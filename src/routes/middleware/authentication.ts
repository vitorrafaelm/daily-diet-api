import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify'
import jsonWebToken from 'jsonwebtoken'

export function authenticationMiddleware(
  request: FastifyRequest,
  response: FastifyReply,
  next: DoneFuncWithErrOrRes,
) {
  const { authorization } = request.headers

  if (!authorization) {
    return response.status(401).send('Access denied. No token provided.')
  }

  try {
    const payload = jsonWebToken.verify(authorization, 'radom key') as {
      user: { email: string; id: string }
    }
    const { user } = payload

    if (!(user.email && user.id)) {
      return response.send(401).send('Invalid Token')
    }

    request.headers.user = JSON.stringify(payload.user)
    next()
  } catch (error: any) {
    response.status(401)
    throw new Error(error.message)
  }
}
