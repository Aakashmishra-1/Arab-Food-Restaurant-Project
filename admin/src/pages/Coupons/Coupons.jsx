import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'react-toastify'
import './Coupons.css'


const Coupons = () => {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState({ code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', maxUses: 100, expiresAt: '' })
  const [loading, setLoading] = useState(false)

  const fetchCoupons = async () => {
    const res = await api.get('/api/coupon/list')
    if (res.data.success) setCoupons(res.data.data)
  }

  useEffect(() => { fetchCoupons() }, [])

  const createCoupon = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await api.post('/api/coupon/create', form)
    if (res.data.success) { toast.success('Coupon created!'); fetchCoupons(); setForm({ code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', maxUses: 100, expiresAt: '' }) }
    else toast.error(res.data.message)
    setLoading(false)
  }

  const deleteCoupon = async (id) => {
    const res = await api.post('/api/coupon/delete', { id })
    if (res.data.success) { toast.success('Coupon deleted'); fetchCoupons() }
  }

  const toggleCoupon = async (id) => {
    const res = await api.post('/api/coupon/toggle', { id })
    if (res.data.success) fetchCoupons()
  }

  return (
    <div className="coupons-page">
      <h2>Coupons & Promo Codes</h2>

      {/* Create form */}
      <div className="coupon-form-card">
        <h3>Create New Coupon</h3>
        <form onSubmit={createCoupon} className="coupon-form">
          <div className="coupon-form-row">
            <label>Coupon Code
              <input placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
            </label>
            <label>Discount Type
              <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </label>
            <label>Discount Value
              <input type="number" placeholder={form.discountType === 'percent' ? '20' : '50'} value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} required />
            </label>
          </div>
          <div className="coupon-form-row">
            <label>Min Order Amount (₹)
              <input type="number" placeholder="0" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
            </label>
            <label>Max Uses
              <input type="number" placeholder="100" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} />
            </label>
            <label>Expires At
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </label>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : '+ Create Coupon'}</button>
        </form>
      </div>

      {/* Coupon list */}
      <div className="coupon-list">
        {coupons.length === 0 ? <p className="no-coupons">No coupons yet. Create one above!</p> : (
          <div className="coupon-table">
            <div className="coupon-table-header">
              <span>Code</span><span>Discount</span><span>Min Order</span>
              <span>Uses</span><span>Expires</span><span>Status</span><span>Actions</span>
            </div>
            {coupons.map(c => (
              <div key={c._id} className={`coupon-row ${!c.isActive ? 'inactive' : ''}`}>
                <span className="coupon-code">{c.code}</span>
                <span className="coupon-discount">
                  {c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`} off
                </span>
                <span>₹{c.minOrderAmount || 0}</span>
                <span>{c.usedCount} / {c.maxUses}</span>
                <span>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}</span>
                <button className={`toggle-btn ${c.isActive ? 'active' : 'paused'}`} onClick={() => toggleCoupon(c._id)}>
                  {c.isActive ? '✅ Active' : '⏸ Paused'}
                </button>
                <button className="del-coupon-btn" onClick={() => deleteCoupon(c._id)}>🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Coupons
