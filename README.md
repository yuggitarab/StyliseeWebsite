# Stylisee Marketing Website

> Application links use the verified custom domain `https://app.stylisee.com`. The application remains hosted on Replit with its existing Clerk authentication, backend, and data.

Static marketing website for [stylisee.com](https://stylisee.com), selling the Stylisee subscription app to personal stylists, image consultants, and colour analysts. The application is separate at [app.stylisee.com](https://app.stylisee.com).

**This repository is the source of truth for the website.** Edit the HTML, CSS and JavaScript here directly. The website is no longer exported from Replit.

## Current structure

```text
StyliseeWebsite/
├── index.html                         # Home
├── pricing/index.html                 # Plans (AUD) with approximate currency conversion
├── about/index.html                   # About
├── contact/index.html                 # Contact form
├── privacy/index.html                 # Privacy policy
├── terms/index.html                   # Terms and conditions
├── refund-policy/index.html           # Refund policy
├── cookie-policy/index.html           # Cookie policy
├── data-processing/index.html         # Data processing
├── security/index.html                # Security
├── 404/index.html                     # Error page, excluded from sitemap
├── assets/
│   ├── site.css                       # All styles for every page
│   ├── site.js                        # Menu, currency conversion, contact form
│   └── images/
│       ├── app/                       # App screenshots (demo data)
│       ├── hero-styling.png
│       └── stylisee-wordmark.png
├── contact-submit.php                 # cPanel enquiry submission endpoint
├── favicon.png                        # Browser icon used by every page
├── robots.txt                         # Includes the sitemap URL
├── sitemap.xml                        # Ten indexable public page URLs
├── .htaccess                          # Apache redirects, error page and caching
├── .cpanel.yml                        # cPanel deployment tasks
├── .gitignore
├── README.md
└── DEPLOY-CPANEL.md
```

Each page folder contains index.html so Apache can serve clean URLs such as /pricing/.

## Technology and design

- Plain HTML, CSS and vanilla JavaScript with no build step. The contact form also requires PHP 8.0+ and a working hosting mail service.
- Every page uses one stylesheet (assets/site.css) and one script (assets/site.js). The header and footer markup is repeated in each page; when changing navigation or footer links, update every page.
- Near-black surfaces, gold and burgundy accents, Cinzel headings and Raleway body text. Colours are defined as variables at the top of site.css.
- **Cache busting:** .htaccess caches CSS and JS for a year. Pages reference `site.css?v=YYYYMMDD` and `site.js?v=YYYYMMDD`. After editing either file, change the `?v=` value in every page (search and replace) so visitors receive the new version.
- Fonts are loaded from Google Fonts.

## Messaging rules

- Only advertise features that exist in the live app. Planned features (for example appointment reminders, emailed invoices, time-slot booking) stay off the website until they ship.
- Plan names, prices and limits must match the app's plan catalogue (currently Basic A$39/month or A$372/year, and Pro A$59/month or A$564/year; there is no Business plan).
- Prices are in AUD. Other currencies are an approximate conversion only; the rates and their date are at the top of assets/site.js.
- The main call to action is "Start your free trial" (14 days, no credit card) linking to https://app.stylisee.com/sign-up. Do not advertise the complimentary 60-day extension; it is granted case by case.
- App screenshots live in assets/images/app/. Capture them from the demo account only (never real client data), and crop out the account email, beta-access banner and any trademarked or third-party names or images.

## Domains and account links

| Purpose | URL |
| --- | --- |
| Marketing website | https://stylisee.com/ |
| Application | https://app.stylisee.com/ |
| Sign In | https://app.stylisee.com/sign-in |
| Get started / Start free trial | https://app.stylisee.com/sign-up |

Do not change the application subdomain DNS while deploying the marketing website.

## Updating content

| Item | Files to update |
| --- | --- |
| Page content | The page's index.html. |
| Styles | assets/site.css, then bump `?v=` in every page. |
| Pricing | pricing/index.html (prices, `data-aud` monthly and `data-aud-yearly` values, and plan features) and the pricing teaser in index.html. Keep in line with the app's plans. |
| Currency rates | AUD_RATES and RATES_UPDATED at the top of assets/site.js, then bump `?v=`. |
| Contact topics | The `<select>` in contact/index.html **and** the allowed list in contact-submit.php must match exactly. |
| Policies | The corresponding policy HTML file; preserve the legal content when changing layout. |
| Navigation and footer | Every page's `<header>` and `<footer>`. |
| Hero image | assets/images/hero-styling.png (used on About and for social sharing) |
| Website wordmark | assets/images/stylisee-wordmark.png |
| Browser favicon | favicon.png. Every page references /favicon.png. |
| Page URLs | Update navigation, canonical links and sitemap.xml together. |

## Sitemap

The search-engine sitemap is at [https://stylisee.com/sitemap.xml](https://stylisee.com/sitemap.xml). It lists Home, Pricing, About, Contact, Privacy, Terms, Refund Policy, Cookie Policy, Data Processing and Security. It excludes the 404 page, assets and the separate application subdomain. Refresh lastmod values when page content changes.

## Editing workflow

1. Create a branch for each change.
2. Preview locally through an HTTP server (not file://, because asset paths start at the site root).
3. Review, then merge to main and push to GitHub.
4. In cPanel: **Git Version Control → Manage → Pull or Deploy → Update from Remote → Deploy HEAD Commit**.

## Deployment

Serve the repository through a local HTTP server or a staging web host. Do not rely on opening index.html with file:// because asset URLs begin at the website root.

See [DEPLOY-CPANEL.md](DEPLOY-CPANEL.md) for deployment instructions. The checked-in .cpanel.yml deploys the static pages and complete assets folder to /home/stylisee/public_html, without deleting unrelated files. It preserves an existing server .htaccess.

After GitHub updates, use **cPanel → Git Version Control → Manage → Pull or Deploy → Update from Remote → Deploy HEAD Commit**. Updating GitHub or pulling into a separate repository directory alone does not update the live website.

## Contact-form delivery

Deploy contact-submit.php at the website root together with contact/index.html and its referenced assets. Email delivery runs on cPanel.

The handler validates required fields, email addresses and topics, rejects cross-site browser requests and a bot-trap field, and limits valid attempts to five per hour per client IP. It sends plain-text email from support@stylisee.com to support@stylisee.com, with the visitor address in Reply-To. Only timestamps are stored in a private temporary rate-limit directory; enquiry text is not saved by the handler.

Sending disables the submit button. Failure keeps the form values and shows an error. PHP mail() confirms host acceptance, not final inbox delivery. Confirm the support mailbox, hosting mail routing, and SPF/DKIM settings, and check the inbox and spam folder after a real enquiry. A false success is not shown when the host rejects the message.

## Cleanup safety

Before deleting an asset, check all HTML, CSS and JavaScript references, including policy and error pages. Keep a backup. Manual uploads generally do not remove obsolete files from cPanel automatically. Verify references before removing old server copies, and avoid deleting unrelated hosting files.

## Before going live

- Confirm prices and policy content are accurate.
- Test Sign In, Get started, menu, monthly/yearly switch, currency selector, FAQs and contact validation.
- Check desktop and mobile layouts, keyboard navigation and colour contrast.
- Verify the favicon, images, HTTPS redirects and real 404 response.
- Confirm sitemap.xml and robots.txt are accessible.
- Review legal pages with a qualified adviser and confirm support email is monitored.
- Keep credentials, secrets and .env files out of this repository.
