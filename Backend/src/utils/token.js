
const jwt = require('jsonwebtoken')
exports.access = p => jwt.sign(p, process.env.JWT_SECRET, { expiresIn: '15m' })
