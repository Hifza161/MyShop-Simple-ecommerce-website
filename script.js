// ─── AUTH GUARD ───
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

// ─── PRODUCTS DATA ───
const products = [
  { id: 1,  name: "Best casual wear Stylish shoes",                    price: 3500,  image: "images/shoes-pictures-0eil7v0z0t9p35zt.jpg",   category: "shoe" },
  { id: 2,  name: "New Style Premium watches",                          price: 8000,  image: "images/cda54c01257ae18109d146b81adb817d.jpg",    category: "watch" },
  { id: 3,  name: "Aesthetic bag old money for girls",                  price: 6800,  image: "images/bf26a8894678f5f78599dc727d15ce6c.jpg",    category: "bag" },
  { id: 4,  name: "Stylish Tote Bags",                                  price: 1000,  image: "images/5f60169ccf732a4a3e0fe190e1783c18.jpg",    category: "bag" },
  { id: 5,  name: "Latest new hp laptop",                               price: 110000,image: "images/OIP (9).jpg",                            category: "laptop" },
  { id: 6,  name: "Best Quality Stylish Watch",                         price: 5000,  image: "images/OIP.jpg",                                category: "watch" },
  { id: 7,  name: "Premium Leather Shoes",                              price: 2000,  image: "images/pexels-webdonut-19090.jpg",               category: "shoe" },
  { id: 8,  name: "Beautiful Flower Vase for home decorations",         price: 1300,  image: "images/simple-minimal-elegant-scene-vase-flowers-deep-dark-background-home-staging-decor-concept-generative-ai-illustration-291774572.webp", category: "home" },
  { id: 9,  name: "Cartoon bear cute phone case",                       price: 870,   image: "images/OIP (7).jpg",                            category: "mobile" },
  { id: 10, name: "Pearl Hair clips for girls",                         price: 900,   image: "images/OIP (4).jpg",                            category: "accessory" },
  { id: 11, name: "Girls premium jewelry",                              price: 1500,  image: "images/OIP (1).jpg",                            category: "accessory" },
  { id: 12, name: "Premium quality black watch",                        price: 5900,  image: "images/eLSIyWmImWZvzIEb863a6fz738fsscwG7cTTV8wE.jpg", category: "watch" },
  { id: 13, name: "Stylish Large HandBags for more stuff",              price: 1500,  image: "images/fashionable-leather-bag-with-elegant-handle-modern-design-and-shiny-buckle-generated-by-ai-free-photo.jpg", category: "bag" },
  { id: 14, name: "Samsung Galaxy S23 latest model mobile",             price: 81500, image: "images/yFVTwgKyQ3uuEf4DRx6imK.jpg",             category: "mobile" },
  { id: 15, name: "Lilac Purple cute collar cap for girls",             price: 7500,  image: "images/492110f8ee40969b197982dd3da58578.jpg",    category: "dress" },
  { id: 16, name: "Gray with gold leaf & chain Lapel pin for men",      price: 800,   image: "images/OIP (5).jpg",                            category: "accessory" },
  { id: 17, name: "Simple designs unique rings",                        price: 7500,  image: "images/OIP (6).jpg",                            category: "accessory" },
  { id: 18, name: "Aesthetic style trendy water bottles",               price: 1470,  image: "images/3781f2d29b188eb2d6a6a4c4b4deb5b5.jpg",   category: "home" },
  { id: 19, name: "Cute yellow best fabric pouch",                      price: 1100,  image: "images/recycling-unused-fabric-usable-items-297581119.webp", category: "bag" },
  { id: 20, name: "Matching wireless keyboard and mouse set",           price: 3100,  image: "images/71eevLdvPaL._AC_SL1500_.jpg",            category: "laptop" },
  { id: 21, name: "Cute little girl 3pc dress",                         price: 5000,  image: "images/F3PELXWV311M_STD_5.webp",                category: "dress" },
  { id: 22, name: "New Trending Abaya with matching hijab",             price: 6500,  image: "images/Had7c2358222f491f9485beb1731e1a1ed_800x.webp", category: "dress" },
  { id: 23, name: "Black sports bag best for sports and travelling",    price: 2000,  image: "images/80c7c7f607af.jpg",                       category: "bag" },
  { id: 24, name: "Classic Home decoration wall paintings set",         price: 4500,  image: "images/710Qt9wC6CL._SL1500_.jpg",               category: "home" },
  { id: 25, name: "Quick Charging Data Cable C-type",                   price: 500,   image: "images/cenoda-65w-4-2a-quick-charging-data-transmit-cable-1000x1000.webp", category: "mobile" },
  { id: 26, name: "Shaker bottle best for protein shaking at gym",      price: 1100,  image: "images/61R+dl-1hEL.jpg",                        category: "home" },
  { id: 27, name: "Best Smart watch 2 in 1",                            price: 12100, image: "images/71nrOl9jhTL._AC_.jpg",                   category: "watch" },
  { id: 28, name: "Modern Kitchen Wall Art Prints",                     price: 1800, image: "images/kitchen art.png",                         category: "home" },
];

