# Stylisee Marketing Website

Static marketing site for [stylisee.com](https://stylisee.com) — the business suite for personal stylists, image consultants, and colour analysts.

## Structure

```
StyliseeWebsite/
├── index.html                 # Home / landing page
├── pricing/index.html         # Pricing page
├── about/index.html           # About page
├── contact/index.html         # Contact page (mailto-based form)
├── privacy/index.html         # Privacy Policy
├── terms/index.html           # Terms & Conditions
├── refund-policy/index.html   # Refund Policy
├── cookie-policy/index.html   # Cookie Policy
├── data-processing/index.html # Data Processing
├── security/index.html        # Security page
├── 404/index.html             # 404 error page
├── assets/
│   ├── style.css              # Design system CSS (tokens + components)
│   ├── main.js                # Vanilla JS (nav, scroll animations, toggle, form)
│   ├── logo.svg               # Stylisee wordmark
│   └── images/
│       └── hero-styling.png   # Hero image
├── favicon.png
├── robots.txt
├── sitemap.xml
├── .htaccess                  # Apache: HTTPS, www redirect, 404, cache, headers
├── .gitignore
├── README.md                  # This file
└── DEPLOY-CPANEL.md           # cPanel deployment guide
```

## Technology

- Plain HTML5, CSS custom properties, vanilla JavaScript
- No build step, no framework, no npm dependencies
- Design tokens from the Stylisee design system, translated to self-contained CSS variables
- Fonts: Playfair Display (headings) and DM Sans (body) via Google Fonts

## Domain split

| Host | Domain |
|------|--------|
| Marketing website (this repo) | `stylisee.com` / `www.stylisee.com` |
| Application (Replit) | `app.stylisee.com` |

All Sign In and Sign Up links point to `https://app.stylisee.com/sign-in` and
`https://app.stylisee.com/sign-up`. Public booking remains on `app.stylisee.com`.

## Content updates

| What to update | Where |
|---|---|
| Plan features and pricing | Log into app and update via admin; also update `pricing/index.html` if hardcoded |
| Legal policy dates | Edit the `Last updated` line in the relevant page |
| Contact email addresses | Edit `contact/index.html` and corresponding pages |
| Hero image | Replace `assets/images/hero-styling.png` |
| Logo | Replace `assets/logo.svg` and `favicon.png` |

## Before going live

- [ ] Confirm every email address exists and is monitored
- [ ] Confirm pricing proposition against live app plans
- [ ] Confirm all policy dates are current
- [ ] Review all legal pages with a qualified legal adviser
- [ ] Test every link, including Sign In / Sign Up handoff
- [ ] Check desktop, tablet, and mobile layouts
- [ ] Verify keyboard navigation and colour contrast
- [ ] Confirm HTTPS and www redirect work after DNS is pointed
- [ ] Check canonical URLs and Open Graph metadata
- [ ] Submit sitemap to Google Search Console
