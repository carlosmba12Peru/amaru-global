// Centralized API configuration for AMARU-CLIMATE
export const API_BASE = 
  typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
    : (process.env.NEXT_PUBLIC_API_URL || "https://coen-backend-289004262994.us-central1.run.app");

export default API_BASE;