// ─── STATE ───
let activeCategory = "all";
let searchQuery    = "";
let sortOrder      = "default";

// ─── CART ───
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
  // Always look up from products array - never trust external input
  const product = products.find(p => p.id === productId);
  if (!product || !product.price || product.price <= 0) return;

  const cart = getCart();
  const existing = cart.find(i => i.id === productId);

  if (existing) {
    existing.qty += 1;
    showToast("🛒 Added another " + product.name.split(" ").slice(0, 3).join(" "));
  } else {
    // Store only canonical fields - never store category chip names or bad data
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      image:    product.image,
      category: product.category,
      qty:      1
    });
    showToast("🛒 Added to cart!");
  }

  saveCart(cart);
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById("cart-count");
  const sideBadge = document.getElementById("sidebar-cart-count");

  if (badge) {
    badge.textContent = total;
    badge.classList.toggle("hidden", total === 0);
    if (total > 0) {
      badge.classList.add("pop");
      setTimeout(() => badge.classList.remove("pop"), 300);
    }
  }

  if (sideBadge) {
    sideBadge.textContent = total > 0 ? total : "";
    sideBadge.style.display = total > 0 ? "inline" : "none";
  }
}

// ─── WISHLIST ───
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist") || "[]");
}

function saveWishlist(list) {
  localStorage.setItem("wishlist", JSON.stringify(list));
}

function toggleWishlist(productId, btn) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  let list = getWishlist();
  const idx = list.findIndex(i => i.id === productId);

  if (idx > -1) {
    list.splice(idx, 1);
    btn.textContent = "🤍";
    showToast("💔 Removed from wishlist");
  } else {
    list.push(product);
    btn.textContent = "❤️";
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), 350);
    showToast("❤️ Saved to wishlist!");
  }

  saveWishlist(list);
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const count = getWishlist().length;
  const badge = document.getElementById("wishlist-count");
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle("hidden", count === 0);
  }
}

// ─── TOAST ───
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 350);
  }, 2500);
}

