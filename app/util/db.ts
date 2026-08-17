// utils/db.ts
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'okouzukai-db'
const DB_VERSION = 1
const STORE_NAME = 'app-data'

export interface AppState {
  balance: number
  history: Array<{
    id: number
    type: 'in' | 'out'
    title: string
    amount: number
    date: string
  }>
}

// DB接続の取得
export const getDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// データの保存
export const saveStateToIDB = async (key: string, value: any) => {
  if (import.meta.server) return // SSR（サーバーサイド）での実行を防止
  const db = await getDB()
  await db.put(STORE_NAME, JSON.parse(JSON.stringify(value)), key)
}

// データの取得
export const getStateFromIDB = async <T>(key: string): Promise<T | undefined> => {
  if (import.meta.server) return undefined
  const db = await getDB()
  return await db.get(STORE_NAME, key)
}