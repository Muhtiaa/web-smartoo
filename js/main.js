/* ============================================================
   SMART O² — Main JavaScript — Phase 3: Advanced Mapping
   Dynamic data mapped to 9 specific columns from Google Sheets
   ============================================================ */

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQdgzjoUdoMloIospOYe7Nc9JSnnQN7zn_G15oi9EFzaW0ENeNGPlRc2RUD4DW_mQ3NZPirJed44D_3/pub?gid=0&single=true&output=csv",
  waNumber: "6281384816826",
  tgBot: "Smartoo_GenTwo_bot",
  sheetsEditUrl: "https://docs.google.com/spreadsheets/d/1f2BenQyUipPzX08d-3gwnX7_3cPrgBOFRqq5tGNVeWM/edit?usp=sharing"
};

// ============================================================
// STATIC DATA (Hero & AI Solutions — tidak dari CSV)
// ============================================================
const SITE_DATA = {
  hero: {
    typingTexts: [
      "n8n Automation Expert",
      "AI Solutions Architect",
      "WhatsApp Bot Developer",
      "Business Process Automator",
      "Telegram Bot Builder"
    ]
  },

  aiSolutions: [
    { icon: "💬", title: "AI Customer Service", desc: "Bot layanan pelanggan otomatis 24/7 yang memahami konteks & bahasa alami." },
    { icon: "📊", title: "Pencatatan Keuangan", desc: "Otomasi pencatatan transaksi, invoice, & laporan keuangan via chat." },
    { icon: "🏥", title: "Pantauan Kesehatan", desc: "Sistem monitoring kesehatan dengan reminder & analisis data otomatis." },
    { icon: "📦", title: "Manajemen Inventaris", desc: "Tracking stok real-time dengan notifikasi otomatis & prediksi restock." },
    { icon: "📱", title: "Social Media Auto", desc: "Penjadwalan konten, auto-reply, & analitik performa multi-platform." },
    { icon: "🎯", title: "Lead Generation", desc: "Bot penangkap prospek cerdas dengan kualifikasi & follow-up otomatis." },
    { icon: "📋", title: "HR & Absensi", desc: "Sistem absensi, cuti, & manajemen karyawan terintegrasi via bot." },
    { icon: "🔗", title: "Custom Integration", desc: "Integrasi API multi-platform sesuai kebutuhan spesifik bisnis Anda." }
  ]
};

// ============================================================
// CSV DATA STORAGE
// ============================================================
let csvProjects = [];
let csvRoadmap = [];
let csvEducation = [];

// Modal State
let currentModalSlides = [];
let currentModalTexts = [];
let activeModalSlide = 0;

// ============================================================
// CSV PARSER
// ============================================================
function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
        if (char === '\r') i++;
      } else {
        currentField += char;
      }
    }
  }

  currentRow.push(currentField.trim());
  if (currentRow.some(f => f !== "")) {
    rows.push(currentRow);
  }

  if (rows.length < 1) return [];

  const headers = rows[0].map(h => h.trim());
  const data = [];

  for (let r = 1; r < rows.length; r++) {
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = rows[r][c] !== undefined ? rows[r][c] : "";
    }
    data.push(obj);
  }

  return data;
}

