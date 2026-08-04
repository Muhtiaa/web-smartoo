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
  const navDompetSidebar = document.getElementById('nav-dompet-sidebar');
  const navKategoriSidebar = document.getElementById('nav-kategori-sidebar');
  const navDashboardMobile = document.getElementById('nav-dashboard-mobile');
  const navTransaksiMobile = document.getElementById('nav-transaksi-mobile');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewTransaksi = document.getElementById('view-transaksi');
  const viewDompet = document.getElementById('view-dompet');
  const viewKategori = document.getElementById('view-kategori');
  
  const navDompetMobile = document.getElementById('nav-dompet-mobile');
  const navLainnyaMobile = document.getElementById('nav-lainnya-mobile');
  const navKategoriMobile = document.getElementById('nav-kategori-mobile');
  const navExportMobile = document.getElementById('nav-export-mobile');
  const modalLainnya = document.getElementById('modal-lainnya');
  const btnCloseLainnya = document.getElementById('btn-close-lainnya');

  // Filter & Pagination Elements
  const filterSearch = document.getElementById('filter-search');
  const filterJenis = document.getElementById('filter-jenis');
  const filterWaktu = document.getElementById('filter-waktu');
  const filterHarianGroup = document.getElementById('filter-harian-group');
  const filterBulananGroup = document.getElementById('filter-bulanan-group');
  const filterDateGroup = document.getElementById('filter-date-group');
  const filterDateGroup2 = document.getElementById('filter-date-group2');
  
  const filterDateSingle = document.getElementById('filter-date-single');
  const filterMonthSingle = document.getElementById('filter-month-single');
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
  const formTanggal = document.getElementById('form-tanggal');
  const formWaktu = document.getElementById('form-waktu');
  const formJenis = document.getElementById('form-jenis');
  const tujuanDanaGroup = document.getElementById('tujuan-dana-group');
  const labelSumberDana = document.getElementById('label-sumber-dana');
  const formTujuanDana = document.getElementById('form-tujuan-dana');
  
  if (formJenis) {
    formJenis.addEventListener('change', (e) => {
      if (e.target.value === 'Mutasi') {
        if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'block';
        if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana (Asal)';
      } else {
        if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'none';
        if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana';
      }
    });
  }

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

  // ================= UTILITIES =================
  window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

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
    btnLogin.disabled = true;
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
      btnLogin.disabled = false;
      localStorage.removeItem('smartoo_phone');
      localStorage.removeItem('smartoo_otp');
    }
  });

  // --- FETCH DATA DARI API ---
  const initializeDefaultsIfNeeded = async () => {
    // Check if we need to initialize
    const isKategoriEmpty = cachedKategori.filter(k => k.id_kategori).length === 0;
    const isDompetEmpty = cachedDompet.filter(d => d.id_dompet).length === 0;

    const idWa = localStorage.getItem('smartoo_id_wa');
    if(!idWa) return;

    let defaultsKategori = [
      { nama: "Gaji", jenis: "Pemasukan" },
      { nama: "Bonus", jenis: "Pemasukan" },
      { nama: "Tip", jenis: "Pemasukan" },
      { nama: "Hasil Usaha", jenis: "Pemasukan" },
      { nama: "Investasi", jenis: "Pemasukan" },
      { nama: "Utang", jenis: "Pemasukan" },
      { nama: "Makanan", jenis: "Pengeluaran" },
      { nama: "Transportasi", jenis: "Pengeluaran" },
      { nama: "Hiburan", jenis: "Pengeluaran" },
      { nama: "Pendidikan", jenis: "Pengeluaran" },
      { nama: "Belanja", jenis: "Pengeluaran" },
      { nama: "Tagihan", jenis: "Pengeluaran" },
      { nama: "Cicilan", jenis: "Pengeluaran" },
      { nama: "Belanja Online", jenis: "Pengeluaran" },
      { nama: "Asuransi", jenis: "Pengeluaran" },
      { nama: "Donasi", jenis: "Pengeluaran" },
      { nama: "Lain-lain", jenis: "Pengeluaran" },
      { nama: "Piutang", jenis: "Pengeluaran" }
    ];

    let defaultsDompet = [
      { nama: "Tunai", grup: "Tunai" },
      { nama: "BCA", grup: "Bank" },
      { nama: "Mandiri", grup: "Bank" },
      { nama: "BNI", grup: "Bank" },
      { nama: "BRI", grup: "Bank" },
      { nama: "BSI", grup: "Bank" },
      { nama: "OVO", grup: "E-Wallet" },
      { nama: "GoPay", grup: "E-Wallet" },
      { nama: "DANA", grup: "E-Wallet" },
      { nama: "ShopeePay", grup: "E-Wallet" }
    ];

    // Extract unique from activities to merge with defaults
    if (cachedActivities && cachedActivities.length > 0) {
      cachedActivities.forEach(act => {
        if (act.kategori && act.kategori !== "-") {
          let jenis = act.jenis_transaksi === "Pemasukan" ? "Pemasukan" : "Pengeluaran";
          if (!defaultsKategori.some(k => k.nama.toLowerCase() === act.kategori.toLowerCase())) {
            defaultsKategori.push({ nama: act.kategori, jenis: jenis });
          }
        }
        if (act.sumber_dana && act.sumber_dana !== "-") {
          if (!defaultsDompet.some(d => d.nama.toLowerCase() === act.sumber_dana.toLowerCase())) {
            let grup = "Bank";
            if (act.sumber_dana.toLowerCase().includes('tunai') || act.sumber_dana.toLowerCase().includes('cash')) grup = "Tunai";
            else if (['ovo', 'gopay', 'dana', 'shopeepay', 'linkaja', 'spay', 'shopee'].some(ew => act.sumber_dana.toLowerCase().includes(ew))) grup = "E-Wallet";
            defaultsDompet.push({ nama: act.sumber_dana, grup: grup });
          }
        }
      });
    }

    let hasAddedKategori = false;
    for(let k of defaultsKategori) {
      if (!cachedKategori.some(c => c.nama_kategori.toLowerCase() === k.nama.toLowerCase() && c.jenis === k.jenis)) {
        try {
          console.log("Menambahkan kategori default yang hilang: " + k.nama);
          await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'tambah', id_whatsapp: idWa, nama_kategori: k.nama, jenis: k.jenis })
          });
          hasAddedKategori = true;
        } catch(e) {}
      }
    }
    if (hasAddedKategori) {
      await window.fetchKategori(); // refresh
    }

    let hasAddedDompet = false;
    for(let d of defaultsDompet) {
      if (!cachedDompet.some(c => c.nama_dompet.toLowerCase() === d.nama.toLowerCase())) {
        try {
          console.log("Menambahkan dompet default yang hilang: " + d.nama);
          await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'tambah', id_whatsapp: idWa, nama_dompet: d.nama, grup: d.grup })
          });
          hasAddedDompet = true;
        } catch(e) {}
      }
    }
    if (hasAddedDompet) {
      await window.fetchDompet(); // refresh
    }

    // --- AUTO CLEANUP DUPLICATES & WRONG CATEGORIES ---
    // If there are duplicate names in cachedKategori or cachedDompet, keep the first one and delete the rest.
    // Also delete the incorrect categories from the previous buggy script.
    let kategoriNames = new Set();
    let hasDeletedKategori = false;
    
    const badCategories = [
      { nama: "minuman", jenis: "Pengeluaran" },
      { nama: "belanja bulanan", jenis: "Pengeluaran" },
      { nama: "bisnis", jenis: "Pemasukan" },
      { nama: "hutang", jenis: "Pemasukan" },
      { nama: "piutang", jenis: "Pemasukan" },
      { nama: "listrik", jenis: "Pengeluaran" },
      { nama: "internet", jenis: "Pengeluaran" },
      { nama: "kesehatan", jenis: "Pengeluaran" }
    ];

    for (let k of cachedKategori) {
      if (!k.nama_kategori) continue;
      
      let isBad = badCategories.some(b => b.nama === k.nama_kategori.toLowerCase() && b.jenis === k.jenis);
      let isDuplicate = kategoriNames.has(k.nama_kategori.toLowerCase());
      
      if (isBad || isDuplicate) {
        // Duplicate or bad found! Delete it.
        try {
          await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'hapus', id_whatsapp: idWa, id_kategori: k.id_kategori })
          });
          hasDeletedKategori = true;
        } catch(e) {}
      } else {
        kategoriNames.add(k.nama_kategori.toLowerCase());
      }
    }
    if (hasDeletedKategori) await window.fetchKategori();

    let dompetNames = new Set();
    let hasDuplicateDompet = false;
    for (let d of cachedDompet) {
      if (!d.nama_dompet) continue;
      if (dompetNames.has(d.nama_dompet.toLowerCase())) {
        try {
          await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'hapus', id_whatsapp: idWa, id_dompet: d.id_dompet })
          });
          hasDuplicateDompet = true;
        } catch(e) {}
      } else {
        dompetNames.add(d.nama_dompet.toLowerCase());
      }
    }
    if (hasDuplicateDompet) await window.fetchDompet();
  };

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
        let idWa = data.id_whatsapp;
        if (!idWa && data.activities && data.activities.length > 0) {
          idWa = data.activities[0].id_whatsapp;
        }
        if (idWa) {
          localStorage.setItem('smartoo_id_wa', idWa);
        }
        
        renderDashboard(data);
        
        // Fetch Dompet & Kategori after successful login
        await window.fetchKategori();
        await window.fetchDompet();
        
        await initializeDefaultsIfNeeded();
        
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

  // --- EXPORT EXCEL MODAL ---
  const modalExport = document.getElementById('modal-export');
  const btnCloseExport = document.getElementById('btn-close-export');
  const exportRentang = document.getElementById('export-rentang');
  const btnDoExport = document.getElementById('btn-do-export');
  
  const expHarian = document.getElementById('export-harian-group');
  const expBulanan = document.getElementById('export-bulanan-group');
  const expKustom = document.getElementById('export-kustom-group');
  const expDateSingle = document.getElementById('export-date-single');
  const expMonthSingle = document.getElementById('export-month-single');
  const expDateStart = document.getElementById('export-date-start');
  const expDateEnd = document.getElementById('export-date-end');

  window.exportExcel = () => {
    if(modalLainnya) modalLainnya.style.display = 'none';
    if(modalExport) modalExport.style.display = 'flex';
  };
  
  if (btnCloseExport) btnCloseExport.addEventListener('click', () => {
    modalExport.style.display = 'none';
  });

  if (exportRentang) {
    exportRentang.addEventListener('change', (e) => {
      expHarian.style.display = 'none';
      expBulanan.style.display = 'none';
      expKustom.style.display = 'none';
      
      if (e.target.value === 'Harian') expHarian.style.display = 'block';
      else if (e.target.value === 'Bulanan') expBulanan.style.display = 'block';
      else if (e.target.value === 'Kustom') expKustom.style.display = 'grid';
    });
  }

  if (btnDoExport) {
    btnDoExport.addEventListener('click', async () => {
      if (cachedActivities.length === 0) {
        alert("Tidak ada data untuk di-export!");
        return;
      }
      
      const rentang = exportRentang.value;
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const parseDate = (dStr) => {
         if(!dStr) return new Date(0);
         if(dStr.includes('/')) {
            const p = dStr.split('/');
            return new Date(`${p[2]}-${p[1]}-${p[0]}T00:00:00`);
         }
         return new Date(dStr + "T00:00:00");
      };

      let filtered = cachedActivities.filter(act => {
        if (!act.tanggal) return false;
        const actDate = parseDate(act.tanggal);
        
        if (rentang === 'Harian') {
          const tDate = expDateSingle.value ? new Date(expDateSingle.value + "T00:00:00") : today;
          return actDate.getTime() === tDate.getTime();
        } else if (rentang === 'Mingguan') {
          const seven = new Date(today); seven.setDate(today.getDate() - 7);
          return actDate >= seven && actDate <= today;
        } else if (rentang === 'Bulanan') {
          let ty = today.getFullYear(); let tm = today.getMonth();
          if (expMonthSingle.value) {
            const p = expMonthSingle.value.split('-');
            ty = parseInt(p[0], 10); tm = parseInt(p[1], 10)-1;
          }
          return actDate.getFullYear() === ty && actDate.getMonth() === tm;
        } else if (rentang === 'Kustom') {
          if (expDateStart.value && actDate < new Date(expDateStart.value + "T00:00:00")) return false;
          if (expDateEnd.value && actDate > new Date(expDateEnd.value + "T00:00:00")) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        alert("Tidak ada transaksi di rentang waktu tersebut.");
        return;
      }

      // EXCELJS GENERATION
      btnDoExport.textContent = "Mengekspor...";
      try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Laporan Keuangan');

        // Styling
        sheet.columns = [
          { header: 'ID Transaksi', key: 'id', width: 20 },
          { header: 'Tanggal', key: 'tgl', width: 15 },
          { header: 'Waktu', key: 'wkt', width: 10 },
          { header: 'Jenis', key: 'jenis', width: 15 },
          { header: 'Kategori', key: 'kat', width: 20 },
          { header: 'Keterangan', key: 'ket', width: 30 },
          { header: 'Sumber Dana', key: 'sumber', width: 20 },
          { header: 'Tujuan Dana (Mutasi)', key: 'tujuan', width: 20 },
          { header: 'Nominal', key: 'nom', width: 20 },
          { header: 'Tag', key: 'tag', width: 15 }
        ];

        // Header Row Styling (Green Background, White Bold Text)
        sheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1b3c35' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Add Data
        filtered.forEach(act => {
          sheet.addRow({
            id: act.id_transaksi,
            tgl: act.tanggal,
            wkt: act.waktu,
            jenis: act.jenis_transaksi,
            kat: act.kategori,
            ket: act.keterangan,
            sumber: act.sumber_dana,
            tujuan: act.tujuan_dana || '-',
            nom: parseInt(String(act.nominal).replace(/[^0-9-]/g, '')) || 0,
            tag: act.tag_status || '-'
          });
        });

        // Currency Format for Nominal
        sheet.getColumn('nom').numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Keuangan_SMARTO2_${rentang}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert("Gagal membuat file Excel. Pastikan koneksi internet stabil.");
      } finally {
        btnDoExport.innerHTML = '<i class="fas fa-file-excel"></i> UNDUH EXCEL';
      }
    });
  }

  const renderDashboard = (data) => {
    const activities = data.activities || [];
    cachedActivities = activities;

    let fallbackIncome = 0;
    let fallbackExpense = 0;
    let fallbackDebt = 0;
    let fallbackPiutang = 0;
    
    if (activities) {
      activities.forEach(act => {
        let n = parseInt(String(act.nominal).replace(/[^0-9-]/g, '')) || 0;
        if (act.jenis_transaksi === 'Pemasukan') {
          if (act.kategori && act.kategori.toLowerCase() === 'utang') fallbackDebt += n;
          fallbackIncome += n;
        } else if (act.jenis_transaksi === 'Pengeluaran') {
          if (act.kategori && act.kategori.toLowerCase() === 'piutang') fallbackPiutang += n;
          fallbackExpense += n;
        }
      });
    }
    const fallbackBalance = fallbackIncome - fallbackExpense;
    
    // Use data.metrics if available and non-zero, otherwise fallback to manual calculation
    let metrics = data.metrics;
    if (!metrics || (metrics.income === 0 && fallbackIncome > 0)) {
      metrics = { income: fallbackIncome, expense: fallbackExpense, balance: fallbackBalance, debt: fallbackDebt, piutang: fallbackPiutang };
    }
    
    let nama = data.nama_pengguna || data.nama;
    if ((!nama || nama === "Pengguna Web") && activities.length > 0) {
      const validActivity = activities.find(a => a.nama_pengguna && a.nama_pengguna !== "Pengguna Web" && a.nama_pengguna !== "-");
      if (validActivity) {
        nama = validActivity.nama_pengguna;
      }
    }
    nama = nama || "Pengguna Web";
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
  const showCatatModal = () => {
    document.getElementById('form-action').value = "tambah";
    document.getElementById('form-id').value = "";
    crudForm.reset();
    
    // Set default date/time to now
    const now = new Date();
    if(formTanggal) formTanggal.value = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    if(formWaktu) formWaktu.value = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).substring(0,5);
    
    // Reset Mutasi UI
    if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'none';
    if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana';

    modalTitle.textContent = "Catat Transaksi";
    crudError.style.display = "none";
    modal.style.display = "flex";
  };

  if(btnCatat) btnCatat.addEventListener('click', showCatatModal);
  
  const btnCatatMobile = document.getElementById('btn-catat-mobile');
  if(btnCatatMobile) btnCatatMobile.addEventListener('click', (e) => {
    e.preventDefault();
    showCatatModal();
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
      tujuan_dana: formTujuanDana ? formTujuanDana.value : "",
      tag_status: tag,
      tanggal: formTanggal ? formTanggal.value : "",
      waktu: formWaktu ? formWaktu.value : "",
      bulan_tahun: formTanggal && formTanggal.value ? formTanggal.value.substring(0, 7) + '-01' : ""
    };

    btnSaveCrud.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 5px;"></i> Menyimpan...';
    btnSaveCrud.disabled = true;
    try {
      const response = await fetch('https://n8n.smart-oo.me/webhook/dashboard-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      
      if (resData.status === 'sukses') {
        modal.style.display = "none";
        showToast("Transaksi berhasil disimpan!", "success");
        // Refresh Dashboard Data
        const phone = localStorage.getItem('smartoo_phone');
        const otp = localStorage.getItem('smartoo_otp');
        await fetchDashboardData(phone, otp);
      } else {
        crudError.textContent = resData.message || "Gagal menyimpan data.";
        crudError.style.display = "block";
        showToast("Gagal menyimpan transaksi", "error");
      }
    } catch (err) {
      crudError.textContent = "Terjadi kesalahan koneksi.";
      crudError.style.display = "block";
      showToast("Kesalahan koneksi", "error");
    } finally {
      btnSaveCrud.innerHTML = "SIMPAN TRANSAKSI";
      btnSaveCrud.disabled = false;
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
    document.getElementById('form-nominal').value = parseInt(String(act.nominal).replace(/[^0-9-]/g, ''), 10).toLocaleString('id-ID').replace(/,/g, '.');
    
    if (formTanggal) formTanggal.value = act.tanggal || '';
    if (formWaktu) formWaktu.value = act.waktu ? act.waktu.substring(0,5) : '';
    
    const sDana = document.getElementById('form-sumber-dana');
    if(sDana) sDana.value = act.sumber_dana || "Tunai";
    if(formTujuanDana) formTujuanDana.value = act.tujuan_dana || "";
    
    if(act.jenis_transaksi === 'Mutasi') {
       if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'block';
       if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana (Asal)';
    } else {
       if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'none';
       if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana';
    }
    
    document.getElementById('form-tag').value = act.tag_status || "";
    
    document.getElementById('modal-title').textContent = "Edit Transaksi";
    document.getElementById('crud-error').style.display = "none";
    document.getElementById('crud-modal').style.display = "flex";
  };

  window.hapusData = async (id) => {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
    if (!confirmDelete) return;

    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    if (!id_whatsapp) return;

    try {
      const response = await fetch('https://n8n.smart-oo.me/webhook/dashboard-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hapus',
          id_transaksi: id,
          id_whatsapp: id_whatsapp
        })
      });
      const resData = await response.json();
      if (resData.status === 'sukses') {
        showToast("Transaksi berhasil dihapus!", "success");
        const phone = localStorage.getItem('smartoo_phone');
        const otp = localStorage.getItem('smartoo_otp');
        await fetchDashboardData(phone, otp);
      } else {
        showToast("Gagal menghapus data.", "error");
        alert(resData.message || "Gagal menghapus data.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan.", "error");
      console.error(err);
    }
  };

  // ================= ROUTING & FILTER TRANSAKSI =================
  const switchView = (viewName) => {
    // Hide all views
    if (viewDashboard) viewDashboard.style.display = 'none';
    if (viewTransaksi) viewTransaksi.style.display = 'none';
    if (viewDompet) viewDompet.style.display = 'none';
    if (viewKategori) viewKategori.style.display = 'none';
    
    // Remove active classes
    const allNavs = [
      navDashboard, navDashboardMobile, 
      navTransaksi, navTransaksiMobile, 
      navDompetSidebar, navDompetMobile, 
      navKategoriSidebar
    ];
    allNavs.forEach(nav => {
      if(nav) nav.classList.remove('active');
    });

    if (viewName === 'transaksi') {
      if (navTransaksi) navTransaksi.classList.add('active');
      if (navTransaksiMobile) navTransaksiMobile.classList.add('active');
      if (viewTransaksi) viewTransaksi.style.display = 'block';
      applyFilters(); 
    } else if (viewName === 'dompet') {
      if (navDompetSidebar) navDompetSidebar.classList.add('active');
      if (navDompetMobile) navDompetMobile.classList.add('active');
      if (viewDompet) viewDompet.style.display = 'block';
    } else if (viewName === 'kategori') {
      if (navKategoriSidebar) navKategoriSidebar.classList.add('active');
      if (viewKategori) viewKategori.style.display = 'block';
    } else {
      if (navDashboard) navDashboard.classList.add('active');
      if (navDashboardMobile) navDashboardMobile.classList.add('active');
      if (viewDashboard) viewDashboard.style.display = 'block';
    }
  };

  if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
  if (navDashboardMobile) navDashboardMobile.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
  
  if (navTransaksi) navTransaksi.addEventListener('click', (e) => { e.preventDefault(); switchView('transaksi'); });
  if (navTransaksiMobile) navTransaksiMobile.addEventListener('click', (e) => { e.preventDefault(); switchView('transaksi'); });
  
  if (navDompetSidebar) navDompetSidebar.addEventListener('click', (e) => { e.preventDefault(); switchView('dompet'); });
  if (navKategoriSidebar) navKategoriSidebar.addEventListener('click', (e) => { e.preventDefault(); switchView('kategori'); });

  if (navDompetMobile) navDompetMobile.addEventListener('click', (e) => { e.preventDefault(); switchView('dompet'); });
  
  // Offcanvas Links
  if (navKategoriMobile) navKategoriMobile.addEventListener('click', (e) => { 
    e.preventDefault(); 
    switchView('kategori'); 
    if(modalLainnya) modalLainnya.style.display = 'none'; 
  });
  
  if (navExportMobile) navExportMobile.addEventListener('click', (e) => {
    e.preventDefault();
    if(modalLainnya) modalLainnya.style.display = 'none'; 
    const modalExport = document.getElementById('modal-export');
    if (modalExport) modalExport.style.display = 'flex';
  });
  
  if (navLainnyaMobile) navLainnyaMobile.addEventListener('click', (e) => {
    e.preventDefault();
    if(modalLainnya) modalLainnya.style.display = 'flex';
  });
  if (btnCloseLainnya) btnCloseLainnya.addEventListener('click', () => {
    if(modalLainnya) modalLainnya.style.display = 'none';
  });

  const applyFilters = () => {
    if (!filterSearch) return;

    const q = filterSearch.value.toLowerCase();
    const jenis = filterJenis.value;
    const waktu = filterWaktu.value;
    
    const dSingle = filterDateSingle ? filterDateSingle.value : '';
    const mSingle = filterMonthSingle ? filterMonthSingle.value : '';
    const dStart = filterDateStart ? filterDateStart.value : '';
    const dEnd = filterDateEnd ? filterDateEnd.value : '';

    const today = new Date();
    today.setHours(0,0,0,0);

    // Helper untuk memparsing tanggal format DD/MM/YYYY atau YYYY-MM-DD
    const parseCustomDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          // Asumsi DD/MM/YYYY -> YYYY-MM-DD
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
        }
      }
      return new Date(dateStr + "T00:00:00");
    };

    let filtered = cachedActivities.filter(act => {
      if (q && !(act.keterangan || '').toLowerCase().includes(q) && !(act.kategori || '').toLowerCase().includes(q)) return false;
      if (jenis !== 'Semua' && act.jenis_transaksi !== jenis) return false;

      if (waktu !== 'Semua' && act.tanggal) {
        const actDate = parseCustomDate(act.tanggal);
        
        if (waktu === 'Harian') {
          let targetDate = today;
          if (dSingle) targetDate = new Date(dSingle + "T00:00:00");
          if (actDate.getTime() !== targetDate.getTime()) return false;
        } else if (waktu === 'Mingguan') {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          if (actDate < sevenDaysAgo || actDate > today) return false;
        } else if (waktu === 'Bulanan') {
          let targetYear = today.getFullYear();
          let targetMonth = today.getMonth();
          if (mSingle) {
            const mParts = mSingle.split('-');
            targetYear = parseInt(mParts[0], 10);
            targetMonth = parseInt(mParts[1], 10) - 1;
          }
          if (actDate.getFullYear() !== targetYear || actDate.getMonth() !== targetMonth) return false;
        } else if (waktu === 'Kustom') {
          if (dStart) {
            const sDate = new Date(dStart + "T00:00:00");
            if (actDate < sDate) return false;
          }
          if (dEnd) {
            const eDate = new Date(dEnd + "T00:00:00");
            if (actDate > eDate) return false;
          }
        }
      }
      return true;
    });

    // Jika mode Kustom, reverse array agar dari tanggal terlama ke terbaru (sesuai request)
    if (waktu === 'Kustom') {
      filtered = filtered.reverse();
    }
    
    filteredActivities = filtered;

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

  const renderDompet = () => {
    const tblDompet = document.getElementById('table-body-dompet');
    const cardsDompet = document.getElementById('dompet-cards');
    const selSumberDana = document.getElementById('form-sumber-dana');
    const selTujuanDana = document.getElementById('form-tujuan-dana');

    if(tblDompet) tblDompet.innerHTML = '';
    if(cardsDompet) cardsDompet.innerHTML = '';

    // DYNAMIC SYNC: Ambil dompet dari transaksi yang mungkin belum ada di cachedDompet
    if (cachedActivities) {
      cachedActivities.forEach(act => {
        if (act.sumber_dana && act.sumber_dana !== '-' && act.sumber_dana.trim() !== '') {
          if (!cachedDompet.some(d => d.nama_dompet && d.nama_dompet.toLowerCase() === act.sumber_dana.toLowerCase())) {
            let grup = 'Bank';
            let lower = act.sumber_dana.toLowerCase();
            if (lower.includes('tunai') || lower.includes('cash')) grup = 'Tunai';
            else if (['ovo', 'gopay', 'dana', 'shopeepay', 'linkaja', 'spay', 'shopee'].some(ew => lower.includes(ew))) grup = 'E-Wallet';
            cachedDompet.push({
              id_dompet: 'virtual_' + Date.now() + Math.random(),
              nama_dompet: act.sumber_dana,
              grup: grup
            });
          }
        }
      });
    }

    let optHtml = '<option value="">Pilih Sumber Dana...</option>';
    let totals = { 'Tunai': 0, 'Bank': 0, 'E-Wallet': 0 };
    let hasDompet = false;
    let totalAllSaldo = 0;

    cachedDompet.forEach(dpt => {
      if (!dpt.nama_dompet) return;

      let saldo = 0;
      if (cachedActivities) {
        cachedActivities.forEach(act => {
          let nom = parseInt(String(act.nominal).replace(/[^0-9-]/g, '')) || 0;
          if (act.sumber_dana === dpt.nama_dompet && act.jenis_transaksi === 'Pemasukan') {
            saldo += nom;
          } else if (act.sumber_dana === dpt.nama_dompet && act.jenis_transaksi === 'Pengeluaran') {
            saldo -= nom;
          } else if (act.jenis_transaksi === 'Mutasi') {
            if (act.sumber_dana === dpt.nama_dompet) saldo -= nom;
            if (act.tujuan_dana === dpt.nama_dompet) saldo += nom;
          }
        });
      }

      totalAllSaldo += saldo;
      if (totals[dpt.grup] !== undefined) totals[dpt.grup] += 1;
      hasDompet = true;
      optHtml += `<option value="${dpt.nama_dompet}">${dpt.nama_dompet}</option>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dpt.nama_dompet}</td>
        <td>${dpt.grup}</td>
        <td>${formatRp(saldo)}</td>
        <td class="action-buttons">
          <button class="btn-action btn-edit" onclick="editDompet('${dpt.id_dompet}', '${dpt.grup}', '${dpt.nama_dompet}')"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" onclick="hapusDompet('${dpt.id_dompet}')"><i class="fas fa-trash"></i></button>
        </td>
      `;
      if(tblDompet) tblDompet.appendChild(tr);
    });

    if(!hasDompet && tblDompet) {
      tblDompet.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada dompet/sumber dana.</td></tr>';
    }

    ['Tunai', 'Bank', 'E-Wallet'].forEach(grp => {
       const d = totals[grp];
       if (cardsDompet) cardsDompet.innerHTML += `
         <div class="card" style="padding:15px; border-left:4px solid var(--primary);">
           <div class="card-title">${grp}</div>
           <div class="card-value" style="font-size:1.2rem;">${d} Akun</div>
         </div>
       `;
    });
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
    // Hide all first
    if (filterHarianGroup) filterHarianGroup.style.display = 'none';
    if (filterBulananGroup) filterBulananGroup.style.display = 'none';
    if (filterDateGroup) filterDateGroup.style.display = 'none';
    if (filterDateGroup2) filterDateGroup2.style.display = 'none';
    
    if (e.target.value === 'Harian') {
      if (filterHarianGroup) filterHarianGroup.style.display = 'block';
    } else if (e.target.value === 'Bulanan') {
      if (filterBulananGroup) filterBulananGroup.style.display = 'block';
    } else if (e.target.value === 'Kustom') {
      if (filterDateGroup) filterDateGroup.style.display = 'block';
      if (filterDateGroup2) filterDateGroup2.style.display = 'block';
    } else {
      if (filterDateSingle) filterDateSingle.value = '';
      if (filterMonthSingle) filterMonthSingle.value = '';
      if (filterDateStart) filterDateStart.value = '';
      if (filterDateEnd) filterDateEnd.value = '';
    }
    applyFilters();
  });
  if (filterDateSingle) filterDateSingle.addEventListener('change', applyFilters);
  if (filterMonthSingle) filterMonthSingle.addEventListener('change', applyFilters);
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

  // ================= MODAL KATEGORI & DOMPET (Basic Handlers) =================
  const modalKategori = document.getElementById('modal-kategori');
  const btnTambahKategori = document.getElementById('btn-tambah-kategori');
  const btnCloseKategori = document.getElementById('btn-close-kategori');
  
  if(btnTambahKategori) {
    btnTambahKategori.addEventListener('click', () => {
      document.getElementById('form-kategori-crud').reset();
      document.getElementById('kategori-action').value = 'tambah';
      document.getElementById('kategori-id').value = '';
      document.getElementById('modal-title-kategori').textContent = 'Tambah Kategori';
      if(modalKategori) modalKategori.style.display = 'flex';
    });
  }
  if(btnCloseKategori) btnCloseKategori.addEventListener('click', () => {
    if(modalKategori) modalKategori.style.display = 'none';
  });

  const modalDompet = document.getElementById('modal-dompet');
  const btnTambahDompet = document.getElementById('btn-tambah-dompet');
  const btnCloseDompet = document.getElementById('btn-close-dompet');

  if(btnTambahDompet) {
    btnTambahDompet.addEventListener('click', () => {
      document.getElementById('form-dompet').reset();
      document.getElementById('dompet-action').value = 'tambah';
      document.getElementById('dompet-id').value = '';
      document.getElementById('modal-title-dompet').textContent = 'Tambah Dompet';
      if(modalDompet) modalDompet.style.display = 'flex';
    });
  }
  if(btnCloseDompet) btnCloseDompet.addEventListener('click', () => {
    if(modalDompet) modalDompet.style.display = 'none';
  });

  // ================= API KATEGORI =================
  let cachedKategori = [];
  window.fetchKategori = async () => {
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    if(!id_whatsapp) return false;
    try {
      const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id_whatsapp })
      });
      const data = await res.json();
      if(data.status === 'sukses' && data.data) {
        cachedKategori = Array.isArray(data.data) ? data.data : (Object.keys(data.data).length === 0 ? [] : [data.data]);
        renderKategori();
        return true;
      }
    } catch(err) {
      console.error('Gagal fetch kategori', err);
    }
    return false;
  };

  const renderKategori = () => {
    const tblPemasukan = document.getElementById('table-kategori-pemasukan');
    const tblPengeluaran = document.getElementById('table-kategori-pengeluaran');
    const formKategoriSelect = document.getElementById('form-kategori'); // di form transaksi
    
    if(tblPemasukan) tblPemasukan.innerHTML = '';
    if(tblPengeluaran) tblPengeluaran.innerHTML = '';
    
    let hasPemasukan = false;
    let hasPengeluaran = false;
    let optHtml = '<option value="">Pilih Kategori...</option>';

    cachedKategori.forEach(kat => {
      if (!kat.id_kategori) return; // skip empty objects from n8n
      optHtml += `<option value="${kat.nama_kategori}">${kat.nama_kategori}</option>`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${kat.nama_kategori}</td>
        <td>
          <button class="btn-action btn-edit" onclick="editKategori('${kat.id_kategori}')"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" onclick="hapusKategori('${kat.id_kategori}')"><i class="fas fa-trash"></i></button>
        </td>
      `;
      if(kat.jenis === 'Pemasukan' && tblPemasukan) { tblPemasukan.appendChild(tr); hasPemasukan = true; }
      if(kat.jenis === 'Pengeluaran' && tblPengeluaran) { tblPengeluaran.appendChild(tr); hasPengeluaran = true; }
    });

    if(!hasPemasukan && tblPemasukan) tblPemasukan.innerHTML = '<tr><td colspan="2" style="text-align:center;">Belum ada kategori pemasukan.</td></tr>';
    if(!hasPengeluaran && tblPengeluaran) tblPengeluaran.innerHTML = '<tr><td colspan="2" style="text-align:center;">Belum ada kategori pengeluaran.</td></tr>';
    
    if(formKategoriSelect) formKategoriSelect.innerHTML = optHtml;
  };

  window.editKategori = (id) => {
    const kat = cachedKategori.find(k => k.id_kategori === id);
    if(!kat) return;
    document.getElementById('kategori-action').value = 'edit';
    document.getElementById('kategori-id').value = id;
    document.getElementById('kategori-jenis').value = kat.jenis;
    document.getElementById('kategori-nama').value = kat.nama_kategori;
    document.getElementById('modal-title-kategori').textContent = 'Edit Kategori';
    if(modalKategori) modalKategori.style.display = 'flex';
  };

  window.hapusKategori = async (id) => {
    if(!confirm('Hapus kategori ini?')) return;
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    try {
      await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hapus', id_whatsapp, id_kategori: id })
      });
      showToast("Kategori berhasil dihapus!", "success");
      fetchKategori();
    } catch(err) {
      showToast("Gagal menghapus kategori", "error");
    }
  };

  const formKatCrud = document.getElementById('form-kategori-crud');
  if(formKatCrud) {
    formKatCrud.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = document.getElementById('kategori-action').value;
      const id = document.getElementById('kategori-id').value;
      const jenis = document.getElementById('kategori-jenis').value;
      const nama = document.getElementById('kategori-nama').value;
      const id_whatsapp = localStorage.getItem('smartoo_id_wa');
      
      const btnSave = document.getElementById('btn-save-kategori');
      btnSave.textContent = 'Menyimpan...';
      btnSave.disabled = true;
      try {
        await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, id_whatsapp, id_kategori: id, jenis, nama_kategori: nama })
        });
        if(modalKategori) modalKategori.style.display = 'none';
        showToast("Kategori berhasil disimpan!", "success");
        fetchKategori();
      } catch(err) {
        showToast("Gagal menyimpan kategori", "error");
      } finally {
        btnSave.textContent = 'SIMPAN KATEGORI';
        btnSave.disabled = false;
      }
    });
  }

  // ================= API DOMPET =================
  let cachedDompet = [];
  window.fetchDompet = async () => {
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    if(!id_whatsapp) return false;
    try {
      const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id_whatsapp })
      });
      const data = await res.json();
      if(data.status === 'sukses' && data.data) {
        cachedDompet = Array.isArray(data.data) ? data.data : (Object.keys(data.data).length === 0 ? [] : [data.data]);
        renderDompet();
        return true;
      }
    } catch(err) {
      console.error('Gagal fetch dompet', err);
    }
    return false;
  };

  
  window.editDompet = (id) => {
    const dpt = cachedDompet.find(d => d.id_dompet === id);
    if(!dpt) return;
    document.getElementById('dompet-action').value = 'edit';
    document.getElementById('dompet-id').value = id;
    document.getElementById('dompet-grup').value = dpt.grup;
    document.getElementById('dompet-nama').value = dpt.nama_dompet;
    document.getElementById('modal-title-dompet').textContent = 'Edit Dompet';
    if(modalDompet) modalDompet.style.display = 'flex';
  };

  window.hapusDompet = async (id) => {
    if(!confirm('Hapus dompet ini?')) return;
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    try {
      await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hapus', id_whatsapp, id_dompet: id })
      });
      showToast("Dompet berhasil dihapus!", "success");
      fetchDompet();
    } catch(err) {
      showToast("Gagal menghapus dompet", "error");
    }
  };

  const formDompetCrud = document.getElementById('form-dompet');
  if(formDompetCrud) {
    formDompetCrud.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = document.getElementById('dompet-action').value;
      const id = document.getElementById('dompet-id').value;
      const grup = document.getElementById('dompet-grup').value;
      const nama = document.getElementById('dompet-nama').value;
      const id_whatsapp = localStorage.getItem('smartoo_id_wa');
      
      const btnSave = document.getElementById('btn-save-dompet');
      btnSave.textContent = 'Menyimpan...';
      btnSave.disabled = true;
      try {
        await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, id_whatsapp, id_dompet: id, grup, nama_dompet: nama })
        });
        if(modalDompet) modalDompet.style.display = 'none';
        showToast("Dompet berhasil disimpan!", "success");
        fetchDompet();
      } catch(err) {
        showToast("Gagal menyimpan dompet", "error");
      } finally {
        btnSave.textContent = 'SIMPAN DOMPET';
        btnSave.disabled = false;
      }
    });
  }

  // INIT
  checkSession();
});
