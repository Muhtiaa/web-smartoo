// ==========================================
// UI.JS
// Mengurus semua perubahan tampilan (Render HTML, Grafik)
// ==========================================

let pieChartObj = null;
let lineChartObj = null;

// Ekspor fungsi agar bisa dipanggil dari file lain
window.renderDashboard = (data) => {
  const activities = data.activities || [];
  window.cachedActivities = activities;
  if (data.metrics) {
    window.cachedMetrics = data.metrics;
  }

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
  
  let metrics = data.metrics || window.cachedMetrics;
  if (!metrics || (metrics.income === 0 && fallbackIncome > 0)) {
    metrics = { income: fallbackIncome, expense: fallbackExpense, balance: fallbackBalance, debt: fallbackDebt, piutang: fallbackPiutang };
  }
  
  let nama = data.nama_pengguna || data.nama;
  if ((!nama || nama === "Pengguna Web") && activities.length > 0) {
    const validActivity = activities.find(a => a.nama_pengguna && a.nama_pengguna !== "Pengguna Web" && a.nama_pengguna !== "-");
    if (validActivity) nama = validActivity.nama_pengguna;
  }
  nama = nama || "Pengguna Web";
  localStorage.setItem('smartoo_nama', nama);

  document.getElementById('user-greeting').textContent = `Halo, ${nama}`;
  document.getElementById('val-saldo').textContent = formatRp(metrics.balance);
  document.getElementById('val-pemasukan').textContent = formatRp(metrics.income);
  document.getElementById('val-pengeluaran').textContent = formatRp(metrics.expense);
  document.getElementById('val-utang').textContent = formatRp(metrics.debt);
  document.getElementById('val-piutang').textContent = formatRp(metrics.piutang || 0);

  // Render Tabel Dasbor (10 Transaksi Terakhir)
  const tableBodyDashboard = document.getElementById('table-body-dashboard');
  tableBodyDashboard.innerHTML = '';
  
  if (activities.length === 0) {
    tableBodyDashboard.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada aktivitas.</td></tr>`;
  } else {
    const recent10 = activities.slice(0, 10);
    recent10.forEach(act => {
      const isIncome = act.jenis_transaksi === 'Pemasukan';
      const isMutasi = act.jenis_transaksi === 'Mutasi';
      const isNabung = act.jenis_transaksi === 'Nabung/Investasi';
      
      const color = isIncome ? '#27ae60' : (act.jenis_transaksi === 'Pengeluaran' ? '#c0392b' : (isNabung ? '#2980b9' : '#f39c12'));
      const symbol = isIncome ? '+' : (act.jenis_transaksi === 'Pengeluaran' ? '-' : '');
      
      const badgeColor = isIncome ? '#27ae60' : (isMutasi ? '#f39c12' : (isNabung ? '#2980b9' : '#c0392b'));
      const badgeLabel = act.jenis_transaksi || '-';
      const badgeHtml = `<span style="background:${badgeColor}; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.75rem; white-space:nowrap;">${badgeLabel}</span>`;
      
      let displaySumber = act.sumber_dana || '-';
      if ((isMutasi || isNabung) && act.tujuan_dana && act.tujuan_dana !== '-') {
        displaySumber = `${act.sumber_dana} <i class="fas fa-arrow-right" style="font-size:0.8em; opacity:0.7; margin:0 4px;"></i> ${act.tujuan_dana}`;
      }
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Tanggal">${act.tanggal} <br><small>${act.waktu}</small></td>
        <td data-label="Keterangan"><strong>${act.keterangan}</strong><br><small style="color:#888;">${act.kategori || '-'}</small></td>
        <td data-label="Jenis">${badgeHtml}</td>
        <td data-label="Sumber Dana" style="font-size:0.9rem;">${displaySumber}</td>
        <td data-label="Nominal" style="color:${color}; font-weight:bold;">${symbol} ${formatRp(act.nominal)}</td>
        <td data-label="Aksi">
          <button class="btn-action btn-edit" onclick="editData('${act.id_transaksi}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-action btn-delete" onclick="hapusData('${act.id_transaksi}')"><i class="fas fa-trash"></i> Hapus</button>
        </td>
      `;
      tableBodyDashboard.appendChild(tr);
    });
  }

  window.renderCharts(metrics, activities);
  
  if (typeof window.applyFilters === 'function') {
    window.applyFilters();
  }
};

window.renderCharts = (metrics, activities) => {
  if (pieChartObj) pieChartObj.destroy();
  if (lineChartObj) lineChartObj.destroy();

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

  let labels = [];
  let dataIncome = [];
  let dataExpense = [];
  
  if (activities && activities.length > 0) {
    const dailyData = {};
    activities.forEach(act => {
      const date = act.tanggal;
      if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
      if (act.jenis_transaksi === 'Pemasukan') dailyData[date].income += parseInt(act.nominal) || 0;
      if (act.jenis_transaksi === 'Pengeluaran') dailyData[date].expense += parseInt(act.nominal) || 0;
    });

    labels = Object.keys(dailyData).sort();
    labels.forEach(date => {
      dataIncome.push(dailyData[date].income);
      dataExpense.push(dailyData[date].expense);
    });
    
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

// Routing Sederhana (Tukar Tampilan)
window.switchView = (viewName) => {
  const views = ['dashboard', 'transaksi', 'dompet', 'kategori'];
  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if(el) {
      el.style.display = 'none';
      el.classList.remove('view-active');
    }
  });
  
  const navIds = ['nav-dashboard', 'nav-dashboard-mobile', 'nav-transaksi', 'nav-transaksi-mobile', 'nav-dompet-sidebar', 'nav-dompet-mobile', 'nav-kategori-sidebar'];
  navIds.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.classList.remove('active');
  });

  const targetView = document.getElementById('view-' + viewName);
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('view-active');
  }

  if (viewName === 'transaksi') {
    if(document.getElementById('nav-transaksi')) document.getElementById('nav-transaksi').classList.add('active');
    if(document.getElementById('nav-transaksi-mobile')) document.getElementById('nav-transaksi-mobile').classList.add('active');
    if (typeof window.applyFilters === 'function') window.applyFilters();
  } else if (viewName === 'dompet') {
    if(document.getElementById('nav-dompet-sidebar')) document.getElementById('nav-dompet-sidebar').classList.add('active');
    if(document.getElementById('nav-dompet-mobile')) document.getElementById('nav-dompet-mobile').classList.add('active');
  } else if (viewName === 'kategori') {
    if(document.getElementById('nav-kategori-sidebar')) document.getElementById('nav-kategori-sidebar').classList.add('active');
  } else {
    if(document.getElementById('nav-dashboard')) document.getElementById('nav-dashboard').classList.add('active');
    if(document.getElementById('nav-dashboard-mobile')) document.getElementById('nav-dashboard-mobile').classList.add('active');
  }
};
