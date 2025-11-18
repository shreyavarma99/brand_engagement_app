import { useState } from 'react'
import { authStore } from '../store/authStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        const success = authStore.login(email, password)
        if (success) {
          onSuccess()
          onClose()
          setEmail('')
          setPassword('')
        } else {
          setError('Invalid email or password')
        }
      } else {
        authStore.signup(username, email, password)
        onSuccess()
        onClose()
        setUsername('')
        setEmail('')
        setPassword('')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-mono">
      <div className="bg-hacker-surface border border-hacker-border p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-hacker-primary">
            {isLogin ? 'login()' : 'signup()'}
          </h2>
          <button
            onClick={onClose}
            className="text-hacker-text-dim hover:text-hacker-text"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-hacker-danger/20 border border-hacker-danger text-hacker-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs text-hacker-text-dim mb-1">username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="hacker-input w-full text-sm"
                required
                placeholder="bounty_hunter_123"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-hacker-text-dim mb-1">email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hacker-input w-full text-sm"
              required
              placeholder="hunter@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-hacker-text-dim mb-1">password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hacker-input w-full text-sm"
              required
              minLength={6}
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="hacker-button-primary w-full text-sm"
          >
            {isLogin ? 'login()' : 'signup()'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-xs text-hacker-text-dim hover:text-hacker-primary"
          >
            {isLogin ? 'need_account? signup()' : 'have_account? login()'}
          </button>
        </div>
      </div>
    </div>
  )
}

