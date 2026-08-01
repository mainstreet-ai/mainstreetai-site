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
`method="POST" action="..."` to a production n8n webhook
(`lineagestudio.app.n8n.cloud/webhook/.../mainstreetai-inquiry`) — there is no
client-side fetch/JS handling of submission. It has a honeypot field
(`company_hp`, visually hidden, `tabindex="-1"`) for basic spam filtering.
When editing this form, keep the honeypot field and the hardcoded webhook
`action` intact unless you're deliberately changing the intake endpoint.

## Conventions

- Every page must go through the `src/` → `build.js` pipeline; never add or
  edit HTML directly under the generated output directories.
- Keep new pages' internal links relative and `{{ROOT}}`-prefixed for
  root-portability.
- Match the existing CSS custom-property palette in `css/style.css` rather
  than introducing new hardcoded colors.
