import axios from 'axios'
import { url } from '../assets/assets'

// Shared axios instance for the admin panel.
// - Uses the correct backend URL (local or deployed) automatically.
// - Attaches the logged-in admin's token to every request, since the
//   backend's admin-only routes now require it.
const api = axios.create({ baseURL: url })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.token = token
  return config
})

export default api
export { url }
