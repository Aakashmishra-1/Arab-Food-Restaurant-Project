import React from 'react'
import './ExploreMenu.css'

const categoryEmojis = {
  'Paranthas': '🫓', 'Breakfast': '🌅', 'Rice Combo': '🍚', 'Thali': '🥘',
  'Rolls': '🌯', 'Salad': '🥗', 'Sandwich': '🥪', 'Deserts': '🍨',
  'Drinks': '🥤', 'Other': '🍴'
}

const ExploreMenu = ({ category, setCategory, viewMode, setViewMode, availableCategories }) => (
  <div className="explore-menu" id="explore-menu">
    <h2>Explore Our Menu</h2>
    <p>Fresh, pure veg food — made with love in Punjab 🌿</p>

    <div className="menu-toggle">
      <button
        className={`toggle-pill ${viewMode === 'todays' ? 'active' : ''}`}
        onClick={() => setViewMode('todays')}
      >
        🍽️ Today's Menu
      </button>
      <button
        className={`toggle-pill ${viewMode === 'all' ? 'active' : ''}`}
        onClick={() => setViewMode('all')}
      >
        📋 All Items
      </button>
    </div>

    {availableCategories.length > 0 && (
      <div className="category-list">
        <button
          className={`category-btn ${category === 'All' ? 'active' : ''}`}
          onClick={() => setCategory('All')}
        >
          <span>🍽️</span>
          <p>All</p>
        </button>
        {availableCategories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            <span>{categoryEmojis[cat] || '🍴'}</span>
            <p>{cat}</p>
          </button>
        ))}
      </div>
    )}
    <hr />
  </div>
)

export default ExploreMenu
