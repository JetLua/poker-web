import {MongoClient} from 'mongo'
import {env} from '~/core/mod.ts'

const c = new MongoClient(env.MONGO_URI)

const db = c.db()

export const user = db.collection<{
  email: string
  name: string
  avatar: string
  createdAt: number
  updatedAt: number
  google: {
    email: string
    name: string
    avatar: string
  }
}>('user')
