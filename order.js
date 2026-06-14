// order.js — real-time orders page

// ─── STATUS CONFIG ───
const STATUS_CONFIG = {
  Processing: { emoji: "⏳", label: "Processing", step: 1, color: "#e8a050" },
  Shipped:    { emoji: "🚚", label: "Shipped",    step: 2, color: "#3a86d4" },
  Delivered:  { emoji: "✅", label: "Delivered",  step: 3, color: "#3aaa6f" },
  Cancelled:  { emoji: "❌", label: "Cancelled",  step: 0, color: "#d44a4a" }
};

const TRACK_STEPS = [
  { key: "Placed",     emoji: "📋" },
  { key: "Processing", emoji: "⏳" },
  { key: "Shipped",    emoji: "🚚" },
  { key: "Delivered",  emoji: "✅" }
];

// Status auto-progression delays (ms after order placed)
// Real-time simulation: Processing → Shipped after 60s, Shipped → Delivered after 120s
const PROGRESSION_DELAYS = {
  Processing: 60 * 1000,   // 1 minute → Shipped
  Shipped:    120 * 1000   // 2 minutes → Delivered
};

let currentFilter = "all";
let progressionTimers = {};

// ─── STORAGE HELPERS ───
function getOrders() {
  try {
    return JSON.parse(localStorage.getItem("orders") || "[]");
  } catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// ─── REAL-TIME: listen for order changes from any page ───
window.addEventListener("storage", (e) => {
  if (e.key === "orders") {
    renderOrders();
    scheduleAllProgressions();
  }
  if (e.key === "cart") {
    updateSidebarBadge();
    if (typeof updateCartBadge === "function") updateCartBadge();
  }
});

// ─── STATUS PROGRESSION ENGINE ───
// Automatically advances order status to simulate real order flow
function scheduleAllProgressions() {
  // Clear existing timers
  Object.values(progressionTimers).forEach(t => clearTimeout(t));
  progressionTimers = {};

  const orders = getOrders();
  const now    = Date.now();

  orders.forEach(order => {
    if (order.status === "Cancelled" || order.status === "Delivered") return;

    // orderId from "ORD-<timestamp>" → extract the timestamp
    const placedAt = order.placedAt || parseInt(order.id.replace("ORD-", "")) || now;
    const age      = now - placedAt;

    if (order.status === "Processing") {
      const delay = PROGRESSION_DELAYS.Processing - age;
      if (delay <= 0) {
        // Already past threshold — advance immediately
        advanceStatus(order.id, "Shipped");
      } else {
        progressionTimers[order.id + "_ship"] = setTimeout(() => {
          advanceStatus(order.id, "Shipped");
        }, delay);
      }
    }

    if (order.status === "Shipped") {
      const delay = PROGRESSION_DELAYS.Shipped - age;
      if (delay <= 0) {
        advanceStatus(order.id, "Delivered");
      } else {
        progressionTimers[order.id + "_deliver"] = setTimeout(() => {
          advanceStatus(order.id, "Delivered");
        }, delay);
      }
    }
  });
}

function advanceStatus(orderId, newStatus) {
  const orders = getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order || order.status === "Cancelled") return;

  // Only advance forward, never back
  const statusRank = { Processing: 1, Shipped: 2, Delivered: 3, Cancelled: 0 };
  if (statusRank[newStatus] <= statusRank[order.status]) return;

  order.status = newStatus;
  saveOrders(orders);
  renderOrders();

  // Chain: if just became Shipped, schedule Delivered
  if (newStatus === "Shipped") {
    progressionTimers[orderId + "_deliver"] = setTimeout(() => {
      advanceStatus(orderId, "Delivered");
    }, PROGRESSION_DELAYS.Shipped);
  }

  // Toast notification
  const cfg = STATUS_CONFIG[newStatus];
  if (typeof showToast === "function") {
    showToast(cfg.emoji + " Order " + orderId + " is now " + cfg.label + "!");
  }
}