// ============================================================
// FETCH CSV DATA
// ============================================================
async function loadAllCSVData() {
  try {
    const response = await fetch(CONFIG.csvUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();
    const allData = parseCSV(csvText);

    // Map 9 columns based on Kategori
    csvProjects = allData.filter(d => (d["Kategori"] || "").trim().toLowerCase() === "projects");
    csvRoadmap = allData.filter(d => (d["Kategori"] || "").trim().toLowerCase() === "roadmap");
    csvEducation = allData.filter(d => (d["Kategori"] || "").trim().toLowerCase() === "education");

    console.log("[SMART O²] CSV data loaded:", allData.length, "rows");
  } catch (error) {
    console.warn("[SMART O²] CSV fetch failed, using fallback data:", error);
  }

  renderProjects();
  renderRoadmap();
  renderEducation();

  setTimeout(() => {
    initScrollAnimations();
    initCarousels();
    initGlowingTrail();
  }, 100);
}

// ============================================================
// FALLBACK DATA
// ============================================================
const FALLBACK = {
  projects: [
    { "Judul": "SMART O² SaaS", "Deskripsi": "Sistem cloud berbasis WA.", "Badge": "Flagship", "Tags": "SaaS, WhatsApp, Multi-User" }
  ],
  roadmap: [
    { "Judul": "Ideation", "Deskripsi": "Analisis kebutuhan.", "Status_Roadmap": "SELESAI" },
    { "Judul": "Development", "Deskripsi": "Pengembangan.", "Status_Roadmap": "SEDANG BERJALAN" },
    { "Judul": "Deployment", "Deskripsi": "Go live.", "Status_Roadmap": "AKAN DATANG" }
  ],
  education: [
    { "Judul": "Panduan n8n", "Deskripsi": "Belajar otomatisasi n8n.", "Badge": "Panduan", "Detail_Teks": "Slide 1 n8n---Slide 2 n8n" }
  ]
};

// ============================================================
// DOM READY
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initTypingEffect();
  initSmoothScroll();
  initMobileMenu();
  initScrollSpy();
  initScrollAnimations();
  initBackToTop();
  initNavbarScroll();
  initEasterEgg();
  renderAISolutions();
  initEducationModal();
  initCodeBlockTypewriter();

  loadAllCSVData();
});

// ============================================================
// TYPING EFFECT
// ============================================================
function initTypingEffect() {
  const typingEl = document.getElementById("typing-text");
  if (!typingEl) return;
  const texts = SITE_DATA.hero.typingTexts;
  let textIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const currentText = texts[textIndex];
    if (isDeleting) {
      typingEl.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingEl.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 40 : 80;
    if (!isDeleting && charIndex === currentText.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      delay = 400;
    }
    setTimeout(type, delay);
  }
  type();
}

function initCodeBlockTypewriter() {
  const el = document.getElementById("hero-code-block");
  if (!el) return;
  const fullText = "LAYANAN UTAMA SMART O²\n\n1. Custom WhatsApp & Telegram Bot\n2. n8n Advanced Workflow & API\n3. Integrasi MongoDB & Google Sheets\n4. Asisten AI Custom untuk UMKM/Bisnis";
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    let currentContent = fullText.substring(0, charIdx);
    el.innerHTML = currentContent + '<span class="typing-cursor"></span>';

    let delay = isDeleting ? 30 : 60;

    if (!isDeleting && charIdx === fullText.length) {
      delay = 5000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      delay = 500;
    }

    if (isDeleting && charIdx > 0) {
      charIdx--;
    } else if (!isDeleting && charIdx < fullText.length) {
      charIdx++;
    }

    setTimeout(type, delay);
  }

  type();
}

// ============================================================
// UI INITIALIZERS
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      e.preventDefault();
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
        const navMenu = document.querySelector(".nav-menu");
        if (navMenu && navMenu.classList.contains("open")) {
          navMenu.classList.remove("open");
          document.querySelector(".hamburger").classList.remove("active");
          document.body.style.overflow = "";
        }
      }
    });
  });
}

