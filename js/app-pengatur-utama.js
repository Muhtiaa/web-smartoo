// ==========================================
// APP.JS (Dulu main.js)
// Inisialisasi aplikasi, Event Listener, dan Smart Polling
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const btnLogin = document.getElementById('btn-login');
  const phoneInput = document.getElementById('login-phone');
  const otpInput = document.getElementById('login-otp');
  const loginError = document.getElementById('login-error');

  // --- SESI LOGIN ---
  const checkSession = async () => {
    const savedPhone = localStorage.getItem('smartoo_phone');
    const savedOtp = localStorage.getItem('smartoo_otp');

    if (savedPhone && savedOtp) {
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'none';
      
      const data = await window.fetchDashboardData(savedPhone, savedOtp);
      
      if (data && !data.error) {
        dashboardSection.style.display = 'block';
        window.renderDashboard(data);
        
        // Ambil data pendukung
        if (typeof window.fetchKategori === 'function') window.fetchKategori();
        if (typeof window.fetchDompet === 'function') window.fetchDompet();
      } else {
        localStorage.removeItem('smartoo_phone');
        localStorage.removeItem('smartoo_otp');
        loginSection.style.display = 'flex';
        if (loginError) {
          loginError.textContent = data ? data.error : "Sesi berakhir.";
          loginError.style.display = "block";
        }
      }
    } else {
      loginSection.style.display = 'flex';
      dashboardSection.style.display = 'none';
    }
  };

  btnLogin.addEventListener('click', async () => {
    const phone = phoneInput.value.trim();
    const otp = otpInput.value.trim();

    if (phone.length < 8 || otp.length !== 6) {
      loginError.textContent = "Data login tidak valid.";
      loginError.style.display = "block";
      return;
    }

    btnLogin.textContent = "Memverifikasi...";
    btnLogin.disabled = true;
    loginError.style.display = "none";

    localStorage.setItem('smartoo_phone', phone);
    localStorage.setItem('smartoo_otp', otp);

    const data = await window.fetchDashboardData(phone, otp);
    
    if (data && !data.error) {
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      window.renderDashboard(data);
      if (typeof window.fetchKategori === 'function') window.fetchKategori();
      if (typeof window.fetchDompet === 'function') window.fetchDompet();
    } else {
      btnLogin.textContent = "MASUK DASHBOARD";
      btnLogin.disabled = false;
      localStorage.removeItem('smartoo_phone');
      localStorage.removeItem('smartoo_otp');
      loginError.textContent = data ? data.error : "Login Gagal.";
      loginError.style.display = "block";
    }
  });

  // --- LOGOUT ---
  const handleLogout = async (e) => {
    if(e) e.preventDefault();
    await window.apiLogout();
    localStorage.clear();
    window.location.reload();
  };

  const btnLogoutSidebar = document.getElementById('btn-logout-sidebar');
  const btnLogoutMobile = document.getElementById('btn-logout-mobile');
  if (btnLogoutSidebar) btnLogoutSidebar.addEventListener('click', handleLogout);
  if (btnLogoutMobile) btnLogoutMobile.addEventListener('click', handleLogout);


  // --- SINKRONISASI DATA (Tanpa Polling) ---
  let isSyncing = false;

  window.syncNow = async () => {
    if (isSyncing) return;
    
    // Jangan sync jika ada modal terbuka (user sedang mengetik)
    if (document.querySelector('.modal.show')) return;

    isSyncing = true;
    try {
      const data = await window.syncDashboardData();
      if (data && data.status === 'sukses') {
        let changed = false;
        if (data.activities && data.activities.length !== window.cachedActivities.length) changed = true;
        
        if (changed) {
          window.renderDashboard(data);
          if (typeof window.showToast === 'function') {
            window.showToast('Data terbaru telah disinkronkan', 'success');
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      isSyncing = false;
    }
  };

  // Jika user pindah tab lalu kembali, lakukan sinkronisasi instan
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') {
       window.syncNow(); 
    }
  });


  // --- NAVIGASI ---
  document.querySelectorAll('[id^="nav-"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      let view = 'dashboard';
      if(el.id.includes('transaksi')) view = 'transaksi';
      if(el.id.includes('dompet')) view = 'dompet';
      if(el.id.includes('kategori')) view = 'kategori';
      
      if (typeof window.switchView === 'function') {
        window.switchView(view);
      }
      
      const modalLainnya = document.getElementById('modal-lainnya');
      if(modalLainnya) modalLainnya.classList.remove('show');
    });
  });

  // Init App
  checkSession();
});
