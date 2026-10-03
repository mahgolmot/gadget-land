(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  const fa = (value) => new Intl.NumberFormat("fa-IR").format(Number(value) || 0);
  const money = (value) => fa(value) + " تومان";
  const priceMarkup = (product) => Number(product.sale_price) > 0 && Number(product.regular_price) > Number(product.price)
    ? `<span class="sale-price"><del>${money(product.regular_price)}</del><strong>${money(product.price)}</strong></span>`
    : `<strong>${money(product.price)}</strong>`;
  const params = new URLSearchParams(location.search);
  const icons = { case: "📱", audio: "🎧", power: "⚡", accessory: "🎮" };
  const state = {
    products: [], categories: [], brands: [],
    category: params.get("category") || "all", query: params.get("q") || "",
    brand: params.get("brand") || "all", minPrice: Number(params.get("min")) || 0,
    maxPrice: Number(params.get("max")) || 0, sort: params.get("sort") || "popular",
  };
  const CART_KEY = "gadgetland_cart_v1";
  const COUNT_KEY = "gadgetland_cart_count_v1";

  function cart() {
    try { const rows = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); return Array.isArray(rows) ? rows : []; }
    catch (_) { return []; }
  }

  function saveCart(rows) {
    localStorage.setItem(CART_KEY, JSON.stringify(rows));
    const count = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
    localStorage.setItem(COUNT_KEY, String(count));
    $("[data-cart-count]").textContent = fa(count);
  }

  function toast(message) {
    const node = $(".shop-toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove("show"), 2500);
  }

  function filtered() {
    const query = state.query.trim().toLocaleLowerCase("fa");
    return state.products.filter((product) => {
      const category = product.category_slug || product.category;
      const price = Number(product.price);
      return (state.category === "all" || category === state.category)
        && (state.brand === "all" || String(product.brand || "") === state.brand)
        && (!state.minPrice || price >= state.minPrice)
        && (!state.maxPrice || price <= state.maxPrice)
        && (!query || [product.name, product.brand, product.description].some((value) => String(value || "").toLocaleLowerCase("fa").includes(query)));
    }).sort((a, b) => state.sort === "price-asc" ? a.price - b.price
      : state.sort === "price-desc" ? b.price - a.price
      : state.sort === "name" ? a.name.localeCompare(b.name, "fa")
      : state.sort === "newest" ? b.id - a.id
      : Number(b.sales_count) - Number(a.sales_count));
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (state.category !== "all") next.set("category", state.category);
    if (state.query) next.set("q", state.query);
    if (state.brand !== "all") next.set("brand", state.brand);
    if (state.minPrice) next.set("min", String(state.minPrice));
    if (state.maxPrice) next.set("max", String(state.maxPrice));
    if (state.sort !== "popular") next.set("sort", state.sort);
    history.replaceState(null, "", location.pathname + (next.toString() ? "?" + next : ""));
  }

  function render() {
    const products = filtered();
    $("#shopResult").textContent = fa(products.length) + " محصول پیدا شد";
    $("#clearShopFilters").hidden = state.category === "all" && !state.query && state.brand === "all" && !state.minPrice && !state.maxPrice;
    $$("[data-category]").forEach((button) => button.classList.toggle("active", button.dataset.category === state.category));
    $("#shopGrid").innerHTML = products.length ? products.map((product, index) => {
      const slug = product.category_slug || product.category || "accessory";
      const available = Number(product.stock) > 0;
      return `<article class="shop-card" data-product-id="${Number(product.id)}" style="animation-delay:${Math.min(index, 8) * .04}s">
        ${Number(product.sales_count) > 0 ? '<span class="shop-badge">پرفروش</span>' : ""}
        <button class="shop-favorite" type="button" data-product-favorite="${Number(product.id)}" aria-label="افزودن به علاقه‌مندی‌ها">♡</button>
        <a href="product.html?id=${Number(product.id)}"><div class="shop-card-media">${product.image_path ? `<img src="${safe(product.image_path)}" alt="${safe(product.name)}" loading="lazy">` : `<span>${icons[slug] || "📦"}</span>`}</div>
        <div class="shop-card-body"><small class="shop-card-category">${safe(product.category_name || "لوازم جانبی")}${product.brand ? " · " + safe(product.brand) : ""}</small><h3>${safe(product.name)}</h3><p class="shop-card-description">${safe(product.description || "یک انتخاب کاربردی از گجت‌لند")}</p><div class="shop-card-price">${priceMarkup(product)}<small>${available ? fa(product.stock) + " عدد موجود" : "ناموجود"}</small></div></div></a>
        <div class="shop-card-actions"><button type="button" data-add-product ${available ? "" : "disabled"}>${available ? "افزودن سریع به سبد" : "ناموجود"}</button><a href="product.html?id=${Number(product.id)}" aria-label="جزئیات محصول">←</a></div>
      </article>`;
    }).join("") : '<div class="shop-empty"><span>⌕</span><h3>محصولی با این فیلتر پیدا نشد</h3><p>برند، بازه قیمت یا دسته‌بندی را تغییر بده.</p></div>';
    $$(".shop-card-media img").forEach((image) => { image.onerror = () => {
      const media = image.parentElement;
      const product = state.products.find((item) => Number(item.id) === Number(image.closest("[data-product-id]").dataset.productId));
      media.innerHTML = `<span>${icons[product?.category_slug || product?.category] || "📦"}</span>`;
    }; });
    syncUrl();
  }

  async function add(productId, button) {
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "در حال بررسی…";
    try {
      const data = await StoreApi.request("/products/" + productId);
      const variant = data.product.find((item) => Number(item.stock) > 0);
      if (!variant) throw new Error("این محصول در حال حاضر موجود نیست.");
      const rows = cart();
      const key = "variant-" + variant.variant_id;
      const row = rows.find((item) => item.key === key);
      if (row) row.qty = Math.min(Number(variant.stock), Number(row.qty) + 1);
      else rows.push({ key, id: Number(variant.id), variant_id: Number(variant.variant_id), name: variant.name, price: Number(variant.price), qty: 1, color: variant.color || "default", colorLabel: variant.color && variant.color !== "default" ? variant.color : "مدل اصلی", size: variant.size || null, image_path: variant.image_path || null });
      saveCart(rows);
      toast("به سبد خرید اضافه شد ✓");
    } catch (error) { toast(error.message); }
    finally { button.disabled = false; button.textContent = label; }
  }

  function renderFilters() {
    $("#shopCategories").innerHTML = '<button data-category="all" type="button">همه محصولات</button>' + state.categories.map((category) => `<button data-category="${safe(category.slug)}" type="button">${safe(category.name)} <small>${fa(category.product_count)}</small></button>`).join("");
    $("#shopBrand").innerHTML = '<option value="all">همه برندها</option>' + state.brands.map((brand) => `<option value="${safe(brand.name)}">${safe(brand.name)} (${fa(brand.product_count)})</option>`).join("");
    if (!state.categories.some((category) => category.slug === state.category)) state.category = "all";
    if (!state.brands.some((brand) => brand.name === state.brand)) state.brand = "all";
    $("#shopBrand").value = state.brand;
    $("#shopSort").value = state.sort;
  }

  async function load() {
    try {
      const [products, catalog, settings] = await Promise.all([StoreApi.request("/products"), StoreApi.request("/catalog"), StoreApi.request("/settings/public")]);
      state.products = (products.products || []).map((product) => ({ ...product, price: Number(product.price), regular_price: Number(product.regular_price), sale_price: Number(product.sale_price), stock: Number(product.stock), id: Number(product.id) }));
      state.categories = catalog.catalog.categories || [];
      state.brands = (catalog.catalog.brands || []).filter((brand) => Number(brand.active) !== 0);
      $("[data-total-products]").textContent = fa(state.products.length);
      if (settings.settings.store_name) document.title = "فروشگاه | " + settings.settings.store_name;
      renderFilters();
      render();
    } catch (error) {
      console.error("Storefront load failed:", error);
      $("#shopGrid").innerHTML = '<div class="shop-error"><span>!</span><h3>ویترین دریافت نشد</h3><p>اتصال به فروشگاه برقرار نشد. چند لحظه دیگر دوباره تلاش کن.</p><button type="button" data-retry>تلاش دوباره</button></div>';
      $("#shopResult").textContent = "خطا در اتصال به فروشگاه";
    }
  }

  $("#shopSearch").value = state.query;
  $("#shopMinPrice").value = state.minPrice || "";
  $("#shopMaxPrice").value = state.maxPrice || "";
  $("#shopSearch").oninput = (event) => { state.query = event.target.value; render(); };
  $("#shopSort").onchange = (event) => { state.sort = event.target.value; render(); };
  $("#shopBrand").onchange = (event) => { state.brand = event.target.value; render(); };
  $("#shopMinPrice").oninput = (event) => { state.minPrice = Math.max(0, Number(event.target.value) || 0); render(); };
  $("#shopMaxPrice").oninput = (event) => { state.maxPrice = Math.max(0, Number(event.target.value) || 0); render(); };
  $("#shopCategories").onclick = (event) => { const button = event.target.closest("[data-category]"); if (button) { state.category = button.dataset.category; render(); } };
  $("#clearShopFilters").onclick = () => {
    state.category = "all"; state.query = ""; state.brand = "all"; state.minPrice = 0; state.maxPrice = 0;
    $("#shopSearch").value = $("#shopMinPrice").value = $("#shopMaxPrice").value = "";
    $("#shopBrand").value = "all";
    render();
  };
  $("#shopGrid").onclick = (event) => {
    const button = event.target.closest("[data-add-product]");
    if (button) add(button.closest("[data-product-id]").dataset.productId, button);
    if (event.target.closest("[data-retry]")) load();
  };

  saveCart(cart());
  load();
})();
