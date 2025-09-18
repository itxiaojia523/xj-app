// src/pages/auth/Register.tsx
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type FormState = { email: string; password: string; confirm: string }
const emailOk = (v: string) => /\S+@\S+\.\S+/.test(v)
const passOk = (v: string) => v.length >= 6

export default function Register() {
  const [form, setForm] = useState<FormState>({ email: '', password: '', confirm: '' })
  const [err, setErr] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!emailOk(form.email)) return setErr('请输入正确的邮箱')
    if (!passOk(form.password)) return setErr('密码至少 6 位')
    if (form.password !== form.confirm) return setErr('两次输入的密码不一致')

    try {
      setLoading(true)
      // TODO: 调用你的注册 API
      // await api.register({ email: form.email, password: form.password })
      await new Promise(r => setTimeout(r, 800)) // 模拟异步
      navigate('/login', { replace: true })
    } catch (e) {
      setErr('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">注册</h1>
        <p className="mt-1 text-sm text-slate-600">创建你的新账户，开始使用应用。</p>

        {err && <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium">邮箱</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">密码</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="至少 6 位"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">确认密码</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="再次输入密码"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '注册中…' : '注册'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          已有账号？{' '}
          <Link className="text-blue-600 hover:underline" to="/login">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