function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (!hamburger || !navMenu) return;
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("open");
    document.body.style.overflow = navMenu.classList.contains("open") ? "hidden" : "";
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");
  function updateActiveLink() {
    const scrollPos = window.scrollY + 100;
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${section.getAttribute("id")}`) link.classList.add("active");
        });
      }
    });
  }
  window.addEventListener("scroll", updateActiveLink, { passive: true });
}

function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 50), { passive: true });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(".fade-in, .fade-in-left, .fade-in-right").forEach((el) => observer.observe(el));
}

function initCarousels() {
  document.querySelectorAll(".carousel-wrapper").forEach((wrapper) => {
    if (wrapper.dataset.carouselInit) return;
    wrapper.dataset.carouselInit = "true";

    const track = wrapper.querySelector(".carousel-track");
    const dots = wrapper.querySelectorAll(".carousel-dot");
    const prevBtn = wrapper.querySelector(".carousel-btn.prev");
    const nextBtn = wrapper.querySelector(".carousel-btn.next");
    const slides = wrapper.querySelectorAll(".carousel-slide");
    let currentIndex = 0, startX = 0, isDragging = false;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => goToSlide(i)));

    track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
      isDragging = false;
    }, { passive: true });
  });
}

function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 400), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initGlowingTrail() {
  const container = document.querySelector(".roadmap-container");
  const progressLine = document.getElementById("glowing-trail-progress");
  
  if (!container || !progressLine) return;

  window.addEventListener("scroll", () => {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const startTrigger = windowHeight / 2;
    
    if (rect.top > startTrigger) {
      progressLine.style.height = "0%";
    } else if (rect.bottom < startTrigger) {
      progressLine.style.height = "100%";
    } else {
      const scrolled = startTrigger - rect.top;
      const progress = (scrolled / rect.height) * 100;
      progressLine.style.height = `${Math.min(100, Math.max(0, progress))}%`;
    }
  }, { passive: true });
}

// ============================================================
// EASTER EGG
// ============================================================
function initEasterEgg() {
  const logoImg = document.getElementById("logo-img");
  if (!logoImg) return;
  let clickTimestamps = [];
  let devModeActive = false;

  logoImg.addEventListener("click", (e) => {
    e.preventDefault();
    if (devModeActive) return;
    const now = Date.now();
    clickTimestamps.push(now);
    clickTimestamps = clickTimestamps.filter(t => now - t < 3000);

    if (clickTimestamps.length >= 5) {
      devModeActive = true;
      console.log("[SMART O²] 🔓 Developer Mode Activated!");
      document.querySelectorAll(".add-card").forEach(card => card.classList.add("active"));
      
      const notification = document.createElement("div");
      notification.className = "dev-mode-notification";
      notification.innerHTML = `<span>🔓</span> Developer Mode Activated`;
      document.body.appendChild(notification);
      requestAnimationFrame(() => notification.classList.add("show"));
      setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 400);
      }, 3000);
      clickTimestamps = [];
    }
  });
}

function generateWALink(projectName) {
  return `https://wa.me/${CONFIG.waNumber}?text=${encodeURIComponent(`Halo, saya ingin tahu lebih lanjut tentang proyek ${projectName}`)}`;
}
function generateTGLink(projectName) {
  return `https://t.me/${CONFIG.tgBot}?start=${encodeURIComponent(projectName)}`;
}

