import fastify from 'fastify'
import { usersRoutes } from './routes/usersRoutes'
import { mealsRoutes } from './routes/mealsRoutes'

const app = fastify()

app.register(usersRoutes, {
  prefix: '/users',
})

app.register(mealsRoutes, {
  prefix: '/meals',
})

export { app }
