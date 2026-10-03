(function () {
  "use strict";

  let csrf = "";
  let sessionPromise = null;

  async function parse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      const error = new Error(data.message || "ارتباط با سرور ناموفق بود.");
      error.status = response.status;
      error.details = data.errors || {};
      throw error;
    }
    return data;
  }

  async function session(force) {
    if (!sessionPromise || force) {
      sessionPromise = fetch("api/csrf", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      }).then(parse).then((data) => {
        csrf = data.csrf || "";
        return data;
      }).catch((error) => {
        sessionPromise = null;
        throw error;
      });
    }
    return sessionPromise;
  }

  async function request(path, options) {
    const config = { credentials: "same-origin", ...(options || {}) };
    const method = String(config.method || "GET").toUpperCase();
    config.headers = { Accept: "application/json", ...(config.headers || {}) };
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      if (!csrf) await session();
      config.headers["X-CSRF-Token"] = csrf;
    }
    const response = await fetch("api" + (path.startsWith("/") ? path : "/" + path), config);
    if (response.status === 419) {
      await session(true);
      config.headers["X-CSRF-Token"] = csrf;
      return parse(await fetch("api" + (path.startsWith("/") ? path : "/" + path), config));
    }
    return parse(response);
  }

  window.StoreApi = { request, session };
})();
