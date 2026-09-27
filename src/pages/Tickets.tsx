import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, formatDateTime } from '../api'
import { ErrorAlert } from '../components/ErrorAlert'
import { StatusBadge } from '../components/StatusBadge'
import { Ticket } from '../types'

const TITLES: Record<string, string> = { my: 'Мои заявки', queue: 'Очередь заявок', all: 'Журнал заявок' }

export default function Tickets() {
  const { scope = 'my' } = useParams()
  const [rows, setRows] = useState<Ticket[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    setRows([]); setError('')
    api.get<Ticket[]>(`/tickets?scope=${scope}`).then(setRows).catch(e => setError(e.message))
  }, [scope])

  return (
    <>
      <h1>{TITLES[scope]}</h1>
      <ErrorAlert message={error} />
      <table className="table">
        <thead><tr>
          <th>Номер</th><th>Тема</th><th>Вид</th>{scope !== 'my' && <th>Заявитель</th>}<th>Исполнитель</th>
          <th>Приоритет</th><th>Статус</th><th>Создана</th><th>Контрольный срок</th>
        </tr></thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id} className={t.overdue ? 'overdue' : ''}>
              <td><Link to={`/ticket/${t.id}`}>{t.number}</Link></td>
              <td>{t.subject}</td>
              <td className="muted">{t.typeCode}</td>
              {scope !== 'my' && <td>{t.author}</td>}
              <td>{t.assignee ?? '—'}</td>
              <td>{t.priorityName}</td>
              <td><StatusBadge t={t} /></td>
              <td>{formatDateTime(t.createdAt)}</td>
              <td>{formatDateTime(t.dueAt)}{t.overdue && <span className="tag danger">просрочена</span>}</td>
            </tr>
          ))}
          {!rows.length && !error && <tr><td colSpan={9} className="muted center">Заявок нет</td></tr>}
        </tbody>
      </table>
    </>
  )
}
