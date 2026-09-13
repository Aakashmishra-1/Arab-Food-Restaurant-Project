import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext'
import './LoginPopup.css'

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, loadCartData, fetchWishlist, fetchProfile } = useContext(StoreContext)
  const [mode, setMode] = useState('login')
  const [data, setData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/user/login' : '/api/user/register'
      const res = await axios.post(url + endpoint, data)
      if (res.data.success) {
        localStorage.setItem('token', res.data.token)
        setToken(res.data.token)
        await loadCartData(res.data.token)
        if (fetchWishlist) await fetchWishlist(res.data.token)
        if (fetchProfile) await fetchProfile(res.data.token)
        setShowLogin(false)
        toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!')
      } else {
        toast.error(res.data.message)
      }
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
  }

  return (
    <div className="popup-overlay" onClick={() => setShowLogin(false)}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={() => setShowLogin(false)}>✕</button>
        <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <p className="popup-subtitle">Arab Food Punjab</p>
        <form onSubmit={onSubmit}>
          {mode === 'signup' && (
            <input name="name" type="text" placeholder="Full Name" value={data.name} onChange={onChange} required />
          )}
          <input name="email" type="email" placeholder="Email Address" value={data.email} onChange={onChange} required />
          <input name="password" type="password" placeholder="Password (min 8 chars)" value={data.password} onChange={onChange} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="popup-toggle">
          {mode === 'login' ? (
            <>New here? <span onClick={() => setMode('signup')}>Create account</span></>
          ) : (
            <>Already have account? <span onClick={() => setMode('login')}>Sign in</span></>
          )}
        </p>
      </div>
    </div>
  )
}

export default LoginPopup
