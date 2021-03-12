import prisma from "../../../lib/prisma"
import { NextApiHandler } from "next"

// POST /api/post
// Required fields in body: email
// Optional fields in body: types
const handler: NextApiHandler = async (req, res) => {
  const { email, types } = req.body

  if (req.method === "POST") {
    if (!types.length) {
      res.status(400)
      return res.send("No types selected")
    }

    const result = await prisma.user.create({
      data: {
        email,
        types,
      },
    })
    res.json(result)
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
}

export default handler
