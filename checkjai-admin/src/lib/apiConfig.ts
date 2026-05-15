export const API_URL = (() => {
  if (!import.meta.env.PROD) return '';
  const url = import.meta.env.VITE_API_URL || 'https://checkjai-api.onrender.com';
  return url.startsWith('http') ? url : `https://${url}`;
})();
