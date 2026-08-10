// ==========================================
// API.JS
// Mengurus semua komunikasi dengan server backend (n8n)
// ==========================================

// Global state untuk menyimpan data sementara agar bisa diakses file lain
window.cachedActivities = [];
window.cachedKategori = [];
window.cachedDompet = [];

// Fungsi bantu untuk memanggil API secara konsisten
const callAPI = async (endpoint, payload) => {
  try {
    const response = await fetch(CONFIG.API_BASE_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error(`Error pada API ${endpoint}:`, error);
    throw error;
  }
};

// 1. Ambil Data Dasbor Utama (Saat Login / Refresh)
window.fetchDashboardData = async (phone, otpOrToken) => {
  try {
    // Mengirim otpOrToken yang bisa berupa OTP (saat login) atau Token (saat sesi aktif)
    const data = await callAPI(CONFIG.API_DASHBOARD, { phone, otp: otpOrToken, token: otpOrToken });
    
    if (data.status === 'sukses') {
      // Simpan Token Session jika diberikan oleh n8n
      if (data.token) {
        localStorage.setItem('smartoo_otp', data.token); // Timpa OTP lama dengan Token baru
      }
      
      // Simpan id_whatsapp (format @lid) untuk keperluan CRUD
      let idWa = data.id_whatsapp;
      if (!idWa && data.activities && data.activities.length > 0) {
        idWa = data.activities[0].id_whatsapp;
      }
      if (idWa) localStorage.setItem('smartoo_id_wa', idWa);
      
      return data; // Kembalikan data untuk di-render oleh ui.js
    } else {
      return { error: data.message || "OTP Salah atau Tidak Ditemukan!" };
    }
  } catch (err) {
    return { error: "Terjadi kesalahan koneksi server." };
  }
};

// 2. Silent Sync (Polling) - Hanya dipanggil saat diperlukan
window.syncDashboardData = async () => {
  const phone = localStorage.getItem('smartoo_phone');
  const otp = localStorage.getItem('smartoo_otp');
  if (!phone || !otp) return null;

  try {
    const data = await callAPI(CONFIG.API_SYNC, { phone, otp });
    return data.status === 'sukses' ? data : null;
  } catch (err) {
    return null;
  }
};

// 3. CRUD Transaksi
window.crudTransaksi = async (payload) => {
  return await callAPI(CONFIG.API_CRUD, payload);
};

// 4. API Kategori (Baca, Tambah, Hapus)
window.fetchKategori = async () => {
  const id_whatsapp = localStorage.getItem('smartoo_id_wa');
  const phone = localStorage.getItem('smartoo_phone');
  const otp = localStorage.getItem('smartoo_otp');
  if(!id_whatsapp || !phone || !otp) return false;
  
  try {
    const data = await callAPI(CONFIG.API_KATEGORI, { action: 'read', id_whatsapp, phone, otp });
    if (data.status === 'sukses' && data.data) {
      window.cachedKategori = Array.isArray(data.data) ? data.data : (Object.keys(data.data).length === 0 ? [] : [data.data]);
      return true;
    }
  } catch(err) {}
  return false;
};

window.crudKategori = async (payload) => {
  return await callAPI(CONFIG.API_KATEGORI, payload);
};

// 5. API Dompet (Baca, Tambah, Hapus)
window.fetchDompet = async () => {
  const id_whatsapp = localStorage.getItem('smartoo_id_wa');
  const phone = localStorage.getItem('smartoo_phone');
  const otp = localStorage.getItem('smartoo_otp');
  if(!id_whatsapp || !phone || !otp) return false;

  try {
    const data = await callAPI(CONFIG.API_DOMPET, { action: 'read', id_whatsapp, phone, otp });
    if (data.status === 'sukses' && data.data) {
      window.cachedDompet = Array.isArray(data.data) ? data.data : (Object.keys(data.data).length === 0 ? [] : [data.data]);
      return true;
    }
  } catch(err) {}
  return false;
};

window.crudDompet = async (payload) => {
  return await callAPI(CONFIG.API_DOMPET, payload);
};

// Fungsi Logout API (Memberitahu server untuk menghapus OTP)
window.apiLogout = async () => {
  const phone = localStorage.getItem('smartoo_phone');
  const otp = localStorage.getItem('smartoo_otp');
  if (phone && otp) {
    try {
      await callAPI(CONFIG.API_CRUD, { action: 'logout', phone, otp });
    } catch (err) {}
  }
};
