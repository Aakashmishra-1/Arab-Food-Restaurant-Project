import React, { useEffect, useState, useCallback } from 'react'
import api from '../../services/api'
import { toast } from 'react-toastify'
import './Orders.css'

const STATUSES = ['Food Processing', 'Preparing', 'Out for Delivery', 'Delivered']

// Orders receives onNewOrders prop from App.jsx to update sidebar badge count
const Orders = ({ onNewOrders }) => {
  const [orders, setOrders] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const knownIds = React.useRef(new Set())
  const isFirstLoad = React.useRef(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/api/order/list')
      if (!res.data.success) return
      const fetched = res.data.data

      if (!isFirstLoad.current) {
        // Detect genuinely new orders
        let newCount = 0
        fetched.forEach(order => {
          if (!knownIds.current.has(order._id)) {
            newCount++
            const items = order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')
            toast.success(
              `🛒 New Order! ${order.address?.firstName || ''} ${order.address?.lastName || ''} — ${items} — ₹${order.amount}`,
              { autoClose: 8000, position: 'top-right' }
            )
            // Play beep
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain); gain.connect(ctx.destination)
              osc.frequency.value = 880
              gain.gain.setValueAtTime(0.3, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
              osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5)
            } catch (_) {}
          }
          knownIds.current.add(order._id)
        })
        if (newCount > 0 && onNewOrders) onNewOrders(newCount)
      } else {
        // First load — seed known IDs silently
        fetched.forEach(o => knownIds.current.add(o._id))
        isFirstLoad.current = false
      }

      setOrders(fetched)
    } catch {}
  }, [onNewOrders])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.post('/api/order/status', { orderId, status })
      if (res.data.success) {
        fetchOrders()
        toast.success('Status updated ✅')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const deleteAll = async () => {
    const res = await api.post('/api/order/delete-all')
    if (res.data.success) { toast.success('All orders deleted'); fetchOrders() }
    setShowConfirm(false)
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>Orders ({orders.length})</h2>
        <button className="del-all-btn" onClick={() => setShowConfirm(true)}>🗑 Delete All</button>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-left">
              <div className="order-icon">📦</div>
              <div>
                <p className="order-customer">{order.address.firstName} {order.address.lastName}</p>
                <p className="order-addr">{order.address.street}, {order.address.city} — {order.address.phone}</p>
                <p className="order-items">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                <div className="order-tags">
                  <span className="order-amount">₹{order.amount}</span>
                  <span className={`order-pay pay-${order.paymentMethod}`}>{order.paymentMethod === 'cod' ? 'COD' : 'Razorpay'}</span>
                  <span className={`order-paid ${order.payment ? 'yes' : 'no'}`}>{order.payment ? 'Paid' : 'Unpaid'}</span>
                  {order.couponCode && <span className="order-coupon">🏷 {order.couponCode}</span>}
                </div>
              </div>
            </div>
            <select
              className="status-select"
              value={order.status}
              onChange={e => updateStatus(order._id, e.target.value)}
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Delete All Orders?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-btns">
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="confirm-del" onClick={deleteAll}>Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
