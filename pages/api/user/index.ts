import prisma from "../../../lib/prisma"
import { NextApiHandler } from "next"
import axios from "axios"
import AWS from "aws-sdk"
import { getProfileUrl } from "@/lib/utils"

const SESConfig = {
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
}

AWS.config.update(SESConfig)

// POST /api/post

const postHandler = async (req, res) => {
  const { email, types } = req.body
  if (!types.length) {
    res.status(400)
    return res.send("No types selected")
  }

  try {
    if (await prisma.user.findUnique({ where: { email } })) {
      console.error(`Email submitted that already exists: ${email}`)
      res.status(400)
      res.json({
        message:
          "There was a problem submitting with your request. Please contact an administrator",
      })
    } else {
      const result = await prisma.user.create({
        data: {
          email,
          types,
        },
      })

      // query mempool.space/api/v1/fees/recommended
      const { data } = await axios.get(
        "https://mempool.space/api/v1/fees/recommended"
      )
      const { hourFee, minimumFee } = data

      const params = {
        Source: "notifications@txfees.watch",
        Template: "confirmation",
        Destination: { ToAddresses: [email] },
        TemplateData: JSON.stringify({
          hourFee,
          minimumFee,
          profileUrl: getProfileUrl(result.id),
        }),
      }
      console.log(`Sending confirmation email for new subscription.`)
      const client = new AWS.SES(SESConfig)
      const emailResp = await client.sendTemplatedEmail(params).promise()
      console.log(`Confirmation Email: `, emailResp)
      return res.json({ ...result, minimumFee, hourFee })
    }
  } catch (e) {
    console.error(`Problem creating new user: ${e.message}`)
    res.status(500)
    res.json({ message: "There was a problem creating the user" })
  }
}

// Required fields in body: email
// Optional fields in body: types
const handler: NextApiHandler = async (req, res) => {
  if (req.method === "POST") {
    postHandler(req, res)
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
}

export default handler
