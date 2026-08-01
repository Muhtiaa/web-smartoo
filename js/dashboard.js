/* ============================================================
   SMART O² — Dashboard Logic
   Menangani OTP Login, Transisi UI, dan Render Grafik Chart.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initOTPInputs();
  initLoginSystem();
});

// ============================================================
// 1. OTP INPUT LOGIC
// ============================================================
function initOTPInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  
  inputs.forEach((input, index) => {
    // Select text on focus
    input.addEventListener('focus', (e) => {
      e.target.select();
    });

    // Menangani Paste OTP (Tempel)
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const pastedNumbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6); // Ambil hanya 6 angka pertama

      if (pastedNumbers.length > 0) {
        pastedNumbers.split('').forEach((char, i) => {
          if (inputs[index + i]) {
            inputs[index + i].value = char;
            // Fokus otomatis ke kotak selanjutnya atau terakhir
            if (i === pastedNumbers.length - 1 && inputs[index + i + 1]) {
              inputs[index + i + 1].focus();
            } else if (i === pastedNumbers.length - 1) {
              inputs[index + i].blur();
            }
          }
        });
      }
    });

    input.addEventListener('keyup', (e) => {
      const currentInput = input;
      const nextInput = input.nextElementSibling;
      const prevInput = input.previousElementSibling;

      // Allow only numbers
      currentInput.value = currentInput.value.replace(/[^0-9]/g, '');

      // Move to next input on typing
      if (currentInput.value.length > 0 && nextInput) {
        nextInput.focus();
      }
      
      // Move to previous input on backspace if current is empty
      if (e.key === 'Backspace' && prevInput) {
        prevInput.focus();
      }
    });
  });
}

// ============================================================
// 2. LOGIN & TRANSITION LOGIC
// ============================================================
function initLoginSystem() {
  const btnVerify = document.getElementById('btn-verify');
  const btnLogout = document.getElementById('btn-logout');
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const errorMsg = document.getElementById('login-error');
  const userPhone = document.getElementById('user-phone');

  btnVerify.addEventListener('click', async () => {
    const phone = document.getElementById('phone-input').value.trim();
    const otpInputs = document.querySelectorAll('.otp-input');
    let otpValue = "";
    
    otpInputs.forEach(input => {
      otpValue += input.value;
    });

    if (phone.length < 8) {
      errorMsg.textContent = "Masukkan nomor WhatsApp yang valid.";
      errorMsg.style.display = "block";
      return;
    }

    if (otpValue.length !== 6) {
      errorMsg.textContent = "Kode OTP harus 6 digit.";
      errorMsg.style.display = "block";
      return;
    }

    // MELAKUKAN API CALL KE N8N WEBHOOK
    btnVerify.textContent = "Memverifikasi...";
    btnVerify.style.opacity = "0.7";
    errorMsg.style.display = "none";

    try {
      const response = await fetch('https://n8n.smart-oo.me/webhook/dashboard-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, otp: otpValue }) // Kirim phone dan otp kembali
      });
      
      const data = await response.json();
      
      if (data.status === 'sukses') {
        loginSection.style.display = "none";
        dashboardSection.style.display = "block";
        userPhone.textContent = phone;
        
        // Load Data Asli dari Webhook & Chart
        loadDashboardData(data);
      } else {
        errorMsg.textContent = data.message || "Gagal masuk. Periksa kembali OTP Anda.";
        errorMsg.style.display = "block";
      }
    } catch (error) {
      errorMsg.textContent = "Terjadi kesalahan koneksi server.";
      errorMsg.style.display = "block";
    } finally {
      btnVerify.textContent = "Verifikasi OTP";
      btnVerify.style.opacity = "1";
    }
  });

  btnLogout.addEventListener('click', () => {
    // Reset form
    document.getElementById('phone-input').value = "";
    document.querySelectorAll('.otp-input').forEach(i => i.value = "");
    btnVerify.textContent = "Verifikasi OTP";
    btnVerify.style.opacity = "1";
    
    // Switch views
    dashboardSection.style.display = "none";
    loginSection.style.display = "flex";
  });
}

// ============================================================
// 3. DASHBOARD DATA & CHART RENDER
// ============================================================
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number);
}

function loadDashboardData(apiData) {
  // Menggunakan data asli dari API
  const data = apiData || {
    metrics: { income: 0, expense: 0, balance: 0, debt: 0 },
    activities: [],
    chartData: [{ label: "Bulan Ini", income: 0, expense: 0 }]
  };

  // 1. Update Metrics UI
  document.getElementById('val-income').textContent = formatRupiah(data.metrics.income);
  document.getElementById('val-expense').textContent = formatRupiah(data.metrics.expense);
  document.getElementById('val-balance').textContent = formatRupiah(data.metrics.balance);
  document.getElementById('val-debt').textContent = formatRupiah(data.metrics.debt);

  // 2. Render Activities
  const actList = document.getElementById('activity-list');
  actList.innerHTML = "";
  
  if (data.activities && data.activities.length > 0) {
    data.activities.forEach(act => {
      const li = document.createElement("li");
      li.className = "activity-item";
      
      const sign = act.type === "income" ? "+" : "-";
      const amountClass = act.type === "income" ? "income" : "expense";
      
      li.innerHTML = `
        <div>
          <div class="act-desc">${act.desc}</div>
          <div class="act-date">${act.date}</div>
        </div>
        <div class="act-amount ${amountClass}">
          ${sign} ${formatRupiah(act.amount)}
        </div>
      `;
      actList.appendChild(li);
    });
  } else {
    actList.innerHTML = "<li style='padding:15px; text-align:center;'>Belum ada riwayat transaksi.</li>";
  }

  // 3. Render Chart.js
  if (data.chartData) {
    renderChart(data.chartData);
  }
}

function renderChart(data) {
  const ctx = document.getElementById('mainChart').getContext('2d');
  
  // Hancurkan chart lama jika ada (mencegah bug re-render)
  if (window.myDashboardChart) {
    window.myDashboardChart.destroy();
  }

  const labels = data.map(d => d.label);
  const incomeData = data.map(d => d.income);
  const expenseData = data.map(d => d.expense);

  // Desain Brutalism untuk grafik
  window.myDashboardChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          backgroundColor: '#1E8E3E', // Hijau Google
          borderColor: '#000',
          borderWidth: 2,
          borderRadius: 0 // Tajam
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          backgroundColor: '#D93025', // Merah Google
          borderColor: '#000',
          borderWidth: 2,
          borderRadius: 0 // Tajam
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'inherit', weight: 'bold' }, color: '#000' }
        },
        tooltip: {
          backgroundColor: '#000',
          titleFont: { family: 'inherit', size: 14 },
          bodyFont: { family: 'inherit', size: 13, weight: 'bold' },
          cornerRadius: 0 // Tajam
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { weight: 'bold' }, color: '#000' }
        },
        y: {
          border: { display: true, width: 2, color: '#000' },
          grid: { color: '#ccc', drawBorder: false },
          ticks: { font: { weight: 'bold' }, color: '#000' }
        }
      }
    }
  });
}
