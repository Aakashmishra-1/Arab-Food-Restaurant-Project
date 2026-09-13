import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext'
import './Coupons.css'

const UserCoupons = () => {
  const { url, token } = useContext(StoreContext)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [myCoupons, setMyCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [claimingId, setClaimingId] = useState(null)

  const fetchAvailable = async () => {
    try {
      const res = await axios.get(url + '/api/coupon/list')
      if (res.data.success) {
        // Only show active, not expired, not maxed out
        const valid = res.data.data.filter(c => {
          if (!c.isActive) return false
          if (c.expiresAt && new Date() > new Date(c.expiresAt)) return false
          if (c.usedCount >= c.maxUses) return false
          return true
        })
        setAvailableCoupons(valid)
      }
    } catch { }
  }

  const fetchMyCoupons = async () => {
    if (!token) return
    try {
      const res = await axios.post(url + '/api/user/coupon/my', {}, { headers: { token } })
      if (res.data.success) setMyCoupons(res.data.coupons || [])
    } catch { }
  }

  useEffect(() => {
    fetchAvailable()
    fetchMyCoupons()
  }, [token])

  const claimCoupon = async (code) => {
    if (!token) { toast.info('Please sign in to claim coupons'); return }
    setClaimingId(code)
    try {
      const res = await axios.post(url + '/api/user/coupon/claim', { code }, { headers: { token } })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchMyCoupons()
      } else {
        toast.error(res.data.message)
      }
    } catch { toast.error('Error claiming coupon') }
    setClaimingId(null)
  }

  const formatDate = (d) => {
    if (!d) return 'No expiry'
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isExpired = (d) => d && new Date() > new Date(d)

  const alreadyClaimed = (code) => myCoupons.some(c => c.code === code)

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied "${code}" to clipboard!`)
  }

  return (
    <div className="user-coupons-page">
      <div className="coupons-hero">
        <h1>🏷️ Coupons & Offers</h1>
        <p>Claim a coupon and save on your next order</p>
      </div>

      {/* Available Coupons */}
      <div className="coupons-section">
        <h2>Available Coupons</h2>
        {availableCoupons.length === 0 ? (
          <div className="no-coupons">
            <p>😕 No active coupons right now. Check back soon!</p>
          </div>
        ) : (
          <div className="coupons-grid">
            {availableCoupons.map(c => {
              const claimed = alreadyClaimed(c.code)
              return (
                <div key={c._id} className={`coupon-card ${claimed ? 'claimed' : ''}`}>
                  <div className="coupon-left">
                    <div className="coupon-discount">
                      {c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      <span>OFF</span>
                    </div>
                  </div>
                  <div className="coupon-divider">
                    <div className="notch top" />
                    <div className="dash-line" />
                    <div className="notch bottom" />
                  </div>
                  <div className="coupon-right">
                    <div className="coupon-code-row">
                      <span className="coupon-code-text">{c.code}</span>
                      <button className="copy-btn" onClick={() => copyCode(c.code)}>📋</button>
                    </div>
                    <p className="coupon-detail">
                      {c.minOrderAmount > 0 ? `Min order ₹${c.minOrderAmount}` : 'No minimum order'}
                    </p>
                    <p className="coupon-expiry">
                      {c.expiresAt ? `Valid till ${formatDate(c.expiresAt)}` : 'No expiry date'}
                    </p>
                    {claimed ? (
                      <button className="claim-btn claimed-btn" disabled>✅ Claimed</button>
                    ) : (
                      <button
                        className="claim-btn"
                        onClick={() => claimCoupon(c.code)}
                        disabled={claimingId === c.code}
                      >
                        {claimingId === c.code ? 'Claiming...' : 'Claim Coupon'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* My Claimed Coupons */}
      {token && (
        <div className="coupons-section">
          <h2>My Claimed Coupons</h2>
          {myCoupons.length === 0 ? (
            <div className="no-coupons"><p>You haven't claimed any coupons yet.</p></div>
          ) : (
            <div className="my-coupons-list">
              {myCoupons.map((c, i) => {
                const expired = isExpired(c.expiresAt)
                return (
                  <div key={i} className={`my-coupon-row ${expired ? 'expired' : ''}`}>
                    <div className="my-coupon-code">
                      <span>{c.code}</span>
                      {!expired && (
                        <button className="copy-btn small" onClick={() => copyCode(c.code)}>📋</button>
                      )}
                      {expired && <span className="expired-tag">Expired</span>}
                    </div>
                    <div className="my-coupon-info">
                      <span className="my-coupon-discount">
                        {c.discountType === 'percent' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                      </span>
                      {c.minOrderAmount > 0 && (
                        <span className="my-coupon-min">Min ₹{c.minOrderAmount}</span>
                      )}
                    </div>
                    <div className="my-coupon-dates">
                      <span>Claimed: {formatDate(c.claimedAt)}</span>
                      <span className={expired ? 'text-red' : 'text-green'}>
                        {c.expiresAt ? `Valid till: ${formatDate(c.expiresAt)}` : 'No expiry'}
                      </span>
                    </div>
                    {!expired && (
                      <div className="use-hint">Use code at checkout →</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!token && (
        <div className="login-prompt">
          <p>🔐 Sign in to claim coupons and view your saved offers</p>
        </div>
      )}
    </div>
  )
}

export default UserCoupons
