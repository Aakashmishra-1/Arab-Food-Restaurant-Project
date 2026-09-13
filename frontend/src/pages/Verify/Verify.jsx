import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Verify = () => {
  const navigate = useNavigate()
  useEffect(() => {
    setTimeout(() => navigate('/myorders'), 2000)
  }, [])
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h2 style={{ color: '#FF6B35' }}>Redirecting to your orders...</h2>
    </div>
  )
}

export default Verify
