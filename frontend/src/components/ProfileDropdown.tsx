import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../store/authStore'

export default function ProfileDropdown() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!authStore.isAuthenticated || !authStore.user) {
    return null
  }

  const handleLogout = () => {
    authStore.logout()
    setIsOpen(false)
    navigate('/')
  }

  // Get initials for profile picture
  const initials = authStore.user.username
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'BH'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded border border-hacker-border bg-hacker-primary/20 hover:bg-hacker-primary/30 transition-colors flex items-center justify-center text-xs font-mono font-semibold text-hacker-primary"
        title={authStore.user.username}
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-hacker-surface border border-hacker-border min-w-[180px] z-50">
          <div className="p-2 border-b border-hacker-border">
            <p className="text-xs text-hacker-text font-mono font-semibold">{authStore.user.username}</p>
            <p className="text-xs text-hacker-text-dim font-mono">{authStore.user.email}</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                navigate('/profile')
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs text-hacker-text hover:bg-hacker-bg transition-colors font-mono"
            >
              profile
            </button>
            <button
              onClick={() => {
                navigate('/profile?tab=rewards')
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs text-hacker-text hover:bg-hacker-bg transition-colors font-mono"
            >
              rewards
            </button>
            <button
              onClick={() => {
                navigate('/profile?tab=settings')
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs text-hacker-text hover:bg-hacker-bg transition-colors font-mono"
            >
              settings
            </button>
          </div>

          <div className="p-2 border-t border-hacker-border">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-xs text-hacker-danger hover:bg-hacker-danger/10 transition-colors font-mono"
            >
              logout()
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

