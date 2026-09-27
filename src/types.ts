export type Role = 'EMPLOYEE' | 'SUPPORT' | 'SECURITY' | 'ADMIN'

export interface User {
  id: number; personnelNo: string; fullName: string; email: string; position: string
  department: string; role: Role; supportGroup: string | null; active: boolean
}

export interface TicketType {
  id: number; code: string; name: string; category: 'INCIDENT' | 'ACCESS'; description: string | null
  slaHours: number; defaultPriority: number; needsApproval: boolean; containsPd: boolean; supportGroup: string
}

export interface Priority { code: number; name: string; slaFactor: number }
export interface Resource { id: number; code: string; name: string; owner: string; paymentContour: boolean }
export interface AccessRole { id: number; code: string; name: string; description: string | null }

export interface Ticket {
  id: number; number: string; typeCode: string; typeName: string; category: string
  statusCode: string; statusName: string; priorityCode: number; priorityName: string
  author: string; authorDepartment: string; assignee: string | null; supportGroup: string
  subject: string; description: string; resource: string | null; accessRole: string | null
  equipmentNo: string | null; createdAt: string; dueAt: string; takenAt: string | null
  resolvedAt: string | null; closedAt: string | null; resolution: string | null
  slaBreached: boolean; overdue: boolean
}

export interface Approval {
  id: number; ticketId: number; ticketNumber: string; subject: string; author: string
  resource: string | null; accessRole: string | null; stepNo: number; approver: string
  kind: 'MANAGER' | 'OWNER' | 'SECURITY'; decision: 'WAITING' | 'PENDING' | 'APPROVED' | 'REJECTED'
  comment: string | null; createdAt: string; decidedAt: string | null
}

export interface TicketEvent { actor: string; type: string; oldStatus: string | null; newStatus: string | null; message: string; createdAt: string }
export interface Comment { author: string; body: string; createdAt: string }

export interface TicketDetails {
  ticket: Ticket; approvals: Approval[]; events: TicketEvent[]; comments: Comment[]
  canTake: boolean; canResolve: boolean; canClose: boolean
}

export interface Grant {
  id: number; employee: string; personnelNo: string; department: string; resource: string; role: string
  ticketNumber: string | null; grantedAt: string; grantedBy: string
  revokedAt: string | null; revokedBy: string | null; revokeReason: string | null
}

export interface SlaRow {
  typeCode: string; typeName: string; total: number; resolved: number; breached: number
  avgHours: number; maxHours: number; withinSlaPercent: number
}
export interface WorkloadRow { assignee: string; groupName: string; open: number; resolved: number; breached: number }
