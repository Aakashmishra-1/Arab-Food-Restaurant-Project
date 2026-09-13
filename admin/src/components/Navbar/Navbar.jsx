import React from 'react'
import './Navbar.css'

const Navbar = ({ setToken }) => {
  const logout = () => { localStorage.removeItem('admin_token'); setToken('') }
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-logo">Arab<span>Punjab</span> <small>Admin</small></div>
      <button onClick={logout} className="admin-logout-btn">🚪 Logout</button>
    </nav>
  )
}
export default Navbar
