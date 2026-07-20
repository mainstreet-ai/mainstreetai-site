/* MainStreet AI — site behavior */

/* ==== CONFIG — fill in at launch ==== */
const CONTACT_WEBHOOK = ""; // n8n production webhook, e.g. "https://<n8n>/webhook/msai-contact"

/* site root (works at domain root and on github.io staging) */
const SITE_ROOT = new URL(
  "..",
  document.querySelector('script[src$="main.js"]').src
).pathname;

/* ==== mobile nav ==== */
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

/* ==== contact form via n8n ==== */
const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = form.querySelector(".form-status");
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.company_hp) return; // honeypot
    if (!CONTACT_WEBHOOK) {
      status.className = "form-status err";
      status.textContent =
        "Form isn't connected yet — call or text (904) 864-8126 instead.";
      return;
    }
    try {
      const res = await fetch(CONTACT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page: location.pathname, ts: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.className = "form-status ok";
      status.textContent = "Got it — we'll be in touch within one business day.";
    } catch {
      status.className = "form-status err";
      status.textContent =
        "Something went wrong. Please call or text (904) 864-8126.";
    }
  });
}
