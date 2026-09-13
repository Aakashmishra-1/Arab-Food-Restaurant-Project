# 🍽️ Arab Food Punjab — MERN Stack Food Delivery App

A full-stack food delivery web application built with **MongoDB, Express, React, Node.js**.

---

## 📁 Project Structure

```
Arab-Food-Punjab-MERN/
├── backend/        ← Node.js + Express API  (npm start)
├── frontend/       ← Customer React App      (npm run dev)
└── admin/          ← Admin React Panel       (npm run dev)
```

---

## ⚙️ Setup Instructions

### 1. Backend

```bash
cd backend
npm install
```

Edit `.env` with your values:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/arab-food-punjab
JWT_SECRET=your_secret_key
ADMIN_SETUP_KEY=choose_a_secret_you_will_remember
PORT=4000
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://your-deployed-frontend.netlify.app
ALLOWED_ORIGINS=https://your-deployed-admin.netlify.app
```
`ADMIN_SETUP_KEY` is required to create admin accounts (see below) — keep it secret.
`ALLOWED_ORIGINS` is a comma-separated list of any extra frontend/admin URLs to allow via CORS.

```bash
npm start
```

**On Render**, set all of the above as Environment Variables in the service dashboard (don't rely on the committed `.env` for production secrets).

### 2. Frontend

```bash
cd frontend
npm install
```

Local dev config lives in `.env.development` (already set to `http://localhost:4000`).
Production config lives in `.env.production` — update `VITE_API_URL` there if your Render backend URL changes.

```bash
npm run dev
# Runs at http://localhost:5173
```

### 3. Admin

```bash
cd admin
npm install
npm run dev
# Runs at http://localhost:5174
```

Local dev config lives in `admin/.env.development`; production config lives in `admin/.env.production`.

---

## 🔐 Creating Admin Accounts

Open the Admin Portal and click **"Create one"** below the sign-in form. Fill in your
name, email, password, and the **Admin Setup Key** (the `ADMIN_SETUP_KEY` value you
set in `backend/.env` / Render environment variables). Anyone with that key can create
as many admin accounts as needed — each one can independently log in and manage food,
orders, and coupons. Admin accounts cannot log in through the customer app, and regular
user accounts cannot log in through the admin portal.

---

## ✅ Features

### Customer App
- 🔐 Sign In / Register
- 🍽️ Browse food by category
- 🔍 Search food items
- ❤️ Wishlist / Favourites
- 🛒 Cart with variant support (S/M/L)
- 🏷️ Coupon / promo code at checkout
- 💳 **Razorpay** (UPI, Cards, Net Banking) + **Cash on Delivery**
- 📍 Full delivery address (street, city, state, pincode, landmark)
- 📦 My Orders with **live polling** status tracker
- ⭐ Rate & review delivered items
- 👤 Profile page with saved addresses
- 📧 Email notifications (order confirmed + status updates)

### Admin Panel
- 🔒 Admin-only login
- 📊 Dashboard with revenue charts (last 7 days) + top items
- ➕ Add food items with image, variants, category
- 📋 Food list with stock toggle + ratings
- 📦 Orders management with status update (auto-emails customer)
- 🍽️ **Today's Menu** — select which items appear on customer menu
- 🏷️ Coupons — create, toggle, delete promo codes

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router, Axios, Vite |
| Admin | React 18, Recharts, React Router, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + Bcrypt |
| Payments | Razorpay |
| Email | Nodemailer (Gmail) |

---

## 📞 Ports

| App | Port |
|-----|------|
| Backend API | 4000 |
| Frontend | 5173 |
| Admin | 5174 |

---

## 🚀 Deployment checklist

- **Backend (Render)**: set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SETUP_KEY`, `RAZORPAY_KEY_ID/SECRET`,
  `FRONTEND_URL` (your Netlify frontend URL), and `ALLOWED_ORIGINS` (your Netlify admin URL, if deployed)
  as Environment Variables in the Render dashboard.
- **MongoDB Atlas → Network Access**: make sure `0.0.0.0/0` (allow from anywhere) is added,
  otherwise Render's servers can't reach your database and the backend will keep crashing/restarting.
- **Frontend (Netlify)**: base directory `frontend`, build command `npm run build`, publish directory `dist`.
  `VITE_API_URL` is already baked in via `.env.production`, so no extra Netlify env var is required —
  but you can override it in Netlify's Environment Variables if your backend URL ever changes.
- **Admin (if you deploy it)**: same as frontend but base directory `admin`. Add its URL to the backend's
  `ALLOWED_ORIGINS` env var so CORS allows it.
- **File uploads**: Render's free tier filesystem is ephemeral — uploaded food images in `backend/uploads`
  will be wiped on every redeploy/restart. For production use, consider moving image storage to
  Cloudinary/S3 instead of local disk.
