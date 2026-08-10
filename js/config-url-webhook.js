// ==========================================
// CONFIG.JS
// File ini menyimpan konfigurasi dasar aplikasi
// ==========================================

const CONFIG = {
  // Base URL Webhook n8n
  API_BASE_URL: 'https://n8n.smart-oo.me/webhook/',
  
  // Endpoint spesifik
  API_DASHBOARD: 'dashboard-api',
  API_SYNC: 'dashboard-sync',
  API_CRUD: 'dashboard-crud',
  API_KATEGORI: 'dashboard-kategori-crud',
  API_DOMPET: 'dashboard-dompet-crud',
  
  // Pengaturan Polling (dalam milidetik)
  // Diubah menjadi 15 detik agar tidak membebani server
  POLLING_INTERVAL: 15000 
};
