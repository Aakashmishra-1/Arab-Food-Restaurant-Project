import React, { useContext, useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext'
import './MyOrders.css'

const STATUS_STEPS = ['Food Processing', 'Preparing', 'Out for Delivery', 'Delivered']
const STATUS_ICONS = {
  'Food Processing': '🍳', 'Preparing': '👨‍🍳',
  'Out for Delivery': '🚴', 'Delivered': '✅',
}

const getStepIndex = (status) => {
  const idx = STATUS_STEPS.findIndex(s => s.toLowerCase() === status.toLowerCase())
  return idx === -1 ? 0 : idx
}

const MyOrders = () => {
  const { url, token, currency } = useContext(StoreContext)
  const [orders, setOrders] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [reviewData, setReviewData] = useState({})
  const [submittedReviews, setSubmittedReviews] = useState({}) // key: orderId_foodId
  const [submittingReview, setSubmittingReview] = useState(null)
  const prevStatuses = useRef({})
  const isFirstLoad = useRef(true)

  const fetchOrders = async () => {
    try {
      const res = await axios.post(url + '/api/order/userorders', {}, { headers: { token } })
      if (!res.data.success) return
      const fetched = res.data.data

      if (!isFirstLoad.current) {
        fetched.forEach(order => {
          const prev = prevStatuses.current[order._id]
          if (prev && prev !== order.status) {
            const icon = STATUS_ICONS[order.status] || '📦'
            const names = order.items.map(i => i.name).join(', ')
            toast.info(`${icon} "${names}" is now: ${order.status}`, {
              autoClose: 6000, position: 'top-right'
            })
          }
        })
      }

      fetched.forEach(o => { prevStatuses.current[o._id] = o.status })
      isFirstLoad.current = false
      setOrders(fetched)
    } catch {}
  }

  useEffect(() => {
    if (!token) return
    fetchOrders()
    const interval = setInterval(fetchOrders, 8000)
    return () => clearInterval(interval)
  }, [token])

  const updateReview = (orderId, foodId, field, value) => {
    const key = `${orderId}_${foodId}`
    setReviewData(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const submitReview = async (order, item) => {
    const key = `${order._id}_${item._id}`
    const rd = reviewData[key] || {}
    if (!rd.rating) { toast.info('Please select a star rating first'); return }
    setSubmittingReview(key)
    try {
      const res = await axios.post(url + '/api/review/add', {
        foodId: item._id,
        orderId: order._id,
        rating: rd.rating,
        comment: rd.comment || ''
      }, { headers: { token } })

      if (res.data.success) {
        toast.success('✅ Review submitted! Thank you.')
        // Mark as submitted so UI updates immediately
        setSubmittedReviews(prev => ({ ...prev, [key]: { rating: rd.rating, comment: rd.comment || '' } }))
      } else {
        toast.error(res.data.message || 'Could not submit review')
      }
    } catch {
      toast.error('Network error, please try again')
    }
    setSubmittingReview(null)
  }

  if (!token) return <div className="mo-empty"><p>Please sign in to view orders</p></div>

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      {orders.length === 0
        ? <div className="mo-empty"><p>No orders yet 🍽️</p></div>
        : <div className="mo-list">
            {orders.map(order => {
              const stepIdx = getStepIndex(order.status)
              const isExpanded = expanded === order._id
              const isDelivered = order.status === 'Delivered'

              return (
                <div key={order._id} className={`mo-card ${isDelivered ? 'mo-card-delivered' : ''}`}>

                  {/* ── Card header — always visible ── */}
                  <div
                    className="mo-card-header"
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                  >
                    <div className="mo-card-left">
                      <span className="mo-icon">{isDelivered ? '✅' : '📦'}</span>
                      <div>
                        <p className="mo-items">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                        <p className="mo-date">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="mo-card-right">
                      <span className="mo-amount">{currency}{order.amount}</span>
                      <span className={`mo-status status-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
                      <span className="mo-expand">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* ── RATING SECTION — shown directly on Delivered cards (no expand needed) ── */}
                  {isDelivered && (
                    <div className="mo-rating-section">
                      <p className="mo-rating-title">⭐ Rate your order</p>
                      <div className="mo-rating-items">
                        {order.items.map((item, i) => {
                          const key = `${order._id}_${item._id}`
                          const rd = reviewData[key] || {}
                          const submitted = submittedReviews[key]

                          return (
                            <div key={i} className="mo-rating-item">
                              <span className="mo-rating-item-name">{item.name}</span>
                              {submitted ? (
                                <div className="mo-rating-submitted">
                                  <span className="mo-submitted-stars">
                                    {[1,2,3,4,5].map(n => (
                                      <span key={n} className={`star-sm ${submitted.rating >= n ? 'filled' : ''}`}>★</span>
                                    ))}
                                  </span>
                                  <span className="mo-submitted-label">Rated ✓</span>
                                  {submitted.comment && <span className="mo-submitted-comment">"{submitted.comment}"</span>}
                                </div>
                              ) : (
                                <div className="mo-rating-input">
                                  <div className="star-picker">
                                    {[1,2,3,4,5].map(n => (
                                      <span
                                        key={n}
                                        className={`star ${rd.rating >= n ? 'filled' : ''}`}
                                        onClick={() => updateReview(order._id, item._id, 'rating', n)}
                                      >★</span>
                                    ))}
                                  </div>
                                  <div className="mo-comment-row">
                                    <input
                                      type="text"
                                      className="mo-comment-input"
                                      placeholder="Add a comment (optional)"
                                      value={rd.comment || ''}
                                      onChange={e => updateReview(order._id, item._id, 'comment', e.target.value)}
                                    />
                                    <button
                                      className="mo-submit-btn"
                                      onClick={() => submitReview(order, item)}
                                      disabled={submittingReview === key || !rd.rating}
                                    >
                                      {submittingReview === key ? '...' : 'Submit'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Expanded details ── */}
                  {isExpanded && (
                    <div className="mo-details">
                      <div className="tracker">
                        <h4>📍 Order Tracking</h4>
                        <div className="tracker-steps">
                          {STATUS_STEPS.map((step, i) => (
                            <div key={step} className={`tracker-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                              <div className="tracker-dot">{i <= stepIdx ? '✓' : i + 1}</div>
                              <p>{step}</p>
                              {i < STATUS_STEPS.length - 1 && <div className={`tracker-line ${i < stepIdx ? 'filled' : ''}`} />}
                            </div>
                          ))}
                        </div>
                        <p className="est-delivery">🕐 Estimated: {order.estimatedDelivery || '30-45 mins'}</p>
                      </div>

                      <div className="mo-section">
                        <h4>🍽️ Items</h4>
                        {order.items.map((item, i) => (
                          <div key={i} className="mo-item-row">
                            <span>{item.name}{item.selectedVariant ? ` (${item.selectedVariant})` : ''}</span>
                            <span>×{item.quantity}</span>
                            <span>{currency}{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mo-meta-grid">
                        <div className="mo-section">
                          <h4>💳 Payment</h4>
                          <p>Method: <b>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</b></p>
                          <p>Status: <b style={{ color: order.payment ? '#2e7d32' : '#FF6B35' }}>{order.payment ? 'Paid' : 'Pending'}</b></p>
                          {order.discount > 0 && <p>Discount: <b style={{ color: '#2e7d32' }}>−{currency}{order.discount}</b></p>}
                        </div>
                        <div className="mo-section">
                          <h4>📍 Delivery Address</h4>
                          <p>{order.address.firstName} {order.address.lastName}</p>
                          <p>{order.address.street}, {order.address.city}</p>
                          <p>{order.address.state} - {order.address.pincode}</p>
                          <p>📞 {order.address.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
      }
    </div>
  )
}

export default MyOrders
