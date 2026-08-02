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
  const tableBodyDashboard = document.getElementById('table-body-dashboard');

  // View Routing Elements
  const navDashboard = document.getElementById('nav-dashboard');
  const navTransaksi = document.getElementById('nav-transaksi');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewTransaksi = document.getElementById('view-transaksi');

  // Filter & Pagination Elements
  const filterSearch = document.getElementById('filter-search');
  const filterJenis = document.getElementById('filter-jenis');
  const filterWaktu = document.getElementById('filter-waktu');
  const filterDateGroup = document.getElementById('filter-date-group');
  const filterDateGroup2 = document.getElementById('filter-date-group2');
  const filterDateStart = document.getElementById('filter-date-start');
  const filterDateEnd = document.getElementById('filter-date-end');
  
  const valFilterMasuk = document.getElementById('val-filter-pemasukan');
  const valFilterKeluar = document.getElementById('val-filter-pengeluaran');
  const valFilterSelisih = document.getElementById('val-filter-selisih');
  
  const tableBodyTransaksi = document.getElementById('table-body-transaksi');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const pageIndicator = document.getElementById('page-indicator');

  let currentPage = 1;
  const itemsPerPage = 10;
  let filteredActivities = [];

  // Modal Elements
  const modal = document.getElementById('crud-modal');
  const btnCatat = document.getElementById('btn-catat-transaksi');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const crudForm = document.getElementById('crud-form');
  const modalTitle = document.getElementById('modal-title');
  const btnSaveCrud = document.getElementById('btn-save-crud');
  const crudError = document.getElementById('crud-error');
  const formNominal = document.getElementById('form-nominal');

  // Format Nominal dengan Titik Ribuan
  if (formNominal) {
    formNominal.addEventListener('input', function(e) {
      let val = this.value.replace(/[^0-9]/g, '');
      if (val !== '') {
        this.value = parseInt(val, 10).toLocaleString('id-ID').replace(/,/g, '.');
      } else {
        this.value = '';
      }
    });
  }

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
      // Sembunyikan login sementara memverifikasi
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'none';
      
      const success = await fetchDashboardData(savedPhone, savedOtp);
      
      if (success) {
        dashboardSection.style.display = 'block';
      } else {
        // Jika gagal verifikasi sesi, hapus storage dan munculkan form login
        localStorage.removeItem('smartoo_phone');
        localStorage.removeItem('smartoo_otp');
        localStorage.removeItem('smartoo_id_wa');
        loginSection.style.display = 'flex';
      }
    } else {
      // Tidak ada sesi, tampilkan login
      loginSection.style.display = 'flex';
      dashboardSection.style.display = 'none';
    }
  };

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    const phone = localStorage.getItem('smartoo_phone');
    const otp = localStorage.getItem('smartoo_otp');

    // Beritahu server untuk MENGHAPUS OTP ini secara permanen agar tidak bisa dipakai login 2 kali
    if (phone && otp) {
      try {
        await fetch('https://n8n.smart-oo.me/webhook/dashboard-crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout', phone: phone, otp: otp })
        });
      } catch (err) {
        console.error("Gagal menghubungi server saat logout", err);
      }
    }

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
  let cachedActivities = [];

  window.exportCSV = () => {
    if (cachedActivities.length === 0) {
      alert("Tidak ada data untuk di-export!");
      return;
    }
    const headers = ['Tanggal', 'Waktu', 'Keterangan', 'Kategori', 'Jenis', 'Nominal', 'Tag'];
    const rows = cachedActivities.map(a => [
      a.tanggal, a.waktu, `"${a.keterangan}"`, `"${a.kategori}"`, a.jenis_transaksi, a.nominal, a.tag_status || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smartoo_riwayat.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDashboard = (data) => {
    const metrics = data.metrics || { income: 0, expense: 0, balance: 0, debt: 0, piutang: 0 };
    const activities = data.activities || [];
    cachedActivities = activities;
    const nama = data.nama_pengguna || "Pengguna Web";
    localStorage.setItem('smartoo_nama', nama);

    userGreeting.textContent = `Halo, ${nama}`;
    valSaldo.textContent = formatRp(metrics.balance);
    valPemasukan.textContent = formatRp(metrics.income);
    valPengeluaran.textContent = formatRp(metrics.expense);
    valUtang.textContent = formatRp(metrics.debt);
    valPiutang.textContent = formatRp(metrics.piutang || 0);

    // Render Table Dashboard (Recent 10)
    tableBodyDashboard.innerHTML = '';
    if (activities.length === 0) {
      tableBodyDashboard.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada aktivitas.</td></tr>`;
    } else {
      const recent10 = activities.slice(0, 10);
      recent10.forEach(act => {
        const isIncome = act.jenis_transaksi === 'Pemasukan';
        const color = isIncome ? '#27ae60' : (act.jenis_transaksi === 'Pengeluaran' ? '#c0392b' : '#f39c12');
        const symbol = isIncome ? '+' : (act.jenis_transaksi === 'Pengeluaran' ? '-' : '');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${act.tanggal} <br><small>${act.waktu}</small></td>
          <td><strong>${act.keterangan}</strong></td>
          <td>${act.kategori}</td>
          <td style="color:${color}; font-weight:bold;">${symbol} ${formatRp(act.nominal)}          </td>
          <td>
            <button class="btn-action btn-edit" onclick="editData('${act.id_transaksi}')"><i class="fas fa-edit"></i></button>
            <button class="btn-action btn-delete" onclick="hapusData('${act.id_transaksi}')"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tableBodyDashboard.appendChild(tr);
      });
    }

    renderCharts(metrics, activities);
    
    // Auto-update filter if Transaksi view is active
    if (viewTransaksi && viewTransaksi.style.display === 'block') {
      applyFilters();
    }
  };

  const renderCharts = (metrics, activities) => {
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

    // Line Chart (Dinamis dari aktivitas)
    let labels = [];
    let dataIncome = [];
    let dataExpense = [];
    
    if (activities && activities.length > 0) {
      const dailyData = {};
      activities.forEach(act => {
        const date = act.tanggal;
        if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
        if (act.jenis_transaksi === 'Pemasukan') dailyData[date].income += act.nominal;
        if (act.jenis_transaksi === 'Pengeluaran') dailyData[date].expense += act.nominal;
      });

      labels = Object.keys(dailyData).sort();
      labels.forEach(date => {
        dataIncome.push(dailyData[date].income);
        dataExpense.push(dailyData[date].expense);
      });
      
      // Jika cuma 1 tanggal, duplikat agar terbentuk garis
      if (labels.length === 1) {
        labels.push(labels[0] + " (Akhir)");
        dataIncome.push(dataIncome[0]);
        dataExpense.push(dataExpense[0]);
      }
    } else {
      labels = ['Kosong'];
      dataIncome = [0];
      dataExpense = [0];
    }

    const ctxLine = document.getElementById('lineChart').getContext('2d');
    lineChartObj = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Pemasukan', data: dataIncome, borderColor: '#27ae60', backgroundColor: 'rgba(39, 174, 96, 0.2)', tension: 0.3, fill: true },
          { label: 'Pengeluaran', data: dataExpense, borderColor: '#c0392b', backgroundColor: 'rgba(192, 57, 43, 0.2)', tension: 0.3, fill: true }
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
    const nominalRaw = document.getElementById('form-nominal').value;
    const nominal = nominalRaw.replace(/[^0-9]/g, ''); // bersihkan titik
    const sumber_dana = document.getElementById('form-sumber-dana').value;
    const tag = document.getElementById('form-tag').value;

    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    const nama_pengguna = localStorage.getItem('smartoo_nama') || "Pengguna Web";
    
    if (!id_whatsapp) {
      alert("Sesi tidak valid, harap login ulang.");
      return;
    }

    const payload = {
      action: action,
      id_whatsapp: id_whatsapp,
      nama_pengguna: nama_pengguna,
      id_transaksi: id_transaksi,
      jenis_transaksi: jenis,
      keterangan: keterangan,
      kategori: kategori,
      nominal: parseInt(nominal),
      sumber_dana: sumber_dana,
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
    const act = cachedActivities.find(a => a.id_transaksi === id);
    if (!act) {
      alert('Data tidak ditemukan!');
      return;
    }
    
    document.getElementById('form-action').value = "edit";
    document.getElementById('form-id').value = id;
    document.getElementById('form-jenis').value = act.jenis_transaksi;
    document.getElementById('form-keterangan').value = act.keterangan;
    document.getElementById('form-kategori').value = act.kategori;
    document.getElementById('form-nominal').value = parseInt(act.nominal, 10).toLocaleString('id-ID').replace(/,/g, '.');
    
    const sDana = document.getElementById('form-sumber-dana');
    if(sDana) sDana.value = act.sumber_dana || "Tunai";
    
    document.getElementById('form-tag').value = act.tag_status || "";
    
    document.getElementById('modal-title').textContent = "Edit Transaksi";
    document.getElementById('crud-error').style.display = "none";
    document.getElementById('crud-modal').style.display = "flex";
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
    };

  // ================= ROUTING & FILTER TRANSAKSI =================
  if (navDashboard && navTransaksi && viewDashboard && viewTransaksi) {
    navDashboard.addEventListener('click', (e) => {
      e.preventDefault();
      navDashboard.classList.add('active');
      navTransaksi.classList.remove('active');
      viewDashboard.style.display = 'block';
      viewTransaksi.style.display = 'none';
    });

    navTransaksi.addEventListener('click', (e) => {
      e.preventDefault();
      navTransaksi.classList.add('active');
      navDashboard.classList.remove('active');
      viewDashboard.style.display = 'none';
      viewTransaksi.style.display = 'block';
      applyFilters(); 
    });
  }

  const applyFilters = () => {
    if (!filterSearch) return;

    const q = filterSearch.value.toLowerCase();
    const jenis = filterJenis.value;
    const waktu = filterWaktu.value;
    const dStart = filterDateStart.value;
    const dEnd = filterDateEnd.value;

    const today = new Date();
    today.setHours(0,0,0,0);

    filteredActivities = cachedActivities.filter(act => {
      if (q && !(act.keterangan || '').toLowerCase().includes(q) && !(act.kategori || '').toLowerCase().includes(q)) return false;
      if (jenis !== 'Semua' && act.jenis_transaksi !== jenis) return false;

      if (waktu !== 'Semua' && act.tanggal) {
        const actDate = new Date(act.tanggal);
        actDate.setHours(0,0,0,0);

        if (waktu === 'Harian') {
          if (actDate.getTime() !== today.getTime()) return false;
        } else if (waktu === 'Mingguan') {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          if (actDate < sevenDaysAgo || actDate > today) return false;
        } else if (waktu === 'Bulanan') {
          if (actDate.getMonth() !== today.getMonth() || actDate.getFullYear() !== today.getFullYear()) return false;
        } else if (waktu === 'Kustom') {
          if (dStart && actDate < new Date(dStart)) return false;
          if (dEnd && actDate > new Date(dEnd)) return false;
        }
      }
      return true;
    });

    let totalMasuk = 0;
    let totalKeluar = 0;
    filteredActivities.forEach(act => {
      if (act.jenis_transaksi === 'Pemasukan') totalMasuk += parseInt(act.nominal) || 0;
      if (act.jenis_transaksi === 'Pengeluaran') totalKeluar += parseInt(act.nominal) || 0;
    });

    valFilterMasuk.textContent = formatRp(totalMasuk);
    valFilterKeluar.textContent = formatRp(totalKeluar);
    valFilterSelisih.textContent = formatRp(totalMasuk - totalKeluar);

    currentPage = 1;
    renderTransaksiTable();
  };

  const renderTransaksiTable = () => {
    if (!tableBodyTransaksi) return;
    tableBodyTransaksi.innerHTML = '';
    
    const maxPage = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
    if (pageIndicator) pageIndicator.textContent = `Halaman ${currentPage} / ${maxPage}`;

    if (filteredActivities.length === 0) {
      tableBodyTransaksi.innerHTML = `<tr><td colspan="5" style="text-align:center;">Tidak ada transaksi yang cocok.</td></tr>`;
      return;
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageData = filteredActivities.slice(startIdx, endIdx);

    pageData.forEach(act => {
      let color = '#333';
      let symbol = '';
      if(act.jenis_transaksi === 'Pemasukan'){ color = '#27ae60'; symbol = '+'; }
      if(act.jenis_transaksi === 'Pengeluaran'){ color = '#c0392b'; symbol = '-'; }
      if(act.jenis_transaksi === 'Mutasi'){ color = '#f39c12'; symbol = ''; }
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:bold;">${act.tanggal || '-'}</div>
          <div style="font-size:0.8rem; color:#888;">${act.waktu || '-'}</div>
        </td>
        <td>
          <div style="font-weight:bold;">${act.keterangan || '-'}</div>
          <div style="font-size:0.8rem; color:#888;">${act.kategori || '-'}</div>
        </td>
        <td>${act.sumber_dana || '-'}</td>
        <td style="color: ${color}; font-weight: bold;">
          ${symbol} ${formatRp(act.nominal || 0)}
        </td>
        <td>
          <button class="btn-action btn-edit" onclick="editData('${act.id_transaksi}')"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" onclick="hapusData('${act.id_transaksi}')"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tableBodyTransaksi.appendChild(tr);
    });
  };

  if (filterSearch) filterSearch.addEventListener('input', applyFilters);
  if (filterJenis) filterJenis.addEventListener('change', applyFilters);
  if (filterWaktu) filterWaktu.addEventListener('change', (e) => {
    if (e.target.value === 'Kustom') {
      filterDateGroup.style.display = 'block';
      filterDateGroup2.style.display = 'block';
    } else {
      filterDateGroup.style.display = 'none';
      filterDateGroup2.style.display = 'none';
      filterDateStart.value = '';
      filterDateEnd.value = '';
    }
    applyFilters();
  });
  if (filterDateStart) filterDateStart.addEventListener('change', applyFilters);
  if (filterDateEnd) filterDateEnd.addEventListener('change', applyFilters);

  if (btnPrevPage) {
    btnPrevPage.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTransaksiTable();
      }
    });
  }

  if (btnNextPage) {
    btnNextPage.addEventListener('click', () => {
      const maxPage = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
      if (currentPage < maxPage) {
        currentPage++;
        renderTransaksiTable();
      }
    });
  }
  // ================= END ROUTING =================

    // INIT
    checkSession();
  });
