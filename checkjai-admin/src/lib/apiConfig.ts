export const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'https://checkjai-api.onrender.com') 
  : '';
