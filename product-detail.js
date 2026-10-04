(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const fa = (value) => new Intl.NumberFormat("fa-IR").format(Number(value) || 0);
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const CART_KEY = "gadgetland_cart_v1";
  const FAV_KEY = "gadgetland_demo_favorites_v1";

  let selected = null;
  let product = null;

  function notice(text) {
    const node = $(".notice");
    node.textContent = text;
    node.classList.add("show");
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove("show"), 2400);
  }

  function loadCart() {
    try {
      const rows = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (_) { return []; }
  }

  function saveCart(rows) {
    localStorage.setItem(CART_KEY, JSON.stringify(rows));
    const count = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
    localStorage.setItem("gadgetland_cart_count_v1", String(count));
    $(".cart-count").textContent = fa(count);
  }

  function loadFavorites() {
    try {
      const ids = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return new Set(Array.isArray(ids) ? ids.map(Number) : []);
    } catch (_) { return new Set(); }
  }

  function saveFavorites(ids) {
    localStorage.setItem(FAV_KEY, JSON.stringify([...ids]));
  }

  function showImage(src, name) {
    const stage = $(".gallery-stage");
    stage.innerHTML = src
      ? `<img src="${safe(src)}" alt="${safe(name)}"><button class="zoom" type="button" aria-label="نمایش بزرگ">⌕</button>`
      : `<div class="gallery-fallback"><i></i><span>تصویر نمایشی در دسترس نیست</span></div>`;
    const image = stage.querySelector("img");
    if (!image) return;
    image.onerror = () => { stage.innerHTML = '<div class="gallery-fallback"><i></i><span>تصویر نمایشی در دسترس نیست</span></div>'; };
    image.onclick = openLightbox;
    stage.querySelector(".zoom").onclick = openLightbox;
  }

  function openLightbox() {
    const image = $(".gallery-stage img");
    if (!image) return;
    $(".lightbox img").src = image.src;
    $(".lightbox").classList.add("open");
  }

  function updateVariant() {
    selected = product;
    const onSale = Number(selected.sale_price) > 0 && Number(selected.regular_price) > Number(selected.price);
    $(".price").innerHTML = onSale
      ? `<del>${fa(selected.regular_price)} تومان</del><strong>${fa(selected.price)} <small>تومان</small></strong>`
      : `<strong>${fa(selected.price)} <small>تومان</small></strong>`;
    $(".selected-sku").textContent = "SKU: " + selected.sku;
    $(".meta-sku").textContent = selected.sku;
    $(".selected-stock").textContent = fa(selected.stock) + " عدد در انبار";
    $(".stock-text").textContent = Number(selected.stock) ? "موجود و آماده ارسال" : "در حال حاضر ناموجود";
    $(".availability").classList.toggle("out", !Number(selected.stock));
    $(".add-product").disabled = !Number(selected.stock);
    $(".qty").max = selected.stock;
  }

  function addToCart() {
    if (!selected || !Number(selected.stock)) return;
    const qty = Math.min(Number(selected.stock), Math.max(1, parseInt($(".qty").value, 10) || 1));
    const cart = loadCart();
    const key = "variant-" + selected.variant_id;
    const row = cart.find((item) => item.key === key);
    if (row) row.qty = Math.min(Number(selected.stock), Number(row.qty) + qty);
    else cart.push({
      key, id: selected.id, variant_id: selected.variant_id, name: selected.name, price: selected.price,
      qty, color: selected.color || "default", colorLabel: selected.color || "مدل اصلی",
      size: selected.size || null, image_path: selected.image_path || null
    });
    saveCart(cart);
    notice("محصول به سبد نمایشی اضافه شد ✓");
  }

  function renderReviews() {
    const list = DemoStore.reviews[Number(product.id)] || [];
    const panel = $('[data-panel="reviews"]');
    const average = list.length ? list.reduce((sum, item) => sum + Number(item.rating), 0) / list.length : 0;
    $(".rating span").textContent = "★".repeat(Math.round(average)) + "☆".repeat(5 - Math.round(average));
    $(".rating a").textContent = list.length ? fa(list.length) + " دیدگاه" : "بدون دیدگاه";
    panel.innerHTML = `<span class="section-index">04 / REVIEWS</span><h2>دیدگاه خریداران</h2><div class="review-list">${list.length ? list.map((review) => `<article><div><b>${safe(review.name)}</b><span>${"★".repeat(Number(review.rating))}${"☆".repeat(5 - Number(review.rating))}</span></div><p>${safe(review.body)}</p><time>${safe(review.created_at)}</time></article>`).join("") : '<div class="empty-reviews"><b>دیدگاهی برای این نسخه نمایشی ثبت نشده است.</b><p>نمونه داده‌ها فقط برای نمایش طراحی صفحه قرار گرفته‌اند.</p></div>'}</div>`;
  }

  function renderRelated() {
    const list = DemoStore.products.filter((item) => Number(item.id) !== Number(product.id)).slice(0, 4);
    $(".related-grid").innerHTML = list.map((item) => `<a class="related-card" href="product.html?id=${Number(item.id)}"><figure>${item.image_path ? `<img src="${safe(item.image_path)}" alt="${safe(item.name)}" loading="lazy">` : ""}</figure><small>${safe(item.category_name)}</small><h3>${safe(item.name)}</h3><span>${fa(item.price)} تومان</span></a>`).join("");
  }

  function render() {
    document.title = product.name + " | گجت‌لند";
    $(".crumb-category").textContent = product.category_name;
    $(".crumb-category").href = "shop.html?category=" + encodeURIComponent(product.category_slug);
    $(".crumb-name").textContent = product.name;
    $(".product-name").textContent = product.name;
    $(".short-description").textContent = product.description;
    $(".full-description").textContent = product.long_description;
    $(".meta-category").textContent = product.category_name;
    $(".meta-category").href = "shop.html?category=" + encodeURIComponent(product.category_slug);
    showImage(product.image_path, product.name);
    $(".variation-box").hidden = true;
    updateVariant();
    $(".spec-list").innerHTML = [
      ["برند", product.brand], ["دسته‌بندی", product.category_name], ["کد محصول", product.sku],
      ["مدل", product.color || "نسخه اصلی"], ["تنوع", product.size || "استاندارد"], ["وضعیت", Number(product.stock) ? "موجود" : "ناموجود"]
    ].map(([title, value]) => `<div><dt>${safe(title)}</dt><dd>${safe(value || "—")}</dd></div>`).join("");

    const favs = loadFavorites();
    const wish = $(".wishlist");
    wish.setAttribute("aria-pressed", String(favs.has(Number(product.id))));
    wish.textContent = favs.has(Number(product.id)) ? "♥ در علاقه‌مندی‌ها" : "♡ افزودن به علاقه‌مندی‌ها";
    renderReviews();
    renderRelated();
  }

  function init() {
    const id = new URLSearchParams(location.search).get("id");
    product = DemoStore.getProduct(id || 1);
    if (!product) {
      $("main").innerHTML = '<div class="error-page"><h1>محصول پیدا نشد</h1><p>این محصول در نسخه نمایشی وجود ندارد.</p><a href="shop.html">بازگشت به فروشگاه</a></div>';
      return;
    }
    render();
    saveCart(loadCart());
  }

  $(".qty-plus").onclick = () => $(".qty").value = Math.min(Number(selected.stock), (parseInt($(".qty").value, 10) || 1) + 1);
  $(".qty-minus").onclick = () => $(".qty").value = Math.max(1, (parseInt($(".qty").value, 10) || 1) - 1);
  $(".qty").onchange = () => $(".qty").value = Math.min(Number(selected?.stock || 1), Math.max(1, parseInt($(".qty").value, 10) || 1));
  $(".add-product").onclick = addToCart;
  $(".wishlist").onclick = () => {
    const favs = loadFavorites();
    const id = Number(product.id);
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    saveFavorites(favs);
    const active = favs.has(id);
    $(".wishlist").setAttribute("aria-pressed", String(active));
    $(".wishlist").textContent = active ? "♥ در علاقه‌مندی‌ها" : "♡ افزودن به علاقه‌مندی‌ها";
    notice(active ? "به علاقه‌مندی‌ها اضافه شد ✓" : "از علاقه‌مندی‌ها حذف شد");
  };
  $(".share").onclick = async () => {
    try {
      if (navigator.share) await navigator.share({ title: document.title, url: location.href });
      else { await navigator.clipboard.writeText(location.href); notice("لینک محصول کپی شد."); }
    } catch (_) {}
  };
  $$('[data-tab]').forEach((button) => button.onclick = () => {
    $$('[data-tab]').forEach((item) => item.classList.toggle("active", item === button));
    $$('[data-panel]').forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === button.dataset.tab));
  });
  $(".lightbox button").onclick = () => $(".lightbox").classList.remove("open");
  $(".lightbox").onclick = (event) => { if (event.target === $(".lightbox")) $(".lightbox").classList.remove("open"); };
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") $(".lightbox").classList.remove("open"); });

  init();
})();
