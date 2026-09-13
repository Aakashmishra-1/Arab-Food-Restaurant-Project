import React, { useContext, useState } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import { toast } from 'react-toastify'
import './FoodItem.css'

const FoodItem = ({ item }) => {
  const { _id, name, description, price, image, variants, avgRating, totalRatings, inStock } = item
  const { url, cartItems, addToCart, removeFromCart, token, wishlist, toggleWishlist, currency } = useContext(StoreContext)
  const [selectedVariant, setSelectedVariant] = useState(variants?.length > 0 ? variants[0].size : '')

  const cartKey = selectedVariant ? `${_id}_${selectedVariant}` : _id
  const qty = cartItems[cartKey] || 0
  const displayPrice = selectedVariant && variants?.length > 0
    ? (variants.find(v => v.size === selectedVariant)?.price || price)
    : price
  const isWishlisted = wishlist.includes(_id)

  const handleAddToCart = () => {
    if (!inStock) { toast.error('Item out of stock'); return }
    addToCart(_id, selectedVariant)
  }

  const handleWishlist = () => {
    if (!token) { toast.info('Please sign in to add to wishlist'); return }
    toggleWishlist(_id)
  }

  return (
    <div className={`food-item ${!inStock ? 'out-of-stock' : ''}`}>
      <div className="food-item-img-wrapper">
        <img src={`${url}/images/${image}`} alt={name} />
        {!inStock && <div className="oos-badge">Out of Stock</div>}
        <button className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`} onClick={handleWishlist}>
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="food-item-info">
        <div className="food-item-top">
          <h3>{name}</h3>
          {avgRating > 0 && (
            <span className="food-rating">⭐ {Number(avgRating).toFixed(1)} ({totalRatings})</span>
          )}
        </div>
        <p className="food-desc">{description}</p>

        {variants?.length > 0 && (
          <div className="variant-selector">
            {variants.map(v => (
              <button
                key={v.size}
                className={`variant-btn ${selectedVariant === v.size ? 'active' : ''}`}
                onClick={() => setSelectedVariant(v.size)}
              >
                {v.size} — {currency}{v.price}
              </button>
            ))}
          </div>
        )}

        <div className="food-item-bottom">
          <span className="food-price">{currency}{displayPrice}</span>
          {qty === 0 ? (
            <button className="add-btn" onClick={handleAddToCart} disabled={!inStock}>
              + Add
            </button>
          ) : (
            <div className="qty-control">
              <button onClick={() => removeFromCart(_id, selectedVariant)}>−</button>
              <span>{qty}</span>
              <button onClick={() => addToCart(_id, selectedVariant)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FoodItem
