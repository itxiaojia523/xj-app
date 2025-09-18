// src/pages/auth/Login.tsx
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth';
import { AuthCredentials } from '../../type';

type FormState = AuthCredentials 
const emailOk = (v: string) => /\S+@\S+\.\S+/.test(v)

export default function Login() {
  const [form, setForm] = useState<FormState>({ email: '', password: '',})
  const [err, setErr] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    
    e.preventDefault()
    setErr('')
    if (!emailOk(form.email)) return setErr('请输入正确的邮箱')
    if (!form.password) return setErr('请输入密码')

    try {
      setLoading(true)
      await login(form)
      await new Promise(r => setTimeout(r, 600)) // 模拟异步
      navigate('/', { replace: true })
    } catch (e) {
      setErr('登录失败，请检查邮箱或密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">登录</h1>
        <p className="mt-1 text-sm text-slate-600">欢迎回来，请使用你的账户登录。</p>

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
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          还没有账号？{' '}
          <Link className="text-blue-600 hover:underline" to="/register">
            去注册
          </Link>
        </p>
      </div>
    </div>
  )
}
