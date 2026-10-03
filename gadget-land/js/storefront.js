(function () {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const money = (value) => new Intl.NumberFormat("fa-IR").format(Number(value) || 0) + " تومان";
  const priceMarkup = (product) => Number(product.sale_price) > 0 && Number(product.regular_price) > Number(product.price)
    ? `<span class="sale-price"><del>${money(product.regular_price)}</del><strong>${money(product.price)}</strong></span>`
    : money(product.price);
  const digits = (value) => new Intl.NumberFormat("fa-IR").format(Number(value) || 0);
  const safe = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);

  const CART_KEY = "gadgetland_cart_v1";
  const COUNT_KEY = "gadgetland_cart_count_v1";
  const iconBySlug = { case: "📱", audio: "🎧", power: "⚡", accessory: "🎮" };
  const state = { products: [], categories: [], filter: "all", query: "", sort: "popular" };
  let cart = loadCart();

  function loadCart() {
    try {
      const legacyKey = ["nou", "raCart"].join("");
      const source = localStorage.getItem(CART_KEY) || localStorage.getItem(legacyKey) || "[]";
      const rows = JSON.parse(source);
      if (!Array.isArray(rows)) return [];
      const clean = rows.filter((row) => row && Number(row.variant_id) > 0).map((row) => ({
        key: "variant-" + Number(row.variant_id), id: Number(row.id), variant_id: Number(row.variant_id),
        name: String(row.name || "محصول").slice(0, 180), price: Math.max(0, Number(row.price) || 0),
        qty: Math.min(20, Math.max(1, Number(row.qty) || 1)), color: String(row.color || "default"),
        colorLabel: String(row.colorLabel || row.color || "مدل اصلی"), size: row.size || null,
        image_path: row.image_path ? String(row.image_path) : null,
      }));
      if (localStorage.getItem(legacyKey)) localStorage.removeItem(legacyKey);
      localStorage.setItem(CART_KEY, JSON.stringify(clean));
      return clean;
    } catch (_) { return []; }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    localStorage.setItem(COUNT_KEY, String(cart.reduce((sum, row) => sum + row.qty, 0)));
  }

  function toast(message) {
    let element = $(".toast");
    if (!element) {
      element = document.createElement("div");
      element.className = "toast";
      element.setAttribute("role", "status");
      document.body.appendChild(element);
    }
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(element._timer);
    element._timer = setTimeout(() => element.classList.remove("show"), 2400);
  }

  function renderCart() {
    const count = cart.reduce((sum, row) => sum + row.qty, 0);
    const total = cart.reduce((sum, row) => sum + row.price * row.qty, 0);
    $("#cartBadge").textContent = digits(count);
    $("#cartTotal").textContent = money(total);
    const box = $("#cartItems");
    if (!cart.length) {
      box.innerHTML = '<div class="cart-empty"><span>🛒</span><p>سبد خرید شما خالی است.</p><a href="shop.html">مشاهده فروشگاه</a></div>';
      $("#checkoutBtn").disabled = true;
      saveCart();
      return;
    }
    $("#checkoutBtn").disabled = false;
    box.innerHTML = cart.map((row) => `<article class="cart-item" data-key="${safe(row.key)}">
      <div class="cart-item-media">${row.image_path ? `<img src="${safe(row.image_path)}" alt="">` : "📦"}</div>
      <div><a class="cart-item-name" href="product.html?id=${row.id}">${safe(row.name)}</a><div class="cart-item-price">${money(row.price)}</div></div>
      <button class="cart-item-remove" data-cart-action="remove" aria-label="حذف ${safe(row.name)}">×</button>
      <div class="cart-item-qty"><button class="qty-btn" data-cart-action="minus" aria-label="کاهش">−</button><span class="qty-val">${digits(row.qty)}</span><button class="qty-btn" data-cart-action="plus" aria-label="افزایش">+</button></div>
    </article>`).join("");
    saveCart();
  }

  function setCartOpen(open) {
    $("#cartDrawer").classList.toggle("open", open);
    $("#cartOverlay").classList.toggle("open", open);
    $("#cartDrawer").setAttribute("aria-hidden", String(!open));
    $("#cartOverlay").setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);
    if (open) setTimeout(() => $("#cartClose").focus(), 50);
  }

  async function addProduct(productId, button) {
    button.disabled = true;
    const oldLabel = button.textContent;
    button.textContent = "در حال بررسی…";
    try {
      const data = await StoreApi.request("/products/" + productId);
      const variant = data.product.find((item) => Number(item.stock) > 0);
      if (!variant) throw new Error("این محصول در حال حاضر موجود نیست.");
      const key = "variant-" + variant.variant_id;
      const row = cart.find((item) => item.key === key);
      if (row) row.qty = Math.min(Number(variant.stock), row.qty + 1);
      else cart.push({ key, id: Number(variant.id), variant_id: Number(variant.variant_id), name: variant.name,
        price: Number(variant.price), qty: 1, color: variant.color || "default",
        colorLabel: variant.color || "مدل اصلی", size: variant.size || null, image_path: variant.image_path || null });
      renderCart();
      toast("محصول به سبد خرید اضافه شد ✓");
    } catch (error) { toast(error.message); }
    finally { button.disabled = false; button.textContent = oldLabel; }
  }

  function visibleProducts() {
    const query = state.query.trim().toLocaleLowerCase("fa");
    const result = state.products.filter((product) => {
      const category = product.category_slug || product.category;
      return (state.filter === "all" || category === state.filter)
        && (!query || String(product.name).toLocaleLowerCase("fa").includes(query));
    });
    return result.sort((a, b) => state.sort === "price-asc" ? a.price - b.price
      : state.sort === "price-desc" ? b.price - a.price
      : state.sort === "name" ? a.name.localeCompare(b.name, "fa")
      : Number(b.sales_count) - Number(a.sales_count));
  }

  function renderProducts() {
    const matches = visibleProducts();
    const products = matches.slice(0, 8);
    $("#resultsCount").textContent = digits(matches.length) + " محصول پیدا شد؛ " + digits(products.length) + " مورد برتر نمایش داده می‌شود";
    $("#emptyProducts").hidden = matches.length !== 0;
    $("#productsGrid").innerHTML = products.map((product, index) => {
      const category = product.category_slug || product.category || "accessory";
      const available = Number(product.stock) > 0;
      return `<article class="product-card glass visible${index < 2 ? " featured" : ""}" data-product-id="${product.id}">
        ${Number(product.sales_count) > 0 ? '<span class="product-badge">پرفروش</span>' : ""}
        <a class="product-card-link" href="product.html?id=${product.id}">
          <div class="product-media">${product.image_path ? `<img src="${safe(product.image_path)}" alt="${safe(product.name)}" loading="lazy">` : `<span aria-hidden="true">${iconBySlug[category] || "📦"}</span>`}</div>
          <small class="product-category">${safe(product.category_name || "لوازم جانبی")}</small>
          <h3 class="product-name">${safe(product.name)}</h3>
          <p class="product-description">${safe(product.description || "")}</p>
          <p class="product-price">${priceMarkup(product)}</p>
        </a>
        <button class="btn btn-primary add-to-cart ripple" type="button" ${available ? "" : "disabled"}>${available ? "افزودن به سبد" : "ناموجود"}</button>
      </article>`;
    }).join("");
  }

  function railCard(product, label) {
    const category = product.category_slug || product.category || "accessory";
    const available = Number(product.stock) > 0;
    return `<article class="rail-card" data-product-id="${Number(product.id)}">
      <a href="product.html?id=${Number(product.id)}"><figure>${product.image_path ? `<img src="${safe(product.image_path)}" alt="${safe(product.name)}" loading="lazy">` : `<span aria-hidden="true">${iconBySlug[category] || "📦"}</span>`}</figure>
      <small>${safe(label || product.category_name || "لوازم جانبی")}</small><h3>${safe(product.name)}</h3></a>
      <div class="rail-card-price"><strong>${priceMarkup(product)}</strong><button class="rail-add" type="button" ${available ? "" : "disabled"} aria-label="${available ? "افزودن به سبد" : "ناموجود"}">${available ? "+" : "×"}</button></div>
    </article>`;
  }

  function renderRails() {
    const newest = [...state.products].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 10);
    const recommended = [...state.products].filter((item) => Number(item.stock) > 0)
      .sort((a, b) => Number(b.sales_count) - Number(a.sales_count) || Number(b.id) - Number(a.id)).slice(0, 10);
    $("#newestRail").innerHTML = newest.length ? newest.map((product) => railCard(product, "تازه رسیده")).join("") : '<p class="catalog-empty">هنوز محصول جدیدی ثبت نشده است.</p>';
    $("#recommendedRail").innerHTML = recommended.length ? recommended.map((product) => railCard(product, "پیشنهاد گجت‌لند")).join("") : '<p class="catalog-empty">پیشنهادی برای نمایش وجود ندارد.</p>';
    $$(".rail-card img").forEach((image) => { image.onerror = () => { const figure = image.closest("figure"); figure.innerHTML = '<span aria-hidden="true">📦</span>'; }; });
  }

  function renderCatalog() {
    const icon = (slug) => iconBySlug[slug] || "✦";
    const latest = [...state.categories].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5);
    $("#filterChips").innerHTML = '<button class="filter-chip active" type="button" data-filter="all" aria-pressed="true">همه</button>'
      + latest.map((category) => `<button class="filter-chip" type="button" data-filter="${safe(category.slug)}" aria-pressed="false">${safe(category.name)}</button>`).join("");
    $("#categoriesGrid").innerHTML = latest.map((category) => `<a href="shop.html?category=${encodeURIComponent(category.slug)}" class="category-card glass visible"><span class="cat-icon">${icon(category.slug)}</span><h3>${safe(category.name)}</h3><span class="cat-count">${digits(category.product_count)} محصول</span></a>`).join("") || '<p class="catalog-empty">هنوز دسته‌بندی فعالی ثبت نشده است.</p>';
    $("#categoryMegaMenu").innerHTML = latest.map((category) => `<a href="shop.html?category=${encodeURIComponent(category.slug)}"><b>${safe(category.name)}</b><small>${digits(category.product_count)} محصول</small></a>`).join("") || '<span>دسته‌ای ثبت نشده است.</span>';
    $("#mobileCategoryLinks").innerHTML = latest.map((category) => `<a href="shop.html?category=${encodeURIComponent(category.slug)}">${safe(category.name)}</a>`).join("");
  }

  function setFilter(filter) {
    state.filter = filter;
    $$(".filter-chip").forEach((chip) => {
      const active = chip.dataset.filter === filter;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
  }

  async function loadStore() {
    try {
      const [productData, catalogData, settingsData] = await Promise.all([
        StoreApi.request("/products"), StoreApi.request("/catalog"), StoreApi.request("/settings/public"),
      ]);
      state.products = productData.products.map((product) => ({ ...product, price: Number(product.price), regular_price: Number(product.regular_price), sale_price: Number(product.sale_price), stock: Number(product.stock) }));
      state.categories = catalogData.catalog.categories || [];
      const storeName = settingsData.settings.store_name;
      if (storeName) document.title = storeName + " | فروشگاه لوازم جانبی موبایل";
      const supportPhone = String(settingsData.settings.support_phone || "").trim();
      const supportLink = $("[data-support-phone]");
      const supportRow = $("[data-support-phone-row]");
      if (supportPhone && supportLink && supportRow) {
        supportLink.href = "tel:" + supportPhone.replace(/[^+\d]/g, "");
        supportLink.textContent = "📞 " + supportPhone;
        supportRow.hidden = false;
      }
      renderCatalog();
      renderProducts();
      renderRails();
    } catch (error) {
      console.error("Homepage catalog load failed:", error);
      $("#productsGrid").innerHTML = '<div class="catalog-error glass"><span>!</span><h3>اتصال به فروشگاه برقرار نشد</h3><p>چند لحظه دیگر دوباره تلاش کنید.</p><button class="btn btn-ghost" type="button" data-retry>تلاش دوباره</button></div>';
      $("#resultsCount").textContent = "خطا در دریافت کاتالوگ";
      $("#newestRail").innerHTML = $("#recommendedRail").innerHTML = '<p class="catalog-empty">محصولات دریافت نشدند.</p>';
    }
  }

  $("#cartBtn").addEventListener("click", () => setCartOpen(true));
  $("#cartClose").addEventListener("click", () => setCartOpen(false));
  $("#cartOverlay").addEventListener("click", () => setCartOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setCartOpen(false);
    $(".category-nav").classList.remove("open");
    $(".category-trigger").setAttribute("aria-expanded", "false");
  });
  $("#cartItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const article = button.closest("[data-key]");
    const row = cart.find((item) => item.key === article.dataset.key);
    if (!row) return;
    if (button.dataset.cartAction === "plus") row.qty = Math.min(20, row.qty + 1);
    if (button.dataset.cartAction === "minus") row.qty -= 1;
    if (button.dataset.cartAction === "remove" || row.qty < 1) cart = cart.filter((item) => item !== row);
    renderCart();
  });
  $("#checkoutBtn").addEventListener("click", () => { if (cart.length) location.href = "checkout.html"; });
  $("#productsGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart");
    if (button) addProduct(button.closest("[data-product-id]").dataset.productId, button);
    if (event.target.closest("[data-retry]")) loadStore();
  });
  document.addEventListener("click", (event) => {
    const add = event.target.closest(".rail-add");
    if (add) addProduct(add.closest("[data-product-id]").dataset.productId, add);
    const control = event.target.closest("[data-rail-prev],[data-rail-next]");
    if (!control) return;
    const rail = document.getElementById(control.dataset.railPrev || control.dataset.railNext);
    if (rail) rail.scrollBy({ left: control.dataset.railNext ? -Math.min(rail.clientWidth * .82, 720) : Math.min(rail.clientWidth * .82, 720), behavior: "smooth" });
  });
  $("#productSearch").addEventListener("input", (event) => { state.query = event.target.value; renderProducts(); });
  $("#productSort").addEventListener("change", (event) => { state.sort = event.target.value; renderProducts(); });
  $("#filterChips").addEventListener("click", (event) => { const chip = event.target.closest("[data-filter]"); if (chip) setFilter(chip.dataset.filter); });
  $("#categoriesGrid").addEventListener("click", (event) => { const card = event.target.closest("[data-filter]"); if (card) setFilter(card.dataset.filter); });
  $("#categoryMegaMenu").addEventListener("click", (event) => { const link = event.target.closest("[data-filter]"); if (link) { setFilter(link.dataset.filter); $(".category-nav").classList.remove("open"); } });
  $("#mobileCategoryLinks").addEventListener("click", (event) => {
    const link = event.target.closest("[data-filter]");
    if (!link) return;
    setFilter(link.dataset.filter);
    $(".mobile-menu").classList.remove("open");
    $(".hamburger").classList.remove("active");
    $(".hamburger").setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
  $(".category-trigger").addEventListener("click", () => { const nav = $(".category-nav"); const open = nav.classList.toggle("open"); $(".category-trigger").setAttribute("aria-expanded", String(open)); });
  $(".mobile-categories > button").addEventListener("click", () => { const item = $(".mobile-categories"); const open = item.classList.toggle("expanded"); $(".mobile-categories > button").setAttribute("aria-expanded", String(open)); });
  document.addEventListener("click", (event) => { if (!event.target.closest(".category-nav")) { $(".category-nav").classList.remove("open"); $(".category-trigger").setAttribute("aria-expanded", "false"); } });
  $("#clearFilters").addEventListener("click", () => { $("#productSearch").value = ""; state.query = ""; setFilter("all"); });

  renderCart();
  loadStore();
})();
