import { useState } from 'react'
import { Dumbbell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/home')
      } else {
        await signUp(email, password)
        setSuccess('Conta criada! Verifique seu e-mail para confirmar (ou faça login diretamente).')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-3">
            <Dumbbell size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Actio Pro</h1>
          <p className="text-muted text-sm mt-1">Gerencie seus treinos</p>
        </div>

        {/* Form */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white text-center">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1 block">E-mail</label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Senha</label>
              <input
                type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password} onChange={e => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-black font-semibold hover:bg-primary-dim transition-colors disabled:opacity-50 mt-1">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-muted text-sm">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-primary hover:underline"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
