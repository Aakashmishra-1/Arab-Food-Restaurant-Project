import React, { useContext, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import './Navbar.css'

const Navbar = ({ setShowLogin }) => {
  const { token, setToken, getCartCount, setCartItems, searchQuery, setSearchQuery } = useContext(StoreContext)
  const [showSearch, setShowSearch] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    setShowDropdown(false)
    navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const goTo = (path) => {
    setShowDropdown(false)
    navigate(path)
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Arab<span>Punjab</span>
        <small>🟢 Pure Veg</small>
      </Link>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><a href="/#explore-menu">Menu</a></li>
        <li><Link to="/myorders">Orders</Link></li>
        <li><Link to="/wishlist">Wishlist</Link></li>
        <li><Link to="/coupons">Coupons</Link></li>
      </ul>

      <div className="navbar-actions">
        {showSearch && (
          <input
            className="navbar-search"
            type="text"
            placeholder="Search food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            onBlur={() => { if (!searchQuery) setShowSearch(false) }}
          />
        )}
        <button className="icon-btn" onClick={() => setShowSearch(!showSearch)} title="Search">🔍</button>
        <Link to="/cart" className="cart-btn">
          🛒 {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
        </Link>

        {!token ? (
          <button className="login-btn" onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className="profile-menu" ref={dropdownRef}>
            <span className="profile-icon" onClick={() => setShowDropdown(!showDropdown)}>👤</span>
            {showDropdown && (
              <ul className="profile-dropdown">
                <li onClick={() => goTo('/profile')}>👤 Profile</li>
                <li onClick={() => goTo('/myorders')}>📦 Orders</li>
                <li onClick={() => goTo('/wishlist')}>❤️ Wishlist</li>
                <li onClick={() => goTo('/coupons')}>🏷️ Coupons</li>
                <li onClick={logout}>🚪 Logout</li>
              </ul>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
