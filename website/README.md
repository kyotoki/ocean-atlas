# svel.app marketing site

A single static page (no build step, no framework) - plain HTML/CSS. Colors, type
scale, spacing, and radius are mirrored 1:1 from `frontend/constants/theme.ts` into
CSS custom properties at the top of `styles.css`, so this reuses the app's exact
visual identity instead of inventing a new one. If you change tokens in `theme.ts`,
update `styles.css` to match.

Files:
- `index.html` - the one marketing page
- `privacy.html` / `terms.html` - "coming soon" placeholders (`noindex`ed so they
  don't get indexed by search engines before real content exists)
- `thanks.html` - shown after a successful email signup
- `404.html` - custom not-found page

## Email capture

The signup form on `index.html` posts directly to Formspree
(`https://formspree.io/f/xykqrzdz`) - no backend needed. Submissions and export
options are in your Formspree dashboard at https://formspree.io/forms. The form
includes a hidden honeypot field (`_gotcha`) for basic spam filtering, and a
`_next` field that redirects back to `thanks.html` after a successful submit.

## Preview locally

No build step - just serve the folder:

```
cd website
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy: Netlify (recommended)

Netlify over Vercel/Cloudflare Pages here mainly because its custom-domain flow
is a couple of clicks and doesn't require moving DNS/nameservers away from
GoDaddy - same is true of Vercel below if you'd rather use that instead.

1. Push this repo to GitHub (if not already).
2. In Netlify: **Add new site > Import an existing project**, pick this repo.
3. Since the site lives in a subfolder of the repo, set:
   - **Base directory**: `website`
   - **Build command**: (leave blank - there isn't one)
   - **Publish directory**: `website` (or `.` if Netlify treats the base
     directory as the root - either works)
4. Deploy. You'll get a temporary `https://<random-name>.netlify.app` URL first.
5. In the site's **Domain settings**, add a custom domain: `svel.app`.
   Netlify will show you the exact DNS records it wants - they should match
   the ones below, but confirm against what's shown in your dashboard.

### DNS records to add at GoDaddy

Keep GoDaddy as your DNS host (no nameserver migration needed) - just add
these two records in GoDaddy's DNS management for `svel.app`:

| Type | Name/Host | Value                     |
|------|-----------|---------------------------|
| A    | `@`       | `75.2.60.5`                |
| CNAME| `www`     | `<your-site-name>.netlify.app` |

Netlify's free SSL certificate provisions automatically once DNS resolves
(usually within minutes, sometimes up to an hour for GoDaddy's propagation).
In Netlify's domain settings you can also choose whether `www.svel.app`
redirects to `svel.app` or vice versa - either is fine, just pick one.

## Deploy: Vercel (equally good alternative)

Same idea, same reason (no nameserver migration required):

1. In Vercel: **Add New Project**, import this repo.
2. Set **Root Directory** to `website`. Framework preset: "Other" (no build
   command, no output directory override needed for plain static HTML).
3. Deploy, then add `svel.app` as a domain in the project's **Settings > Domains**.

### DNS records to add at GoDaddy (Vercel)

| Type | Name/Host | Value                  |
|------|-----------|-------------------------|
| A    | `@`       | `76.76.21.21`            |
| CNAME| `www`     | `cname.vercel-dns.com`  |

(Use either the Netlify records above or the Vercel records here, depending
on which host you actually deploy to - not both.)
