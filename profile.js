// profile.js — runs after script.js

// ─── PROFILE DATA ───
const PROFILE_KEY   = "userProfile";
const SETTINGS_KEY  = "userSettings";
const CORRECT_PASS  = "1234"; // matches login.js

const DEFAULT_PROFILE = {
  name:     "Hifza",
  username: "hifza",
  email:    "hifza@myshop.pk",
  phone:    "+92 300 0000000",
  address:  "Lahore, Punjab, Pakistan"
};

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || { ...DEFAULT_PROFILE };
  } catch { return { ...DEFAULT_PROFILE }; }
}

function saveProfileData(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { notifications: true, saveAddress: true };
  } catch { return { notifications: true, saveAddress: true }; }
}

// ─── INIT PROFILE DISPLAY ───
function initProfile() {
  const p = getProfile();

  // Avatar initials from name
  const initials = p.name
    ? p.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";
  const el = document.getElementById("avatar-circle");
  if (el) el.textContent = initials;

  const nameEl  = document.getElementById("profile-display-name");
  const emailEl = document.getElementById("profile-display-email");
  if (nameEl)  nameEl.textContent  = p.name  || "User";
  if (emailEl) emailEl.textContent = p.email || "";

  // Nav subtitle
  const navSub = document.getElementById("nav-subtitle");
  if (navSub) {
    const orders   = getStoredOrders();
    const wishlist = getStoredWishlist();
    navSub.textContent = "@" + (p.username || "user") +
      " · " + orders.length + " order" + (orders.length !== 1 ? "s" : "") +
      " · " + wishlist.length + " saved";
  }

  // Update VIEW CARDS
  setViewCard("view-name",     p.name);
  setViewCard("view-username", "@" + (p.username || "user"));
  setViewCard("view-email",    p.email);
  setViewCard("view-phone",    p.phone);
  setViewCard("view-address",  p.address);

  // Fill EDIT form fields
  setField("field-name",     p.name);
  setField("field-username", p.username);
  setField("field-email",    p.email);
  setField("field-phone",    p.phone);
  setField("field-address",  p.address);

  // Settings toggles
  const s = getSettings();
  const notifToggle   = document.getElementById("notif-toggle");
  const addressToggle = document.getElementById("address-toggle");
  if (notifToggle)   notifToggle.checked   = s.notifications !== false;
  if (addressToggle) addressToggle.checked = s.saveAddress   !== false;
}

function setField(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || "";
}

function setViewCard(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "—";
}

// ─── STORAGE HELPERS (safe reads) ───
function getStoredOrders() {
  try { return JSON.parse(localStorage.getItem("orders") || "[]"); } catch { return []; }
}

function getStoredWishlist() {
  try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); } catch { return []; }
}

function getStoredCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
}

