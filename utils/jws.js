

import jwt from 'jsonwebtoken'

export const generateToken = async (payload) => {
  return jwt.sign(payload, process.env.SECRET_TOKEN, {
    expiresIn: '2d'
  })
}
