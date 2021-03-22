import { NextApiHandler } from "next"
import axios from "axios"
import prisma from "@/lib/prisma"
import AWS from "aws-sdk"

const SESConfig = {
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
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

const getEmailSubject = (type: AlertType): string => {
  const LOW_FEE = process.env.LOW_FEE || 10
  const HIGH_FEE = process.env.HIGH_FEE || 50

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

const getProfileUrl = (id: string): string => {
  const VERCEL_URL = process.env.VERCEL_URL
  const API_ORIGIN = process.env.API_ORIGIN

  let base: string
  if (API_ORIGIN && API_ORIGIN.includes("http")) {
    base = API_ORIGIN
  } else {
    base = VERCEL_URL ? `https://${VERCEL_URL}` : `https://txfees.watch`
  }

  return new URL(`profile/${id}`, base).href
}

const getEmailBody = (
  type: AlertType,
  hourFee: number,
  minimumFee: number,
  id: string
): string => {
  const LOW_FEE = process.env.LOW_FEE
  const HIGH_FEE = process.env.HIGH_FEE

  let body = "<h3>This is a bitoin fee alert.</h3><br />"

  body += `Fees on the bitcoin network are currently `

  switch (type) {
    case "ltlow":
      body += `<strong>less than ${LOW_FEE} sats/byte.</strong> Now might be a good time to send non-urgent transactions or consolidate UTXOs.`
      break
    case "gtlow":
      body += `<strong>greater than ${LOW_FEE} sats/byte</strong>, but still below ${HIGH_FEE} sats/byte. If any transactions are not urgent, you might consider waiting until they drop back down below ${LOW_FEE} sats/byte.`
      break
    case "lthigh":
      body += `going down and are <strong>now less than ${HIGH_FEE} sats/byte.</strong>`
      break
    case "gthigh":
      body += `<strong>greater than ${HIGH_FEE} sats/byte.</strong> If possible, try and avoid sending any non-urgent transactions until they go back down again.`
      break
    default:
      throw new Error(`Unrecognized type: ${type}`)
  }

  body += `<br /><br />`

  body += `<h4>Current Network Statistics:</h4>`
  body += `<strong>Fee estimate for 1 hour confirmation:</strong> ${hourFee} sats/byte<br />`
  body += `<strong>Stuck/dropped transaction fee level:</strong> ${minimumFee} sats/byte (don't send any transactions with fees less than this!)`

  body += `<br /><br />`

  const profileUrl = getProfileUrl(id)

  body += `To update your preferences or unsubscribe visit this link: <br />
<a href="${profileUrl}">${profileUrl}</a>`

  body += `<br /><br />`
  body += `Data for this alert provided by <a href="https://mempool.space">https://mempool.space</a>`
  return body
}

const sendCustomEmail = async (
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

  const subject = getEmailSubject(type)

  // TODO: Parallelize these calls?
  data.forEach(async ({ email, id }) => {
    try {
      const params = {
        Source: "notifications@txfees.watch",
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: getEmailBody(type, hourFee, minimumFee, id),
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: `[Bitcoin Fee Alert ${date}]: ${subject}`,
          },
        },
      }
      const client = new AWS.SES(SESConfig)
      const resp = await client.sendEmail(params).promise()
      console.log("email response: ", resp)
    } catch (e) {
      console.error(`Problem sending email for user ${id}: ${e.message}`)
    }
  })

  console.log(`Sending ${data.length} ${type} email alerts`)
}

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
        LOW_FEE: process.env.HIGH_FEE,
        date,
        hourFee,
        minimumFee,
        profileUrl: getProfileUrl(id),
      }),
    }

    destinations.push(destination)
  }

  try {
    const params = {
      Source: "notifications@txfees.watch",
      Template: type,
      Destinations: destinations,
      DefaultTemplateData: JSON.stringify({
        HIGH_FEE: process.env.HIGH_FEE,
        LOW_FEE: process.env.HIGH_FEE,
        date,
        hourFee,
        minimumFee,
        profileUrl: "https://txfees.watch",
      }),
    }

    const client = new AWS.SES(SESConfig)
    const resp = await client.sendBulkTemplatedEmail(params).promise()
    console.log("email response: ", resp)
  } catch (e) {
    console.error(`Problem sending emails: ${e.message}`)
  }

  console.log(`Sending ${data.length} ${type} email alerts`)
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

  console.log("Determining which emails to send...")
  if (!feeAlertType) {
    console.log(
      `Fee change from ${lastFee.hourFee} to ${hourFee} did not trigger alert`
    )

    // TODO: Remove this test call
    await sendEmail("gthigh", hourFee, minimumFee)
  } else {
    // change in fee value triggers emails
    await sendEmail(feeAlertType, hourFee, minimumFee)
  }

  return res.send("success")
}

export default handler
