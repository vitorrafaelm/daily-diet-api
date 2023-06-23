import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database/database'
import { randomUUID } from 'crypto'
import jsonWebToken from 'jsonwebtoken'
import { authenticationMiddleware } from './middleware/authentication'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticationMiddleware] }, async (request) => {
    const { id } = JSON.parse(request.headers.user as string)

    const user = await knex('users').select().where('uuid', id).first()

    return {
      user,
    }
  })

  app.post('/', async (request, reply) => {
    const createUsersBodySchema = z.object({
      name: z.string(),
      username: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, username, email, password } = createUsersBodySchema.parse(
      request.body,
    )

    await knex('users').insert({
      uuid: randomUUID(),
      name,
      username,
      email,
      password,
    })

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const createUsersBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    try {
      const { email, password } = createUsersBodySchema.parse(request.body)

      const userExists = await knex('users').where({ email }).first()
      const isPasswordCorrect = userExists?.password === password

      if (!userExists || !isPasswordCorrect) {
        throw new Error('Could not login with those informations, please retry')
      }

      const token = jsonWebToken.sign(
        {
          user: {
            email,
            id: userExists.uuid,
          },
        },
        'radom key',
        { expiresIn: '60m' },
      )

      return reply.status(200).headers({ authorization: token }).send()
    } catch (error: any) {
      reply.status(401)

      return {
        error: 'Could not authenticate',
      }
    }
  })

  app.get(
    '/metrics',
    { preHandler: [authenticationMiddleware] },
    async (request, reply) => {
      const { id } = JSON.parse(request.headers.user as string)

      const total = await knex('meals')
        .where('user_id', '=', id)
        .select()
        .count('uuid', { as: 'total' })
        .first()

      const diet = await knex('meals')
        .where('diet', '=', true)
        .select()
        .count('uuid', { as: 'diet' })
        .first()

      const nodiet = await knex('meals')
        .where('diet', '=', false)
        .select()
        .count('uuid', { as: 'nodiet' })
        .first()

      reply.status(200)
      return {
        total: Number(total?.total) + 1,
        diet: diet?.diet,
        nodiet: nodiet?.nodiet,
      }
    },
  )
}