// ─── DISPLAY PRODUCTS ───
function displayProducts(list) {
  const container = document.getElementById("product-container");
  const emptyState = document.getElementById("empty-state");
  const countEl = document.getElementById("results-count");
  if (!container) return;

  container.innerHTML = "";

  if (list.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    if (countEl) countEl.textContent = "No products found";
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  const label = list.length === products.length
    ? "Showing all " + products.length + " products"
    : "Showing " + list.length + " of " + products.length + " products";

  if (countEl) countEl.textContent = label;

  const wishlist = getWishlist();

  list.forEach(product => {
    const isWished = wishlist.some(w => w.id === product.id);
    const card = document.createElement("div");
    card.classList.add("product");

    card.innerHTML = `
      <button class="wish-btn" onclick="toggleWishlist(${product.id}, this)" title="Save to wishlist">
        ${isWished ? "❤️" : "🤍"}
      </button>
      <img src="${product.image}" alt="${product.name}" loading="lazy" onclick="openProductDetail(${product.id})" style="cursor:pointer">
      <div class="product-info">
        <h3 onclick="openProductDetail(${product.id})" style="cursor:pointer">${product.name}</h3>
        <p class="product-price">Rs ${product.price.toLocaleString()}</p>
        <div class="product-actions">
          <button class="btn-view" onclick="openProductDetail(${product.id})">View Details</button>
          <button class="btn-cart" onclick="addToCart(${product.id})">🛒</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}


// ─── CATEGORY GROUP MAP ───
const categoryGroups = {
  fashion:     ["shoe", "dress"],
  electronics: ["mobile", "laptop"],
  bags:        ["bag"],
  accessories: ["accessory", "watch"],
  home:        ["home"]
};

// ─── FILTER + SORT ───
function getFilteredProducts() {
  let list = [...products];

  if (activeCategory !== "all") {
    const group = categoryGroups[activeCategory];
    if (group) {
      list = list.filter(p => group.includes(p.category));
    } else {
      list = list.filter(p => p.category === activeCategory);
    }
  }

  if (searchQuery) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery)
    );
  }

  if (sortOrder === "price-low")  list.sort((a, b) => a.price - b.price);
  if (sortOrder === "price-high") list.sort((a, b) => b.price - a.price);
  if (sortOrder === "name-az")    list.sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

function refresh() {
  displayProducts(getFilteredProducts());
}

// ─── CHIP FILTER ───
const chipSubtitles = {
  all:         "✦ New arrivals every week",
  fashion:     "👗 Shoes, dresses & more",
  electronics: "📱 Mobiles, laptops & tech",
  bags:        "👜 Totes, pouches & handbags",
  accessories: "💍 Watches, jewellery & more",
  home:        "🏡 Decor, bottles & vases"
};

function filterByChip(el, cat) {
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  activeCategory = cat;

  // update navbar subtitle to category context
  const navSub = document.getElementById("nav-subtitle");
  if (navSub) navSub.textContent = chipSubtitles[cat] || "✦ New arrivals every week";

  refresh();
}

// ─── SEARCH ───
function handleSearch() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");
  if (!input) return;

  searchQuery = input.value.trim().toLowerCase();
  if (clearBtn) clearBtn.style.display = searchQuery ? "flex" : "none";
  refresh();
}

function clearSearch() {
  const input = document.getElementById("searchInput");
  if (input) { input.value = ""; input.focus(); }
  searchQuery = "";
  const clearBtn = document.getElementById("clearSearch");
  if (clearBtn) clearBtn.style.display = "none";
  refresh();
}

function resetFilters() {
  clearSearch();
  activeCategory = "all";
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  const allChip = document.querySelector('.chip[data-cat="all"]');
  if (allChip) allChip.classList.add("active");
  refresh();
}

// ─── SORT ───
function handleSort() {
  const sel = document.getElementById("sortSelect");
  if (sel) sortOrder = sel.value;
  refresh();
}

// ─── NAVBAR SCROLL SHADOW ───
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
});

// ─── SIDEBAR ACTIVE LINK ───
function highlightActiveLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#sidebar a").forEach(link => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === currentPage);
  });
}

// ─── INIT ───
document.addEventListener("DOMContentLoaded", () => {
  highlightActiveLink();
  updateCartBadge();
  updateWishlistBadge();

  // Search input listener
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  // Map old single-cat values (from categories page) → new groups
  const catMap = { shoe: "fashion", dress: "fashion", mobile: "electronics", laptop: "electronics",
                   bag: "bags", watch: "accessories", accessory: "accessories" };

  // Check if coming from categories page
  const rawCat = localStorage.getItem("selectedCategory");
  if (rawCat) {
    localStorage.removeItem("selectedCategory");
    const mapped = catMap[rawCat] || rawCat;
    activeCategory = mapped;
    const chip = document.querySelector(`.chip[data-cat="${mapped}"]`);
    if (chip) {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const navSub = document.getElementById("nav-subtitle");
      if (navSub) navSub.textContent = chipSubtitles[mapped] || "✦ New arrivals every week";
    }
  }

  refresh();
});


// ─── PRODUCT DETAIL MODAL ───
let pdCurrentId  = null;
let pdCurrentQty = 1;

const CAT_LABELS = {
  shoe: "👟 Shoes", bag: "👜 Bags", watch: "⌚ Watches", dress: "👗 Fashion",
  mobile: "📱 Mobiles", laptop: "💻 Laptops", home: "🏡 Home & Decor", accessory: "💍 Accessories"
};

const PRODUCT_FEATURES = {
  shoe:      ["Premium quality material", "Comfortable all-day wear", "Available in all sizes", "Stylish & trendy design"],
  bag:       ["Durable premium material", "Spacious interior", "Multiple compartments", "Perfect for daily use"],
  watch:     ["Scratch-resistant glass", "Water resistant", "Long battery life", "Elegant design"],
  dress:     ["Soft breathable fabric", "True to size fit", "Easy care & wash", "Versatile styling"],
  mobile:    ["Latest processor", "High-res camera", "Fast charging support", "Large display"],
  laptop:    ["High performance specs", "Lightweight design", "Long battery life", "Fast SSD storage"],
  home:      ["Premium quality finish", "Easy to clean", "Elegant modern design", "Perfect gift idea"],
  accessory: ["Hypoallergenic material", "Elegant finish", "Timeless design", "Lightweight & comfortable"]
};

function openProductDetail(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  pdCurrentId  = productId;
  pdCurrentQty = 1;

  // Fill modal
  const imgEl  = document.getElementById("pd-img");
  const nameEl = document.getElementById("pd-name");
  const catEl  = document.getElementById("pd-cat");
  const priceEl = document.getElementById("pd-price");
  const featEl  = document.getElementById("pd-features");
  const qtyEl   = document.getElementById("pd-qty");
  const wishBtn = document.getElementById("pd-btn-wish");

  if (imgEl)   { imgEl.src = product.image; imgEl.alt = product.name; }
  if (nameEl)  nameEl.textContent  = product.name;
  if (catEl)   catEl.textContent   = CAT_LABELS[product.category] || product.category;
  if (priceEl) priceEl.textContent = "Rs " + product.price.toLocaleString();
  if (qtyEl)   qtyEl.textContent   = 1;

  // Features
  if (featEl) {
    const feats = PRODUCT_FEATURES[product.category] || ["Quality product", "Great value", "Fast delivery", "Easy returns"];
    featEl.innerHTML = feats.map(f => `<li>${f}</li>`).join("");
  }

  // Wishlist state
  if (wishBtn) {
    const wished = getWishlist().some(w => w.id === productId);
    wishBtn.textContent = wished ? "❤️" : "🤍";
    wishBtn.classList.toggle("wished", wished);
  }

  // Show overlay
  const overlay = document.getElementById("pd-overlay");
  if (overlay) overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeProductDetail() {
  const overlay = document.getElementById("pd-overlay");
  if (overlay) overlay.classList.add("hidden");
  document.body.style.overflow = "";
  pdCurrentId  = null;
  pdCurrentQty = 1;
}

function pdChangeQty(delta) {
  pdCurrentQty = Math.max(1, Math.min(10, pdCurrentQty + delta));
  const qtyEl = document.getElementById("pd-qty");
  if (qtyEl) qtyEl.textContent = pdCurrentQty;
}

function pdAddToCart() {
  if (!pdCurrentId) return;
  const product = products.find(p => p.id === pdCurrentId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(i => i.id === pdCurrentId);
  if (existing) {
    existing.qty += pdCurrentQty;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price,
                image: product.image, category: product.category, qty: pdCurrentQty });
  }
  saveCart(cart);
  updateCartBadge();

  const btn = document.getElementById("pd-btn-cart");
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = "✓ Added!";
    btn.style.background = "#3aaa6f";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; }, 1200);
  }
  showToast("🛒 " + pdCurrentQty + "× " + product.name.split(" ").slice(0,3).join(" ") + " added!");
}

function pdToggleWish() {
  if (!pdCurrentId) return;
  const btn = document.getElementById("pd-btn-wish");
  toggleWishlist(pdCurrentId, btn);

  // sync the wish-btn on the product card too
  const cards = document.querySelectorAll(".product");
  cards.forEach(card => {
    const cartBtn = card.querySelector(".btn-cart");
    if (cartBtn && cartBtn.getAttribute("onclick")?.includes(pdCurrentId)) {
      const wishBtnCard = card.querySelector(".wish-btn");
      if (wishBtnCard) {
        const wished = getWishlist().some(w => w.id === pdCurrentId);
        wishBtnCard.textContent = wished ? "❤️" : "🤍";
      }
    }
  });
}

// Close on backdrop click
document.addEventListener("click", e => {
  const overlay = document.getElementById("pd-overlay");
  if (overlay && e.target === overlay) closeProductDetail();
});

// Close on Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeProductDetail();
});

// Wishlist nav → profile wishlist tab
document.querySelector(".wishlist-nav")?.addEventListener("click", () => {
  localStorage.setItem("openTab", "wishlist");
  window.location.href = "profile.html";
});
