/* ValidateToken */
const jwt = require("jsonwebtoken")


module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.headers["authorization"]

  // Initializing token
  let token

  // Splitting header to get token
  if (authHeader) {
    token = authHeader.split(" ")[1]
  } else {
    token = null
  }

  // Check if token is null
  if (token == null) return res.sendStatus(401)

  // If token found
  console.log("Token found")

  // Verify token
  jwt.verify(token, process.env.SECRET, async (err, user) => {
    if (err) return res.sendStatus(403)
    next()
  })
}
