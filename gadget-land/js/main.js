/* ============================================================
   گجت‌لند — اسکریپت اصلی
   Three.js + GSAP/ScrollTrigger + سبد خرید کامل + Fallback
   ============================================================ */
(function () {
  "use strict";

  /* ---------- ابزارها ---------- */
  const faNum = (n) => Number(n).toLocaleString("fa-IR");
  const faToman = (n) => faNum(n) + " تومان";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);
  const toEnglishDigits = (value) => String(value)
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));

  const productEmojis = {
    "کاور سیلیکونی آیفون ۱۵": "📱",
    "هدفون بی‌سیم پرو": "🎧",
    "پاوربانک ۲۰۰۰۰": "🔋",
    "هولدر موبایل ماشین": "🖥️",
    "شارژر سریع ۶۵ وات": "⚡",
    "دسته بازی بلوتوث": "🎮",
    "کابل تایپ‌سی مگنتی": "🔌",
    "لنز کلیپسی دوربین": "📷",
  };

  /* ============================================================
     ۱) صحنه Three.js — ۶۰ آبجکت شناور
     ============================================================ */
  function initThree() {
    const canvas = $("#heroCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0d12, 0.045);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // نورها
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const p1 = new THREE.PointLight(0x3b82f6, 1.6, 60); p1.position.set(8, 8, 10); scene.add(p1);
    const p2 = new THREE.PointLight(0x00e5ff, 1.2, 60); p2.position.set(-10, -6, 8); scene.add(p2);
    const p3 = new THREE.PointLight(0xe91e63, 0.9, 60); p3.position.set(0, 10, -8); scene.add(p3);

    const group = new THREE.Group();
    scene.add(group);

    const geoms = [
      new THREE.TorusGeometry(1, 0.35, 14, 32),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
    ];
    const palette = [0x3b82f6, 0x60a5fa, 0x00e5ff, 0x818cf8, 0xe91e63];
    const TOTAL = 60;

    for (let i = 0; i < TOTAL; i++) {
      const wireframe = i % 2 === 0;
      const geo = geoms[i % geoms.length];
      const mat = wireframe
        ? new THREE.MeshBasicMaterial({ color: palette[i % palette.length], wireframe: true, transparent: true, opacity: 0.55 })
        : new THREE.MeshStandardMaterial({
            color: palette[i % palette.length],
            metalness: 0.6,
            roughness: 0.25,
            transparent: true,
            opacity: 0.85,
          });
      const mesh = new THREE.Mesh(geo, mat);

      const r = 6 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        (Math.random() - 0.5) * 16,
        r * Math.sin(phi) * Math.sin(theta) * 0.6
      );

      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.setScalar(0.35 + Math.random() * 0.9);
      mesh.userData = {
        floatSpeed: 0.2 + Math.random() * 0.6,
        rotSpeed: 0.002 + Math.random() * 0.01,
        baseY: mesh.position.y,
        phase: Math.random() * Math.PI * 2,
      };
      group.add(mesh);
    }

    // پارالاکس موس
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener("mousemove", (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    let visible = true;
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      const t = clock.getElapsedTime();

      // پارالاکس نرم
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.position.x = mouse.x * 3;
      camera.position.y = -mouse.y * 2;
      camera.lookAt(0, 0, 0);

      group.children.forEach((m, i) => {
        m.rotation.x += m.userData.rotSpeed;
        m.rotation.y += m.userData.rotSpeed * 1.3;
        m.position.y = m.userData.baseY + Math.sin(t * m.userData.floatSpeed + m.userData.phase) * 0.8;
        if (i % 10 === 0) m.position.x += Math.cos(t * 0.3 + m.userData.phase) * 0.002;
      });

      group.rotation.y = t * 0.03;
      renderer.render(scene, camera);
    }
    if (!reducedMotion) animate();
    else renderer.render(scene, camera);
  }

  /* ============================================================
     ۲) انیمیشن‌های GSAP
     ============================================================ */
  function initGSAP() {
    // --- Reveal عمومی: ScrollTrigger با fallback به IntersectionObserver ---
    const reveals = $$(".reveal");

    function revealEl(el, i) {
      if (window.gsap) {
        gsap.fromTo(el,
          { y: 40, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out", delay: (i % 4) * 0.08 });
      } else {
        el.classList.add("visible");
      }
    }

    if (window.gsap && window.ScrollTrigger && !reducedMotion) {
      gsap.registerPlugin(ScrollTrigger);

      // نوار ناوبری هنگام اسکرول
      ScrollTrigger.create({
        start: 80,
        onUpdate: (self) => $("#siteHeader").classList.toggle("scrolled", self.scroll() > 80),
      });

      // کارت‌های محصول با استگرگر
      gsap.from(".product-card", {
        y: 80,
        opacity: 0,
        scale: 0.92,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: "#productsGrid", start: "top 80%", once: true },
      });

      // شمارنده آمار
      $$(".stat-number").forEach((el) => {
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2.2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => { el.textContent = faNum(Math.round(obj.v)) + suffix; },
        });
      });

      // شناور بودن دکمه CTA هیرو
      gsap.to("#heroCta", {
        y: -10,
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      reveals.forEach((el) => {
        gsap.fromTo(el, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    } else {
      // Fallback: IntersectionObserver
      $("#siteHeader") && window.addEventListener("scroll", () => {
        $("#siteHeader").classList.toggle("scrolled", window.scrollY > 80);
      }, { passive: true });

      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target;
            const idx = reveals.indexOf(el);
            revealEl(el, idx);
            io.unobserve(el);
          }
        });
      }, { threshold: 0.15 });
      reveals.forEach((el) => io.observe(el));

      // شمارنده با IO
      const statIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          const target = +el.dataset.target;
          const suffix = el.dataset.suffix || "";
          const dur = 2000;
          const t0 = performance.now();
          (function tick(now) {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 2);
            el.textContent = faNum(Math.round(target * eased)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
          statIO.unobserve(el);
        });
      }, { threshold: 0.4 });
      $$(".stat-number").forEach((el) => statIO.observe(el));
    }

    // Hero copy stays visible from the first paint; CSS handles the entrance.
  }

  /* ============================================================
     ۳) سبد خرید کامل
     ============================================================ */
  const cart = []; // {name, price, qty, emoji}
  const cartDrawer = $("#cartDrawer");
  const cartOverlay = $("#cartOverlay");
  const cartItemsEl = $("#cartItems");
  const cartTotalEl = $("#cartTotal");
  const cartBadge = $("#cartBadge");

  function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => $("#cartClose").focus(), 100);
  }
  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function saveCart() {
    try { localStorage.setItem("gadgetland_cart", JSON.stringify(cart)); } catch (e) {}
  }
  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem("gadgetland_cart") || "[]");
      if (Array.isArray(saved)) {
        cart.push(...saved
          .filter((item) => item && typeof item.name === "string" && Number(item.price) > 0)
          .map((item) => ({
            name: item.name.slice(0, 80),
            price: Number(item.price),
            qty: Math.min(20, Math.max(1, Number(item.qty) || 1)),
            emoji: productEmojis[item.name] || "📦",
          })));
      }
    } catch (e) {}
  }

  function toast(msg) {
    let t = $(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function renderCart() {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);

    cartBadge.textContent = faNum(totalQty);
    cartBadge.classList.add("pop");
    setTimeout(() => cartBadge.classList.remove("pop"), 200);
    cartTotalEl.textContent = faToman(totalPrice);

    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">سبد خرید شما خالی است.</p>';
      saveCart();
      return;
    }

    cartItemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <span class="cart-item-emoji">${escapeHtml(item.emoji || "📦")}</span>
        <div>
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">${faToman(item.price)}</div>
        </div>
        <button class="cart-item-remove" data-idx="${idx}" aria-label="حذف">🗑️</button>
        <div class="cart-item-qty">
          <button class="qty-btn qty-dec" data-idx="${idx}" aria-label="کاهش">−</button>
          <span class="qty-val">${faNum(item.qty)}</span>
          <button class="qty-btn qty-inc" data-idx="${idx}" aria-label="افزایش">+</button>
        </div>
      </div>
    `).join("");
    saveCart();
  }

  function addToCart(name, price) {
    const existing = cart.find((i) => i.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price: +price, qty: 1, emoji: productEmojis[name] || "📦" });
    renderCart();
    toast(`«${name}» به سبد اضافه شد ✓`);
  }

  function initCart() {
    loadCart();
    renderCart();

    $("#cartBtn").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

    $$(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");
        addToCart(card.dataset.name, card.dataset.price);
        if (window.gsap) gsap.fromTo(card, { scale: 1 }, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" });
      });
    });

    cartItemsEl.addEventListener("click", (e) => {
      const idx = +e.target.dataset.idx;
      if (e.target.classList.contains("qty-inc")) cart[idx].qty += 1;
      else if (e.target.classList.contains("qty-dec")) {
        cart[idx].qty -= 1;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      } else if (e.target.classList.contains("cart-item-remove")) cart.splice(idx, 1);
      else return;
      renderCart();
    });

    $("#checkoutBtn").addEventListener("click", () => {
      if (!cart.length) { toast("سبد خرید خالی است!"); return; }
      window.location.href = "checkout.html";
    });
  }

  /* ============================================================
     ۴) جست‌وجو، فیلتر و مرتب‌سازی محصولات
     ============================================================ */
  function initShop() {
    const grid = $("#productsGrid");
    const search = $("#productSearch");
    const sort = $("#productSort");
    const cards = $$(".product-card", grid);
    const count = $("#resultsCount");
    const empty = $("#emptyProducts");
    let activeFilter = "all";

    const normalized = (text) => String(text).trim().toLocaleLowerCase("fa").replace(/[\u200c\s]+/g, " ");

    function applyShopState() {
      const query = normalized(search.value);
      const visible = cards.filter((card) => {
        const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
        const matchesQuery = !query || normalized(card.dataset.name).includes(query);
        const show = matchesCategory && matchesQuery;
        card.hidden = !show;
        return show;
      });

      const sorted = [...cards].sort((a, b) => {
        if (sort.value === "price-asc") return Number(a.dataset.price) - Number(b.dataset.price);
        if (sort.value === "price-desc") return Number(b.dataset.price) - Number(a.dataset.price);
        if (sort.value === "name") return a.dataset.name.localeCompare(b.dataset.name, "fa");
        return Number(b.dataset.popularity) - Number(a.dataset.popularity);
      });
      sorted.forEach((card) => grid.appendChild(card));

      count.textContent = `${faNum(visible.length)} محصول نمایش داده می‌شود`;
      empty.hidden = visible.length !== 0;
    }

    function setFilter(filter) {
      activeFilter = filter;
      $$(".filter-chip").forEach((chip) => {
        const selected = chip.dataset.filter === filter;
        chip.classList.toggle("active", selected);
        chip.setAttribute("aria-pressed", String(selected));
      });
      applyShopState();
    }

    search.addEventListener("input", applyShopState);
    sort.addEventListener("change", applyShopState);
    $("#filterChips").addEventListener("click", (event) => {
      const chip = event.target.closest(".filter-chip");
      if (chip) setFilter(chip.dataset.filter);
    });
    $$(".category-card[data-filter]").forEach((card) => card.addEventListener("click", () => setFilter(card.dataset.filter)));
    $("#clearFilters").addEventListener("click", () => {
      search.value = "";
      sort.value = "popular";
      setFilter("all");
      search.focus();
    });
    applyShopState();
  }

  /* ============================================================
     ۵) تیکر Marquee — تکثیر محتوا برای حلقه بی‌نهایت
     ============================================================ */
  function initTicker() {
    const track = $("#tickerTrack");
    if (!track) return;
    track.innerHTML += track.innerHTML; // دوباره‌سازی برای اسکرول یکپارچه
    if (reducedMotion) track.style.animation = "none";
  }

  /* ============================================================
     ۶) مودال‌ها، ثبت سفارش و پیگیری
     ============================================================ */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.body.classList.add("modal-open");
  }

  function closeModal(modal) {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
    document.body.classList.remove("modal-open");
  }

  function initModals() {
    $$('[data-open-modal]').forEach((button) => button.addEventListener("click", () => openModal(button.dataset.openModal)));
    $$(".modal").forEach((modal) => {
      modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(modal); });
      modal.addEventListener("close", () => document.body.classList.remove("modal-open"));
      $("[data-close-modal]", modal)?.addEventListener("click", () => closeModal(modal));
    });

  }

  /* ============================================================
     ۷) اسکرول نرم، همبرگر، Ripple، خبرنامه
     ============================================================ */
  function initMisc() {
    // همبرگر
    const burger = $("#hamburgerBtn");
    const mobileMenu = $("#mobileMenu");
    burger.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
      mobileMenu.setAttribute("aria-hidden", !open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("#mobileMenu a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      })
    );

    // اسکرول نرم با آفست هدر
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
      });
    });

    // Ripple
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".ripple");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ink = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ink.className = "ripple-ink";
      ink.style.width = ink.style.height = size + "px";
      ink.style.left = e.clientX - rect.left - size / 2 + "px";
      ink.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(ink);
      setTimeout(() => ink.remove(), 650);
    });

    // خبرنامه
    const form = $("#newsletterForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("#newsletterEmail").value.trim();
      const msg = $("#newsletterMsg");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "لطفاً یک ایمیل معتبر وارد کنید.";
        msg.className = "newsletter-msg err";
        return;
      }
      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      msg.textContent = "در حال ثبت عضویت…";
      msg.className = "newsletter-msg";
      try {
        await StoreApi.request("/newsletter", { method: "POST", body: JSON.stringify({ email }) });
        msg.textContent = "عضویت شما با موفقیت ثبت شد! 🎉";
        msg.className = "newsletter-msg ok";
        form.reset();
        toast("به خانواده گجت‌لند خوش آمدید 🎉");
      } catch (error) {
        msg.textContent = error.message;
        msg.className = "newsletter-msg err";
      } finally {
        button.disabled = false;
      }
    });

    $("#currentYear").textContent = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date());
  }

  /* ---------- راه‌اندازی ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initThree();
    initGSAP();
    initTicker();
    initModals();
    initMisc();
  });
})();
