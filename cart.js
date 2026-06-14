// cart.js — runs after script.js

let promoApplied = false;
const PROMO_CODE    = "SAVE10";
const DISCOUNT_RATE = 0.10;

// ─── SAFE CART READ (fixes old data without qty field) ───
function getCartSafe() {
  const raw = JSON.parse(localStorage.getItem("cart") || "[]");
  const clean = [];
  let changed = false;

  raw.forEach(item => {
    // Cross-check against the real products array (defined in script.js)
    const real = typeof products !== "undefined"
      ? products.find(p => p.id === item.id)
      : null;

    // Reject anything that has no real product match or has price 0/missing
    if (!real || typeof real.price !== "number" || real.price <= 0) {
      changed = true;
      return;
    }

    clean.push({
      id:       real.id,
      name:     real.name,
      price:    real.price,
      image:    real.image,
      category: real.category,
      qty: typeof item.qty === "number" && item.qty > 0 ? item.qty : 1
    });
  });

  // Persist cleaned data immediately so stale entries are gone for good
  if (changed) {
    localStorage.setItem("cart", JSON.stringify(clean));
  }

  return clean;
}

// ─── RENDER CART ───
function renderCart() {
  const cart    = getCartSafe();
  const layout  = document.getElementById("cart-layout");
  const emptyEl = document.getElementById("empty-cart");
  const listEl  = document.getElementById("cart-items-list");
  if (!listEl) return;

  if (cart.length === 0) {
    if (layout)  layout.style.display = "none";
    if (emptyEl) emptyEl.classList.remove("hidden");
    updateSummary(cart);
    return;
  }

  if (layout)  layout.style.display = "";
  if (emptyEl) emptyEl.classList.add("hidden");

  listEl.innerHTML = "";

  cart.forEach(item => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.id = "cart-item-" + item.id;
    el.innerHTML = `
      <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">
          Rs ${(item.price * item.qty).toLocaleString()}
          <span class="cart-item-unit">Rs ${item.price.toLocaleString()} each</span>
        </p>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num" id="qty-${item.id}">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove">✕</button>
    `;
    listEl.appendChild(el);
  });

  updateSummary(cart);
  updateCartBadge();
}

// ─── CHANGE QTY ───
function changeQty(id, delta) {
  const cart = getCartSafe();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(id);
    return;
  }

  saveCart(cart);

  const qtyEl = document.getElementById("qty-" + id);
  if (qtyEl) qtyEl.textContent = item.qty;

  const card = document.getElementById("cart-item-" + id);
  if (card) {
    const priceEl = card.querySelector(".cart-item-price");
    if (priceEl) priceEl.innerHTML = `
      Rs ${(item.price * item.qty).toLocaleString()}
      <span class="cart-item-unit">Rs ${item.price.toLocaleString()} each</span>
    `;
  }

  updateSummary(cart);
  updateCartBadge();
}

// ─── REMOVE ITEM ───
function removeItem(id) {
  const el = document.getElementById("cart-item-" + id);
  if (el) {
    el.classList.add("removing");
    setTimeout(() => {
      const cart = getCartSafe().filter(i => i.id !== id);
      saveCart(cart);
      renderCart();
      updateCartBadge();
      showToast("🗑️ Item removed");
    }, 290);
  } else {
    saveCart(getCartSafe().filter(i => i.id !== id));
    renderCart();
  }
}

// ─── CLEAR CART ───
function confirmClearCart() {
  showModal({
    icon: "🗑️",
    title: "Clear your cart?",
    body: "This will remove all items. You can always add them back from the shop.",
    cancelText: "Cancel",
    confirmText: "Yes, clear it",
    onConfirm: clearAllItems
  });
}

function clearAllItems() {
  saveCart([]);
  promoApplied = false;
  renderCart();
  updateCartBadge();
  showToast("🛒 Cart cleared");
}

// ─── PROMO CODE ───
function applyPromo() {
  const input = document.getElementById("promo-input");
  const msg   = document.getElementById("promo-msg");
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();

  if (promoApplied) {
    msg.textContent = "✓ Promo already applied!";
    msg.className = "promo-msg success";
    return;
  }

  if (code === PROMO_CODE) {
    promoApplied = true;
    msg.textContent = "✓ 10% discount applied!";
    msg.className = "promo-msg success";
    input.disabled = true;
    updateSummary(getCartSafe());
    showToast("🎉 10% off applied!");
  } else {
    msg.textContent = "✗ Invalid code — try SAVE10";
    msg.className = "promo-msg error";
  }
}