// ─── RENDER ───
function renderOrders() {
  const orders   = getOrders();
  const list     = document.getElementById("orders-list");
  const empty    = document.getElementById("empty-orders");
  const emptyMsg = document.getElementById("empty-orders-msg");
  const countEl  = document.getElementById("orders-count");
  const navSub   = document.getElementById("nav-subtitle");
  if (!list) return;

  // Separate real vs demo for subtitle
  const realOrders = orders.filter(o => !o.isDemo);
  const active = orders.filter(o => o.status === "Processing" || o.status === "Shipped");
  const delivered = orders.filter(o => o.status === "Delivered");

  if (navSub) {
    if (orders.length === 0) {
      navSub.textContent = "No orders yet";
    } else {
      let parts = [orders.length + " order" + (orders.length !== 1 ? "s" : "")];
      if (active.length > 0) parts.push(active.length + " active");
      if (delivered.length > 0) parts.push(delivered.length + " delivered");
      navSub.textContent = parts.join(" · ");
    }
  }

  // Apply filter
  const filtered = currentFilter === "all"
    ? orders
    : orders.filter(o => o.status === currentFilter);

  // Update tab counts
  document.querySelectorAll(".tab-btn").forEach(btn => {
    const f = btn.dataset.filter;
    const count = f === "all" ? orders.length : orders.filter(o => o.status === f).length;
    btn.textContent = (f === "all" ? "All" : f) + (count > 0 ? " (" + count + ")" : "");
  });

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.style.display = "none";
    empty.classList.remove("hidden");
    if (emptyMsg) {
      emptyMsg.textContent = currentFilter === "all"
        ? "You haven't placed any orders yet. Start shopping!"
        : "No " + currentFilter.toLowerCase() + " orders found.";
    }
    const emptyBtn = empty.querySelector("button");
    if (emptyBtn) emptyBtn.style.display = currentFilter === "all" ? "" : "none";
    if (countEl) countEl.textContent = "";
    return;
  }

  list.style.display = "flex";
  empty.classList.add("hidden");
  if (countEl) {
    countEl.textContent = filtered.length === orders.length
      ? filtered.length + " order" + (filtered.length !== 1 ? "s" : "")
      : filtered.length + " of " + orders.length + " orders";
  }

  filtered.forEach((order, idx) => {
    const card = buildOrderCard(order);
    card.style.animationDelay = (idx * 55) + "ms";
    list.appendChild(card);
  });
}

// ─── BUILD ORDER CARD ───
function buildOrderCard(order) {
  const cfg    = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;
  const items  = order.items || [];
  const preview = items.slice(0, 4);
  const extra   = items.length - preview.length;
  const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0);
  const firstName = items[0]
    ? items[0].name.split(" ").slice(0, 4).join(" ")
    : "Items";

  const card = document.createElement("div");
  card.className = "order-card";
  card.dataset.status = order.status;
  card.dataset.id     = order.id;

  const imgHTML = preview.map(item =>
    `<img class="preview-img" src="${item.image}" alt="${item.name}"
          onerror="this.style.background='#f0e8df';this.src=''">`
  ).join("") + (extra > 0 ? `<div class="preview-more">+${extra}</div>` : "");

  // Time ago label
  const placedAt = parseInt(order.id.replace("ORD-", "")) || 0;
  const timeLabel = placedAt ? getTimeAgo(placedAt) : "";

  // Progress bar (not for Cancelled)
  const trackHTML = order.status !== "Cancelled" ? buildTrackBar(order.status, order.id) : "";

  // Action buttons per status
  let actionHTML = "";
  if (order.status === "Processing") {
    actionHTML = `
      <button class="btn-track"  onclick="openModal('${order.id}')">View Details</button>
      <button class="btn-cancel" onclick="promptCancel('${order.id}')">Cancel</button>`;
  } else if (order.status === "Shipped") {
    actionHTML = `
      <button class="btn-track" onclick="openModal('${order.id}')">Track Order 🚚</button>`;
  } else if (order.status === "Delivered") {
    actionHTML = `
      <button class="btn-track"   onclick="openModal('${order.id}')">View Details</button>
      <button class="btn-reorder" onclick="reorder('${order.id}')">Reorder 🔄</button>`;
  } else {
    actionHTML = `
      <button class="btn-track"   onclick="openModal('${order.id}')">View Details</button>
      <button class="btn-reorder" onclick="reorder('${order.id}')">Reorder 🔄</button>`;
  }

  card.innerHTML = `
    <div class="order-card-top">
      <div class="order-meta">
        <span class="order-id">${order.id}</span>
        <span class="order-date">
          ${order.date}${timeLabel ? " &nbsp;·&nbsp; " + timeLabel : ""}
        </span>
      </div>
      <div class="order-right">
        <span class="status-badge badge-${order.status}">${cfg.emoji} ${cfg.label}</span>
      </div>
    </div>

    <div class="order-items-preview">
      ${imgHTML}
      <div class="order-item-summary">
        <strong>${firstName}${items.length > 1 ? " & " + (items.length - 1) + " more" : ""}</strong><br>
        ${totalQty} item${totalQty !== 1 ? "s" : ""}
      </div>
    </div>

    ${trackHTML}

    <div class="order-card-footer">
      <div class="order-total">
        Rs ${(order.total || 0).toLocaleString()}
        <span>${order.discount > 0 ? "(incl. discount)" : "total"}</span>
      </div>
      <div class="order-actions">${actionHTML}</div>
    </div>
  `;

  return card;
}

