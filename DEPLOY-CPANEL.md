# Deploying Stylisee Marketing Site to cPanel

> The website links to the verified custom domain `https://app.stylisee.com` for authentication and pricing. The application remains hosted on Replit with its existing Clerk authentication, backend, and data. Updating GitHub does not itself update cPanel: deploy the latest commit using your cPanel deployment process or upload the updated files. Do not change website, policy, email, or Clerk DNS records as part of this link update.

This guide explains how to upload the static marketing site to a cPanel hosting account
and configure the domain so `stylisee.com` (and `www.stylisee.com`) serve this site while
`app.stylisee.com` continues to run the Replit application.

---

## Prerequisites

- cPanel hosting account with the `stylisee.com` domain added
- FTP / File Manager access or cPanel's Git Version Control
- SSL certificate for `stylisee.com` and `www.stylisee.com` (cPanel AutoSSL or Let's Encrypt)
- DNS access to set A / CNAME records
- PHP 8.0 or newer enabled for stylisee.com and PHP mail() enabled by the host
- A monitored support@stylisee.com mailbox and correctly configured email routing / SPF / DKIM

---

## Step 1 — DNS configuration

Point the apex domain and www subdomain to your hosting server's IP address.
Leave `app.stylisee.com` pointing to Replit — do not change it.

```
stylisee.com.       A     <your-cPanel-server-IP>
www.stylisee.com.   CNAME stylisee.com.
app.stylisee.com.   CNAME <replit-deployment-hostname>   ← leave unchanged
```

DNS propagation can take up to 48 hours. You can test with:

```bash
dig stylisee.com A +short
dig www.stylisee.com CNAME +short
```

---

## Step 2 — Enable SSL

1. Log in to cPanel.
2. Go to **Security → SSL/TLS Status** (or AutoSSL).
3. Run AutoSSL for `stylisee.com` and `www.stylisee.com`.
4. Confirm the certificate covers both the apex and www.
5. The `.htaccess` file in this repo enforces HTTPS automatically once the certificate is active.

---

## Step 3 — Upload files

### Option A — File Manager (manual upload)

1. Log in to cPanel → **Files → File Manager**.
2. Navigate to the document root for `stylisee.com`.
   - For a primary domain this is usually `public_html/`.
   - For an addon domain it may be `public_html/stylisee.com/` or a custom path set during domain setup.
3. Upload all files and folders from this repository, preserving the directory structure.
   - You can zip the repository contents and use **Upload** → **Extract** in File Manager.
4. Ensure hidden files are visible in File Manager (Settings → Show Hidden Files) so `.htaccess` is uploaded.

### Option B — cPanel Git Version Control (recommended)

The repository includes a checked-in .cpanel.yml deployment file targeting /home/stylisee/public_html. It copies the static website and all assets; it does not delete unrelated files or deploy the Replit workspace. Existing server .htaccess settings are preserved; the repository's .htaccess is copied only if one does not already exist. If you intentionally change .htaccess later, review and merge those changes into the server copy separately.

**For the existing cPanel repository:**

1. Open **Files → Git Version Control → Manage** for StyliseeWebsite.
2. Ensure the checked-out branch is main.
3. Open **Pull or Deploy** and click **Update from Remote**.
4. After the pull completes, click **Deploy HEAD Commit**. Pulling alone does not deploy a repository stored outside the document root.
5. Check the deployment status and logs for success.
6. Visit https://stylisee.com/assets/index-C0j6UP0Y.css and confirm it returns CSS, not a 404 page. Check the homepage, images and navigation too.

**For a new cPanel repository:**

- Clone https://github.com/yuggitarab/StyliseeWebsite.git using cPanel Git Version Control.
- Prefer a repository directory outside the public document root, such as /home/stylisee/repositories/StyliseeWebsite. Keep the domain's document root set to /home/stylisee/public_html.
- Select main, then use **Update from Remote → Deploy HEAD Commit** as above.
- If the existing repository is already cloned directly into public_html, the deployment file detects that location and skips copying files onto themselves. Do not move an existing repository just to use this configuration.

**Important:** GitHub pushes do not automatically trigger cPanel pull deployment. Repeat both buttons after future GitHub updates unless a separate automation has been configured. Deployment also requires a clean cPanel repository working tree; direct edits inside the clone may block the pull. Do not discard those edits without backing them up and reviewing them.

### Option C — FTP

Use an FTP client (FileZilla, Cyberduck) with the credentials from cPanel → **FTP Accounts**.
Upload all files and folders to the document root, preserving structure.
Enable "Show hidden files" in your FTP client so `.htaccess` is transferred.

---

## Step 4 — Verify .htaccess is active

1. In cPanel → **Software → Apache Handlers** (or check with your host) that `mod_rewrite` is enabled.
2. Visit `http://stylisee.com` in your browser — you should be redirected to `https://stylisee.com`.
3. Visit `https://www.stylisee.com` — you should be redirected to `https://stylisee.com`.

If redirects do not work, check:
- `mod_rewrite` is enabled on the server
- `AllowOverride All` is set for the document root (ask your host if needed)
- The `.htaccess` file is present in the document root (not a subdirectory)

---

## Step 5 — Verify all pages load

Visit each URL and confirm the correct page loads:

| URL | Expected page |
|-----|--------------|
| `https://stylisee.com/` | Home |
| `https://stylisee.com/pricing/` | Pricing |
| `https://stylisee.com/about/` | About |
| `https://stylisee.com/contact/` | Contact |
| `https://stylisee.com/privacy/` | Privacy Policy |
| `https://stylisee.com/terms/` | Terms & Conditions |
| `https://stylisee.com/refund-policy/` | Refund Policy |
| `https://stylisee.com/cookie-policy/` | Cookie Policy |
| `https://stylisee.com/data-processing/` | Data Processing |
| `https://stylisee.com/security/` | Security |
| `https://stylisee.com/nonexistent-page` | 404 page |

---

## Step 6 — Verify the app subdomain still works

Visit `https://app.stylisee.com/sign-in`, `https://app.stylisee.com/sign-up`, and `https://app.stylisee.com/pricing` and confirm they load normally.
Do not modify the DNS record for `app.stylisee.com`.

---

## Step 7 — Submit sitemap

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add `https://stylisee.com` as a property and verify ownership.
3. Submit `https://stylisee.com/sitemap.xml` under **Sitemaps**.
4. The sitemap includes the ten public content pages, excludes the 404 page and app subdomain, and uses per-page Git modification timestamps. Refresh it when content or page URLs change.
5. Confirm `https://stylisee.com/robots.txt` includes the sitemap address.

---

## Ongoing updates

To update content after deployment:

- **Git deploy**: push to GitHub, then use **Update from Remote** and **Deploy HEAD Commit** in cPanel Git Version Control.
- **File Manager**: edit files directly in cPanel or re-upload changed files.
- **FTP**: overwrite changed files via FTP client.

Test using a local HTTP server or staging host, not by opening index.html with file://: the pages use root-relative asset paths. Verify the live site after uploading.

### Contact-form deployment

Upload or deploy all four contact-form files together:

- contact-submit.php → /home/stylisee/public_html/contact-submit.php
- contact/index.html → /home/stylisee/public_html/contact/index.html
- assets/marketing-f56cb6647c44.js → the same path under public_html
- assets/index-EX2Giq98.css → the same path under public_html

The deployment tasks include the PHP handler and copy it before the updated page. If Deploy HEAD Commit is unavailable, copy these files using File Manager without copying .git or overwriting the existing server .htaccess.

The form sends enquiries to support@stylisee.com and shows an on-page thank-you after PHP mail() reports that the host accepted the email. No acknowledgement email is sent to the visitor. The visitor's address is set as Reply-To, not From. The handler requires server-side PHP; a static-only hosting environment cannot send the enquiry.

Verify the handler URL returns a JSON response with HTTP 405 when opened directly; this is expected because GET cannot send email. If it returns 404, the file has not reached the document root. If PHP source appears, stop using the form and ask the host to enable its PHP handler.

After deploying, verify actual inbox delivery to support@stylisee.com. PHP mail() acceptance alone does not guarantee delivery. Check the mailbox spam folder, cPanel Email Deliverability and Email Routing, and the hosting error log if sending fails. The host must permit outbound mail. If your host requires authenticated SMTP instead, configure an SMTP delivery method rather than reporting success or switching back to mailto. Do not store SMTP credentials in GitHub.

### Contact sending failures after creating the mailbox

Mailbox creation does not enable PHP sending. The handler explicitly uses support@stylisee.com as the From address and envelope sender, while retaining the visitor as Reply-To. The fixed envelope sender can satisfy hosting sender restrictions, but cannot bypass a disabled PHP mail() function or a broken mail transport.

For this sending/diagnostics update, replace only /home/stylisee/public_html/contact-submit.php with the latest repository version. No contact HTML, JavaScript, CSS or .htaccess replacement is required. Pulling the repository under /home/stylisee/repositories alone does not replace the live handler.

After one submission, inspect the PHP error log for Stylisee contact entries. Depending on the hosting configuration, these may appear in cPanel Metrics > Errors, the PHP error_log file or the provider's central PHP logs. Do not make private error logs publicly accessible.

- [mail-unavailable]: PHP mail() is disabled or unavailable. Ask the host to enable sending or supply secure authenticated SMTP settings.
- [mail-rejected]: mail() returned false. The log includes any available PHP warning; otherwise the host must inspect sendmail/Exim, sendmail_path and mail.force_extra_parameters. Check that the account can use the fixed local envelope sender.
- [mail-exception]: PHP raised a transport exception; the log records its type and message.

The visitor still receives a generic failure, not internal hosting details. Do not interpret successful local fake-transport tests as proof of live mail delivery. Do not store SMTP passwords in this repository or share them in chat.

The Replit Vite preview does not run PHP or deliver emails. Backend regression checks use a fake mail transport; they do not prove the cPanel mail service or the recipient inbox is configured.

### Current assets and favicon

- Home, Pricing and About currently use assets/index-C0j6UP0Y.css and assets/marketing-index-C0j6UP0Y.js. Contact uses the newly referenced files listed above. Future exports may use new filenames; always upload each page with its referenced assets.
- Legal pages and the 404 page still use assets/style.css and assets/main.js. Keep both until those pages are migrated.
- Every page uses /favicon.png as the browser icon. Keep this file and clear the browser cache if the icon appears stale after replacing its contents.
- The website wordmark is assets/images/stylisee-wordmark.png. The former assets/logo.svg and assets/images/stylisee-monogram.png files are no longer in the repository.
- Manual uploads do not necessarily remove obsolete server files. Back up the site and remove only files confirmed to be unused; do not delete unrelated hosting files.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| HTTP not redirecting to HTTPS | AutoSSL not complete or `mod_rewrite` disabled | Wait for SSL, or ask host to enable `mod_rewrite` |
| www not redirecting to apex | `.htaccess` not being read | Check `AllowOverride All`; ensure `.htaccess` is in document root |
| New CSS, scripts or images return 404 | HTML deployed without the full assets folder, or repository changes not deployed to the document root | Pull main and click Deploy HEAD Commit; inspect deployment logs and verify /home/stylisee/public_html/assets |
| Deploy HEAD Commit unavailable | Missing .cpanel.yml, no branch, or dirty working tree | Pull the commit containing .cpanel.yml, select main, and review local changes before resolving them |
| Contact form reports it cannot send | Missing PHP handler, disabled PHP mail(), or host mail configuration | Check contact-submit.php, PHP configuration, hosting error log, email routing and deliverability settings |
| Thank-you appears but email is missing | Host accepted the email but delivery failed or it went to spam | Check support mailbox, spam, Email Routing and Email Deliverability; mail() does not confirm final delivery |
| Fonts not loading | Google Fonts blocked by browser or network | Self-host fonts if needed |
| 404 page not showing | `ErrorDocument` requires `mod_rewrite` or `AllowOverride` | Check Apache config |
| Hero image slow | Large PNG served without CDN | Consider serving via cPanel's built-in CDN or Cloudflare |

---

## Security notes

- This repository contains **no secrets, credentials, API keys, or database configuration**.
- Do not add `.env` files or any secrets to this repository.
- `app.stylisee.com` credentials (Clerk, database, SMTP, etc.) remain exclusively on Replit.
- Review and update legal pages annually or whenever policies change.
