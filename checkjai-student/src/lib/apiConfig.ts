export const API_URL = (() => {
  // ในโหมด Development ใช้ค่าว่างเพื่อให้ Fetch ไปที่ Local Proxy หรือ Localhost
  if (!import.meta.env.PROD) return '';
  
  // ในโหมด Production (Vercel) ต้องตั้งค่า VITE_API_URL ใน Environment Variables
  // ตัวอย่าง: https://checkjai-api.vercel.app
  const url = import.meta.env.VITE_API_URL || '';
  
  if (!url) {
    console.warn('[API] VITE_API_URL is not set! API calls might fail.');
  }

  return url.startsWith('http') ? url : (url ? `https://${url}` : '');
})();
