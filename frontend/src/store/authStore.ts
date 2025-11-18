interface User {
  id: string
  username: string
  email: string
  role: 'bounty_hunter' | 'company'
  completedBounties: string[] // Array of bounty IDs
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  signup: (username: string, email: string, password: string) => void
  login: (email: string, password: string) => boolean
  logout: () => void
  completeBounty: (bountyId: string) => void
}

// Simple localStorage-based auth (no backend)
const STORAGE_KEY = 'bountymap_auth'
const USERS_KEY = 'bountymap_users'

function loadUsers(): Map<string, { password: string; user: User }> {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      const map = new Map()
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        map.set(key, value)
      })
      return map
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
  return new Map()
}

function saveUsers(users: Map<string, { password: string; user: User }>) {
  try {
    const obj = Object.fromEntries(users)
    localStorage.setItem(USERS_KEY, JSON.stringify(obj))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

function loadAuth(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading auth:', error)
  }
  return null
}

function saveAuth(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.error('Error saving auth:', error)
  }
}

// Simple hash function (not secure, but fine for demo)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

export const authStore: AuthState = {
  user: loadAuth(),
  isAuthenticated: !!loadAuth(),

  signup: (username: string, email: string, password: string) => {
    const users = loadUsers()
    
    // Check if user already exists
    if (users.has(email)) {
      throw new Error('User already exists')
    }

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      role: 'bounty_hunter',
      completedBounties: [],
      createdAt: new Date().toISOString(),
    }

    users.set(email, {
      password: simpleHash(password),
      user,
    })

    saveUsers(users)
    saveAuth(user)
    authStore.user = user
    authStore.isAuthenticated = true
  },

  login: (email: string, password: string): boolean => {
    const users = loadUsers()
    const userData = users.get(email)

    if (!userData || userData.password !== simpleHash(password)) {
      return false
    }

    saveAuth(userData.user)
    authStore.user = userData.user
    authStore.isAuthenticated = true
    return true
  },

  logout: () => {
    saveAuth(null)
    authStore.user = null
    authStore.isAuthenticated = false
  },

  completeBounty: (bountyId: string) => {
    if (!authStore.user) return

    const updatedUser = {
      ...authStore.user,
      completedBounties: [...authStore.user.completedBounties, bountyId],
    }

    // Update in users storage
    const users = loadUsers()
    const userData = users.get(authStore.user.email)
    if (userData) {
      userData.user = updatedUser
      users.set(authStore.user.email, userData)
      saveUsers(users)
    }

    saveAuth(updatedUser)
    authStore.user = updatedUser
  },
}

