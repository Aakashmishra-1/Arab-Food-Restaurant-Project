import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import './CartCapsule.css'

const CartCapsule = () => {
  const { cartItems, food_list, getTotalCartAmount, currency } = useContext(StoreContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [bump, setBump] = useState(false)

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0)
  const totalAmount = getTotalCartAmount()

  // Get names of items in cart (up to 2 for display)
  const cartItemNames = []
  for (const key in cartItems) {
    if (cartItems[key] > 0) {
      const itemId = key.includes('_') ? key.split('_')[0] : key
      const item = food_list.find(f => f._id === itemId)
      if (item && !cartItemNames.includes(item.name)) {
        cartItemNames.push(item.name)
      }
    }
  }

  // Bump animation on cart change
  useEffect(() => {
    if (totalItems > 0) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 400)
      return () => clearTimeout(t)
    }
  }, [totalItems])

  // Hide on cart, checkout, orders pages
  const hideOn = ['/cart', '/order', '/myorders']
  if (totalItems === 0 || hideOn.includes(location.pathname)) return null

  const preview = cartItemNames.slice(0, 2).join(', ') + (cartItemNames.length > 2 ? ` +${cartItemNames.length - 2} more` : '')

  return (
    <div className={`cart-capsule ${bump ? 'bump' : ''}`} onClick={() => navigate('/cart')}>
      <div className="cart-capsule-left">
        <div className="cart-capsule-count">{totalItems}</div>
        <div className="cart-capsule-text">
          <span className="cart-capsule-items">{preview}</span>
          <span className="cart-capsule-sub">in your bag</span>
        </div>
      </div>
      <div className="cart-capsule-right">
        <span className="cart-capsule-amount">{currency}{totalAmount}</span>
        <span className="cart-capsule-arrow">View Bag →</span>
      </div>
    </div>
  )
}

export default CartCapsule
