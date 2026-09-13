import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../../components/FoodItem/FoodItem'
import './Wishlist.css'

const Wishlist = () => {
  const { food_list, wishlist, token } = useContext(StoreContext)
  const navigate = useNavigate()

  if (!token) return (
    <div className="wishlist-page">
      <div className="wishlist-empty"><p>Please sign in to view your wishlist</p><button onClick={() => navigate('/')}>Go Home</button></div>
    </div>
  )

  const wishlisted = food_list.filter(f => wishlist.includes(f._id))

  return (
    <div className="wishlist-page">
      <h2>❤️ My Wishlist</h2>
      {wishlisted.length === 0 ? (
        <div className="wishlist-empty">
          <p>Your wishlist is empty</p>
          <button onClick={() => navigate('/')}>Browse Menu</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlisted.map(item => <FoodItem key={item._id} item={item} />)}
        </div>
      )}
    </div>
  )
}

export default Wishlist
