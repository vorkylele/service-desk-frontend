import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../auth'
import { User } from '../types'

export default function Employees() {
  const { user } = useAuth()
  const [rows, setRows] = useState<User[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(() => { api.get<User[]>('/employees').then(setRows) }, [])
  useEffect(load, [load])

  const dismiss = async (e: User) => {
    if (!window.confirm(`Оформить увольнение: ${e.fullName}? Учётная запись будет заблокирована, все действующие права отозваны.`)) return
    setError('')
    try {
      const res = await api.post<{ revokedGrants: number }>(`/employees/${e.id}/dismiss`)
      setMessage(`${e.fullName}: учётная запись заблокирована, отозвано прав доступа — ${res.revokedGrants}`)
      load()
    } catch (err) { setError((err as Error).message) }
  }

  return (
    <>
      <h1>Работники</h1>
      <p className="muted">Сведения поступают из кадровой системы; кадровое событие «увольнение» автоматически отзывает права доступа</p>
      {message && <div className="alert info">{message}</div>}
      <ErrorAlert message={error} />
      <table className="table">
        <thead><tr><th>Таб. №</th><th>Работник</th><th>Должность</th><th>Подразделение</th><th>Роль в системе</th><th>Состояние</th><th /></tr></thead>
        <tbody>
          {rows.map(e => (
            <tr key={e.id} className={e.active ? '' : 'revoked'}>
              <td>{e.personnelNo}</td><td>{e.fullName}<div className="muted small">{e.email}</div></td><td>{e.position}</td>
              <td>{e.department}</td><td>{e.role}{e.supportGroup && <div className="muted small">{e.supportGroup}</div>}</td>
              <td>{e.active ? 'работает' : 'уволен'}</td>
              <td>{user!.role === 'ADMIN' && e.active && e.id !== user!.id && <button onClick={() => dismiss(e)}>Увольнение</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
