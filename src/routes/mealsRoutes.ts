import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database/database'
import { randomUUID } from 'crypto'
import { authenticationMiddleware } from './middleware/authentication'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticationMiddleware] }, async (request) => {
    const { id } = JSON.parse(request.headers.user as string)

    const meals = await knex('meals').select().where('user_id', id)

    return {
      meals,
    }
  })

  app.post(
    '/',
    { preHandler: [authenticationMiddleware] },
    async (request, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        mealsHour: z.string(),
        diet: z.boolean(),
      })

      const { id } = JSON.parse(request.headers.user as string)

      const { name, description, mealsHour, diet } =
        createMealsBodySchema.parse(request.body)

      await knex('meals').insert({
        uuid: randomUUID(),
        user_id: id,
        name,
        description,
        meals_hour: new Date(mealsHour).toDateString(),
        diet,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:idMeals',
    { preHandler: [authenticationMiddleware] },
    async (request) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        mealsHour: z.string(),
        diet: z.boolean(),
      })

      const createMealsParamsSchema = z.object({
        idMeals: z.string(),
      })

      const { idMeals } = createMealsParamsSchema.parse(request.params)

      const { id } = JSON.parse(request.headers.user as string)

      const { name, description, mealsHour, diet } =
        createMealsBodySchema.parse(request.body)

      console.log(diet)

      const mealUpdated = await knex('meals')
        .where('uuid', '=', idMeals)
        .where('user_id', '=', id)
        .update({
          name,
          description,
          meals_hour: new Date(mealsHour).toDateString(),
          diet,
        })
        .returning('*')

      return {
        meal: {
          ...mealUpdated[0],
        },
      }
    },
  )

  app.delete(
    '/:idMeals',
    { preHandler: [authenticationMiddleware] },
    async (request, reply) => {
      const createMealsParamsSchema = z.object({
        idMeals: z.string(),
      })

      const { idMeals } = createMealsParamsSchema.parse(request.params)

      const { id } = JSON.parse(request.headers.user as string)

      await knex('meals')
        .where('uuid', '=', idMeals)
        .where('user_id', '=', id)
        .delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/:idMeals',
    { preHandler: [authenticationMiddleware] },
    async (request, reply) => {
      const createMealsParamsSchema = z.object({
        idMeals: z.string(),
      })

      const { idMeals } = createMealsParamsSchema.parse(request.params)

      const { id } = JSON.parse(request.headers.user as string)

      const meal = await knex('meals')
        .where('uuid', '=', idMeals)
        .where('user_id', '=', id)
        .select()

      return {
        meal,
      }
    },
  )
}
