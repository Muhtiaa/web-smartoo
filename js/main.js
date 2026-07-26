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
// DATA STORAGE
// ============================================================
let currentLang = 'id';
let csvProjects = [];
let csvRoadmap = [];
let csvEducation = [];

// Modal State
let currentModalSlides = [];
let currentModalTexts = [];
let activeModalSlide = 0;

// ============================================================
// API FETCH
// ============================================================
async function fetchMultiLangData(lang, category) {
  try {
    const url = `https://n8n.smart-oo.me/webhook/smartoo-web?lang=${lang}&kategori=${category}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error(`[SMART O²] Failed fetching ${category} for lang ${lang}:`, error);
    return [];
  }
}

async function loadAllData() {
  csvProjects = await fetchMultiLangData(currentLang, 'projects');
  csvRoadmap = await fetchMultiLangData(currentLang, 'roadmap');
  csvEducation = await fetchMultiLangData(currentLang, 'education');

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
  initHeroChatbot();

  initLanguageModal();

  loadAllData();
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

function initHeroChatbot() {
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatHistory = document.getElementById("chat-history");
  if (!chatInput || !chatSendBtn || !chatHistory) return;

  const webhookUrl = "https://n8n.smart-oo.me/webhook/website_smartoo";
  const sessionId = "sess_" + Math.random().toString(36).substr(2, 9);

  function parseMarkdown(text) {
    const div = document.createElement("div");
    div.textContent = text;
    let html = div.innerHTML;
    // Parse bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Parse italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Parse line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function appendBubble(text, sender, isHtml = false) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    chatHistory.appendChild(bubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return bubble;
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendBubble(text, "user", false);
    chatInput.value = "";

    const loadingBubble = appendBubble("Mengetik...", "ai loading", false);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const contentType = response.headers.get("content-type");
      let replyText = "";
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        replyText = data.reply || data.output || data.message || JSON.stringify(data);
      } else {
        replyText = await response.text();
      }

      loadingBubble.className = "chat-bubble ai";
      loadingBubble.innerHTML = parseMarkdown(replyText || "Maaf, saya tidak mengerti respons tersebut.");
    } catch (error) {
      console.error("[SMART O²] Chatbot Error:", error);
      loadingBubble.className = "chat-bubble ai";
      loadingBubble.innerHTML = "⚠️ Maaf, terjadi kesalahan saat terhubung ke server.";
    }
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
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
      console.log("[SMART O²] 🔓 Visual CMS Activated!");

      // 1. Text Editing
      const textTags = "h1, h2, h3, h4, p, span, a, li, button";
      document.querySelectorAll(textTags).forEach(el => {
        // Prevent editing elements inside the visual CMS panel itself later
        if (!el.closest('.cms-panel') && !el.closest('.chat-container')) {
          el.setAttribute("contenteditable", "true");
          el.classList.add("cms-editable");
          // Prevent links from redirecting when clicked
          if (el.tagName === "A") {
            el.addEventListener("click", (ev) => ev.preventDefault());
          }
        }
      });

      // 2. Image Editing
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);

      let currentEditingImage = null;

      document.querySelectorAll("img").forEach(img => {
        img.classList.add("cms-image-editable");
        img.addEventListener("click", (ev) => {
          ev.preventDefault();
          currentEditingImage = img;
          fileInput.click();
        });
      });

      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && currentEditingImage) {
          const reader = new FileReader();
          reader.onload = (event) => {
            currentEditingImage.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      // 3. Save & Download Panel
      const panel = document.createElement("div");
      panel.className = "cms-panel";
      panel.innerHTML = `
        <span>🔓 Visual Edit Mode Active</span>
        <button id="cms-save-btn">Save & Download</button>
      `;
      document.body.appendChild(panel);

      document.getElementById("cms-save-btn").addEventListener("click", () => {
        // Clone document to clean it up before downloading
        const clone = document.documentElement.cloneNode(true);
        
        // Clean up CMS artifacts from clone
        clone.querySelectorAll(".cms-editable").forEach(el => {
          el.removeAttribute("contenteditable");
          el.classList.remove("cms-editable");
        });
        clone.querySelectorAll(".cms-image-editable").forEach(el => {
          el.classList.remove("cms-image-editable");
        });
        
        const clonePanel = clone.querySelector(".cms-panel");
        if (clonePanel) clonePanel.remove();
        
        const cloneInput = clone.querySelector("input[type='file']");
        if (cloneInput) cloneInput.remove();

        const cloneNotif = clone.querySelector(".dev-mode-notification");
        if (cloneNotif) cloneNotif.remove();

        // Get full HTML string
        let htmlContent = "<!DOCTYPE html>\\n" + clone.outerHTML;
        
        // Trigger download
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "index.html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

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
    const title = item.judul || `Project ${index + 1}`;
    const desc = item.deskripsi || "";
    const badge = item.badge || defaultBadges[index % defaultBadges.length];
    
    // Split tags by comma, max 3
    const tagsRaw = item.tags || "";
    const tagsArray = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).slice(0, 3) : defaultTags;
    
    // Primary image is index 0 of link_gambar
    const linkGambarRaw = item.link_gambar || item["Link_Gambar"] || item["Link Gambar"] || "";
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
        
        <div class="card-actions" style="margin-bottom: 12px;">
          <a href="#" class="btn read-more-project" style="width:100%; background:var(--bg-primary); border:2px solid var(--text-dark); color:var(--text-dark); text-align:center;">Detail Project ➔</a>
        </div>
        
        <div class="card-actions">
          <a href="${generateWALink(title)}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">WhatsApp</a>
          <a href="${generateTGLink(title)}" target="_blank" rel="noopener noreferrer" class="btn btn-tg">Telegram</a>
        </div>
      </div>
    `;
    grid.appendChild(card);

    // Modal click logic for Project
    const detailBtn = card.querySelector(".read-more-project");
    if (detailBtn) {
      detailBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openEducationModal(item.detail_gambar, item.detail_teks);
      });
    }
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
    const title = item.judul || `Phase ${index + 1}`;
    const desc = item.deskripsi || "";
    const statusRaw = (item.status_roadmap || "").trim().toUpperCase();
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
    const title = item.judul || `Materi ${index + 1}`;
    const desc = item.deskripsi || "";
    const badge = item.badge || defaultBadges[index % defaultBadges.length];
    
    // Split for dynamic slider
    const linkGambarRaw = item.link_gambar || item["Link_Gambar"] || item["Link Gambar"] || "";
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
      openEducationModal(item.detail_gambar, item.detail_teks);
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

// ============================================================
// LANGUAGE MODAL
// ============================================================
function initLanguageModal() {
  const btn = document.getElementById("custom-lang-btn");
  const modal = document.getElementById("lang-modal");
  const overlay = document.getElementById("lang-modal-overlay");
  const closeBtn = document.getElementById("lang-modal-close");
  const langItems = document.querySelectorAll(".lang-item");
  const currentLangText = document.getElementById("current-lang-text");

  if (!btn || !modal) return;

  function openModal() { modal.classList.add("active"); }
  function closeModal() { modal.classList.remove("active"); }

  btn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  langItems.forEach(item => {
    item.addEventListener("click", () => {
      const langCode = item.getAttribute("data-lang");
      currentLangText.textContent = langCode.toUpperCase();
      
      // Update state and re-fetch data
      currentLang = langCode;
      loadAllData();
      
      closeModal();
    });
  });
}
