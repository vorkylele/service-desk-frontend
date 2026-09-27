import { Ticket } from '../types'

export function StatusBadge({ t }: { t: Ticket }) {
  return <span className={`badge st-${t.statusCode}`}>{t.statusName}</span>
}
