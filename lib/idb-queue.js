import Dexie from 'dexie'

const db = new Dexie('makmal_usage_db')
db.version(1).stores({ queue: '++id, payload, created_at' })

export async function enqueue(payload){
  return db.queue.add({
    payload,
    created_at: new Date().toISOString()
  })
}

export async function getAllQueue(){
  return db.queue.toArray()
}

export async function clearItems(ids){
  return db.queue.bulkDelete(ids)
}

export default db
