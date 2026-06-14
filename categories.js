// ─── AUTH GUARD ───
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

// ─── CATEGORY DATA ───
// Images use only files confirmed to exist in /images/
// Counts match the grouped categories in script.js (fashion=shoe+dress, etc.)
const CATEGORIES = [
  {
    id:    "fashion",
    name:  "Fashion",
    emoji: "👗",
    desc:  "Shoes, dresses, abayas & caps",
    count: 5,
    // uses pakistanclothing for a strong fashion hero shot
    images: [
      "images/pakistanclothing_1.webp",
      "images/Had7c2358222f491f9485beb1731e1a1ed_800x.webp",
      "images/shoes-pictures-0eil7v0z0t9p35zt.jpg"
    ]
  },
  {
    id:    "electronics",
    name:  "Electronics",
    emoji: "📱",
    desc:  "Mobiles, laptops & accessories",
    count: 5,
    images: [
      "images/yFVTwgKyQ3uuEf4DRx6imK.jpg",
      "images/OIP (9).jpg",
      "images/71eevLdvPaL._AC_SL1500_.jpg"
    ]
  },
  {
    id:    "bags",
    name:  "Bags",
    emoji: "👜",
    desc:  "Totes, handbags, pouches & sports bags",
    count: 5,
    images: [
      "images/fashionable-leather-bag-with-elegant-handle-modern-design-and-shiny-buckle-generated-by-ai-free-photo.jpg",
      "images/bf26a8894678f5f78599dc727d15ce6c.jpg",
      "images/5f60169ccf732a4a3e0fe190e1783c18.jpg"
    ]
  },
  {
    id:    "accessories",
    name:  "Accessories",
    emoji: "💍",
    desc:  "Watches, jewellery, pins & clips",
    count: 8,
    images: [
      "images/cda54c01257ae18109d146b81adb817d.jpg",
      "images/71nrOl9jhTL._AC_.jpg",
      "images/OIP (1).jpg"
    ]
  },
  {
    id:    "home",
    name:  "Home & Decor",
    emoji: "🏡",
    desc:  "Vases, paintings, bottles & more",
    count: 4,
    images: [
      "images/simple-minimal-elegant-scene-vase-flowers-deep-dark-background-home-staging-decor-concept-generative-ai-illustration-291774572.webp",
      "images/710Qt9wC6CL._SL1500_.jpg",
      "images/3781f2d29b188eb2d6a6a4c4b4deb5b5.jpg"
    ]
  }
];

// ─── RENDER CARDS ───
function renderCategories() {
  const container = document.getElementById("categories-container");
  if (!container) return;

  container.innerHTML = "";

  CATEGORIES.forEach((cat, idx) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.style.animationDelay = (idx * 80) + "ms";

    // Pick primary image; fallback chain handled by onerror
    const primaryImg  = cat.images[0];
    const fallbackImg = cat.images[1] || cat.images[0];

    card.innerHTML = `
      <img
        src="${primaryImg}"
        alt="${cat.name}"
        loading="lazy"
        onerror="handleImgError(this, ${JSON.stringify(cat.images)})"
      >
      <div class="cat-overlay"></div>
      <div class="cat-content">
        <div class="cat-top-row">
          <span class="cat-emoji">${cat.emoji}</span>
          <span class="cat-badge">${cat.count} items</span>
        </div>
        <h3 class="cat-name">${cat.name}</h3>
        <p class="cat-desc">${cat.desc}</p>
        <div class="cat-explore-btn">
          Explore <span class="arrow">→</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => goToCategory(cat.id));

    // Preload next image on hover for snappy feel
    card.addEventListener("mouseenter", () => {
      if (cat.images[1]) {
        const pre = new Image();
        pre.src = cat.images[1];
      }
    });

    container.appendChild(card);
  });
}

// ─── IMAGE ERROR FALLBACK ───
// Tries each image in the array in order until one loads
function handleImgError(imgEl, imageArray) {
  const currentSrc = imgEl.src;
  const usedIdx = imageArray.findIndex(src => currentSrc.endsWith(src.replace("images/", "")));
  const nextIdx = usedIdx + 1;

  if (nextIdx < imageArray.length) {
    imgEl.src = imageArray[nextIdx];
  } else {
    // Final fallback: solid beige placeholder
    imgEl.style.display = "none";
    const parent = imgEl.closest(".category-card");
    if (parent) parent.style.background = "linear-gradient(135deg, #c9956b, #5c3d2e)";
  }
}

// ─── NAVIGATE TO CATEGORY ───
function goToCategory(categoryId) {
  localStorage.setItem("selectedCategory", categoryId);
  window.location.href = "index.html";
}

// ─── SIDEBAR & NAV HELPERS ───
function updateSidebarBadge() {
  const cart  = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const el    = document.getElementById("sidebar-cart-count");
  if (el) { el.textContent = total > 0 ? total : ""; el.style.display = total > 0 ? "inline" : "none"; }
  const badge = document.getElementById("cart-count");
  if (badge) { badge.textContent = total; badge.classList.toggle("hidden", total === 0); }
  const wBadge = document.getElementById("wishlist-count");
  if (wBadge) {
    const wCount = (JSON.parse(localStorage.getItem("wishlist") || "[]")).length;
    wBadge.textContent = wCount;
    wBadge.classList.toggle("hidden", wCount === 0);
  }
}

function setActiveLink() {
  const cur = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#sidebar a").forEach(a =>
    a.classList.toggle("active", a.getAttribute("href") === cur)
  );
}

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("fade-out"); setTimeout(() => toast.remove(), 350); }, 2500);
}

// ─── SCROLL SHADOW ───
window.addEventListener("scroll", () => {
  document.getElementById("navbar")?.classList.toggle("scrolled", window.scrollY > 10);
});

// ─── REAL-TIME CART UPDATES ───
window.addEventListener("storage", (e) => {
  if (e.key === "cart" || e.key === "wishlist") updateSidebarBadge();
});

// ─── INIT ───
document.addEventListener("DOMContentLoaded", () => {
  setActiveLink();
  updateSidebarBadge();
  renderCategories();
});
