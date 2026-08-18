# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing website for MainStreet AI (mymainstreetai.com), a Jacksonville, FL
automation studio. It's a hand-built, zero-framework static site: no npm
dependencies, no bundler, no CSS framework. It's hosted free on GitHub Pages
and deployed via `CNAME` + `.nojekyll` at the repo root.

## Build

There is no package.json — the only tooling is a single Node script with no
external dependencies.

```
node build.js
```

This reads `src/template.html` + `src/pages.json` + `src/content/<slug>.html`
and writes the finished, fully-inlined pages to the repo root:
- `src/content/index.html` → `index.html`
- `src/content/<slug>.html` → `<slug>/index.html` (e.g. `services/index.html`)

There is no lint or test suite. "Testing" a change means running the build
and opening the affected page(s) in a browser (or serving the repo root with
any static file server) to check layout and links.

## Architecture

**Source of truth is `src/`, not the root HTML files.** The root-level
`index.html`, `services/index.html`, `pricing/index.html`, and
`contact/index.html` are *generated output* — GitHub Pages serves directly
from the repo root, so the build artifacts are committed. Never hand-edit the
root HTML files; edit the source and rebuild, or your changes will be
overwritten on the next build.

- `src/template.html` — the single shared page shell (header, nav, footer,
  JSON-LD business schema). Contains `{{TITLE}}`, `{{DESC}}`, `{{CANONICAL}}`,
  `{{CONTENT}}`, `{{ROOT}}` placeholders.
- `src/pages.json` — the page manifest: one entry per page with `slug`,
  `nav` (which nav link to mark active), `title`, `desc`. Adding a page means
  adding an entry here *and* creating `src/content/<slug>.html`.
- `src/content/<slug>.html` — the body content for each page (no `<html>`/
  `<head>`/nav/footer — just the `<main>` contents).
- `build.js` — does simple string `replaceAll` templating, marks the active
  nav item by regex-matching `data-nav="<slug>"`, then writes output. `index`
  is special-cased to build to the repo root instead of a subfolder.

**`{{ROOT}}` makes the site work at both a custom domain root and a
`github.io` subpath.** It resolves to `./` for the index page and `../` for
every subpage, so all asset/nav links are relative rather than absolute.
Preserve this pattern — don't hardcode `/assets/...`-style absolute paths in
template or content HTML.

- `css/style.css` — single global stylesheet, CSS custom properties in
  `:root` for the palette (navy / goldenrod / sage / terracotta) and
  typography (Fraunces display serif + Work Sans body).
- `js/main.js` — minimal vanilla JS (mobile nav toggle only). Computes
  `SITE_ROOT` from its own `<script>` tag's URL for the same root-portability
  reason as `{{ROOT}}`.
- `assets/` — logo and favicon.

## Forms

The contact form (`src/content/contact.html`) posts directly via
`method="POST" action="https://lineagestudio.app.n8n.cloud/webhook/mainstreetai-inquiry"`.
There is no `fetch()`/`XMLHttpRequest` submission and no `preventDefault()`;
the browser's native POST is what sends the data, which is why there is no CORS
exposure. Keep it that way.

Four fields exist purely for spam filtering. n8n decides on all four in a
single `Spam Gate` Code node; the page itself never blocks anything.

- `msa_ref_code` and `msa_alt_uri` are honeypots, off-screen via `.hp-field`,
  `tabindex="-1"`, `autocomplete="off"`. Their names are deliberately
  meaningless so no browser autofill profile matches them. **Do not rename
  either to anything resembling a real profile field** (`company`, `address`,
  `url`). The previous honeypot was named `company_hp` with a label reading
  "Company", Chrome autofilled it, and real inquiries were silently discarded.
- `msa_ok` is empty in the served HTML and filled by JS on load with the UTC
  date reversed plus `-msa`. A client that POSTs straight at the webhook
  without loading the page leaves it blank. n8n recomputes and compares,
  accepting yesterday/today/tomorrow UTC.
- `msa_t` is filled by a `submit` listener with elapsed milliseconds from
  `performance.now()`, not a wall-clock timestamp, so a visitor with a wrong
  system clock is unaffected. n8n rejects under 3000 ms.

Cloudflare Turnstile markup is present but commented out in two places: the
widget div in the form and the `api.js` loader at the end of the file. Do not
uncomment it until the n8n workflow verifies `cf-turnstile-response` against
`challenges.cloudflare.com/turnstile/v0/siteverify` server side.

## Conventions

- Every page must go through the `src/` → `build.js` pipeline; never add or
  edit HTML directly under the generated output directories.
- Keep new pages' internal links relative and `{{ROOT}}`-prefixed for
  root-portability.
- Match the existing CSS custom-property palette in `css/style.css` rather
  than introducing new hardcoded colors.
