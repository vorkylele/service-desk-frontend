import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { TicketType } from '../types'

const GROUPS: [TicketType['category'], string, string][] = [
  ['INCIDENT', 'Техническая поддержка', 'Что-то не работает — сообщите, и заявка сразу попадёт нужному исполнителю'],
  ['ACCESS', 'Доступ к информационным системам', 'Предоставление, расширение и отзыв прав доступа с электронным согласованием'],
]

export default function Catalog() {
  const [types, setTypes] = useState<TicketType[]>([])
  useEffect(() => { api.get<TicketType[]>('/catalog').then(setTypes) }, [])

  return (
    <>
      <h1>Каталог услуг</h1>
      {GROUPS.map(([category, title, hint]) => (
        <section key={category}>
          <h2>{title}</h2>
          <p className="muted">{hint}</p>
          <div className="grid">
            {types.filter(t => t.category === category).map(t => (
              <Link key={t.id} to={`/new/${t.id}`} className="card service">
                <div className="service-code">{t.code}</div>
                <div className="service-name">{t.name}</div>
                <div className="muted small">{t.description}</div>
                <div className="tags">
                  <span className="tag">срок: {t.slaHours} раб. ч</span>
                  {t.needsApproval && <span className="tag warn">требует согласования</span>}
                  <span className="tag grey">{t.supportGroup}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
