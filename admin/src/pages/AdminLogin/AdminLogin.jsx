import React, { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import './AdminLogin.css'

const AdminLogin = ({ setToken }) => {
  const [mode, setMode] = useState('login') // 'login' | 'create'
  const [data, setData] = useState({ name: '', email: '', password: '', adminSetupKey: '' })
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value })

  const switchMode = (newMode) => {
    setMode(newMode)
    setData({ name: '', email: '', password: '', adminSetupKey: '' })
  }

  const onLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/user/login', {
        email: data.email,
        password: data.password,
        role: 'admin',
      })
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.token)
        setToken(res.data.token)
        toast.success('Welcome, Admin!')
      } else {
        toast.error(res.data.message || 'Login failed')
      }
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
  }

  const onCreateAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/user/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'admin',
        adminSetupKey: data.adminSetupKey,
      })
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.token)
        setToken(res.data.token)
        toast.success('Admin account created!')
      } else {
        toast.error(res.data.message || 'Could not create admin account')
      }
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>Arab<span>Punjab</span></h1>
          <p>Admin Portal</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={onLogin}>
            <label>Email Address</label>
            <input type="email" name="email" placeholder="admin@arabpunjab.com" value={data.email} onChange={onChange} required />
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" value={data.password} onChange={onChange} required />
            <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In to Admin Panel'}</button>
          </form>
        ) : (
          <form onSubmit={onCreateAdmin}>
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Your name" value={data.name} onChange={onChange} required />
            <label>Email Address</label>
            <input type="email" name="email" placeholder="admin@arabpunjab.com" value={data.email} onChange={onChange} required />
            <label>Password</label>
            <input type="password" name="password" placeholder="8+ characters" value={data.password} onChange={onChange} required minLength={8} />
            <label>Admin Setup Key</label>
            <input type="password" name="adminSetupKey" placeholder="Shared setup key" value={data.adminSetupKey} onChange={onChange} required />
            <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Admin Account'}</button>
          </form>
        )}

        <p className="admin-login-note">
          {mode === 'login' ? (
            <>Need a new admin account? <span className="admin-login-link" onClick={() => switchMode('create')}>Create one</span></>
          ) : (
            <>Already have an account? <span className="admin-login-link" onClick={() => switchMode('login')}>Sign in</span></>
          )}
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
