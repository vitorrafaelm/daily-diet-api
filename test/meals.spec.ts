import { afterAll, beforeAll, expect, it, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  describe('User should be able to manipulate meals if he is authenticated', async () => {
    let userToken: string | null = null

    beforeEach(async () => {
      await request(app.server).post('/users').send({
        name: 'Vitor Rafael',
        username: 'vitor.rafael',
        email: 'vitor.rafael1518@gmail.com',
        password: '123456',
      })

      const response = await request(app.server).post('/users/login').send({
        email: 'vitor.rafael1518@gmail.com',
        password: '123456',
      })

      userToken = response.header.authorization
    })

    it('should be able to register a meal', async () => {
      const response = await request(app.server)
        .post('/meals')
        .send({
          name: 'minha primeira refeição',
          description: 'minha descrição',
          mealsHour: '2023-05-22 11:55',
          diet: true,
        })
        .set({ authorization: userToken })

      expect(response.status).toBe(201)
    })
  })

  describe('User should not be able to manipulate meals if he is not authenticated', async () => {
    let userToken: string | null = null

    beforeEach(async () => {
      await request(app.server).post('/users').send({
        name: 'Vitor Rafael',
        username: 'vitor.rafael',
        email: 'vitor.rafael1518@gmail.com',
        password: '123456',
      })

      const response = await request(app.server).post('/users/login').send({
        email: 'vitor.rafael1518@gmail.com',
        password: '12356',
      })

      userToken = response.header.authorization || null
    })

    it('should not be able to register a meal because jwt malformed token', async () => {
      const response = await request(app.server)
        .post('/meals')
        .send({
          name: 'minha primeira refeição',
          description: 'minha descrição',
          mealsHour: '2023-05-22 11:55',
          diet: true,
        })
        .set({ authorization: userToken })

      expect(response.body.statusCode).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
      expect(response.body.message).toBe('jwt malformed')
    })

    it('should not be able to register a meal becuase jwt expired token', async () => {
      const response = await request(app.server)
        .post('/meals')
        .send({
          name: 'minha primeira refeição',
          description: 'minha descrição',
          mealsHour: '2023-05-22 11:55',
          diet: true,
        })
        .set({
          authorization:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidml0b3IucmFmYWVsMTUxOEBnbWFpbC5jb20iLCJpZCI6IjVkMzdhMTg1LTMzNWUtNGUxOC1hYzA0LTI5MmY0NTAzMDRlNiJ9LCJpYXQiOjE2ODcyMjcwMzQsImV4cCI6MTY4NzIzMDYzNH0.tI9xTVOSxKeyZQd-ZJGabESLchbqEbs1URbb9BzZG-g',
        })

      expect(response.body.statusCode).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
      expect(response.body.message).toBe('jwt expired')
    })
  })
})
