(() => {
  "use strict";
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");
  const link = document.querySelector("[data-support-phone]");
  const phone = "021-12345678";

  if (link) {
    link.textContent = phone;
    link.href = "tel:" + phone.replace(/[^+\d]/g, "");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "ثبت پیام…";
    status.textContent = "";
    window.setTimeout(() => {
      form.reset();
      status.textContent = "این فرم در نسخه نمایشی است؛ پیام واقعی ارسال نمی‌شود. ✓";
      button.disabled = false;
      button.textContent = "ارسال پیام";
    }, 350);
  });
})();
