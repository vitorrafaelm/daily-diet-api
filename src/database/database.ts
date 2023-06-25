/* eslint-disable no-use-before-define */
import { knex as setupKnex, Knex } from 'knex'
import path from 'node:path'
import { env } from '../env'

class SetupKnexSingleton {
  private static _instance: SetupKnexSingleton | null = null
  public knex: Knex<any, unknown[]>

  private client: string = 'sqlite'
  private connectionPath: string = path.resolve('', env.DATABASE_URL)
  private migrationsExtesions = 'ts'
  private migrationsDirectory = './src/database/migrations'
  private useAsDefault: boolean = true

  public objectSettings = {
    client: this.client,
    connection: {
      filename: this.connectionPath,
    },
    useNullAsDefault: this.useAsDefault,
    migrations: {
      extension: this.migrationsExtesions,
      directory: this.migrationsDirectory,
    },
  }

  private constructor() {
    this.knex = setupKnex(this.objectSettings)
  }

  public static getInstance(): SetupKnexSingleton {
    if (SetupKnexSingleton._instance === null) {
      SetupKnexSingleton._instance = new SetupKnexSingleton()
    }

    return SetupKnexSingleton._instance
  }

  public getSettings(): any {
    return this.objectSettings
  }
}

const singletonInstance = SetupKnexSingleton.getInstance()

export const knex = singletonInstance.knex
export const settings = singletonInstance.getSettings()
