import { NextApiHandler } from "next"
import axios from "axios"
import prisma from "@/lib/prisma"
import AWS from "aws-sdk"

const SESConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccesKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
}

AWS.config.update(SESConfig)

export type AlertType = "ltlow" | "gtlow" | "lthigh" | "gthigh"

export const getFeeAlertType = (
  currentFee: number,
  prevFee: number
): AlertType | void => {
  const LOW_FEE = +process.env.LOW_FEE
  const HIGH_FEE = +process.env.HIGH_FEE
  if (currentFee >= HIGH_FEE && prevFee <= LOW_FEE) return "gthigh"
  if (currentFee <= LOW_FEE && prevFee > LOW_FEE) return "ltlow"
  if (currentFee > LOW_FEE && prevFee <= LOW_FEE) return "gtlow"
  if (currentFee >= HIGH_FEE && prevFee < HIGH_FEE) return "gthigh"
  if (currentFee < HIGH_FEE && prevFee >= HIGH_FEE) return "lthigh"
  return null
}

const getTypeSubject = (type: AlertType): string => {
  const LOW_FEE = process.env.LOW_FEE
  const HIGH_FEE = process.env.HIGH_FEE

  switch (type) {
    case "ltlow":
      return `Fees are less than ${LOW_FEE} sats/byte`
    case "gtlow":
      return `Fees are greater than ${LOW_FEE} sats/byte`
    case "lthigh":
      return `Fees are less than ${HIGH_FEE} sats/byte`
    case "gthigh":
      return `Fees are greater than ${HIGH_FEE} sats/byte`
    default:
      throw new Error(`Unrecognized type: ${type}`)
  }
}

const getEmailBody = (
  type: AlertType,
  hourFee: number,
  minimumFee: number
): string => {
  const LOW_FEE = process.env.LOW_FEE
  const HIGH_FEE = process.env.HIGH_FEE

  let body = "This is a bitoin fee alert. \n"

  body += `Fees on the bitcoin network are currently `

  switch (type) {
    case "ltlow":
      body += `less than ${LOW_FEE} sats/byte. Now might be a good time to send non-urgent transactions or consolidate UTXOs.`
      break
    case "gtlow":
      body += `greater than ${LOW_FEE} sats/byte, but still below ${HIGH_FEE} sats/byte. If any transactions are not urgent, you might consider waiting until they drop back down below ${LOW_FEE} sats/byte.`
      break
    case "lthigh":
      body += `going down and are now less than ${HIGH_FEE} sats/byte.`
      break
    case "gthigh":
      body += `greater than ${HIGH_FEE} sats/byte. If possible, try and avoid sending any non-urgent transactions until they go back down again.`
      break
    default:
      throw new Error(`Unrecognized type: ${type}`)
  }

  body += `\n`

  body += `Fee estimate for 1 hour confirmation: ${hourFee} sats/byte\n`
  body += `Stuck or dropped transaction fee level: ${minimumFee} sats/byte (don't send any transactions with fees less than this!)`

  // TODO: add footer material, attribution, and update profile link
  return body
}

const sendEmail = async (type: AlertType): Promise<void> => {
  const emails = (
    await prisma.user.findMany({
      where: {
        types: {
          hasSome: type,
        },
      },
      select: {
        email: true,
      },
    })
  ).map((data) => data.email)

  const date = new Date().toISOString().split("T")[0]

  const subject = getTypeSubject(type)

  const params = {
    Source: "fee-alert@protonmail.com",
    Destination: {
      ToAddresses: emails,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "IT IS <strong>WORKING</strong>!",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `[Bitcoin Fee Alert ${date}]: ${subject}`,
      },
    },
  }

  const client = new AWS.SES(SESConfig)
  await client.sendEmail(params).promise()
  console.log(`Sent ${emails.length} ${type} email alerts`)
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

  if (!feeAlertType)
    console.log(
      `Fee change from ${lastFee.hourFee} to ${hourFee} did not trigger alert`
    )
  else {
    await sendEmail(feeAlertType)
  }

  await sendEmail("ltlow")
  return res.json(lastFee)

  // based on value determined, get emails for all users that signed up for corresponding alert
  // send email
}

export default handler
