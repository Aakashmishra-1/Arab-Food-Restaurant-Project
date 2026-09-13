import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext'
import './ReviewsSection.css'

const stars = (rating) => '⭐'.repeat(rating)

const ReviewsSection = () => {
  const { url } = useContext(StoreContext)
  const [reviews, setReviews] = useState([])
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(url + '/api/review/all')
        if (res.data.success && res.data.data.length > 0) {
          setReviews(res.data.data)
        }
      } catch (err) { console.error(err) }
    }
    fetchReviews()
  }, [url])

  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % reviews.length)
        setFade(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [reviews])

  if (reviews.length === 0) return null

  const review = reviews[current]

  const goTo = (idx) => {
    setFade(false)
    setTimeout(() => { setCurrent(idx); setFade(true) }, 300)
  }

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h2>What Our Customers Say</h2>
        <p>Real reviews from real food lovers 💬</p>
      </div>
      <div className={`review-card ${fade ? 'visible' : ''}`}>
        <div className="review-stars">{stars(review.rating)}</div>
        <p className="review-comment">"{review.comment || 'Great food!'}"</p>
        <div className="review-meta">
          <span className="review-avatar">{review.userName?.[0]?.toUpperCase() || 'U'}</span>
          <div>
            <strong className="review-name">{review.userName}</strong>
            {review.foodName && <span className="review-food">on {review.foodName}</span>}
          </div>
        </div>
      </div>
      {reviews.length > 1 && (
        <div className="review-dots">
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ReviewsSection
