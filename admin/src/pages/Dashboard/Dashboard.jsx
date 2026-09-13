import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import './Dashboard.css'


const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/order/dashboard-stats').then(res => {
      if (res.data.success) setStats(res.data)
    })
  }, [])

  if (!stats) return <div className="dashboard-loading">Loading dashboard...</div>

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} color="#FF6B35" />
        <StatCard icon="✅" label="Delivered" value={stats.deliveredOrders} color="#2e7d32" />
        <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="#1565C0" />
        <StatCard icon="🕐" label="Today's Orders" value={stats.todayOrders} color="#6A1B9A" />
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `₹${v}`} />
              <Bar dataKey="revenue" fill="#FF6B35" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🔥 Top Selling Items</h3>
          <div className="top-items">
            {stats.topItems.map((item, i) => (
              <div key={i} className="top-item-row">
                <span className="top-item-rank">#{i + 1}</span>
                <span className="top-item-name">{item._id}</span>
                <span className="top-item-sold">{item.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
