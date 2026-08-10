// ==========================================
// UTILS.JS
// Kumpulan fungsi alat bantu (Helper)
// ==========================================

// Fungsi untuk menampilkan notifikasi kecil (Toast)
window.showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  // Memicu animasi muncul
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Hilangkan setelah 3 detik
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300); // Hapus dari DOM
  }, 3000);
};

// Fungsi untuk format angka menjadi Rupiah (misal: 10000 -> Rp 10.000)
window.formatRp = (num) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// Parsing string tanggal (DD/MM/YYYY atau YYYY-MM-DD) menjadi objek Date
window.parseCustomDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      // Mengubah format DD/MM/YYYY menjadi YYYY-MM-DD standar agar bisa di-parse
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
    }
  }
  return new Date(dateStr + "T00:00:00");
};
