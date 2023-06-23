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

    // Get Users users/ -> List single user informations
    it('should be able to list his informations', async () => {
      const response = await request(app.server)
        .get('/users')
        .send()
        .set({ authorization: userToken })

      expect(response.status).toBe(200)
      expect(response.body).toBeDefined()
      expect(response.body.user).toHaveProperty('uuid')
      expect(response.body.user).toHaveProperty('email')
      expect(response.body.user).toHaveProperty('username')
    })

    it('should be able to get user metrics', async () => {
      const response = await request(app.server)
        .get('/users/metrics')
        .send()
        .set({ authorization: userToken })

      expect(response.status).toBe(200)
      expect(response.body).toBeDefined()
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('diet')
      expect(response.body).toHaveProperty('nodiet')
    })
  })
})
