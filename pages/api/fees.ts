import { NextApiHandler } from "next"
import axios from "axios"
import prisma from "@/lib/prisma"
import AWS from "aws-sdk"
import { AlertType, getProfileUrl, getFeeAlertType, delay } from "@/lib/utils"

const SESConfig = {
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
}

AWS.config.update(SESConfig)

const sendEmail = async (
  type: AlertType,
  hourFee: number,
  minimumFee: number
): Promise<void> => {
  const data = await prisma.user.findMany({
    where: {
      types: {
        hasSome: type,
      },
    },
    select: {
      email: true,
      id: true,
    },
  })

  const date = new Date().toISOString().split("T")[0]
  const destinations = []

  for (const { email, id } of data) {
    const destination = {
      Destination: {
        ToAddresses: [email],
      },
      ReplacementTemplateData: JSON.stringify({
        HIGH_FEE: process.env.HIGH_FEE,
        LOW_FEE: process.env.LOW_FEE,
        date,
        hourFee,
        minimumFee,
        profileUrl: getProfileUrl(id),
      }),
    }

    destinations.push(destination)
  }

  while (destinations.length) {
    // max send per hour
    const destinationList = destinations.splice(0, 49)
    try {
      const params = {
        Source: "notifications@txfees.watch",
        Template: type,
        Destinations: destinationList,
        DefaultTemplateData: JSON.stringify({
          HIGH_FEE: process.env.HIGH_FEE,
          LOW_FEE: process.env.HIGH_FEE,
          date,
          hourFee,
          minimumFee,
          profileUrl: "https://txfees.watch",
        }),
      }
      console.log(`Sending ${destinationList.length} ${type} email alerts`)
      const client = new AWS.SES(SESConfig)
      const resp = await client.sendBulkTemplatedEmail(params).promise()
      console.log("email response: ", resp)
      // delay before next send
      await delay(250)
    } catch (e) {
      console.error(`Problem sending emails: ${e.message}`)
    }
  }
}

const handler: NextApiHandler = async (req, res) => {
  const token = req.headers.authorization

  // checks API Key in the header
  if (!token || token !== process.env.FEES_API_KEY) {
    // returns 401 if doesn't match or none included
    res.status(401)
    res.send("Unauthorized")
    return
  }

  // query mempool.space/api/v1/fees/recommended
  const { data } = await axios.get(
    "https://mempool.space/api/v1/fees/recommended"
  )
  const { hourFee, minimumFee } = data
  if (!hourFee || !minimumFee) {
    console.error(
      `Problem retrieving fee suggestions from mempool.space. hourFee: ${hourFee}, minimumFee: ${minimumFee}`
    )
    res.status(400)
    return res.send("Problem getting fees")
  }

  const savedFeesCount: number = await prisma.fee.count()

  let lastFee

  // if no saved fees then set last fee to current one
  if (!savedFeesCount) {
    lastFee = { hourFee, minimumFee }
  } else {
    // get lastFee amount saved in the database
    lastFee = await prisma.fee.findFirst({ orderBy: { addedAt: "desc" } })
  }

  // if more than max_records then we can delete the oldest
  if (savedFeesCount >= (process.env.MAX_RECORDS || 100)) {
    const oldestFee = await prisma.fee.findFirst({
      orderBy: { addedAt: "asc" },
    })
    const deleted = await prisma.fee.delete({
      where: { id: oldestFee.id },
    })
    console.log(
      `Deleted oldest fee record #${deleted.id} from ${deleted.addedAt} `
    )
  }

  // add current as latest
  await prisma.fee.create({
    data: { hourFee, minimumFee },
  })

  const feeAlertType = getFeeAlertType(hourFee, lastFee.hourFee)

  if (!feeAlertType) {
    console.log(
      `Fee change from ${lastFee.hourFee} to ${hourFee} did not trigger alert`
    )
  } else {
    // change in fee value triggers emails
    await sendEmail(feeAlertType, hourFee, minimumFee)
  }

  return res.send("success")
}

export default handler
