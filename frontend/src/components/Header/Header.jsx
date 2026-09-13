import React, { useContext } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import './Header.css'

const Header = () => {
  const { searchQuery, setSearchQuery } = useContext(StoreContext)

  return (
    <div className="header">
      <div className="header-content">
        <h1>Taste of Arabia<br />in the Heart of Punjab 🌿</h1>
        <p>Fresh, authentic, pure vegetarian food — delivered to your door</p>
        <div className="header-search">
          <input
            type="text"
            placeholder="Search biryanis, wraps, desserts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button onClick={() => document.getElementById('food-display')?.scrollIntoView({ behavior: 'smooth' })}>
            Search
          </button>
        </div>
        <div className="header-badges">
          <span>🟢 100% Pure Veg</span>
          <span>🕐 30-45 Min Delivery</span>
          <span>⭐ 4.8 Rated</span>
        </div>
      </div>
    </div>
  )
}

export default Header
