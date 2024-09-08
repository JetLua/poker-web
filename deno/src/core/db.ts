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

export enum FileType {
  File = 1,
  Folder = 2
}

export const file = db.collection<{
  name: string
  key: string
  size?: number
  hash: string
  owner: string
  createdAt: number
  updatedAt: number
  parent?: string
  type: FileType
  /** 默认隐藏 */
  public?: boolean
}>('file')