// ============================================================
// RENDERERS
// ============================================================
function renderProjects() {
  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const data = csvProjects.length > 0 ? csvProjects : FALLBACK.projects;
  const defaultBadges = ["Project", "Bot", "Automation", "Tool", "Service"];
  const defaultTags = ["Automation", "WhatsApp", "AI"];

  data.forEach((item, index) => {
    const title = item["Judul"] || `Project ${index + 1}`;
    const desc = item["Deskripsi"] || "";
    const badge = item["Badge"] || defaultBadges[index % defaultBadges.length];
    
    // Split tags by comma, max 3
    const tagsRaw = item["Tags"] || "";
    const tagsArray = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).slice(0, 3) : defaultTags;
    
    // Primary image is index 0 of Link_Gambar
    const linkGambarRaw = item["Link_Gambar"] || item["Link Gambar"] || "";
    const imageUrl = linkGambarRaw ? linkGambarRaw.split(",")[0].trim() : "";

    const isFeatured = index === 0;

    const card = document.createElement("div");
    card.className = `portfolio-card fade-in stagger-${(index % 6) + 1}${isFeatured ? " featured" : ""}`;

    const imageContent = imageUrl 
      ? `<img src="${imageUrl}" alt="${title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />` 
      : `<div class="placeholder-visual" style="background: linear-gradient(135deg, #1E3C2B, #2D5A3D);"><span class="visual-label">${title}</span></div>`;

    card.innerHTML = `
      <div class="card-image">
        ${imageContent}
        <span class="card-badge">${badge}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <div class="card-tags">
          ${tagsArray.map((tag, i) => `<span class="card-tag${i === 0 ? " accent" : ""}">${tag}</span>`).join("")}
        </div>
        <p class="card-desc">${desc}</p>
        <div class="card-actions">
          <a href="${generateWALink(title)}" target="_blank" rel="noopener" class="btn btn-wa">WhatsApp</a>
          <a href="${generateTGLink(title)}" target="_blank" rel="noopener" class="btn btn-tg">Telegram</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  const addCard = document.createElement("div");
  addCard.className = "add-card fade-in";
  addCard.innerHTML = `<div class="add-icon">+</div><span class="add-label">Tambah Project</span>`;
  addCard.addEventListener("click", () => {
    if (addCard.classList.contains("active")) window.open(CONFIG.sheetsEditUrl, "_blank");
  });
  grid.appendChild(addCard);
}

function renderAISolutions() {
  const grid = document.getElementById("solutions-grid");
  if (!grid) return;
  grid.innerHTML = "";
  SITE_DATA.aiSolutions.forEach((solution, index) => {
    const card = document.createElement("div");
    card.className = `solution-card fade-in stagger-${(index % 6) + 1}`;
    card.innerHTML = `<div class="solution-icon">${solution.icon}</div><h4>${solution.title}</h4><p>${solution.desc}</p>`;
    grid.appendChild(card);
  });
}

function renderRoadmap() {
  const container = document.getElementById("roadmap-phases");
  if (!container) return;
  container.innerHTML = "";

  const data = csvRoadmap.length > 0 ? csvRoadmap : FALLBACK.roadmap;

  function getRoadmapIcon(title) {
    const t = title.toLowerCase();
    if (t.includes("idea") || t.includes("ideation") || t.includes("arsitektur")) return "💡";
    if (t.includes("dev") || t.includes("development") || t.includes("integrasi") || t.includes("coding")) return "⚙️";
    if (t.includes("test") || t.includes("testing") || t.includes("beta")) return "🧪";
    if (t.includes("deploy") || t.includes("deployment") || t.includes("live") || t.includes("launch")) return "🚀";
    return "📌";
  }

  data.forEach((item, index) => {
    const title = item["Judul"] || `Phase ${index + 1}`;
    const desc = item["Deskripsi"] || "";
    const statusRaw = (item["Status_Roadmap"] || "").trim().toUpperCase();
    const icon = getRoadmapIcon(title);

    let statusClass = "akan-datang";
    let statusLabel = statusRaw || "AKAN DATANG";

    if (statusRaw === "SELESAI") statusClass = "selesai";
    else if (statusRaw === "SEDANG BERJALAN") statusClass = "sedang-berjalan";

    const isActive = statusClass === "sedang-berjalan" || statusClass === "selesai";

    const phaseItem = document.createElement("div");
    phaseItem.className = `phase-item fade-in${isActive ? " active" : ""}`;
    phaseItem.innerHTML = `
      <div class="phase-marker">
        <span class="phase-number">${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="phase-content">
        <span class="phase-icon">${icon}</span>
        <h3>${title}</h3>
        <p>${desc}</p>
        <span class="phase-status ${statusClass}">${statusLabel}</span>
      </div>
    `;
    container.appendChild(phaseItem);
  });
}

function renderEducation() {
  const grid = document.getElementById("insights-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const data = csvEducation.length > 0 ? csvEducation : FALLBACK.education;
  const defaultBadges = ["Panduan", "Tutorial", "Insight", "Strategi"];
  const slideColors = ["#2D5A3D", "#1E3C2B"];

  data.forEach((item, index) => {
    const title = item["Judul"] || `Materi ${index + 1}`;
    const desc = item["Deskripsi"] || "";
    const badge = item["Badge"] || defaultBadges[index % defaultBadges.length];
    
    // Split for dynamic slider
    const linkGambarRaw = item["Link_Gambar"] || item["Link Gambar"] || "";
    let imageArray = linkGambarRaw ? linkGambarRaw.split(",").map(i => i.trim()) : [];
    if (imageArray.length === 0) imageArray = [""]; // fallback

    let slidesHTML = "";
    imageArray.forEach((img, i) => {
      if (img) {
        slidesHTML += `<div class="carousel-slide"><img src="${img}" alt="Slide ${i+1}" onerror="this.style.display='none'" /></div>`;
      } else {
        slidesHTML += `<div class="carousel-slide"><div class="slide-placeholder" style="background:${slideColors[i%2]};"><span class="slide-label">No Image</span></div></div>`;
      }
    });

    let dotsHTML = "";
    if (imageArray.length > 1) {
      for (let i = 0; i < imageArray.length; i++) {
        dotsHTML += `<button class="carousel-dot${i === 0 ? " active" : ""}" aria-label="Slide ${i + 1}"></button>`;
      }
    }

    const card = document.createElement("div");
    card.className = `insight-card fade-in stagger-${(index % 6) + 1}`;
    card.innerHTML = `
      <div class="carousel-wrapper">
        <div class="carousel-track">${slidesHTML}</div>
        ${imageArray.length > 1 ? `<button class="carousel-btn prev">‹</button><button class="carousel-btn next">›</button><div class="carousel-nav">${dotsHTML}</div>` : ''}
      </div>
      <div class="card-body">
        <span class="card-category">${badge}</span>
        <h3 class="card-title">${title}</h3>
        <p class="card-desc">${desc}</p>
      </div>
      <div class="card-footer">
        <a href="#" class="read-more">Selengkapnya <span>→</span></a>
      </div>
    `;
    grid.appendChild(card);

    // Modal click logic
    const readMoreBtn = card.querySelector(".read-more");
    readMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openEducationModal(item["Detail_Gambar"], item["Detail_Teks"]);
    });
  });

  const addCard = document.createElement("div");
  addCard.className = "add-card fade-in";
  addCard.innerHTML = `<div class="add-icon">+</div><span class="add-label">Tambah Materi</span>`;
  addCard.addEventListener("click", () => {
    if (addCard.classList.contains("active")) window.open(CONFIG.sheetsEditUrl, "_blank");
  });
  grid.appendChild(addCard);
}

// ============================================================
// EDUCATION MODAL (POP-UP)
// ============================================================
function initEducationModal() {
  const modal = document.getElementById("education-modal");
  if(!modal) return;

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", closeModal);
  
  document.getElementById("modal-prev").addEventListener("click", () => {
    if (activeModalSlide > 0) updateModalSlide(activeModalSlide - 1);
  });
  document.getElementById("modal-next").addEventListener("click", () => {
    if (activeModalSlide < currentModalSlides.length - 1) updateModalSlide(activeModalSlide + 1);
  });
}

function closeModal() {
  document.getElementById("education-modal").classList.remove("active");
  document.body.style.overflow = "";
}

function openEducationModal(detailGambarRaw, detailTeksRaw) {
  let images = detailGambarRaw ? detailGambarRaw.split(",").map(i => i.trim()).slice(0, 5) : [];
  let texts = detailTeksRaw ? detailTeksRaw.split("---").map(t => t.trim()) : [];
  
  if (images.length === 0) images = [""]; // fallback

  currentModalSlides = images;
  currentModalTexts = texts;
  
  const track = document.getElementById("modal-track");
  track.innerHTML = "";
  images.forEach((img, i) => {
    if(img) {
      track.innerHTML += `<div class="modal-slide"><img src="${img}" alt="Detail Image ${i+1}" onerror="this.src=''" /></div>`;
    } else {
      track.innerHTML += `<div class="modal-slide"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1E3C2B;color:#F0E3D3;">No Image Available</div></div>`;
    }
  });

  updateModalSlide(0);
  document.getElementById("education-modal").classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scroll
}

function updateModalSlide(index) {
  activeModalSlide = index;
  document.getElementById("modal-track").style.transform = `translateX(-${index * 100}%)`;

  const prevBtn = document.getElementById("modal-prev");
  const nextBtn = document.getElementById("modal-next");
  
  prevBtn.style.display = index === 0 ? "none" : "flex";
  nextBtn.style.display = index === currentModalSlides.length - 1 ? "none" : "flex";

  if (currentModalSlides.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  }

  // Handle text mismatch gracefully (use current slide text, or last available text)
  const textContainer = document.getElementById("modal-text");
  textContainer.innerHTML = currentModalTexts[index] || currentModalTexts[currentModalTexts.length - 1] || "Tidak ada detail teks.";
}