// ─── SUMMARY (always pass cart to avoid double-read) ───
function updateSummary(cart) {
  if (!cart) cart = getCartSafe();

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total    = subtotal - discount;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("summary-count",    totalQty);
  set("summary-subtotal", "Rs " + subtotal.toLocaleString());
  set("summary-total",    "Rs " + total.toLocaleString());

  const discRow = document.getElementById("discount-row");
  const discEl  = document.getElementById("summary-discount");
  if (discRow) discRow.style.display = promoApplied ? "flex" : "none";
  if (discEl)  discEl.textContent = "– Rs " + discount.toLocaleString();

  const deliveryEl = document.getElementById("summary-delivery");
  if (deliveryEl) {
    deliveryEl.textContent = subtotal > 0 ? "Free" : "—";
    deliveryEl.className   = subtotal > 0 ? "free-tag" : "";
  }

  // live subtitle in navbar
  const navSub = document.getElementById("nav-subtitle");
  if (navSub) {
    if (totalQty === 0) {
      navSub.textContent = "Your cart is empty";
    } else {
      navSub.textContent = totalQty + " item" + (totalQty > 1 ? "s" : "") + " · Rs " + subtotal.toLocaleString();
    }
  }
}

// ─── MODAL HELPER ───
function showModal({ icon, title, body, cancelText, confirmText, onConfirm }) {
  document.querySelector(".checkout-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "checkout-overlay";
  overlay.innerHTML = `
    <div class="checkout-modal">
      <div class="modal-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${body}</p>
      <div class="modal-btns">
        <button class="modal-cancel" id="modal-cancel-btn">${cancelText}</button>
        <button class="modal-confirm" id="modal-confirm-btn">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("modal-cancel-btn").onclick  = () => overlay.remove();
  document.getElementById("modal-confirm-btn").onclick = () => { overlay.remove(); onConfirm(); };
}

// ─── CHECKOUT ───
function checkout() {
  const cart = getCartSafe();
  if (cart.length === 0) { showToast("🛒 Your cart is empty!"); return; }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const finalTotal = subtotal - discount;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  showModal({
    icon: "🎉",
    title: "Confirm your order?",
    body: `${cart.length} item type${cart.length > 1 ? "s" : ""} · ${totalQty} piece${totalQty > 1 ? "s" : ""}
           <br><strong style="color:var(--primary);font-size:17px">Total: Rs ${finalTotal.toLocaleString()}</strong>
           ${promoApplied ? "<br><small style='color:#2e7d32'>✓ SAVE10 applied</small>" : ""}`,
    cancelText:  "Cancel",
    confirmText: "Place Order ✓",
    onConfirm:   placeOrder
  });
}

function placeOrder() {
  const cart     = getCartSafe();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * DISCOUNT_RATE) : 0;

  const now    = Date.now();
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.unshift({
    id:       "ORD-" + now,
    date:     new Date(now).toLocaleDateString("en-PK", { day:"numeric", month:"short", year:"numeric" }),
    placedAt: now,
    items:    cart,
    subtotal, discount,
    total:    subtotal - discount,
    status:   "Processing"
  });
  localStorage.setItem("orders", JSON.stringify(orders));

  saveCart([]);
  promoApplied = false;
  updateCartBadge();
  renderCart();
  showToast("✅ Order placed!");
  setTimeout(() => window.location.href = "order.html", 1800);
}

// ─── SIDEBAR BADGE ───
function updateSidebarBadge() {
  const total = getCartSafe().reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById("sidebar-cart-count");
  if (el) { el.textContent = total > 0 ? total : ""; el.style.display = total > 0 ? "inline" : "none"; }
}

// ─── SCROLL SHADOW ───
window.addEventListener("scroll", () => {
  document.getElementById("navbar")?.classList.toggle("scrolled", window.scrollY > 10);
});

// ─── SIDEBAR ACTIVE ───
function setActiveLink() {
  const cur = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#sidebar a").forEach(a =>
    a.classList.toggle("active", a.getAttribute("href") === cur)
  );
}

// ─── INIT ───
document.addEventListener("DOMContentLoaded", () => {
  setActiveLink();
  updateCartBadge();
  updateSidebarBadge();
  renderCart();
});
