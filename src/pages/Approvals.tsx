import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDateTime } from '../api'
import { ErrorAlert } from '../components/ErrorAlert'
import { Approval } from '../types'

const KIND = { MANAGER: 'как руководитель заявителя', OWNER: 'как владелец ресурса', SECURITY: 'как отдел информационной безопасности' }

export default function Approvals() {
  const [rows, setRows] = useState<Approval[]>([])
  const [comments, setComments] = useState<Record<number, string>>({})
  const [error, setError] = useState('')
  const load = useCallback(() => { api.get<Approval[]>('/approvals').then(setRows) }, [])
  useEffect(load, [load])

  const decide = async (a: Approval, approved: boolean) => {
    setError('')
    try { await api.post(`/approvals/${a.id}/decision`, { approved, comment: comments[a.id] ?? null }); load() }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <>
      <h1>Согласования</h1>
      <p className="muted">Заявки, ожидающие вашего решения</p>
      <ErrorAlert message={error} />
      {!rows.length && <div className="card muted">Нет заявок на согласовании</div>}
      {rows.map(a => (
        <div className="card" key={a.id}>
          <div className="approval-head">
            <Link to={`/ticket/${a.ticketId}`}>№ {a.ticketNumber}</Link>
            <span className="muted small">шаг {a.stepNo} · вы согласуете {KIND[a.kind]} · поступила {formatDateTime(a.createdAt)}</span>
          </div>
          <p><b>{a.author}</b> запрашивает роль <b>«{a.accessRole}»</b> в системе <b>«{a.resource}»</b></p>
          <input placeholder="Комментарий (обязателен при отказе)" value={comments[a.id] ?? ''} onChange={e => setComments({ ...comments, [a.id]: e.target.value })} />
          <div className="actions">
            <button onClick={() => decide(a, false)}>Отказать</button>
            <button className="primary" onClick={() => decide(a, true)}>Согласовать</button>
          </div>
        </div>
      ))}
    </>
  )
}
