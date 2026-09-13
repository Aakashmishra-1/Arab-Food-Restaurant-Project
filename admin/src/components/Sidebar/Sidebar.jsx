import React from 'react'
import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = ({ orderBadge, clearOrderBadge }) => {
  const links = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/orders',    icon: '📦', label: 'Orders',    badge: orderBadge, onClear: clearOrderBadge },
    { to: '/add',       icon: '➕', label: 'Add Item' },
    { to: '/list',      icon: '📋', label: 'Food List' },
    { to: '/todays-menu', icon: '🍽️', label: "Today's Menu" },
    { to: '/coupons',   icon: '🏷️', label: 'Coupons' },
    { to: '/reviews',   icon: '⭐', label: 'Reviews' },
  ]

  return (
    <aside className="admin-sidebar">
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          onClick={l.onClear}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">{l.icon}</span>
          <span className="sidebar-label">{l.label}</span>
          {l.badge > 0 && (
            <span className="sidebar-badge">{l.badge}</span>
          )}
        </NavLink>
      ))}
    </aside>
  )
}

export default Sidebar
