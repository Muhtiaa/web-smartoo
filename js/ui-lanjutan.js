document.addEventListener('DOMContentLoaded', () => {
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
      const val = e.target.value;
      if (val === 'Mutasi' || val === 'Nabung/Investasi') {
        if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'block';
        if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana (Asal)';
        if(formTujuanDana) formTujuanDana.required = true;
      } else {
        if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'none';
        if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana';
        if(formTujuanDana) {
          formTujuanDana.required = false;
          formTujuanDana.value = "";
        }
      }
      if (typeof window.updateKategoriDropdown === 'function') {
        window.updateKategoriDropdown();
      }
    });
  }

  // --- CRUD MODAL LOGIC ---
  window.showCatatModal = () => {
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
    modal.classList.add('show');
  };

  if(btnCatat) btnCatat.addEventListener('click', showCatatModal);
  
  const btnCatatMobile = document.getElementById('btn-catat-mobile');
  if(btnCatatMobile) btnCatatMobile.addEventListener('click', (e) => {
    e.preventDefault();
    showCatatModal();
  });

  btnCloseModal.addEventListener('click', () => {
    modal.classList.remove('show');
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
      phone: localStorage.getItem('smartoo_phone'),
      otp: localStorage.getItem('smartoo_otp'),
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
        modal.classList.remove('show');
        showToast("Transaksi berhasil disimpan!", "success");
        // Refresh Dashboard Data
        const phone = localStorage.getItem('smartoo_phone');
        const otp = localStorage.getItem('smartoo_otp');
        window.syncNow();
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
    const act = window.cachedActivities.find(a => a.id_transaksi === id);
    if (!act) {
      alert('Data tidak ditemukan!');
      return;
    }
    
    document.getElementById('form-action').value = "edit";
    document.getElementById('form-id').value = id;
    document.getElementById('form-jenis').value = act.jenis_transaksi;
    
    // Update Kategori Dropdown berdasarkan Jenis Transaksi
    if (typeof window.updateKategoriDropdown === 'function') {
      window.updateKategoriDropdown();
    }
    
    document.getElementById('form-keterangan').value = act.keterangan;
    document.getElementById('form-kategori').value = act.kategori || "Pindah Dana";
    document.getElementById('form-nominal').value = parseInt(String(act.nominal).replace(/[^0-9-]/g, ''), 10).toLocaleString('id-ID').replace(/,/g, '.');
    
    if(formTanggal) formTanggal.value = act.tanggal || '';
    if(formWaktu) formWaktu.value = act.waktu ? act.waktu.substring(0,5) : '';
    
    // Set dompet dropdown values after updateKategoriDropdown builds them
    const sDana = document.getElementById('form-sumber-dana');
    if(sDana) sDana.value = act.sumber_dana || "Tunai";
    if(formTujuanDana) formTujuanDana.value = act.tujuan_dana || "";
    
    if(act.jenis_transaksi === 'Mutasi' || act.jenis_transaksi === 'Nabung/Investasi') {
       if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'block';
       if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana (Asal)';
    } else {
       if(tujuanDanaGroup) tujuanDanaGroup.style.display = 'none';
       if(labelSumberDana) labelSumberDana.textContent = 'Sumber Dana';
    }
    
    document.getElementById('form-tag').value = act.tag_status || "";
    
    document.getElementById('modal-title').textContent = "Edit Transaksi";
    document.getElementById('crud-error').style.display = "none";
    document.getElementById('crud-modal').classList.add('show');
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
          id_whatsapp: id_whatsapp,
          phone: localStorage.getItem('smartoo_phone'),
          otp: localStorage.getItem('smartoo_otp')
        })
      });
      const resData = await response.json();
      if (resData.status === 'sukses') {
        showToast("Transaksi berhasil dihapus!", "success");
        const phone = localStorage.getItem('smartoo_phone');
        const otp = localStorage.getItem('smartoo_otp');
        window.syncNow();
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
    if (viewDashboard) viewDashboard.style.display = 'none'; viewDashboard.classList.remove('view-active');
    if (viewTransaksi) viewTransaksi.style.display = 'none'; viewTransaksi.classList.remove('view-active');
    if (viewDompet) viewDompet.style.display = 'none'; viewDompet.classList.remove('view-active');
    if (viewKategori) viewKategori.style.display = 'none'; viewKategori.classList.remove('view-active');
    
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
      if (viewTransaksi) viewTransaksi.style.display = 'block'; viewTransaksi.classList.add('view-active');
      applyFilters(); 
    } else if (viewName === 'dompet') {
      if (navDompetSidebar) navDompetSidebar.classList.add('active');
      if (navDompetMobile) navDompetMobile.classList.add('active');
      if (viewDompet) viewDompet.style.display = 'block'; viewDompet.classList.add('view-active');
    } else if (viewName === 'kategori') {
      if (navKategoriSidebar) navKategoriSidebar.classList.add('active');
      if (viewKategori) viewKategori.style.display = 'block'; viewKategori.classList.add('view-active');
    } else {
      if (navDashboard) navDashboard.classList.add('active');
      if (navDashboardMobile) navDashboardMobile.classList.add('active');
      if (viewDashboard) viewDashboard.style.display = 'block'; viewDashboard.classList.add('view-active');
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
    if(modalLainnya) modalLainnya.classList.remove('show'); 
  });
  
  if (navExportMobile) navExportMobile.addEventListener('click', (e) => {
    e.preventDefault();
    if(modalLainnya) modalLainnya.classList.remove('show'); 
    const modalExport = document.getElementById('modal-export');
    if (modalExport) modalExport.classList.add('show');
  });
  
  if (navLainnyaMobile) navLainnyaMobile.addEventListener('click', (e) => {
    e.preventDefault();
    if(modalLainnya) modalLainnya.classList.add('show');
  });
  if (btnCloseLainnya) btnCloseLainnya.addEventListener('click', () => {
    if(modalLainnya) modalLainnya.classList.remove('show');
  });

  window.applyFilters = () => {
    if (!filterSearch) return;

    const selectedKategori = filterSearch.value; // Sekarang dropdown kategori
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

    let filtered = window.cachedActivities.filter(act => {
      // Filter berdasarkan Dropdown Kategori
      if (selectedKategori && (act.kategori || '').toLowerCase() !== selectedKategori.toLowerCase()) return false;
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

  window.renderDompet = () => {
    const tblDompet = document.getElementById('table-body-dompet');
    const cardsDompet = document.getElementById('dompet-cards');
    const selSumberDana = document.getElementById('form-sumber-dana');
    const selTujuanDana = document.getElementById('form-tujuan-dana');

    if(tblDompet) tblDompet.innerHTML = '';
    if(cardsDompet) cardsDompet.innerHTML = '';

    // DYNAMIC SYNC: Ambil dompet dari transaksi yang mungkin belum ada di window.cachedDompet
    if (window.cachedActivities) {
      window.cachedActivities.forEach(act => {
        const checkAndAdd = (danaName) => {
          if (!danaName || danaName === '-' || danaName.trim() === '') return;
          const lower = danaName.toLowerCase();
          if (['bank', 'e-wallet', 'tunai', 'tabungan'].includes(lower)) return; // Abaikan generic name
          if (window.cachedDompet.some(d => d.nama_dompet && d.nama_dompet.toLowerCase() === lower)) return;
          let grup = 'Bank';
          if (lower.includes('tunai') || lower.includes('cash')) grup = 'Tunai';
          else if (['ovo', 'gopay', 'dana', 'shopeepay', 'linkaja', 'spay', 'shopee'].some(ew => lower.includes(ew))) grup = 'E-Wallet';
          else if (['bibit', 'reksadana', 'saham', 'deposito', 'celengan', 'tabungan'].some(tb => lower.includes(tb))) grup = 'Tabungan';
          window.cachedDompet.push({ id_dompet: 'virtual_' + Date.now() + Math.random(), nama_dompet: danaName, grup: grup });
        };
        checkAndAdd(act.sumber_dana);
        if (act.jenis_transaksi === 'Mutasi' && act.tujuan_dana) checkAndAdd(act.tujuan_dana);
      });
    }

    let optHtml = '<option value="">Pilih Sumber Dana...</option>';
    let totals = { 'Tunai': 0, 'Bank': 0, 'E-Wallet': 0, 'Tabungan': 0 };
    let hasDompet = false;
    let totalAllSaldo = 0;

    // Urutkan dompet: Tunai dulu, lalu Bank, E-Wallet, Tabungan
    const grupOrder = { 'Tunai': 0, 'Bank': 1, 'E-Wallet': 2, 'Tabungan': 3 };
    const sortedDompet = [...window.cachedDompet].sort((a, b) => (grupOrder[a.grup] || 99) - (grupOrder[b.grup] || 99));

    sortedDompet.forEach(dpt => {
      if (!dpt.nama_dompet) return;
      const isVirtual = (dpt.id_dompet || '').toString().startsWith('virtual_');

      let saldo = 0;
      if (window.cachedActivities) {
        window.cachedActivities.forEach(act => {
          let nom = parseInt(String(act.nominal).replace(/[^0-9-]/g, '')) || 0;
          const sd = (act.sumber_dana || "").toLowerCase();
          const td = (act.tujuan_dana || "").toLowerCase();
          const nd = (dpt.nama_dompet || "").toLowerCase();

          if (sd === nd && act.jenis_transaksi === 'Pemasukan') {
            saldo += nom;
          } else if (sd === nd && act.jenis_transaksi === 'Pengeluaran') {
            saldo -= nom;
          } else if (act.jenis_transaksi === 'Mutasi' || act.jenis_transaksi === 'Nabung/Investasi') {
            if (sd === nd) saldo -= nom;
            if (td === nd) saldo += nom;
          }
        });
      }

      totalAllSaldo += saldo;
      if (totals[dpt.grup] !== undefined) totals[dpt.grup] += saldo;
      hasDompet = true;
      optHtml += `<option value="${dpt.nama_dompet}">${dpt.nama_dompet}</option>`;

      // Tombol aksi: sembunyikan hapus untuk virtual dompet (belum tersimpan di DB)
      const aksiHtml = isVirtual 
        ? `<span style="color:#888; font-size:0.8rem;">Otomatis</span>`
        : `<button class="btn-action btn-edit" onclick="editDompet('${dpt.id_dompet}', '${dpt.grup}', '${dpt.nama_dompet}')"><i class="fas fa-edit"></i> Edit</button>
           <button class="btn-action btn-delete" onclick="hapusDompet('${dpt.id_dompet}')"><i class="fas fa-trash"></i> Hapus</button>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Nama Dompet">${dpt.nama_dompet}</td>
        <td data-label="Grup"><span style="background:${dpt.grup === 'Tunai' ? '#27ae60' : dpt.grup === 'Bank' ? '#2980b9' : dpt.grup === 'E-Wallet' ? '#8e44ad' : '#f39c12'}; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.75rem;">${dpt.grup}</span></td>
        <td data-label="Saldo" style="font-weight:bold; color:${saldo >= 0 ? '#27ae60' : '#c0392b'};">${formatRp(saldo)}</td>
        <td data-label="Aksi" class="action-buttons">${aksiHtml}</td>
      `;
      if(tblDompet) tblDompet.appendChild(tr);
    });

    if(!hasDompet && tblDompet) {
      tblDompet.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada dompet/sumber dana.</td></tr>';
    }

    const formSumberDanaSelect = document.getElementById('form-sumber-dana');
    const formTujuanDanaSelect = document.getElementById('form-tujuan-dana');
    if(formSumberDanaSelect) formSumberDanaSelect.innerHTML = optHtml;
    if(formTujuanDanaSelect) formTujuanDanaSelect.innerHTML = optHtml;

    ['Tunai', 'Bank', 'E-Wallet', 'Tabungan'].forEach(grp => {
       const d = totals[grp];
       let icon = 'fa-wallet';
       let cardColor = 'var(--primary)';
       if(grp === 'Bank') { icon = 'fa-university'; cardColor = '#2980b9'; }
       if(grp === 'E-Wallet') { icon = 'fa-mobile-alt'; cardColor = '#8e44ad'; }
       if(grp === 'Tabungan') { icon = 'fa-piggy-bank'; cardColor = '#f39c12'; }
       
       if (cardsDompet) cardsDompet.innerHTML += `
         <div class="card" style="padding:15px; border-left:4px solid ${cardColor};">
           <div class="card-title" style="display:flex; align-items:center; gap:8px;"><i class="fas ${icon}" style="color:${cardColor};"></i> ${grp}</div>
           <div class="card-value" style="font-size:1.2rem; color:${d >= 0 ? '#27ae60' : '#c0392b'};">${formatRp(d)}</div>
         </div>
       `;
    });
  };

  window.renderTransaksiTable = () => {
    if (!tableBodyTransaksi) return;
    tableBodyTransaksi.innerHTML = '';
    
    const maxPage = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
    if (pageIndicator) pageIndicator.textContent = `Halaman ${currentPage} / ${maxPage}`;

    if (filteredActivities.length === 0) {
      tableBodyTransaksi.innerHTML = `<tr><td colspan="6" style="text-align:center;">Tidak ada transaksi yang cocok.</td></tr>`;
      return;
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageData = filteredActivities.slice(startIdx, endIdx);

    pageData.forEach(act => {
      const isIncome = act.jenis_transaksi === 'Pemasukan';
      const isMutasi = act.jenis_transaksi === 'Mutasi';
      const isNabung = act.jenis_transaksi === 'Nabung/Investasi';
      let color = '#333';
      let symbol = '';
      if(isIncome){ color = '#27ae60'; symbol = '+'; }
      if(act.jenis_transaksi === 'Pengeluaran'){ color = '#c0392b'; symbol = '-'; }
      if(isMutasi){ color = '#f39c12'; symbol = ''; }
      if(isNabung){ color = '#2980b9'; symbol = ''; }
      
      // Badge Jenis Transaksi
      const badgeColor = isIncome ? '#27ae60' : (isMutasi ? '#f39c12' : (isNabung ? '#2980b9' : '#c0392b'));
      const badgeHtml = `<span style="background:${badgeColor}; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.75rem; white-space:nowrap;">${act.jenis_transaksi || '-'}</span>`;
      
      let displaySumber = act.sumber_dana || '-';
      if ((isMutasi || isNabung) && act.tujuan_dana && act.tujuan_dana !== '-') {
         displaySumber = `${act.sumber_dana} <i class="fas fa-arrow-right" style="font-size:0.8em; opacity:0.7; margin:0 4px;"></i> ${act.tujuan_dana}`;
      }
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Tanggal">
          <div style="font-weight:bold;">${act.tanggal || '-'}</div>
          <div style="font-size:0.8rem; color:#888;">${act.waktu || '-'}</div>
        </td>
        <td data-label="Keterangan">
          <div style="font-weight:bold;">${act.keterangan || '-'}</div>
          <div style="font-size:0.8rem; color:#888;">${act.kategori || '-'}</div>
        </td>
        <td data-label="Jenis">${badgeHtml}</td>
        <td data-label="Sumber Dana" style="font-size:0.9rem;">${displaySumber}</td>
        <td data-label="Nominal" style="color: ${color}; font-weight: bold;">
          ${symbol} ${formatRp(act.nominal || 0)}
        </td>
        <td data-label="Aksi">
          <button class="btn-action btn-edit" onclick="editData('${act.id_transaksi}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-action btn-delete" onclick="hapusData('${act.id_transaksi}')"><i class="fas fa-trash"></i> Hapus</button>
        </td>
      `;
      tableBodyTransaksi.appendChild(tr);
    });
  };

  if (filterSearch) filterSearch.addEventListener('change', applyFilters);
  if (filterJenis) filterJenis.addEventListener('change', (e) => {
    // Update opsi filter kategori agar menyesuaikan jenis transaksi
    if (filterSearch && filterSearch.tagName === 'SELECT') {
      const jenis = e.target.value;
      let filterOpts = '<option value="">Semua Kategori</option>';
      const uniqueKats = new Set();
      window.cachedKategori.forEach(k => {
        if (k.nama_kategori && !uniqueKats.has(k.nama_kategori)) {
          // Tampilkan jika Semua Jenis, ATAU jenis cocok, ATAU Nabung/Mutasi pakai kategori bawaannya sendiri
          if (jenis === 'Semua' || k.jenis === jenis) {
            uniqueKats.add(k.nama_kategori);
            filterOpts += `<option value="${k.nama_kategori}">${k.nama_kategori}</option>`;
          }
        }
      });
      if (jenis === 'Mutasi' || jenis === 'Nabung/Investasi') {
         filterOpts += '<option value="Pindah Dana">Pindah Dana</option>';
      }
      filterSearch.innerHTML = filterOpts;
    }
    applyFilters();
  });
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
      if(modalKategori) modalKategori.classList.add('show');
    });
  }
  if(btnCloseKategori) btnCloseKategori.addEventListener('click', () => {
    if(modalKategori) modalKategori.classList.remove('show');
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
      if(modalDompet) modalDompet.classList.add('show');
    });
  }
  if(btnCloseDompet) btnCloseDompet.addEventListener('click', () => {
    if(modalDompet) modalDompet.classList.remove('show');
  });

  // ================= API KATEGORI =================
  window.cachedKategori = window.cachedKategori || [];
  window.fetchKategori = async () => {
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    const phone = localStorage.getItem('smartoo_phone');
    const otp = localStorage.getItem('smartoo_otp');
    if(!id_whatsapp || !phone || !otp) return false;
    try {
      const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id_whatsapp, phone, otp })
      });
      const data = await res.json();
      if(data.status === 'sukses' && data.data) {
        window.cachedKategori = Array.isArray(data.data) ? data.data : (Object.keys(data.data).length === 0 ? [] : [data.data]);
        renderKategori();
        return true;
      }
    } catch(err) {
      console.error('Gagal fetch kategori', err);
    }
    return false;
  };

  window.renderKategori = () => {
    const tblPemasukan = document.getElementById('table-kategori-pemasukan');
    const tblPengeluaran = document.getElementById('table-kategori-pengeluaran');
    const formKategoriSelect = document.getElementById('form-kategori'); // di form transaksi
    
    if(tblPemasukan) tblPemasukan.innerHTML = '';
    if(tblPengeluaran) tblPengeluaran.innerHTML = '';
    
    let hasPemasukan = false;
    let hasPengeluaran = false;
    let optHtml = '<option value="">Pilih Kategori...</option>';

    window.cachedKategori.forEach(kat => {
      if (!kat.id_kategori) return; // skip empty objects from n8n
      optHtml += `<option value="${kat.nama_kategori}">${kat.nama_kategori}</option>`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Nama Kategori">${kat.nama_kategori}</td>
        <td data-label="Aksi">
          <button class="btn-action btn-edit" onclick="editKategori('${kat.id_kategori}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-action btn-delete" onclick="hapusKategori('${kat.id_kategori}')"><i class="fas fa-trash"></i> Hapus</button>
        </td>
      `;
      if(kat.jenis === 'Pemasukan' && tblPemasukan) { tblPemasukan.appendChild(tr); hasPemasukan = true; }
      if(kat.jenis === 'Pengeluaran' && tblPengeluaran) { tblPengeluaran.appendChild(tr); hasPengeluaran = true; }
    });

    if(!hasPemasukan && tblPemasukan) tblPemasukan.innerHTML = '<tr><td colspan="2" style="text-align:center;">Belum ada kategori pemasukan.</td></tr>';
    if(!hasPengeluaran && tblPengeluaran) tblPengeluaran.innerHTML = '<tr><td colspan="2" style="text-align:center;">Belum ada kategori pengeluaran.</td></tr>';
    
    // Initial dropdown update based on current selection
    if (typeof window.updateKategoriDropdown === 'function') {
      window.updateKategoriDropdown();
    }
    
    // Populasi dropdown filter kategori di halaman Transaksi
    if (filterSearch && filterSearch.tagName === 'SELECT') {
      let filterOpts = '<option value="">Semua Kategori</option>';
      const uniqueKats = new Set();
      window.cachedKategori.forEach(k => {
        if (k.nama_kategori && !uniqueKats.has(k.nama_kategori)) {
          uniqueKats.add(k.nama_kategori);
          filterOpts += `<option value="${k.nama_kategori}">${k.nama_kategori}</option>`;
        }
      });
      filterSearch.innerHTML = filterOpts;
    }
  };

  // Logic memisahkan opsi Kategori Dropdown
  window.updateKategoriDropdown = () => {
    const jenis = document.getElementById('form-jenis').value;
    const formKategoriSelect = document.getElementById('form-kategori');
    const formSumberSelect = document.getElementById('form-sumber-dana');
    const formTujuanSelect = document.getElementById('form-tujuan-dana');
    
    // Build options for Sumber Dana & Tujuan Dana dynamically
    if (formSumberSelect && formTujuanSelect && window.cachedDompet.length > 0) {
      let optSumber = '<option value="">Pilih Sumber Dana...</option>';
      let optTujuan = '<option value="">Pilih Tujuan Dana...</option>';
      
      const grupOrder = { 'Tunai': 0, 'Bank': 1, 'E-Wallet': 2, 'Tabungan': 3 };
      const sortedDompet = [...window.cachedDompet].sort((a, b) => (grupOrder[a.grup] || 99) - (grupOrder[b.grup] || 99));
      
      sortedDompet.forEach(dpt => {
        if (!dpt.nama_dompet) return;
        
        if (jenis === 'Nabung/Investasi') {
          // Sumber Dana = Non-Tabungan, Tujuan Dana = Tabungan
          if (dpt.grup !== 'Tabungan') optSumber += `<option value="${dpt.nama_dompet}">${dpt.nama_dompet}</option>`;
          if (dpt.grup === 'Tabungan') optTujuan += `<option value="${dpt.nama_dompet}">${dpt.nama_dompet}</option>`;
        } else {
          // Mutasi, Pemasukan, Pengeluaran = Tampilkan semua
          optSumber += `<option value="${dpt.nama_dompet}">${dpt.nama_dompet}</option>`;
          optTujuan += `<option value="${dpt.nama_dompet}">${dpt.nama_dompet}</option>`;
        }
      });
      
      const oldSumber = formSumberSelect.value;
      const oldTujuan = formTujuanSelect.value;
      formSumberSelect.innerHTML = optSumber;
      formTujuanSelect.innerHTML = optTujuan;
      if (oldSumber) formSumberSelect.value = oldSumber;
      if (oldTujuan) formTujuanSelect.value = oldTujuan;
    }

    if(!formKategoriSelect) return;
    
    let optHtml = '<option value="">Pilih Kategori...</option>';
    
    if (jenis === 'Mutasi' || jenis === 'Nabung/Investasi') {
        optHtml += '<option value="Pindah Dana">Pindah Dana</option>';
        formKategoriSelect.innerHTML = optHtml;
        formKategoriSelect.value = "Pindah Dana";
        return;
    }

    window.cachedKategori.forEach(kat => {
      if (!kat.id_kategori) return;
      if (kat.jenis === jenis) {
        optHtml += `<option value="${kat.nama_kategori}">${kat.nama_kategori}</option>`;
      }
    });
    formKategoriSelect.innerHTML = optHtml;
  };

  window.editKategori = (id) => {
    const kat = window.cachedKategori.find(k => k.id_kategori === id);
    if(!kat) return;
    document.getElementById('kategori-action').value = 'edit';
    document.getElementById('kategori-id').value = id;
    document.getElementById('kategori-jenis').value = kat.jenis;
    document.getElementById('kategori-nama').value = kat.nama_kategori;
    document.getElementById('modal-title-kategori').textContent = 'Edit Kategori';
    if(modalKategori) modalKategori.classList.add('show');
  };

  window.hapusKategori = async (id) => {
    if(!confirm('Hapus kategori ini?')) return;
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    const phone = localStorage.getItem('smartoo_phone');
    const otp = localStorage.getItem('smartoo_otp');
    try {
      const backupKategori = JSON.parse(JSON.stringify(window.cachedKategori));
      // Optimistic UI Update
      window.cachedKategori = window.cachedKategori.filter(k => k.id_kategori !== id);
      renderKategori();
      
      const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hapus', id_whatsapp, phone, otp, id_kategori: id })
      });
      const data = await res.json();
      if (data.status === 'error') {
         window.cachedKategori = backupKategori; // Rollback
         renderKategori();
         showToast(data.message || "Gagal menghapus kategori", "error");
      } else {
         showToast("Kategori berhasil dihapus!", "success");
         fetchKategori();
      }
    } catch(err) {
      showToast("Terjadi kesalahan jaringan", "error");
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
      const phone = localStorage.getItem('smartoo_phone');
      const otp = localStorage.getItem('smartoo_otp');
      
      const btnSave = document.getElementById('btn-save-kategori');
      btnSave.textContent = 'Menyimpan...';
      btnSave.disabled = true;
      try {
        const backupKategori = JSON.parse(JSON.stringify(window.cachedKategori));
        // Optimistic UI Update
        if (action === 'tambah') {
           window.cachedKategori.push({ id_kategori: 'temp_' + Date.now(), jenis, nama_kategori: nama });
        } else if (action === 'edit') {
           const idx = window.cachedKategori.findIndex(k => k.id_kategori === id);
           if (idx > -1) { window.cachedKategori[idx].jenis = jenis; window.cachedKategori[idx].nama_kategori = nama; }
        }
        renderKategori();

        const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-kategori-crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, id_whatsapp, phone, otp, id_kategori: id, jenis, nama_kategori: nama })
        });
        const data = await res.json();
        
        if (data.status === 'error') {
           window.cachedKategori = backupKategori; // Rollback
           renderKategori();
           showToast(data.message || "Gagal menyimpan kategori", "error");
        } else {
           if(modalKategori) modalKategori.classList.remove('show');
           showToast("Kategori berhasil disimpan!", "success");
           fetchKategori();
        }
      } catch(err) {
        showToast("Terjadi kesalahan jaringan", "error");
      } finally {
        btnSave.textContent = 'SIMPAN KATEGORI';
        btnSave.disabled = false;
      }
    });
  }

  // ================= API DOMPET =================
  window.cachedDompet = window.cachedDompet || [];
  window.fetchDompet = async () => {
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    const phone = localStorage.getItem('smartoo_phone');
    const otp = localStorage.getItem('smartoo_otp');
    if(!id_whatsapp || !phone || !otp) return false;
    try {
      const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id_whatsapp, phone, otp })
      });
      const data = await res.json();
      if(data.status === 'sukses' && data.data) {
        window.cachedDompet = Array.isArray(data.data) ? data.data : (Object.keys(data.data).length === 0 ? [] : [data.data]);
        renderDompet();
        return true;
      }
    } catch(err) {
      console.error('Gagal fetch dompet', err);
    }
    return false;
  };

  
  window.editDompet = (id) => {
    const dpt = window.cachedDompet.find(d => d.id_dompet === id);
    if(!dpt) return;
    document.getElementById('dompet-action').value = 'edit';
    document.getElementById('dompet-id').value = id;
    document.getElementById('dompet-grup').value = dpt.grup;
    document.getElementById('dompet-nama').value = dpt.nama_dompet;
    document.getElementById('modal-title-dompet').textContent = 'Edit Dompet';
    if(modalDompet) modalDompet.classList.add('show');
  };

  window.hapusDompet = async (id) => {
    if(!confirm('Hapus dompet ini?')) return;
    const id_whatsapp = localStorage.getItem('smartoo_id_wa');
    const phone = localStorage.getItem('smartoo_phone');
    const otp = localStorage.getItem('smartoo_otp');
    try {
      const backupDompet = JSON.parse(JSON.stringify(window.cachedDompet));
      // Optimistic UI Update
      window.cachedDompet = window.cachedDompet.filter(d => d.id_dompet !== id);
      renderDompet();

      const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hapus', id_whatsapp, phone, otp, id_dompet: id })
      });
      const data = await res.json();
      if (data.status === 'error') {
         window.cachedDompet = backupDompet; // Rollback
         renderDompet();
         showToast(data.message || "Gagal menghapus dompet", "error");
      } else {
         showToast("Dompet berhasil dihapus!", "success");
         fetchDompet();
      }
    } catch(err) {
      showToast("Terjadi kesalahan jaringan", "error");
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
      const phone = localStorage.getItem('smartoo_phone');
      const otp = localStorage.getItem('smartoo_otp');
      
      const btnSave = document.getElementById('btn-save-dompet');
      btnSave.textContent = 'Menyimpan...';
      btnSave.disabled = true;
      try {
        const backupDompet = JSON.parse(JSON.stringify(window.cachedDompet));
        // Optimistic UI Update
        if (action === 'tambah') {
           window.cachedDompet.push({ id_dompet: 'temp_' + Date.now(), grup, nama_dompet: nama });
        } else if (action === 'edit') {
           const idx = window.cachedDompet.findIndex(d => d.id_dompet === id);
           if(idx > -1) { window.cachedDompet[idx].grup = grup; window.cachedDompet[idx].nama_dompet = nama; }
        }
        renderDompet();

        const res = await fetch('https://n8n.smart-oo.me/webhook/dashboard-dompet-crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, id_whatsapp, phone, otp, id_dompet: id, grup, nama_dompet: nama })
        });
        const data = await res.json();
        
        if (data.status === 'error') {
           window.cachedDompet = backupDompet; // Rollback
           renderDompet();
           showToast(data.message || "Gagal menyimpan dompet", "error");
        } else {
           if(modalDompet) modalDompet.classList.remove('show');
           showToast("Dompet berhasil disimpan!", "success");
           fetchDompet();
        }
      } catch(err) {
        showToast("Terjadi kesalahan jaringan", "error");
      } finally {
        btnSave.textContent = 'SIMPAN DOMPET';
        btnSave.disabled = false;
      }
    });
  }

  // INIT
});
