import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext'
import './Cart.css'

const Cart = () => {
  const { food_list, cartItems, removeFromCart, addToCart, getTotalCartAmount, currency, deliveryCharge, url, token } = useContext(StoreContext)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const navigate = useNavigate()

  const cartEntries = Object.entries(cartItems).filter(([, qty]) => qty > 0)

  const getItemDetails = (key) => {
    const [itemId, variant] = key.includes('_') ? key.split('_') : [key, '']
    const item = food_list.find(f => f._id === itemId)
    if (!item) return null
    const price = variant && item.variants?.length > 0
      ? (item.variants.find(v => v.size === variant)?.price || item.price)
      : item.price
    return { ...item, selectedVariant: variant, displayPrice: price }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const res = await axios.post(url + '/api/coupon/validate', { code: couponCode, amount: getTotalCartAmount() })
      if (res.data.success) {
        setDiscount(res.data.discount)
        setCouponMsg(res.data.message)
        setCouponApplied(true)
        toast.success(res.data.message)
      } else {
        setCouponMsg(res.data.message)
        toast.error(res.data.message)
      }
    } catch { toast.error('Error applying coupon') }
  }

  const removeCoupon = () => { setDiscount(0); setCouponCode(''); setCouponMsg(''); setCouponApplied(false) }

  const subtotal = getTotalCartAmount()
  const total = subtotal + deliveryCharge - discount

  const handleCheckout = () => {
    if (!token) { toast.info('Please sign in to place order'); return }
    if (cartEntries.length === 0) { toast.info('Your cart is empty'); return }
    navigate('/order', { state: { couponCode: couponApplied ? couponCode : '', discount } })
  }

  if (cartEntries.length === 0) return (
    <div className="cart-empty">
      <p>🛒 Your cart is empty</p>
      <button onClick={() => navigate('/')}>Browse Menu</button>
    </div>
  )

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {cartEntries.map(([key, qty]) => {
            const item = getItemDetails(key)
            if (!item) return null
            return (
              <div key={key} className="cart-item">
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <div className="cart-item-info">
                  <h4>{item.name}{item.selectedVariant && <span className="variant-tag">{item.selectedVariant}</span>}</h4>
                  <p className="cart-item-price">{currency}{item.displayPrice} each</p>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => removeFromCart(item._id, item.selectedVariant)}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => addToCart(item._id, item.selectedVariant)}>+</button>
                </div>
                <span className="cart-item-subtotal">{currency}{item.displayPrice * qty}</span>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{currency}{subtotal}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{currency}{deliveryCharge}</span></div>
          {discount > 0 && <div className="summary-row discount-row"><span>Discount</span><span>−{currency}{discount}</span></div>}
          <div className="summary-row total-row"><span>Total</span><span>{currency}{total}</span></div>

          {/* Coupon */}
          <div className="coupon-box">
            <h4>Have a coupon?</h4>
            {!couponApplied ? (
              <div className="coupon-input">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                />
                <button onClick={applyCoupon}>Apply</button>
              </div>
            ) : (
              <div className="coupon-applied">
                <span>✅ {couponCode} applied</span>
                <button onClick={removeCoupon}>Remove</button>
              </div>
            )}
            {couponMsg && !couponApplied && <p className="coupon-msg error">{couponMsg}</p>}
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
