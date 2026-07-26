/* MainStreet AI — site behavior */

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
