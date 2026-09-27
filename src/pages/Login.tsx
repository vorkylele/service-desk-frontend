import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { ErrorAlert } from '../components/ErrorAlert'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try { await login(email, password); navigate('/catalog') }
    catch (err) { setError((err as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <h1>Портал внутренних заявок</h1>
        <p className="muted">Техническая поддержка и управление доступом</p>
        <label>Корпоративная электронная почта
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@vbtech.example" autoFocus required />
        </label>
        <label>Пароль
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <ErrorAlert message={error} />
        <button className="primary" disabled={busy}>{busy ? 'Вход…' : 'Войти'}</button>
      </form>
    </div>
  )
}
