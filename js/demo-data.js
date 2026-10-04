/* Gadget Land — GitHub Pages demo data (frontend-only) */
(() => {
  "use strict";

  const products = [
    { id: 1, variant_id: 101, name: "هدفون بی‌سیم پرو X", price: 3890000, regular_price: 4290000, sale_price: 3890000, stock: 18, sales_count: 92, brand: "Nova", category_slug: "audio", category_name: "صوتی و هدفون", sku: "GL-AUD-101", color: "مشکی", size: "استاندارد", image_path: "assets/home/headphones-studio-web.png", description: "صدای شفاف، طراحی مینیمال و حذف نویز برای استفاده روزمره و کاری.", long_description: "هدفون بی‌سیم پرو X یک انتخاب نمایشی از محصولات گجت‌لند است؛ با طراحی سبک، اتصال بی‌سیم سریع و تجربه‌ای مناسب برای موسیقی و تماس." },
    { id: 2, variant_id: 102, name: "ساعت هوشمند Nova S", price: 3190000, regular_price: 3490000, sale_price: 3190000, stock: 11, sales_count: 81, brand: "Nova", category_slug: "wearable", category_name: "پوشیدنی هوشمند", sku: "GL-WEA-102", color: "مشکی", size: "44mm", image_path: "assets/home/smartwatch-studio-web.png", description: "نمایشگر روشن، طراحی مدرن و همراهی روزانه برای سبک زندگی دیجیتال.", long_description: "ساعت هوشمند Nova S برای نمایش قابلیت‌های یک فروشگاه مدرن انتخاب شده و مشخصات آن صرفاً نمونه‌ی نمایشی هستند." },
    { id: 3, variant_id: 103, name: "ایربادز Air Mini", price: 2490000, regular_price: 2490000, sale_price: 0, stock: 24, sales_count: 76, brand: "Aero", category_slug: "audio", category_name: "صوتی و هدفون", sku: "GL-AUD-103", color: "سفید", size: "استاندارد", image_path: "assets/home/earbuds-studio-web.png", description: "جمع‌وجور، سبک و مناسب تماس و موسیقی در طول روز.", long_description: "ایربادز Air Mini یک محصول نمونه برای نسخه‌ی نمایشی سایت است." },
    { id: 4, variant_id: 104, name: "پاوربانک ۲۰۰۰۰ Ultra", price: 1980000, regular_price: 2190000, sale_price: 1980000, stock: 15, sales_count: 69, brand: "Voltix", category_slug: "power", category_name: "شارژ و انرژی", sku: "GL-PWR-104", color: "مشکی", size: "20000mAh", image_path: "assets/home/charger-studio-web.png", description: "ظرفیت بالا برای شارژ روزانه موبایل و لوازم همراه.", long_description: "این محصول صرفاً برای نمایش کارت محصول، فیلترها و صفحه جزئیات در نسخه‌ی پورتفولیو استفاده شده است." },
    { id: 5, variant_id: 105, name: "شارژر GaN سریع ۶۵ وات", price: 1750000, regular_price: 1890000, sale_price: 1750000, stock: 32, sales_count: 58, brand: "Voltix", category_slug: "power", category_name: "شارژ و انرژی", sku: "GL-PWR-105", color: "سفید", size: "65W", image_path: "assets/home/charger-studio-web.png", description: "شارژر جمع‌وجور GaN برای لپ‌تاپ، تبلت و گوشی‌های سازگار.", long_description: "نمونه‌ای از یک محصول فنی برای نمایش ساختار فروشگاه و قیمت‌گذاری در نسخه‌ی نمایشی." },
    { id: 6, variant_id: 106, name: "هولدر مغناطیسی خودرو", price: 890000, regular_price: 990000, sale_price: 890000, stock: 27, sales_count: 44, brand: "Grip", category_slug: "accessory", category_name: "لوازم جانبی", sku: "GL-ACC-106", color: "مشکی", size: "استاندارد", image_path: "assets/home/smartwatch-studio-web.png", description: "نصب سریع و طراحی ساده برای استفاده ایمن‌تر از موبایل در خودرو.", long_description: "محصول نمونه برای نمایش کارت، صفحه جزئیات و سبد خرید محلی در GitHub Pages." },
    { id: 7, variant_id: 107, name: "کابل Type‑C Pro", price: 420000, regular_price: 420000, sale_price: 0, stock: 46, sales_count: 39, brand: "Voltix", category_slug: "accessory", category_name: "لوازم جانبی", sku: "GL-ACC-107", color: "مشکی", size: "1.5m", image_path: "assets/home/charger-studio-web.png", description: "کابل مقاوم Type‑C برای شارژ و انتقال داده در استفاده روزمره.", long_description: "این مورد نیز بخشی از داده‌های ساختگی نسخه‌ی نمایشی است." },
    { id: 8, variant_id: 108, name: "قاب سیلیکونی آیفون ۱۵", price: 690000, regular_price: 760000, sale_price: 690000, stock: 21, sales_count: 63, brand: "CaseLab", category_slug: "case", category_name: "قاب و محافظ", sku: "GL-CAS-108", color: "بنفش", size: "iPhone 15", image_path: "assets/home/earbuds-studio-web.png", description: "قاب مینیمال با پوشش نرم و لبه‌های محافظ برای استفاده روزانه.", long_description: "محصول نمایشی برای نشان دادن دسته‌بندی، تنوع و صفحه‌ی محصول." },
    { id: 9, variant_id: 109, name: "شارژر رومیزی ۳ پورت", price: 1290000, regular_price: 1290000, sale_price: 0, stock: 19, sales_count: 31, brand: "Voltix", category_slug: "power", category_name: "شارژ و انرژی", sku: "GL-PWR-109", color: "مشکی", size: "3 Port", image_path: "assets/home/charger-studio-web.png", description: "هاب شارژ رومیزی برای مدیریت چند دستگاه در یک نقطه.", long_description: "نمونه محصول برای نسخه‌ی پورتفولیو؛ اطلاعات واقعی فروشگاه در این نسخه استفاده نمی‌شود." },
    { id: 10, variant_id: 110, name: "هدفون Studio Lite", price: 2790000, regular_price: 2790000, sale_price: 0, stock: 9, sales_count: 27, brand: "Aero", category_slug: "audio", category_name: "صوتی و هدفون", sku: "GL-AUD-110", color: "نوک‌مدادی", size: "استاندارد", image_path: "assets/home/headphones-studio-web.png", description: "هدفون سبک با ظاهر استودیویی و کنترل‌های ساده روی بدنه.", long_description: "داده‌ی ساختگی برای نمایش کامل‌تر ویترین فروشگاه." }
  ];

  const categories = [
    { id: 4, slug: "audio", name: "صوتی و هدفون", product_count: 3 },
    { id: 3, slug: "power", name: "شارژ و انرژی", product_count: 3 },
    { id: 2, slug: "accessory", name: "لوازم جانبی", product_count: 2 },
    { id: 1, slug: "case", name: "قاب و محافظ", product_count: 1 },
    { id: 5, slug: "wearable", name: "پوشیدنی هوشمند", product_count: 1 }
  ];

  const brands = [
    { name: "Voltix", product_count: 4, active: 1 },
    { name: "Aero", product_count: 2, active: 1 },
    { name: "Nova", product_count: 2, active: 1 },
    { name: "Grip", product_count: 1, active: 1 },
    { name: "CaseLab", product_count: 1, active: 1 }
  ];

  const reviews = {
    1: [
      { name: "سارا", rating: 5, body: "طراحی خیلی تمیز و حرفه‌ایه. برای نمونه سایت، صفحه محصول هم حس خوبی منتقل می‌کنه.", created_at: "۱۴۰۵/۰۷/۱۲" },
      { name: "مهدی", rating: 4, body: "ظاهر محصول و نمایش جزئیات خوب و مرتب طراحی شده.", created_at: "۱۴۰۵/۰۷/۱۰" }
    ],
    2: [
      { name: "آرمان", rating: 5, body: "نمایش ساعت در کارت‌ها خیلی جذاب شده و صفحه جزئیات هم کامل به نظر می‌رسه.", created_at: "۱۴۰۵/۰۷/۰۹" }
    ],
    3: [
      { name: "نیلو", rating: 5, body: "جمع‌وجور و خوش‌ظاهر؛ برای یک دمو انتخاب خوبی است.", created_at: "۱۴۰۵/۰۷/۰۸" }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getProduct(id) {
    return products.find((item) => Number(item.id) === Number(id)) || null;
  }

  window.DemoStore = {
    products,
    categories,
    brands,
    reviews,
    getProduct
  };

  window.StoreApi = {
    async request(path) {
      const clean = String(path || "").split("?")[0];
      if (clean === "/products" || clean === "products") {
        return { ok: true, products: clone(products) };
      }
      if (clean === "/catalog" || clean === "catalog") {
        return { ok: true, catalog: { categories: clone(categories), brands: clone(brands) } };
      }
      if (clean === "/settings/public" || clean === "settings/public") {
        return { ok: true, settings: { store_name: "گجت‌لند", support_phone: "021-12345678", standard_shipping: 0, express_shipping: 0 } };
      }
      if (clean === "/csrf" || clean === "csrf") {
        return { ok: true, csrf: "demo", user: null };
      }
      const match = clean.match(/^\/products\/(\d+)$/);
      if (match) {
        const product = getProduct(match[1]);
        return product ? { ok: true, product: [clone(product)] } : Promise.reject(new Error("محصول پیدا نشد."));
      }
      const extrasMatch = clean.match(/^\/products\/(\d+)\/extras$/);
      if (extrasMatch) {
        return { ok: true, images: [], reviews: clone(reviews[Number(extrasMatch[1])] || []) };
      }
      const catalogMatch = clean.match(/^\/products\/(\d+)\/catalog$/);
      if (catalogMatch) {
        return { ok: true, catalog: { attributes: [] } };
      }
      return Promise.reject(new Error("این نسخه نمایشی به سرور متصل نیست."));
    }
  };
})();
