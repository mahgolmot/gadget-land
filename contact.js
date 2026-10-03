(() => {
  "use strict";
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");

  async function loadPhone() {
    try {
      const data = await StoreApi.request("/settings/public");
      const phone = String(data.settings.support_phone || "").trim();
      const link = document.querySelector("[data-support-phone]");
      if (phone) { link.textContent = phone; link.href = "tel:" + phone.replace(/[^+\d]/g, ""); }
      else { link.textContent = "از فرم پیام استفاده کنید"; link.removeAttribute("href"); }
    } catch (_) { document.querySelector("[data-support-phone]").textContent = "از فرم پیام استفاده کنید"; }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true; button.textContent = "در حال ارسال…"; status.textContent = "";
    try {
      await StoreApi.request("/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      form.reset(); status.textContent = "پیام شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم ✓";
    } catch (error) { status.textContent = error.message || "ارسال پیام ناموفق بود. دوباره تلاش کنید."; }
    finally { button.disabled = false; button.textContent = "ارسال پیام"; }
  });

  loadPhone();
})();
