# SEO Optimization for Blur Social

This project now follows modern Next.js SEO best practices.

## Implemented Features

### 1. Metadata API
- **Global Metadata**: Defined in `app/layout.tsx`.
- **OpenGraph**: Support for Facebook, LinkedIn, etc.
- **Twitter**: support for X cards.
- **Title Template**: Dynamic titles like "Login | Blur".

### 2. Search Engine Files
- **`robots.ts`**: Located at `/robots.txt` in production.
- **`sitemap.ts`**: Located at `/sitemap.xml` in production.
- **`manifest.ts`**: Located at `/manifest.json` for PWA and SEO.

### 3. Structured Data
- **JSON-LD**: Added to the home page for `WebApplication` schema.

### 4. Assets
- **OG Image**: `/public/og-image.png`
- **Icon**: `/public/icon.png`
