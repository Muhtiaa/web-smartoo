document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  
  const phoneInput = document.getElementById('login-phone');
  const otpInput = document.getElementById('login-otp');
  const btnLogin = document.getElementById('btn-login');
  const loginError = document.getElementById('login-error');

  const btnLogoutSidebar = document.getElementById('btn-logout-sidebar');
  const btnLogoutMobile = document.getElementById('btn-logout-mobile');

  // DOM Elements for Dashboard
  const userGreeting = document.getElementById('user-greeting');
  const currentDate = document.getElementById('current-date');
  const valSaldo = document.getElementById('val-saldo');
  const valPemasukan = document.getElementById('val-pemasukan');
  const valPengeluaran = document.getElementById('val-pengeluaran');
  const valUtang = document.getElementById('val-utang');
  const valPiutang = document.getElementById('val-piutang');
  const tableBody = document.getElementById('table-body');

  // Modal Elements
  const modal = document.getElementById('crud-modal');
  const btnCatat = document.getElementById('btn-catat-transaksi');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const crudForm = document.getElementById('crud-form');
  const modalTitle = document.getElementById('modal-title');
  const btnSaveCrud = document.getElementById('btn-save-crud');
  const crudError = document.getElementById('crud-error');

  // Format IDR
  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Set Tanggal Hari Ini
  const today = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  currentDate.textContent = today.toLocaleDateString('en-GB', options);

  // --- SESI LOGIN (localStorage) ---
  const checkSession = async () => {
    const savedPhone = localStorage.getItem('smartoo_phone');
    const savedOtp = localStorage.getItem('smartoo_otp');

    if (savedPhone && savedOtp) {
      // Sesi ada, langsung coba fetch data
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      await fetchDashboardData(savedPhone, savedOtp);
    } else {
      // Tidak ada sesi, tampilkan login
      loginSection.style.display = 'flex';
      dashboardSection.style.display = 'none';
    }
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    localStorage.removeItem('smartoo_phone');
    localStorage.removeItem('smartoo_otp');
    localStorage.removeItem('smartoo_id_wa');
    window.location.reload();
  };

  if (btnLogoutSidebar) btnLogoutSidebar.addEventListener('click', handleLogout);
  if (btnLogoutMobile) btnLogoutMobile.addEventListener('click', handleLogout);

  // --- LOGIN PROCESS ---
  btnLogin.addEventListener('click', async () => {
    const phone = phoneInput.value.trim();
    const otp = otpInput.value.trim();

    if (phone.length < 8) {
      loginError.textContent = "Nomor WA tidak valid.";
      loginError.style.display = "block";
      return;
    }
    if (otp.length !== 6) {
      loginError.textContent = "OTP harus 6 digit.";
      loginError.style.display = "block";
      return;
    }

    btnLogin.textContent = "Memverifikasi...";
    loginError.style.display = "none";

    // Simpan ke localStorage sementara (akan dihapus kalau gagal)
    localStorage.setItem('smartoo_phone', phone);
    localStorage.setItem('smartoo_otp', otp);

    const success = await fetchDashboardData(phone, otp);
    
    if (success) {
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
    } else {
      btnLogin.textContent = "MASUK DASHBOARD";
      localStorage.removeItem('smartoo_phone');
      localStorage.removeItem('smartoo_otp');
    }
  });

  // --- FETCH DATA DARI API ---
  const fetchDashboardData = async (phone, otp) => {
    try {
      const response = await fetch('https://n8n.smart-oo.me/webhook/dashboard-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, otp: otp })
      });
      
      const data = await response.json();
      
      if (data.status === 'sukses') {
        // Simpan id_whatsapp (format @lid) untuk keperluan CRUD
        if (data.id_whatsapp) {
          localStorage.setItem('smartoo_id_wa', data.id_whatsapp);
        }
        renderDashboard(data);
        return true;
      } else {
        if (loginError) {
          loginError.textContent = data.message || "OTP Salah atau Tidak Ditemukan!";
          loginError.style.display = "block";
        } else {
          alert("Sesi berakhir, silakan login ulang.");
          handleLogout();
        }
        return false;
      }
    } catch (error) {
      console.error(error);
      if (loginError) {
        loginError.textContent = "Terjadi kesalahan koneksi server.";
        loginError.style.display = "block";
      }
      return false;
    }
  };

  // --- RENDER DASHBOARD ---
  let pieChartObj = null;
  let lineChartObj = null;

  const renderDashboard = (data) => {
    const metrics = data.metrics || { income: 0, expense: 0, balance: 0, debt: 0, piutang: 0 };
    const activities = data.activities || [];
    const nama = data.nama_pengguna || "Pengguna";

    userGreeting.textContent = `Halo, ${nama}`;
    valSaldo.textContent = formatRp(metrics.balance);
    valPemasukan.textContent = formatRp(metrics.income);
    valPengeluaran.textContent = formatRp(metrics.expense);
    valUtang.textContent = formatRp(metrics.debt);
    valPiutang.textContent = formatRp(metrics.piutang || 0);

    // Render Table
    tableBody.innerHTML = '';
    if (activities.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada aktivitas.</td></tr>`;
    } else {
      activities.forEach(act => {
        const isIncome = act.jenis_transaksi === 'Pemasukan';
        const color = isIncome ? '#27ae60' : '#c0392b';
        const symbol = isIncome ? '+' : '-';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${act.tanggal} <br><small>${act.waktu}</small></td>
          <td><strong>${act.keterangan}</strong></td>
          <td>${act.kategori}</td>
          <td style="color:${color}; font-weight:bold;">${symbol} ${formatRp(act.nominal)}</td>
          <td>
            <button class="btn-action btn-edit" onclick="editData('${act.id_transaksi}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-action btn-delete" onclick="hapusData('${act.id_transaksi}')" title="Hapus"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    // Render Charts
    renderCharts(metrics, data.chartData);
  };

  const renderCharts = (metrics, chartData) => {
    // Destroy old charts if exist
    if (pieChartObj) pieChartObj.destroy();
    if (lineChartObj) lineChartObj.destroy();

    // Pie Chart
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    pieChartObj = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Pemasukan', 'Pengeluaran'],
        datasets: [{
          data: [metrics.income, metrics.expense],
          backgroundColor: ['#27ae60', '#c0392b'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Line Chart (Dummy / basic for now until backend provides daily array)
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    const labels = chartData ? chartData.map(d => d.label) : ['Awal Bulan', 'Pertengahan', 'Sekarang'];
    const dataIncome = chartData ? chartData.map(d => d.income) : [0, metrics.income/2, metrics.income];
    const dataExpense = chartData ? chartData.map(d => d.expense) : [0, metrics.expense/2, metrics.expense];

    lineChartObj = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Pemasukan', data: dataIncome, borderColor: '#27ae60', tension: 0.3 },
          { label: 'Pengeluaran', data: dataExpense, borderColor: '#c0392b', tension: 0.3 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  };

  // --- CRUD MODAL LOGIC ---
  btnCatat.addEventListener('click', () => {
    document.getElementById('form-action').value = "tambah";
    document.getElementById('form-id').value = "";
    crudForm.reset();
    modalTitle.textContent = "Catat Transaksi";
    crudError.style.display = "none";
    modal.style.display = "flex";
  });

  btnCloseModal.addEventListener('click', () => {
    modal.style.display = "none";
  });

  // Handle Form Submit
  crudForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = document.getElementById('form-action').value;
    const id_transaksi = document.getElementById('form-id').value;
    const jenis = document.getElementById('form-jenis').value;
    const keterangan = document.getElementById('form-keterangan').value;
    const kategori = document.getElementById('form-kategori').value;
    const nominal = document.getElementById('form-nominal').value;
    const tag = document.getElementById('form-tag').value;

    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    if (!id_whatsapp) {
      alert("Sesi tidak valid, harap login ulang.");
      return;
    }

    const payload = {
      action: action,
      id_whatsapp: id_whatsapp,
      id_transaksi: id_transaksi,
      jenis_transaksi: jenis,
      keterangan: keterangan,
      kategori: kategori,
      nominal: parseInt(nominal),
      tag_status: tag
    };

    btnSaveCrud.textContent = "Menyimpan...";
    try {
      const response = await fetch('https://n8n.smart-oo.me/webhook/dashboard-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      
      if (resData.status === 'sukses') {
        modal.style.display = "none";
        // Refresh Dashboard Data
        const phone = localStorage.getItem('smartoo_phone');
        const otp = localStorage.getItem('smartoo_otp');
        await fetchDashboardData(phone, otp);
      } else {
        crudError.textContent = resData.message || "Gagal menyimpan data.";
        crudError.style.display = "block";
      }
    } catch (err) {
      crudError.textContent = "Terjadi kesalahan koneksi.";
      crudError.style.display = "block";
    } finally {
      btnSaveCrud.textContent = "SIMPAN TRANSAKSI";
    }
  });

  // Fungsi Global untuk Edit & Hapus (dipanggil dari button onclick di tabel)
  window.editData = (id) => {
    // Fitur edit simpel: alert for now, real implementation requires fetching single data
    alert(`Fitur edit untuk ID: ${id} akan segera tersedia setelah Webhook dikonfigurasi sepenuhnya!`);
  };

  window.hapusData = async (id) => {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
    if (!confirmDelete) return;

    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    try {
      const response = await fetch('https://n8n.smart-oo.me/webhook/dashboard-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hapus', id_transaksi: id, id_whatsapp: id_whatsapp })
      });
      const resData = await response.json();
      if (resData.status === 'sukses') {
        const phone = localStorage.getItem('smartoo_phone');
        const otp = localStorage.getItem('smartoo_otp');
        await fetchDashboardData(phone, otp); // Refresh table
      } else {
        alert(resData.message || "Gagal menghapus data.");
      }
    } catch(err) {
      alert("Terjadi kesalahan koneksi saat menghapus.");
    }
  };

  // INIT
  checkSession();
});
