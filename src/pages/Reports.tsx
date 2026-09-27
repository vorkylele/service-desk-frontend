import { useEffect, useState } from 'react'
import { api } from '../api'
import { SlaRow, WorkloadRow } from '../types'

// дата в местном часовом поясе (toISOString дал бы дату по Гринвичу)
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function Reports() {
  const [from, setFrom] = useState(iso(new Date(Date.now() - 60 * 864e5)))
  const [to, setTo] = useState(iso(new Date()))
  const [sla, setSla] = useState<SlaRow[]>([])
  const [load, setLoad] = useState<WorkloadRow[]>([])

  useEffect(() => {
    api.get<SlaRow[]>(`/reports/sla?from=${from}&to=${to}`).then(setSla)
    api.get<WorkloadRow[]>(`/reports/workload?from=${from}&to=${to}`).then(setLoad)
  }, [from, to])

  const sum = (f: (r: SlaRow) => number) => sla.reduce((a, r) => a + f(r), 0)
  const total = sum(r => r.total), resolved = sum(r => r.resolved), breached = sum(r => r.breached)
  const within = resolved ? Math.round(1000 * (resolved - breached) / resolved) / 10 : 100
  const maxResolved = Math.max(1, ...load.map(r => r.resolved))

  return (
    <>
      <h1>Отчёты</h1>
      <div className="filters">
        <label>Период с <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>по <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
      </div>

      <div className="kpis">
        <div className="card kpi"><div className="kpi-value">{total}</div><div className="muted">заявок за период</div></div>
        <div className="card kpi"><div className="kpi-value">{resolved}</div><div className="muted">решено</div></div>
        <div className="card kpi"><div className="kpi-value">{within}%</div><div className="muted">в пределах норматива</div></div>
        <div className="card kpi"><div className="kpi-value">{breached}</div><div className="muted">с нарушением срока</div></div>
      </div>

      <h2>Соблюдение нормативов срока исполнения</h2>
      <table className="table">
        <thead><tr><th>Код</th><th>Вид заявки</th><th>Всего</th><th>Решено</th><th>Нарушен срок</th><th>Среднее время, ч</th><th>Макс. время, ч</th><th>В срок</th></tr></thead>
        <tbody>
          {sla.map(r => (
            <tr key={r.typeCode}>
              <td>{r.typeCode}</td><td>{r.typeName}</td><td>{r.total}</td><td>{r.resolved}</td><td>{r.breached}</td>
              <td>{r.avgHours}</td><td>{r.maxHours}</td>
              <td><div className="bar"><div style={{ width: `${r.withinSlaPercent}%` }} className={r.withinSlaPercent < 80 ? 'low' : ''} /><span>{r.withinSlaPercent}%</span></div></td>
            </tr>
          ))}
          <tr className="total"><td /><td>Итого</td><td>{total}</td><td>{resolved}</td><td>{breached}</td><td /><td /><td>{within}%</td></tr>
        </tbody>
      </table>

      <h2>Нагрузка на исполнителей</h2>
      <table className="table">
        <thead><tr><th>Исполнитель</th><th>Группа</th><th>В работе</th><th>Решено</th><th>Нарушен срок</th><th>Доля решённых</th></tr></thead>
        <tbody>
          {load.map(r => (
            <tr key={r.assignee}>
              <td>{r.assignee}</td><td>{r.groupName}</td><td>{r.open}</td><td>{r.resolved}</td><td>{r.breached}</td>
              <td><div className="bar"><div style={{ width: `${100 * r.resolved / maxResolved}%` }} /><span>{r.resolved}</span></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
