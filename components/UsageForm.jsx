'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { enqueue, getAllQueue, clearItems } from '../lib/idb-queue'

export default function UsageForm() {
  const [name, setName] = useState('')
  const [klass, setKlass] = useState('')
  const [purpose, setPurpose] = useState('')
  const [pc, setPc] = useState('PC1')
  const [status, setStatus] = useState('')

  // Auto sync bila online
  useEffect(() => {
    const trySync = async () => {
      if (navigator.onLine) {
        const queued = await getAllQueue()
        if (queued.length) {
          const batch = queued.map(q => q.payload)
          const res = await fetch('/api/sync/queue', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ items: batch })
          })
          if (res.ok) {
            const ids = queued.map(q => q.id)
            await clearItems(ids)
            console.log('synced:', ids)
          }
        }
      }
    }

    window.addEventListener('online', trySync)
    trySync()
    return () => window.removeEventListener('online', trySync)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name,
      class: klass,
      purpose,
      pc_number: pc
    }

    if (!navigator.onLine) {
      await enqueue(payload)
      setStatus('✔ Disimpan secara offline — akan sync bila online.')
    } else {
      const { error } = await supabase.from('usages').insert(payload)
      if (error) {
        await enqueue(payload)
        setStatus('⚠ Ralat — disimpan offline.')
      } else {
        setStatus('✔ Disimpan online!')
      }
    }

    setName('')
    setKlass('')
    setPurpose('')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-3">
      <h2 className="text-xl font-bold mb-3">Rekod Penggunaan Makmal ICT</h2>

      <div>
        <label>Nama Murid / Guru</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label>Kelas / Jawatan</label>
        <input
          value={klass}
          onChange={e => setKlass(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label>Tujuan Penggunaan</label>
        <input
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label>Nombor PC</label>
        <select
          value={pc}
          onChange={e => setPc(e.target.value)}
          className="w-full border p-2 rounded"
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <option key={i}>PC{ i + 1 }</option>
          ))}
        </select>
      </div>

      <button className="w-full bg-blue-600 text-white p-2 rounded">
        Hantar
      </button>

      <p className="text-sm mt-2">{status}</p>
    </form>
  )
}
