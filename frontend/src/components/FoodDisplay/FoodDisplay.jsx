import React, { useContext } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import './FoodDisplay.css'

const CATEGORY_ORDER = [
  'Paranthas', 'Breakfast', 'Rice Combo', 'Thali', 'Rolls',
  'Salad', 'Sandwich', 'Deserts', 'Drinks', 'Other'
]

const categoryEmojis = {
  'Paranthas': '🫓', 'Breakfast': '🌅', 'Rice Combo': '🍚', 'Thali': '🥘',
  'Rolls': '🌯', 'Salad': '🥗', 'Sandwich': '🥪', 'Deserts': '🍨',
  'Drinks': '🥤', 'Other': '🍴'
}

const categoryDescriptions = {
  'Thali': '🍱 Complete meal platters with authentic taste — Roti, Rice, Dal, Sabzi & more!'
}

const FoodDisplay = ({ category, viewMode, allFoodList }) => {
  const { food_list, searchQuery } = useContext(StoreContext)

  // viewMode 'todays' → food_list (today's menu from backend)
  // viewMode 'all'    → allFoodList (every item, no filter)
  const sourceList = viewMode === 'all' ? (allFoodList || []) : (food_list || [])

  // ── Search mode ──────────────────────────────────────────────────
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    const filtered = sourceList.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
    )
    return (
      <div className="food-display" id="food-display">
        <p className="search-result-label">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<b>{searchQuery}</b>"
        </p>
        {filtered.length === 0
          ? <div className="no-results"><p>😔 No items found for "{searchQuery}"</p></div>
          : <div className="food-grid">{filtered.map(item => <FoodItem key={item._id} item={item} />)}</div>
        }
      </div>
    )
  }

  // ── Section visibility rule ──────────────────────────────────────
  // A section header is shown only if admin has EVER added an item to it
  // (i.e. the category exists in allFoodList). Sections are hidden until
  // admin adds items — satisfying the "hidden until admin adds" condition.
  const allFoodSafe = allFoodList || []
  const categoriesWithItems = new Set(allFoodSafe.map(i => i.category))

  const sectionsToRender = CATEGORY_ORDER.filter(cat => {
    if (!categoriesWithItems.has(cat)) return false          // never added → hide
    if (category !== 'All' && cat !== category) return false // specific category selected
    return true
  })

  // Group current source list by category
  const grouped = {}
  sourceList.forEach(item => {
    if (category !== 'All' && item.category !== category) return
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  if (sectionsToRender.length === 0) {
    return (
      <div className="food-display" id="food-display">
        <div className="no-results">
          <p>{viewMode === 'todays' ? "🍽️ No items on today's menu yet" : '😔 No items found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="food-display" id="food-display">
      {sectionsToRender.map(cat => {
        const items = grouped[cat] || []
        return (
          <div key={cat} className="food-section">
            <div className="food-section-header">
              <span className="section-emoji">{categoryEmojis[cat] || '🍴'}</span>
              <h3 className="section-title">{cat.toUpperCase()}</h3>
              <div className="section-line" />
            </div>
            {categoryDescriptions[cat] && (
              <p className="section-description">{categoryDescriptions[cat]}</p>
            )}
            {items.length === 0
              ? <p className="section-empty">
                  {viewMode === 'todays' ? "Not on today's menu" : 'No items available yet'}
                </p>
              : <div className="food-grid">
                  {items.map(item => <FoodItem key={item._id} item={item} />)}
                </div>
            }
          </div>
        )
      })}
    </div>
  )
}

export default FoodDisplay
