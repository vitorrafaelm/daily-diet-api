import { afterAll, beforeAll, expect, it, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', () => {
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
})
