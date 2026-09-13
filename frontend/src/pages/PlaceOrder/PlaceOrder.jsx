import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext'
import './PlaceOrder.css'

const PlaceOrder = () => {
  const { food_list, cartItems, getTotalCartAmount, token, url, setCartItems, currency, deliveryCharge, userProfile } = useContext(StoreContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { couponCode = '', discount = 0 } = location.state || {}

  const [payment, setPayment] = useState('cod')
  const [address, setAddress] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', state: '', pincode: '', landmark: ''
  })
  const [useSaved, setUseSaved] = useState('')
  const [loading, setLoading] = useState(false)

  const subtotal = getTotalCartAmount()
  const total = subtotal + deliveryCharge - discount

  // Pre-fill from profile
  useEffect(() => {
    if (userProfile) {
      const [firstName = '', lastName = ''] = (userProfile.name || '').split(' ')
      setAddress(a => ({ ...a, firstName, lastName, email: userProfile.email || '', phone: userProfile.phone || '' }))
    }
  }, [userProfile])

  useEffect(() => {
    if (!token) { toast.info('Please sign in first'); navigate('/cart') }
    else if (subtotal === 0) navigate('/cart')
  }, [token])

  const onChange = e => setAddress({ ...address, [e.target.name]: e.target.value })

  const fillSavedAddress = (saved) => {
    setAddress(a => ({ ...a, ...saved }))
    setUseSaved(saved._id)
  }

  const buildOrderItems = () => {
    const items = []
    for (const key in cartItems) {
      if (cartItems[key] <= 0) continue
      const [itemId, variant] = key.includes('_') ? key.split('_') : [key, '']
      const item = food_list.find(f => f._id === itemId)
      if (!item) continue
      const price = variant && item.variants?.length > 0
        ? (item.variants.find(v => v.size === variant)?.price || item.price)
        : item.price
      items.push({ ...item, quantity: cartItems[key], selectedVariant: variant, price })
    }
    return items
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    const items = buildOrderItems()
    const orderData = { items, amount: subtotal, address, couponCode, discount }

    try {
      if (payment === 'cod') {
        const res = await axios.post(url + '/api/order/place-cod', orderData, { headers: { token } })
        if (res.data.success) {
          setCartItems({})
          toast.success('Order placed! Check your email for confirmation.')
          navigate('/myorders')
        } else toast.error(res.data.message)

      } else if (payment === 'razorpay') {
        const res = await axios.post(url + '/api/order/place-razorpay', orderData, { headers: { token } })
        if (!res.data.success) { toast.error(res.data.message); setLoading(false); return }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: res.data.amount,
          currency: res.data.currency,
          name: 'Arab Food Punjab',
          description: 'Food Order Payment',
          order_id: res.data.razorpayOrderId,
          handler: async (response) => {
            const verify = await axios.post(url + '/api/order/verify-razorpay', {
              orderId: res.data.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }, { headers: { token } })
            if (verify.data.success) {
              setCartItems({})
              toast.success('Payment successful! Order confirmed.')
              navigate('/myorders')
            } else toast.error('Payment verification failed')
          },
          prefill: { name: `${address.firstName} ${address.lastName}`, email: address.email, contact: address.phone },
          theme: { color: '#FF6B35' },
          modal: { ondismiss: () => { toast.info('Payment cancelled'); setLoading(false) } }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
        return
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="place-order-page">
      <form onSubmit={placeOrder} className="place-order-form">
        {/* LEFT - Delivery Info */}
        <div className="place-order-left">
          <h2>Delivery Information</h2>

          {/* Saved addresses */}
          {userProfile?.savedAddresses?.length > 0 && (
            <div className="saved-addresses">
              <h4>Saved Addresses</h4>
              <div className="saved-addr-list">
                {userProfile.savedAddresses.map(addr => (
                  <div
                    key={addr._id}
                    className={`saved-addr-card ${useSaved === addr._id ? 'selected' : ''}`}
                    onClick={() => fillSavedAddress(addr)}
                  >
                    <b>{addr.label}</b>
                    <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-row">
            <input name="firstName" placeholder="First Name" value={address.firstName} onChange={onChange} required />
            <input name="lastName" placeholder="Last Name" value={address.lastName} onChange={onChange} required />
          </div>
          <input name="email" type="email" placeholder="Email Address" value={address.email} onChange={onChange} required />
          <input name="phone" placeholder="Phone Number" value={address.phone} onChange={onChange} required />
          <input name="street" placeholder="Street / House No." value={address.street} onChange={onChange} required />
          <div className="form-row">
            <input name="city" placeholder="City" value={address.city} onChange={onChange} required />
            <input name="state" placeholder="State" value={address.state} onChange={onChange} required />
          </div>
          <div className="form-row">
            <input name="pincode" placeholder="Pincode" value={address.pincode} onChange={onChange} required />
            <input name="landmark" placeholder="Landmark (optional)" value={address.landmark} onChange={onChange} />
          </div>
        </div>

        {/* RIGHT - Summary + Payment */}
        <div className="place-order-right">
          <div className="order-summary-box">
            <h3>Order Summary</h3>
            <div className="order-summary-rows">
              <div className="order-summary-row"><span>Subtotal</span><span>{currency}{subtotal}</span></div>
              <div className="order-summary-row"><span>Delivery</span><span>{currency}{deliveryCharge}</span></div>
              {discount > 0 && (
                <div className="order-summary-row discount"><span>Coupon Discount</span><span>−{currency}{discount}</span></div>
              )}
              <div className="order-summary-row total"><span>Total</span><span>{currency}{total}</span></div>
            </div>
            <p className="delivery-est">🕐 Estimated delivery: 30–45 mins</p>
          </div>

          <div className="payment-box">
            <h3>Payment Method</h3>
            <div className={`payment-option ${payment === 'cod' ? 'selected' : ''}`} onClick={() => setPayment('cod')}>
              <div className="radio-dot">{payment === 'cod' ? '🔵' : '⚪'}</div>
              <div>
                <b>Cash on Delivery</b>
                <p>Pay when your order arrives</p>
              </div>
            </div>
            <div className={`payment-option ${payment === 'razorpay' ? 'selected' : ''}`} onClick={() => setPayment('razorpay')}>
              <div className="radio-dot">{payment === 'razorpay' ? '🔵' : '⚪'}</div>
              <div>
                <b>Razorpay</b>
                <p>UPI, Cards, Net Banking, Wallets</p>
              </div>
            </div>
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? 'Processing...' : `Place Order — ${currency}${total}`}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PlaceOrder
