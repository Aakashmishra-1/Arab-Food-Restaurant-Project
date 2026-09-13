import React, { useEffect, useState } from 'react'
import api, { url } from '../../services/api'
import { toast } from 'react-toastify'
import './TodaysMenu.css'


const TodaysMenu = () => {
  const [allFood, setAllFood] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [menuActive, setMenuActive] = useState(false)

  useEffect(() => {
    api.get('/api/food/list').then(res => {
      if (res.data.success) setAllFood(res.data.data)
    })
    api.get('/api/food/todays-menu/get').then(res => {
      if (res.data.success) {
        setSelected(res.data.data)
        setMenuActive(res.data.data.length > 0)
      }
    })
  }, [])

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAll = () => setSelected(allFood.map(f => f._id))
  const clearAll = () => setSelected([])

  const saveMenu = async () => {
    setLoading(true)
    try {
      const res = await api.post('/api/food/todays-menu/set', { selectedIds: selected })
      if (res.data.success) {
        toast.success(selected.length > 0
          ? `Today's menu set — ${selected.length} items showing to customers`
          : 'Menu cleared — all items visible to customers')
        setMenuActive(selected.length > 0)
      } else toast.error('Error saving menu')
    } catch { toast.error('Network error') }
    setLoading(false)
  }

  // Group by category
  const grouped = allFood.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="todays-menu-page">
      <div className="tm-header">
        <div>
          <h2>Today's Menu</h2>
          <p>Select items to show on customer menu today. If nothing selected, all items are visible.</p>
          {menuActive && (
            <span className="menu-active-badge">✅ Custom menu active — {selected.length} items showing</span>
          )}
        </div>
        <div className="tm-actions">
          <button onClick={selectAll} className="btn-outline">Select All</button>
          <button onClick={clearAll} className="btn-outline red">Clear All</button>
          <button onClick={saveMenu} className="btn-save" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Menu'}
          </button>
        </div>
      </div>

      <div className="tm-selected-count">
        {selected.length} of {allFood.length} items selected
        {selected.length === 0 && ' — all items will be visible'}
      </div>

      {allFood.length === 0 ? (
        <div className="tm-empty">No food items added yet. Add items from <b>Add Item</b> section.</div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="tm-category">
            <h3>{category} <span>({items.length})</span></h3>
            <div className="tm-grid">
              {items.map(item => (
                <div
                  key={item._id}
                  className={`tm-item ${selected.includes(item._id) ? 'selected' : ''} ${!item.inStock ? 'oos' : ''}`}
                  onClick={() => toggle(item._id)}
                >
                  <div className="tm-item-check">{selected.includes(item._id) ? '✅' : '⬜'}</div>
                  <img src={`${url}/images/${item.image}`} alt={item.name} />
                  <div className="tm-item-info">
                    <p className="tm-item-name">{item.name}</p>
                    <p className="tm-item-price">₹{item.price}</p>
                    {!item.inStock && <span className="tm-oos-tag">Out of Stock</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default TodaysMenu
