import prisma from "../../../lib/prisma"
import { NextApiHandler } from "next"

// DELETE /api/user/:id
const deleteHandler: NextApiHandler = async (req, res) => {
  let id = req.query.id

  if (Array.isArray(id)) id = id[0]

  const result = await prisma.user.delete({
    where: { id },
  })
  res.json(result)
}

// UPDATE /api/user/:id
const updateHandler: NextApiHandler = async (req, res) => {
  const { types, email } = req.body

  let id = req.query.id
  if (Array.isArray(id)) id = id[0]

  const result = await prisma.user.update({
    where: { id },
    data: { types, email },
  })

  res.json(result)
}

// Required fields in body: email
// Optional fields in body: types
const handler: NextApiHandler = async (req, res) => {
  if (req.method === "PUT") {
    updateHandler(req, res)
  } else if (req.method === "DELETE") {
    deleteHandler(req, res)
  } else {
    res.status(404)
    res.end()
  }
}

export default handler
