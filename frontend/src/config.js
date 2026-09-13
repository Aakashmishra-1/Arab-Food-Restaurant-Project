// Centralized backend URL config.
//
// In production (Netlify build) this defaults to your deployed Render
// backend, so the site works even if you forget to set env vars on Netlify.
// Override by setting VITE_API_URL in Netlify's Environment Variables, or
// in a local .env file for local development.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://arab-food-restaurant-project.onrender.com"
    : "http://localhost:4000");
