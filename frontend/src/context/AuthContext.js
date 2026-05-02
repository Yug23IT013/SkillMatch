'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
