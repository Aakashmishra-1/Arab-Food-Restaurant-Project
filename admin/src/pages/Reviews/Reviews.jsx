import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import './Reviews.css'


const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    try {
      const res = await api.get('/api/review/all')
      if (res.data.success) setReviews(res.data.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [])

  const stars = (n) => '⭐'.repeat(n)

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <div className="reviews-admin-page">
      <div className="reviews-admin-header">
        <h2>⭐ Customer Reviews</h2>
        <div className="reviews-stats">
          <div className="stat-pill">
            <span className="stat-num">{reviews.length}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">{avg}</span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="reviews-loading">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty">No reviews yet.</div>
      ) : (
        <div className="reviews-table-wrap">
          <div className="reviews-table-head">
            <span>Customer</span>
            <span>Item</span>
            <span>Rating</span>
            <span>Comment</span>
            <span>Date</span>
          </div>
          {reviews.map(r => (
            <div key={r._id} className="review-row">
              <div className="review-user">
                <div className="review-avatar-admin">
                  {r.userName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span>{r.userName}</span>
              </div>
              <span className="review-food-name">{r.foodName || '—'}</span>
              <span className="review-stars-admin">{stars(r.rating)} <small>{r.rating}/5</small></span>
              <span className="review-comment-admin">
                {r.comment ? `"${r.comment}"` : <em style={{ color: '#aaa' }}>No comment</em>}
              </span>
              <span className="review-date">{formatDate(r.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews
