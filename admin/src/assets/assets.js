import logo from './logo.png'
import parcel_icon from './parcel_icon.png'

export const url =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://arab-food-restaurant-project.onrender.com' : 'http://localhost:4000')
export const currency = '₹'

export const assets = {
  logo,
  parcel_icon,
}