// ─── TAB SWITCHING ───
function switchTab(btn, tabId) {
  document.querySelectorAll(".prof-nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".prof-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  const tab = document.getElementById("tab-" + tabId);
  if (tab) tab.classList.add("active");

  // Lazy-render tabs
  if (tabId === "stats")    renderStats();
  if (tabId === "wishlist") renderWishlist();
  if (tabId === "recent")   renderRecentOrders();
}

// ─── EDIT PROFILE ───
let editing = false;
let originalValues = {};

function toggleEdit() {
  editing = !editing;
  const iconEl  = document.getElementById("edit-btn-icon");
  const textEl  = document.getElementById("edit-btn-text");
  const btn     = document.getElementById("edit-btn");
  const viewEl  = document.getElementById("info-view");
  const formEl  = document.getElementById("info-form");

  if (editing) {
    // snapshot current field values for discard
    ["field-name","field-email","field-phone","field-address"].forEach(id => {
      const inp = document.getElementById(id);
      if (inp) originalValues[id] = inp.value;
    });

    // hide view, show form
    viewEl.style.display = "none";
    formEl.classList.add("visible");
    btn.classList.add("editing");
    if (iconEl) iconEl.textContent = "✕";
    if (textEl) textEl.textContent = "Cancel";

    // focus first editable field
    setTimeout(() => {
      const nameInp = document.getElementById("field-name");
      if (nameInp) { nameInp.focus(); nameInp.select(); }
    }, 50);

  } else {
    // show view, hide form
    viewEl.style.display = "";
    formEl.classList.remove("visible");
    btn.classList.remove("editing");
    if (iconEl) iconEl.textContent = "✏️";
    if (textEl) textEl.textContent = "Edit Profile";
  }
}

function discardEdit() {
  // Restore original values
  Object.entries(originalValues).forEach(([id, val]) => {
    const inp = document.getElementById(id);
    if (inp) inp.value = val;
  });
  editing = true;   // toggleEdit will flip it to false
  toggleEdit();
  showToast("↩️ Changes discarded");
}

function saveProfile() {
  const name    = document.getElementById("field-name").value.trim();
  const email   = document.getElementById("field-email").value.trim();
  const phone   = document.getElementById("field-phone").value.trim();
  const address = document.getElementById("field-address").value.trim();

  if (!name)  { shakeField("field-name");  showToast("⚠️ Name cannot be empty"); return; }
  if (!email) { shakeField("field-email"); showToast("⚠️ Email cannot be empty"); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { shakeField("field-email"); showToast("⚠️ Enter a valid email"); return; }

  const p = getProfile();
  p.name    = name;
  p.email   = email;
  p.phone   = phone;
  p.address = address;
  saveProfileData(p);

  // Update view cards immediately
  setViewCard("view-name",     name);
  setViewCard("view-username", "@" + (p.username || "user"));
  setViewCard("view-email",    email);
  setViewCard("view-phone",    phone || "—");
  setViewCard("view-address",  address || "—");

  // Update avatar initials
  const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const avatarEl = document.getElementById("avatar-circle");
  if (avatarEl) {
    avatarEl.textContent = initials;
    avatarEl.style.transform = "scale(1.15)";
    setTimeout(() => avatarEl.style.transform = "", 300);
  }

  // Update sidebar display
  const nameDisplayEl = document.getElementById("profile-display-name");
  if (nameDisplayEl) nameDisplayEl.textContent = name;
  const emailDisplayEl = document.getElementById("profile-display-email");
  if (emailDisplayEl) emailDisplayEl.textContent = email;

  // Nav subtitle
  const navSub = document.getElementById("nav-subtitle");
  if (navSub) navSub.textContent = "@" + (p.username || "user") + " · profile updated ✓";

  editing = true; // toggleEdit flips to false
  toggleEdit();
  showToast("✅ Profile saved!");
}

function shakeField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = "#d44a4a";
  el.style.animation = "shake 0.4s ease";
  setTimeout(() => { el.style.animation = ""; el.style.borderColor = ""; }, 500);
}

// ─── STATS TAB ───
function renderStats() {
  const orders   = getStoredOrders();
  const wishlist = getStoredWishlist();
  const cart     = getStoredCart();

  const totalOrders    = orders.length;
  const delivered      = orders.filter(o => o.status === "Delivered").length;
  const cancelled      = orders.filter(o => o.status === "Cancelled").length;
  const active         = orders.filter(o => o.status === "Processing" || o.status === "Shipped").length;
  const totalSpent     = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
  const totalItems     = orders.filter(o => o.status !== "Cancelled")
                               .reduce((s, o) => s + (o.items || []).reduce((si, i) => si + (i.qty || 1), 0), 0);
  const avgOrderValue  = totalOrders > 0 ? Math.round(totalSpent / Math.max(totalOrders - cancelled, 1)) : 0;

  const statsEl = document.getElementById("stats-grid");
  if (!statsEl) return;

  const stats = [
    { icon: "📦", value: totalOrders,                     label: "Total Orders" },
    { icon: "✅", value: delivered,                       label: "Delivered" },
    { icon: "🚀", value: active,                          label: "Active" },
    { icon: "❤️", value: wishlist.length,                  label: "Wishlisted" },
    { icon: "🛒", value: cart.reduce((s,i)=>s+(i.qty||1),0), label: "In Cart" },
    { icon: "💰", value: "Rs " + totalSpent.toLocaleString(), label: "Total Spent" },
    { icon: "📊", value: "Rs " + avgOrderValue.toLocaleString(), label: "Avg Order" },
    { icon: "🛍️", value: totalItems,                       label: "Items Bought" }
  ];

  statsEl.innerHTML = "";
  stats.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.style.animationDelay = (i * 50) + "ms";
    card.innerHTML = `
      <span class="stat-icon">${s.icon}</span>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    `;
    statsEl.appendChild(card);
  });

  // Spending by category
  const spendingEl = document.getElementById("spending-section");
  if (!spendingEl) return;

  const catSpend = {};
  orders.filter(o => o.status !== "Cancelled").forEach(o => {
    (o.items || []).forEach(item => {
      const cat = item.category || "other";
      catSpend[cat] = (catSpend[cat] || 0) + (item.price * (item.qty || 1));
    });
  });

  const catLabels = {
    shoe: "👟 Shoes", bag: "👜 Bags", watch: "⌚ Watches", dress: "👗 Fashion",
    mobile: "📱 Mobiles", laptop: "💻 Laptops", home: "🏡 Home", accessory: "💍 Accessories"
  };

  const sorted = Object.entries(catSpend).sort((a, b) => b[1] - a[1]);
  const maxSpend = sorted.length > 0 ? sorted[0][1] : 1;

  if (sorted.length === 0) {
    spendingEl.innerHTML = `<p class="spending-title">Spending by Category</p><p style="color:var(--text-muted);font-size:13px">Place some orders to see your spending breakdown!</p>`;
    return;
  }

  spendingEl.innerHTML = `<p class="spending-title">💳 Spending by Category</p>` +
    sorted.map(([cat, amount]) => `
      <div class="spending-row">
        <span class="spending-label">${catLabels[cat] || cat}</span>
        <div class="spending-bar-wrap">
          <div class="spending-bar-fill" style="width:${Math.round((amount/maxSpend)*100)}%"></div>
        </div>
        <span class="spending-amount">Rs ${amount.toLocaleString()}</span>
      </div>
    `).join("");
}

