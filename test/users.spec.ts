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

  it('User can create an account', async () => {
    // Fazer a chamada http
    const response = await request(app.server).post('/users').send({
      name: 'Vitor Rafael',
      username: 'vitor.rafael',
      email: 'vitor.rafael1518@gmail.com',
      password: '123456',
    })

    // validação
    expect(response.statusCode).toEqual(201)
  })

  it('Should be able to login in yout account', async () => {
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

    expect(response.statusCode).toEqual(200)
    expect(response.header.authorization).toBeDefined()
  })

  it('Should not be able to login in yout account becuase credentials are invalid', async () => {
    await request(app.server).post('/users').send({
      name: 'Vitor Rafael',
      username: 'vitor.rafael',
      email: 'vitor.rafael1518@gmail.com',
      password: '123456',
    })

    const response = await request(app.server).post('/users/login').send({
      email: 'vitor.rafael1518@gmail.com',
      password: '1234',
    })

    expect(response.statusCode).toEqual(401)
    expect(response.body.error).toBe('Could not authenticate')
  })

  describe('User should be able to get information if he is authenticated', async () => {
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

  describe('User not should be able to get information if he is not authenticated', async () => {
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
        password: '1234',
      })

      userToken = response.header?.authorization
        ? response.header?.authorization
        : null
    })

    // Get Users users/ -> List single user informations
    it('should not be able to list his informations because jwt is malformed', async () => {
      const response = await request(app.server)
        .get('/users')
        .send()
        .set({ authorization: userToken })

      expect(response.body.statusCode).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
      expect(response.body.message).toBe('jwt malformed')
    })

    it('should not be able to get user metrics because jwt expired', async () => {
      const response = await request(app.server)
        .get('/users/metrics')
        .send()
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
