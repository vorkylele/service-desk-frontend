import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ErrorAlert } from '../components/ErrorAlert'
import { AccessRole, Priority, Resource, Ticket, TicketType } from '../types'

export default function NewTicket() {
  const { typeId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [type, setType] = useState<TicketType>()
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [roles, setRoles] = useState<AccessRole[]>([])
  const [form, setForm] = useState({ subject: '', description: '', priorityCode: 0, resourceId: 0, accessRoleId: 0, equipmentNo: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<TicketType[]>('/catalog').then(list => {
      const t = list.find(x => x.id === Number(typeId))
      setType(t)
      // уже введённую пользователем тему не затираем: справочник может прийти позже первых нажатий клавиш
      if (t) setForm(f => ({ ...f, priorityCode: t.defaultPriority, subject: t.category === 'ACCESS' ? t.name : f.subject }))
    })
    api.get<Priority[]>('/priorities').then(setPriorities)
    api.get<Resource[]>('/resources').then(setResources)
  }, [typeId])

  useEffect(() => {
    setRoles([])
    if (form.resourceId) api.get<AccessRole[]>(`/resources/${form.resourceId}/roles`).then(setRoles)
  }, [form.resourceId])

  if (!type || !user) return null
  const isAccess = type.category === 'ACCESS'
  const resource = resources.find(r => r.id === form.resourceId)
  const factor = priorities.find(p => p.code === form.priorityCode)?.slaFactor ?? 1

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    try {
      const created = await api.post<Ticket>('/tickets', {
        typeId: type.id, subject: form.subject, description: form.description, priorityCode: form.priorityCode,
        resourceId: isAccess ? form.resourceId : null, accessRoleId: isAccess ? form.accessRoleId : null,
        equipmentNo: form.equipmentNo || null,
      })
      navigate(`/ticket/${created.id}`)
    } catch (err) { setError((err as Error).message) }
  }

  return (
    <>
      <h1>Новая заявка</h1>
      <p className="muted">{type.code} · {type.name}</p>
      <form className="card form" onSubmit={submit}>
        <fieldset>
          <legend>Заявитель — заполняется автоматически</legend>
          <div className="row">
            <label>Работник<input value={user.fullName} disabled /></label>
            <label>Табельный номер<input value={user.personnelNo} disabled /></label>
          </div>
          <div className="row">
            <label>Подразделение<input value={user.department} disabled /></label>
            <label>Должность<input value={user.position} disabled /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Содержание заявки</legend>
          {isAccess ? (
            <div className="row">
              <label>Информационная система
                <select value={form.resourceId} required onChange={e => setForm({ ...form, resourceId: Number(e.target.value), accessRoleId: 0 })}>
                  <option value="">— выберите —</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.code} · {r.name}</option>)}
                </select>
              </label>
              <label>Роль (право доступа)
                <select value={form.accessRoleId} required disabled={!roles.length} onChange={e => setForm({ ...form, accessRoleId: Number(e.target.value) })}>
                  <option value="">— выберите —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name} — {r.description}</option>)}
                </select>
              </label>
            </div>
          ) : (
            <div className="row">
              <label>Кратко о проблеме
                <input value={form.subject} maxLength={200} required onChange={e => setForm({ ...form, subject: e.target.value })} />
              </label>
              <label>Инвентарный номер оборудования
                <input value={form.equipmentNo} maxLength={20} placeholder="если обращение связано с оборудованием" onChange={e => setForm({ ...form, equipmentNo: e.target.value })} />
              </label>
            </div>
          )}
          <label>{isAccess ? 'Обоснование необходимости доступа' : 'Подробное описание'}
            <textarea rows={4} value={form.description} required onChange={e => setForm({ ...form, description: e.target.value })} />
          </label>
          <div className="row">
            <label>Приоритет
              <select value={form.priorityCode} onChange={e => setForm({ ...form, priorityCode: Number(e.target.value) })}>
                {priorities.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </label>
            <label>Норматив срока исполнения
              <input value={`${Math.round(type.slaHours * factor * 10) / 10} рабочих часов`} disabled />
            </label>
          </div>
        </fieldset>

        {isAccess && type.needsApproval && (
          <div className="alert info">
            Маршрут согласования формируется автоматически: непосредственный руководитель → владелец ресурса
            {resource ? ` (${resource.owner})` : ''}
            {resource?.paymentContour ? ' → отдел информационной безопасности (платёжный контур)' : ''}.
          </div>
        )}
        {type.containsPd && <div className="muted small">Заявка содержит персональные данные; доступ к ней ограничен участниками обработки.</div>}
        <ErrorAlert message={error} />
        <div className="actions">
          <button type="button" onClick={() => navigate(-1)}>Отмена</button>
          <button className="primary">Отправить заявку</button>
        </div>
      </form>
    </>
  )
}
