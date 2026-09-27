import { useCallback, useEffect, useState } from 'react'
import { api, formatDateTime } from '../api'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth'
import { Grant } from '../types'

export default function AccessRegistry() {
  const { user } = useAuth()
  const staff = user!.role !== 'EMPLOYEE'
  const canRevoke = user!.role === 'SECURITY' || user!.role === 'ADMIN'
  const [rows, setRows] = useState<Grant[]>([])
  const [onlyActive, setOnlyActive] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(() => { api.get<Grant[]>(staff ? '/access-grants' : '/access-grants/my').then(setRows) }, [staff])
  useEffect(load, [load])

  const revoke = async (g: Grant) => {
    const reason = window.prompt(`Основание отзыва права «${g.role}» у работника ${g.employee}:`)
    if (!reason) return
    try { await api.post(`/access-grants/${g.id}/revoke`, { reason }); load() } catch (e) { setError((e as Error).message) }
  }

  const shown = rows.filter(g => !onlyActive || !g.revokedAt)
  return (
    <>
      <h1>{staff ? 'Реестр прав доступа' : 'Мои права доступа'}</h1>
      <p className="muted">Полный след: кто, когда и на каком основании получил и утратил право</p>
      <label className="check"><input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)} /> только действующие</label>
      <ErrorAlert message={error} />
      <table className="table">
        <thead><tr>{staff && <th>Работник</th>}<th>Информационная система</th><th>Роль</th><th>Основание</th><th>Предоставлено</th><th>Отозвано</th>{canRevoke && <th />}</tr></thead>
        <tbody>
          {shown.map(g => (
            <tr key={g.id} className={g.revokedAt ? 'revoked' : ''}>
              {staff && <td>{g.employee}<div className="muted small">{g.personnelNo} · {g.department}</div></td>}
              <td>{g.resource}</td><td>{g.role}</td>
              <td>{g.ticketNumber ? `заявка № ${g.ticketNumber}` : '—'}</td>
              <td>{formatDateTime(g.grantedAt)}<div className="muted small">{g.grantedBy}</div></td>
              <td>{g.revokedAt ? <>{formatDateTime(g.revokedAt)}<div className="muted small">{g.revokedBy}: {g.revokeReason}</div></> : '—'}</td>
              {canRevoke && <td>{!g.revokedAt && <button onClick={() => revoke(g)}>Отозвать</button>}</td>}
            </tr>
          ))}
          {!shown.length && <tr><td colSpan={7} className="muted center">Записей нет</td></tr>}
        </tbody>
      </table>
    </>
  )
}
