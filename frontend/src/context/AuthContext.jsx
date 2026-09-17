import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../services/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mtaafix_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('mtaafix_token'))
      .finally(() => setLoading(false))
  }, [])

  const loginUser = async (credentials) => {
    const res = await authApi.login(credentials)
    localStorage.setItem('mtaafix_token', res.data.token)
    setUser(res.data.user)
  }

  const registerUser = async (data) => {
    const res = await authApi.register(data)
    localStorage.setItem('mtaafix_token', res.data.token)
    setUser({ id: res.data.id, username: res.data.username, email: res.data.email, role: res.data.role })
  }

  const logoutUser = async () => {
    try {
      await authApi.logout()
    } catch {
      // even if the server call fails, clear local state so the user isn't stuck
    }
    localStorage.removeItem('mtaafix_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}