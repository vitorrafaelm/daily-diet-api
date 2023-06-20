// eslint-disable-next-line no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      uuid: string
      name: string
      username: string
      email: string
      password: string
      created_at: string
      updated_at: string
    }
  }
}
