import React from 'react'
import './Footer.css'

const Footer = () => (
  <footer className="footer" id="footer">
    <div className="footer-top">
      <div className="footer-brand">
        <h2>Arab<span>Punjab</span></h2>
        <p>Authentic Arab cuisine with a Punjabi heart.<br />Pure vegetarian, always fresh.</p>
      </div>
      <div className="footer-links">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/#explore-menu">Menu</a></li>
          <li><a href="/myorders">My Orders</a></li>
          <li><a href="/profile">Profile</a></li>
        </ul>
      </div>
      <div className="footer-contact">
        <h4>Contact</h4>
        <p>📍 Nawanshahr, Punjab, India</p>
        <p>📞 +91 98765 43210</p>
        <p>✉️ hello@arabpunjab.com</p>
        <p>🕐 Open: 11am – 11pm</p>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© 2025 Arab Food Punjab. All rights reserved. 🟢 Pure Veg</p>
    </div>
  </footer>
)

export default Footer
