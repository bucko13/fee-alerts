const { v4: uuid } = require("uuid")

const generateKey = () => {
  const key = uuid()
  console.log("key:", key)
  return key
}

module.exports = { generateKey }

generateKey()
