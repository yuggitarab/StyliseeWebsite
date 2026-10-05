# Stylisee Marketing Website

> Application links use the verified custom domain `https://app.stylisee.com`. The application remains hosted on Replit with its existing Clerk authentication, backend, and data.

Static marketing website for [stylisee.com](https://stylisee.com), serving personal stylists, image consultants, and colour analysts. The application is separate at [app.stylisee.com](https://app.stylisee.com).

## Current structure

```text
StyliseeWebsite/
├── index.html                         # Home
├── pricing/index.html                 # Pricing and billing switch
├── about/index.html                   # About
├── contact/index.html                 # Contact form (opens an email client)
├── privacy/index.html                 # Privacy policy
├── terms/index.html                   # Terms and conditions
├── refund-policy/index.html           # Refund policy
├── cookie-policy/index.html           # Cookie policy
├── data-processing/index.html         # Data processing
├── security/index.html                # Security
├── 404/index.html                     # Error page, excluded from sitemap
├── assets/
│   ├── index-C0j6UP0Y.css               # Current marketing-page styles
│   ├── marketing-index-C0j6UP0Y.js      # Menu, pricing, FAQ and contact interactions
│   ├── style.css                      # Existing policy and error-page styles
│   ├── main.js                        # Existing policy and error-page script
│   └── images/
│       ├── hero-styling.png
│       └── stylisee-wordmark.png
├── favicon.png                        # Browser icon used by every page
├── robots.txt                         # Includes the sitemap URL
├── sitemap.xml                        # Ten indexable public page URLs
├── .htaccess                          # Apache redirects, error page and caching
├── .cpanel.yml                        # cPanel deployment tasks
├── .gitignore
├── README.md
└── DEPLOY-CPANEL.md
```

Each page folder contains index.html so Apache can serve clean URLs such as /pricing/. These are dedicated pages, not duplicate homepages.

## Technology and design

- Deployable files are plain HTML, CSS and vanilla JavaScript; no Node.js server, database or package installation is required on cPanel.
- The four main marketing screens are exported from the React/Vite website in the Replit workspace using its shared Stylisee design-system styles. Source packages and workspace folders are deliberately not uploaded to this repository.
- Main marketing pages use near-black surfaces, gold and burgundy accents, square geometry, Cinzel headings and Raleway body text.
- Policy pages and the 404 page currently retain their existing styles, including Playfair Display and DM Sans. Do not delete assets/style.css or assets/main.js until those pages are migrated.
- Fonts are loaded from Google Fonts and require network access.
- Asset filenames can change after a new export. Update the HTML references and upload all newly referenced assets together.

## Domains and account links

| Purpose | URL |
| --- | --- |
| Marketing website | https://stylisee.com/ |
| Application | https://app.stylisee.com/ |
| Sign In | https://app.stylisee.com/sign-in |
| Get Started | https://app.stylisee.com/sign-up |

Do not change the application subdomain DNS while deploying the marketing website.

## Updating content

| Item | Files to update |
| --- | --- |
| Marketing content and design | Update the Replit source and export the four marketing pages and assets, or carefully edit the static files here. A later export may overwrite direct HTML edits. |
| Pricing | Keep pricing/index.html and the pricing data in assets/marketing-index-C0j6UP0Y.js synchronized; update the live application's plans separately if required. |
| Contact | contact/index.html and its marketing script. The form opens a mailto link; it does not send email from a server. |
| Policies | The corresponding policy HTML file; preserve the actual legal content when changing its layout. |
| Hero image | assets/images/hero-styling.png |
| Website wordmark | assets/images/stylisee-wordmark.png |
| Browser favicon | favicon.png. Every page references /favicon.png; replace its contents without changing that path. |
| Page URLs | Update navigation, canonical links and sitemap.xml together. |

The former assets/logo.svg and assets/images/stylisee-monogram.png files have been removed. Do not restore references to those filenames. Preserve the favicon.png file.

## Sitemap

The search-engine sitemap is at [https://stylisee.com/sitemap.xml](https://stylisee.com/sitemap.xml). It lists Home, Pricing, About, Contact, Privacy, Terms, Refund Policy, Cookie Policy, Data Processing and Security. It excludes the 404 page, assets and the separate application subdomain.

The lastmod timestamps reflect the most recent Git commits affecting each page at sitemap generation time. Refresh them when page content changes; do not change every timestamp merely because the sitemap was regenerated. robots.txt already advertises the sitemap URL.

After deploying the file to cPanel, submit sitemap.xml in Google Search Console. A sitemap helps discovery but does not guarantee indexing.

## Preview and deployment

Serve the repository through a local HTTP server or a staging web host. Do not rely on opening index.html with file:// because asset URLs begin at the website root.

See [DEPLOY-CPANEL.md](DEPLOY-CPANEL.md) for deployment instructions. The checked-in .cpanel.yml deploys the static pages and complete assets folder to /home/stylisee/public_html, without deleting unrelated files. It preserves an existing server .htaccess.

After GitHub updates, use **cPanel → Git Version Control → Manage → Pull or Deploy → Update from Remote → Deploy HEAD Commit**. Updating GitHub or pulling into a separate repository directory alone does not update the live website.

## Cleanup safety

Before deleting an asset, check all HTML, CSS and JavaScript references, including policy and error pages. Keep a backup. Manual uploads generally do not remove obsolete files from cPanel automatically. Verify references before removing old server copies, and avoid deleting unrelated hosting files.

## Before going live

- Confirm prices and policy content are accurate.
- Test Sign In, Get Started, menu, pricing switch, FAQs and contact validation.
- Check desktop and mobile layouts, keyboard navigation and colour contrast.
- Verify the favicon, images, HTTPS redirects and real 404 response.
- Confirm sitemap.xml and robots.txt are accessible.
- Review legal pages with a qualified adviser and confirm support email is monitored.
- Keep credentials, secrets and .env files out of this repository.
