import prisma from "../../../lib/prisma"
import { NextApiHandler } from "next"

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
      res.json(result)
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
