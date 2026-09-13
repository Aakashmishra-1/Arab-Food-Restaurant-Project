import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AdminLogin from './pages/AdminLogin/AdminLogin'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './pages/Dashboard/Dashboard'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import TodaysMenu from './pages/TodaysMenu/TodaysMenu'
import Coupons from './pages/Coupons/Coupons'
import Reviews from './pages/Reviews/Reviews'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  // Badge count shown on Orders sidebar link
  const [orderBadge, setOrderBadge] = useState(0)

  const handleNewOrders = (count) => {
    setOrderBadge(prev => prev + count)
  }

  const clearOrderBadge = () => {
    setOrderBadge(0)
  }

  if (!token) return (
    <>
      <ToastContainer />
      <AdminLogin setToken={setToken} />
    </>
  )

  return (
    <div className="admin-app">
      <ToastContainer position="top-right" autoClose={5000} />
      <Navbar setToken={setToken} />
      <div className="admin-body">
        <Sidebar orderBadge={orderBadge} clearOrderBadge={clearOrderBadge} />
        <main className="admin-main">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add" element={<Add />} />
            <Route path="/list" element={<List />} />
            <Route path="/orders" element={<Orders onNewOrders={handleNewOrders} />} />
            <Route path="/todays-menu" element={<TodaysMenu />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/reviews" element={<Reviews />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
