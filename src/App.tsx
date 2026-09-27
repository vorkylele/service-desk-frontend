import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Login from './pages/Login'
import Catalog from './pages/Catalog'
import NewTicket from './pages/NewTicket'
import Tickets from './pages/Tickets'
import TicketCard from './pages/TicketCard'
import Approvals from './pages/Approvals'
import AccessRegistry from './pages/AccessRegistry'
import Reports from './pages/Reports'
import Employees from './pages/Employees'

const ROLE_TITLE = { EMPLOYEE: 'Сотрудник', SUPPORT: 'Исполнитель', SECURITY: 'Информационная безопасность', ADMIN: 'Администратор' }

export default function App() {
  const { user, loading, logout } = useAuth()
  if (loading) return <div className="center muted">Загрузка…</div>
  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>

  const staff = user.role !== 'EMPLOYEE'
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Портал<br />внутренних заявок</div>
        <nav>
          <NavLink to="/catalog">Каталог услуг</NavLink>
          <NavLink to="/tickets/my">Мои заявки</NavLink>
          <NavLink to="/approvals">Согласования</NavLink>
          <NavLink to="/access">{staff ? 'Реестр прав доступа' : 'Мои права доступа'}</NavLink>
          {staff && <div className="nav-section">Работа с заявками</div>}
          {staff && <NavLink to="/tickets/queue">Очередь заявок</NavLink>}
          {staff && <NavLink to="/tickets/all">Журнал заявок</NavLink>}
          {staff && <NavLink to="/reports">Отчёты</NavLink>}
          {staff && <NavLink to="/employees">Работники</NavLink>}
        </nav>
        <div className="userbox">
          <div className="user-name">{user.fullName}</div>
          <div className="muted small">{user.position}</div>
          <div className="muted small">{ROLE_TITLE[user.role]}</div>
          <button className="link" onClick={logout}>Выйти</button>
        </div>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/new/:typeId" element={<NewTicket />} />
          <Route path="/tickets/:scope" element={<Tickets />} />
          <Route path="/ticket/:id" element={<TicketCard />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/access" element={<AccessRegistry />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </main>
    </div>
  )
}