// ─── WISHLIST TAB ───
function renderWishlist() {
  const wishlist = getStoredWishlist();
  const grid     = document.getElementById("wishlist-grid");
  const empty    = document.getElementById("wishlist-empty");
  const count    = document.getElementById("wishlist-tab-count");
  if (!grid) return;

  if (count) count.textContent = wishlist.length + " item" + (wishlist.length !== 1 ? "s" : "");

  if (wishlist.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  grid.innerHTML = "";

  wishlist.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "wish-card";
    card.style.animationDelay = (idx * 50) + "ms";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" onerror="this.style.background='#f0e8df';this.src=''">
      <div class="wish-card-body">
        <p class="wish-card-name">${item.name}</p>
        <p class="wish-card-price">Rs ${item.price.toLocaleString()}</p>
        <div class="wish-card-actions">
          <button class="wish-btn-cart"   onclick="addToCartFromWishlist(${item.id})">Add to Cart</button>
          <button class="wish-btn-remove" onclick="removeFromWishlist(${item.id}, this)">🗑</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addToCartFromWishlist(productId) {
  if (typeof addToCart === "function") {
    addToCart(productId);
  } else {
    // fallback: manually add
    const real = typeof products !== "undefined" ? products.find(p => p.id === productId) : null;
    if (!real) return;
    const cart = getStoredCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) { existing.qty += 1; } else { cart.push({ ...real, qty: 1 }); }
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast("🛒 Added to cart!");
    updateBadges();
  }
}

function removeFromWishlist(productId, btn) {
  let list = getStoredWishlist().filter(i => i.id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(list));

  if (btn) {
    const card = btn.closest(".wish-card");
    if (card) {
      card.style.transition = "opacity 0.25s, transform 0.25s";
      card.style.opacity = "0";
      card.style.transform = "scale(0.9)";
      setTimeout(() => renderWishlist(), 250);
    }
  } else {
    renderWishlist();
  }

  if (typeof updateWishlistBadge === "function") updateWishlistBadge();
  showToast("💔 Removed from wishlist");
}

// ─── RECENT ORDERS TAB ───
function renderRecentOrders() {
  const orders  = getStoredOrders().slice(0, 5); // show last 5
  const listEl  = document.getElementById("recent-orders-list");
  const emptyEl = document.getElementById("recent-empty");
  if (!listEl) return;

  if (orders.length === 0) {
    listEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");
  listEl.innerHTML = "";

  const STATUS_EMOJI = { Processing:"⏳", Shipped:"🚚", Delivered:"✅", Cancelled:"❌" };

  orders.forEach((order, idx) => {
    const items    = order.items || [];
    const thumbs   = items.slice(0, 2).map(i =>
      `<img class="recent-thumb" src="${i.image}" alt="${i.name}" onerror="this.style.background='#f0e8df';this.src=''">`
    ).join("");

    const row = document.createElement("div");
    row.className = "recent-order-row";
    row.style.animationDelay = (idx * 55) + "ms";
    row.onclick = () => window.location.href = "order.html";
    row.innerHTML = `
      <div class="recent-order-imgs">${thumbs}</div>
      <div class="recent-order-info">
        <p class="recent-order-id">${order.id}</p>
        <p class="recent-order-date">${order.date} · ${items.length} item${items.length !== 1 ? "s" : ""}</p>
      </div>
      <div class="recent-order-right">
        <p class="recent-order-total">Rs ${(order.total || 0).toLocaleString()}</p>
        <span class="recent-status-badge badge-${order.status}">
          ${STATUS_EMOJI[order.status] || ""} ${order.status}
        </span>
      </div>
    `;
    listEl.appendChild(row);
  });
}

// ─── SETTINGS ───
function saveSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  showToast(value ? "✅ " + key + " enabled" : "🔕 " + key + " disabled");
}

function confirmClearData(type) {
  const messages = {
    cart:   { title: "Clear Cart?",          body: "All items in your cart will be removed.",            key: "cart",   toast: "🛒 Cart cleared" },
    orders: { title: "Clear Order History?", body: "All your past orders will be permanently deleted.",  key: "orders", toast: "📦 Order history cleared" }
  };
  const m = messages[type];
  if (!m) return;

  document.getElementById("confirm-icon").textContent  = "⚠️";
  document.getElementById("confirm-title").textContent = m.title;
  document.getElementById("confirm-body").textContent  = m.body;

  const okBtn = document.getElementById("confirm-ok-btn");
  okBtn.onclick = () => {
    localStorage.setItem(m.key, "[]");
    closeConfirmModal();
    showToast(m.toast);
    if (m.key === "cart") updateBadges();
    // Re-render stats if open
    const statsTab = document.getElementById("tab-stats");
    if (statsTab && statsTab.classList.contains("active")) renderStats();
  };

  document.getElementById("confirm-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
  document.getElementById("confirm-modal").classList.add("hidden");
  document.body.style.overflow = "";
}

// ─── CHANGE PASSWORD ───
function showChangePassword() {
  document.getElementById("pwd-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  // switch to settings tab if not already there
}

function closePwdModal() {
  document.getElementById("pwd-modal").classList.add("hidden");
  document.body.style.overflow = "";
  ["pwd-current","pwd-new","pwd-confirm"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const errEl = document.getElementById("pwd-error");
  if (errEl) errEl.classList.add("hidden");
}

function changePassword() {
  const current = document.getElementById("pwd-current").value;
  const next    = document.getElementById("pwd-new").value;
  const confirm = document.getElementById("pwd-confirm").value;
  const errEl   = document.getElementById("pwd-error");

  const showErr = (msg) => {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  };

  errEl.classList.add("hidden");

  if (!current)          { showErr("Enter your current password."); return; }
  if (current !== CORRECT_PASS) { showErr("Current password is incorrect."); return; }
  if (next.length < 4)   { showErr("New password must be at least 4 characters."); return; }
  if (next !== confirm)  { showErr("Passwords don't match."); return; }

  // In a real app this would hit an API. Here we just show success.
  closePwdModal();
  showToast("🔒 Password updated!");
}

// ─── BADGE UPDATES ───
function updateBadges() {
  const cart  = getStoredCart();
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const badge = document.getElementById("cart-count");
  if (badge) { badge.textContent = total; badge.classList.toggle("hidden", total === 0); }
  const sideBadge = document.getElementById("sidebar-cart-count");
  if (sideBadge) { sideBadge.textContent = total > 0 ? total : ""; sideBadge.style.display = total > 0 ? "inline" : "none"; }
  if (typeof updateCartBadge === "function") updateCartBadge();
}

// ─── REAL-TIME: react to changes from other tabs ───
window.addEventListener("storage", (e) => {
  if (e.key === "orders" || e.key === "wishlist" || e.key === "cart") {
    initProfile(); // refresh nav subtitle & counts

    const activeTab = document.querySelector(".prof-tab.active");
    if (activeTab) {
      const id = activeTab.id;
      if (id === "tab-stats")    renderStats();
      if (id === "tab-wishlist") renderWishlist();
      if (id === "tab-recent")   renderRecentOrders();
    }

    if (e.key === "cart") updateBadges();
  }
});

// ─── SIDEBAR ───
function setActiveLink() {
  const cur = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#sidebar a").forEach(a =>
    a.classList.toggle("active", a.getAttribute("href") === cur)
  );
}

window.addEventListener("scroll", () => {
  document.getElementById("navbar")?.classList.toggle("scrolled", window.scrollY > 10);
});

// Close modals on backdrop click
["pwd-modal","confirm-modal"].forEach(id => {
  document.getElementById(id)?.addEventListener("click", function(e) {
    if (e.target === this) {
      this.classList.add("hidden");
      document.body.style.overflow = "";
    }
  });
});

// ─── INIT ───
document.addEventListener("DOMContentLoaded", () => {
  setActiveLink();
  updateBadges();
  initProfile();

  // If navigated here from wishlist nav icon, open wishlist tab automatically
  const openTab = localStorage.getItem("openTab");
  if (openTab) {
    localStorage.removeItem("openTab");
    const btn = document.querySelector(`.prof-nav-btn[data-tab="${openTab}"]`);
    if (btn) { btn.click(); }
  }
});
