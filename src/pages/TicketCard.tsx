import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, formatDateTime } from '../api'
import { ErrorAlert } from '../components/ErrorAlert'
import { StatusBadge } from '../components/StatusBadge'
import { TicketDetails } from '../types'

const KIND = { MANAGER: 'Руководитель', OWNER: 'Владелец ресурса', SECURITY: 'Информационная безопасность' }
const DECISION = { WAITING: 'ожидает очереди', PENDING: 'на рассмотрении', APPROVED: 'согласовано', REJECTED: 'отказано' }

export default function TicketCard() {
  const { id } = useParams()
  const [data, setData] = useState<TicketDetails>()
  const [resolution, setResolution] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => { api.get<TicketDetails>(`/tickets/${id}`).then(setData).catch(e => setError(e.message)) }, [id])
  useEffect(load, [load])

  const act = async (path: string, body?: unknown) => {
    setError('')
    try { await api.post(`/tickets/${id}/${path}`, body); setResolution(''); setComment(''); load() }
    catch (e) { setError((e as Error).message) }
  }

  if (!data) return <ErrorAlert message={error} />
  const t = data.ticket
  return (
    <>
      <h1>Заявка № {t.number} <StatusBadge t={t} /></h1>
      <p className="muted">{t.typeCode} · {t.typeName}</p>
      <ErrorAlert message={error} />

      <div className="two-col">
        <div>
          <div className="card">
            <h3>{t.subject}</h3>
            <p className="pre">{t.description}</p>
            <dl className="props">
              <dt>Заявитель</dt><dd>{t.author}, {t.authorDepartment}</dd>
              {t.resource && <><dt>Информационная система</dt><dd>{t.resource}</dd></>}
              {t.accessRole && <><dt>Роль</dt><dd>{t.accessRole}</dd></>}
              {t.equipmentNo && <><dt>Инвентарный номер</dt><dd>{t.equipmentNo}</dd></>}
              <dt>Группа исполнителей</dt><dd>{t.supportGroup}</dd>
              <dt>Исполнитель</dt><dd>{t.assignee ?? 'не назначен'}</dd>
              <dt>Приоритет</dt><dd>{t.priorityName}</dd>
              <dt>Создана</dt><dd>{formatDateTime(t.createdAt)}</dd>
              <dt>Контрольный срок</dt>
              <dd>{formatDateTime(t.dueAt)} {t.overdue && <span className="tag danger">просрочена</span>}
                {t.resolvedAt && (t.slaBreached ? <span className="tag danger">срок нарушен</span> : <span className="tag ok">в срок</span>)}</dd>
              {t.resolvedAt && <><dt>Решена</dt><dd>{formatDateTime(t.resolvedAt)}</dd></>}
              {t.resolution && <><dt>Решение</dt><dd className="pre">{t.resolution}</dd></>}
            </dl>
          </div>

          {data.approvals.length > 0 && (
            <div className="card">
              <h3>Маршрут согласования</h3>
              <ol className="route">
                {data.approvals.map(a => (
                  <li key={a.id} className={`dec-${a.decision}`}>
                    <b>{a.approver}</b> <span className="muted">— {KIND[a.kind]}</span>
                    <div className="small">{DECISION[a.decision]}{a.decidedAt && `, ${formatDateTime(a.decidedAt)}`}{a.comment && ` — «${a.comment}»`}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(data.canTake || data.canResolve || data.canClose) && (
            <div className="card">
              <h3>Действия</h3>
              {data.canTake && <button className="primary" onClick={() => act('take')}>Принять в работу</button>}
              {data.canResolve && (
                <>
                  <textarea rows={3} placeholder="Опишите выполненные действия" value={resolution} onChange={e => setResolution(e.target.value)} />
                  <button className="primary" disabled={!resolution.trim()} onClick={() => act('resolve', { resolution })}>
                    {t.accessRole ? 'Решить и внести изменение в реестр прав' : 'Решить заявку'}
                  </button>
                </>
              )}
              {data.canClose && <button className="primary" onClick={() => act('close')}>Подтвердить решение и закрыть</button>}
            </div>
          )}

          <div className="card">
            <h3>Комментарии</h3>
            {data.comments.map((c, i) => <div key={i} className="comment"><b>{c.author}</b> <span className="muted small">{formatDateTime(c.createdAt)}</span><div>{c.body}</div></div>)}
            <textarea rows={2} placeholder="Добавить комментарий" value={comment} onChange={e => setComment(e.target.value)} />
            <button disabled={!comment.trim()} onClick={() => act('comments', { body: comment })}>Отправить</button>
          </div>
        </div>

        <div className="card">
          <h3>История заявки</h3>
          <ul className="timeline">
            {data.events.map((e, i) => (
              <li key={i}><div className="muted small">{formatDateTime(e.createdAt)} · {e.actor}</div>{e.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