// ─── TRACK BAR ───
function buildTrackBar(status, orderId) {
  const stepIndex = TRACK_STEPS.findIndex(s => s.key === status);
  const pct = stepIndex <= 0 ? 0
    : Math.round((stepIndex / (TRACK_STEPS.length - 1)) * 100);

  // Real-time countdown for active orders
  const allOrders = getOrders();
  const thisOrder = allOrders.find(o => o.id === orderId);
  const placedAt  = (thisOrder && thisOrder.placedAt) || parseInt((orderId || "").replace("ORD-", "")) || 0;
  let countdownHTML = "";
  if (placedAt && status === "Processing") {
    const remaining = Math.max(0, Math.ceil((placedAt + PROGRESSION_DELAYS.Processing - Date.now()) / 1000));
    if (remaining > 0) {
      countdownHTML = `<p class="track-eta" id="eta-${orderId}">🚚 Ships in ~${formatCountdown(remaining)}</p>`;
    }
  } else if (placedAt && status === "Shipped") {
    const remaining = Math.max(0, Math.ceil((placedAt + PROGRESSION_DELAYS.Shipped - Date.now()) / 1000));
    if (remaining > 0) {
      countdownHTML = `<p class="track-eta" id="eta-${orderId}">✅ Delivers in ~${formatCountdown(remaining)}</p>`;
    }
  }

  const steps = TRACK_STEPS.map((step, i) => {
    const isDone   = i < stepIndex;
    const isActive = i === stepIndex;
    const cls = isDone ? "done" : isActive ? "active" : "";
    return `
      <div class="track-step">
        <div class="step-dot ${cls}">${isDone ? "✓" : step.emoji}</div>
        <span class="step-label ${cls}">${step.key}</span>
      </div>`;
  }).join("");

  return `
    <div class="track-bar">
      <div class="track-steps">
        <div class="track-line">
          <div class="track-line-fill" style="width:${pct}%"></div>
        </div>
        ${steps}
      </div>
      ${countdownHTML}
    </div>`;
}

// ─── COUNTDOWN HELPERS ───
function formatCountdown(seconds) {
  if (seconds >= 60) return Math.ceil(seconds / 60) + " min";
  return seconds + "s";
}

function getTimeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return mins + "m ago";
  if (hrs  < 24)  return hrs  + "h ago";
  return days + "d ago";
}

// Live countdown ticker — updates every second for active orders
function startLiveTicker() {
  setInterval(() => {
    const orders = getOrders();
    orders.forEach(order => {
      if (order.status !== "Processing" && order.status !== "Shipped") return;
      const placedAt = parseInt(order.id.replace("ORD-", "")) || 0;
      if (!placedAt) return;

      const etaEl = document.getElementById("eta-" + order.id);
      if (!etaEl) return;

      if (order.status === "Processing") {
        const rem = Math.max(0, Math.ceil((placedAt + PROGRESSION_DELAYS.Processing - Date.now()) / 1000));
        etaEl.textContent = rem > 0 ? "🚚 Ships in ~" + formatCountdown(rem) : "🚚 Shipping soon...";
      } else if (order.status === "Shipped") {
        const rem = Math.max(0, Math.ceil((placedAt + PROGRESSION_DELAYS.Shipped - Date.now()) / 1000));
        etaEl.textContent = rem > 0 ? "✅ Delivers in ~" + formatCountdown(rem) : "✅ Arriving soon...";
      }
    });
  }, 1000);
}

// ─── FILTER ───
function filterOrders(btn, filter) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = filter;
  renderOrders();
}

// ─── DETAIL MODAL ───
function openModal(orderId) {
  const order = getOrders().find(o => o.id === orderId);
  if (!order) return;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;

  document.getElementById("modal-order-id").textContent   = order.id;
  document.getElementById("modal-order-date").textContent =
    "Placed on " + order.date + "  ·  " + cfg.emoji + " " + cfg.label;
  document.getElementById("modal-subtotal").textContent   = "Rs " + (order.subtotal || 0).toLocaleString();
  document.getElementById("modal-total").textContent      = "Rs " + (order.total || 0).toLocaleString();

  const discRow = document.getElementById("modal-discount-row");
  const discEl  = document.getElementById("modal-discount");
  if (order.discount > 0) {
    discRow.style.display = "flex";
    discEl.textContent    = "– Rs " + order.discount.toLocaleString();
  } else {
    discRow.style.display = "none";
  }

  const itemsEl = document.getElementById("modal-items-list");
  itemsEl.innerHTML = (order.items || []).map(item => `
    <div class="modal-item">
      <img class="modal-item-img" src="${item.image}" alt="${item.name}"
           onerror="this.style.background='#f0e8df';this.src=''">
      <div class="modal-item-info">
        <p class="modal-item-name">${item.name}</p>
        <p class="modal-item-meta">Qty: ${item.qty || 1} &nbsp;·&nbsp; Rs ${item.price.toLocaleString()} each</p>
      </div>
      <span class="modal-item-price">Rs ${(item.price * (item.qty || 1)).toLocaleString()}</span>
    </div>
  `).join("");

  const actionsEl = document.getElementById("modal-actions");
  if (order.status === "Processing") {
    actionsEl.innerHTML = `
      <button style="flex:1;background:var(--bg-color);color:var(--text-muted);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;font-size:13.5px;font-weight:600;cursor:pointer;" onclick="closeModal()">Close</button>
      <button style="flex:1;background:#d44a4a;color:white;border:none;border-radius:var(--radius-sm);padding:11px;font-size:13.5px;font-weight:600;cursor:pointer;" onclick="closeModal();promptCancel('${order.id}')">Cancel Order</button>`;
  } else if (order.status === "Delivered" || order.status === "Cancelled") {
    actionsEl.innerHTML = `
      <button style="flex:1;background:var(--bg-color);color:var(--text-muted);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;font-size:13.5px;font-weight:600;cursor:pointer;" onclick="closeModal()">Close</button>
      <button style="flex:1;background:var(--primary);color:white;border:none;border-radius:var(--radius-sm);padding:11px;font-size:13.5px;font-weight:600;cursor:pointer;" onclick="closeModal();reorder('${order.id}')">Reorder 🔄</button>`;
  } else {
    actionsEl.innerHTML = `
      <button style="flex:1;background:var(--primary);color:white;border:none;border-radius:var(--radius-sm);padding:11px;font-size:13.5px;font-weight:600;cursor:pointer;" onclick="closeModal()">Got it</button>`;
  }

  document.getElementById("order-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("order-modal").classList.add("hidden");
  document.body.style.overflow = "";
}

document.addEventListener("click", e => {
  if (e.target === document.getElementById("order-modal")) closeModal();
});

// ─── CANCEL ───
function promptCancel(orderId) {
  const order = getOrders().find(o => o.id === orderId);
  if (!order) return;
  if (order.status === "Shipped" || order.status === "Delivered") {
    showToast("⚠️ Cannot cancel — order already " + order.status.toLowerCase());
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.innerHTML = `
    <div class="confirm-box">
      <div class="confirm-icon">🚫</div>
      <h3>Cancel this order?</h3>
      <p>
        <strong>${order.id}</strong><br>
        Rs ${(order.total || 0).toLocaleString()} · ${(order.items||[]).reduce((s,i)=>s+(i.qty||1),0)} item(s)<br>
        <span style="font-size:12px;color:#b76e00">⚠ This cannot be undone.</span>
      </p>
      <div class="confirm-btns">
        <button class="btn-no" id="cancel-no">Keep Order</button>
        <button class="btn-yes-cancel" id="cancel-yes">Yes, Cancel</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.getElementById("cancel-no").onclick  = () => overlay.remove();
  document.getElementById("cancel-yes").onclick = () => { overlay.remove(); cancelOrder(orderId); };
}

function cancelOrder(orderId) {
  const orders = getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;
  if (order.status === "Shipped" || order.status === "Delivered") {
    showToast("⚠️ Cannot cancel — already " + order.status.toLowerCase()); return;
  }

  // Kill any pending progression timers for this order
  clearTimeout(progressionTimers[orderId + "_ship"]);
  clearTimeout(progressionTimers[orderId + "_deliver"]);
  delete progressionTimers[orderId + "_ship"];
  delete progressionTimers[orderId + "_deliver"];

  order.status = "Cancelled";
  saveOrders(orders);
  renderOrders();
  showToast("🚫 Order " + orderId + " cancelled");
}

// ─── REORDER ───
function reorder(orderId) {
  const order = getOrders().find(o => o.id === orderId);
  if (!order) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let added = 0;

  (order.items || []).forEach(item => {
    // Cross-check against real products
    const real = typeof products !== "undefined"
      ? products.find(p => p.id === item.id) : null;
    const src = real || item;
    if (!src || !src.price) return;

    const existing = cart.find(c => c.id === src.id);
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      cart.push({
        id: src.id, name: src.name, price: src.price,
        image: src.image, category: src.category, qty: item.qty || 1
      });
    }
    added++;
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  if (typeof updateCartBadge === "function") updateCartBadge();

  showToast("🛒 " + added + " item" + (added !== 1 ? "s" : "") + " added to cart!");
  setTimeout(() => window.location.href = "cart.html", 1600);
}

// ─── SIDEBAR & NAV HELPERS ───
function updateSidebarBadge() {
  const cart  = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const el = document.getElementById("sidebar-cart-count");
  if (el) { el.textContent = total > 0 ? total : ""; el.style.display = total > 0 ? "inline" : "none"; }
  const badge = document.getElementById("cart-count");
  if (badge) { badge.textContent = total; badge.classList.toggle("hidden", total === 0); }
}

function setActiveLink() {
  const cur = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#sidebar a").forEach(a =>
    a.classList.toggle("active", a.getAttribute("href") === cur)
  );
}

window.addEventListener("scroll", () => {
  document.getElementById("navbar")?.classList.toggle("scrolled", window.scrollY > 10);
});

// ─── INIT ───
document.addEventListener("DOMContentLoaded", () => {
  setActiveLink();
  updateSidebarBadge();
  if (typeof updateCartBadge === "function") updateCartBadge();

  renderOrders();
  scheduleAllProgressions();
  startLiveTicker();
});
