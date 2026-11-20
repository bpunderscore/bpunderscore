# Troubleshooting

Last updated 2026-11-20. Each problem has symptoms, the cause, how to check, and the fix.

---

## 1. "Enforce HTTPS" is unavailable, or https://www.bpunderscore.com shows a certificate warning

**What GitHub says:** "Unavailable for your site because your domain is not properly configured
to support HTTPS (www.bpunderscore.com)."

**Symptoms**
- `http://www.bpunderscore.com` works, `https://www.bpunderscore.com` shows a browser warning
  (the certificate is for `*.github.io`, not for the domain).
- In Settings > Pages the "Enforce HTTPS" box is grayed out.
- `gh api repos/bpunderscore/bpunderscore/pages` shows `"https_certificate": null`.

**Cause (found 2026-11-20):** the `www` DNS record was a CNAME to `bpunderscore.com` (the main
domain). GitHub requires it to point at `bpunderscore.github.io`. The site still loaded, because
the main domain resolves to GitHub's servers, but GitHub's check for the certificate failed, so
it never issued one.

**The correct DNS setup** (managed at GoDaddy; name servers `ns05` and `ns06.domaincontrol.com`)

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `bpunderscore.github.io` |

Optional: four AAAA records for `@` (GitHub's IPv6 addresses `2606:50c0:8000::153`,
`2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`).

Also required:
- The repo's `CNAME` file contains `www.bpunderscore.com`.
- Settings > Pages > Custom domain is `www.bpunderscore.com`.
- No other `www` record (an A or AAAA record on `www` conflicts with the CNAME).
- If a `CAA` record exists on the domain, it must allow `letsencrypt.org`. There is none now.

**How to check**

```
dig www.bpunderscore.com CNAME +short            # want: bpunderscore.github.io.
dig @1.1.1.1 www.bpunderscore.com CNAME +short   # a public resolver, ignores your local cache
dig @ns05.domaincontrol.com www.bpunderscore.com CNAME +short   # GoDaddy itself
dig bpunderscore.com A +short                    # want the four 185.199.x.153 addresses
gh api repos/bpunderscore/bpunderscore/pages --jq '{cname, https_enforced, https_certificate}'
echo | openssl s_client -servername www.bpunderscore.com -connect www.bpunderscore.com:443 2>/dev/null | openssl x509 -noout -subject -issuer
```

Reading the results:
- The first `dig` shows the old value but the `@1.1.1.1` one shows the new one: your own
  resolver is still caching. The record's TTL is 3600 seconds, so wait up to an hour.
- DNS is right but `https_certificate` is still `null`: GitHub has not re-checked yet. Wait.
- The certificate subject is `*.github.io`: still the default certificate, not yours. After
  GitHub issues one, the subject becomes `www.bpunderscore.com` (issuer Let's Encrypt).

**Fix**
1. At GoDaddy, set the `www` CNAME value to `bpunderscore.github.io`. Keep the four `@` A records.
2. Wait for DNS to spread (minutes, up to an hour with the 3600 second TTL).
3. In Settings > Pages, watch the DNS check. It can take from a few minutes up to a day
   after the DNS is right. If it stays on "DNS check unsuccessful" or the certificate does not
   appear, remove the custom domain, save, add `www.bpunderscore.com` again and save. This starts a
   new check.
4. When "Enforce HTTPS" becomes clickable, tick it. Then `http://` redirects to `https://`.

**State on 2026-11-20:** the CNAME was changed to `bpunderscore.github.io` and was confirmed on
GoDaddy's name servers and on 1.1.1.1 and 8.8.8.8. GitHub had not yet issued a certificate.
Next: wait, then re-run the checks above and tick "Enforce HTTPS".

---

## 2. I pushed to `master` but the site did not change

- Pages usually takes 1 to 3 minutes. Hard refresh (Cmd+Shift+R) to get past the browser cache.
- Check the build: `gh api repos/bpunderscore/bpunderscore/pages/builds/latest --jq '{status, error, commit}'`
  and compare `commit` with `git rev-parse origin/master`. An `error` field gives the reason.
- Look at the live files, not the page: `curl -s http://www.bpunderscore.com/css/main.css | grep -c frost-layer`.

## 3. The styles look different live than on my machine

GitHub Pages builds with its own pinned Jekyll ("legacy" build), not the Jekyll 4 in `Gemfile`.
Most Sass compiles the same, but check after changing styles: curl the live `css/main.css` and
grep for the new rules. Features such as CSS custom properties (`var(--c)`) and `calc()` have
worked so far.

## 4. Nodes will not drag, or the nav and scrolling stopped working

All of it is one script, `js/creative.js`. A syntax error in it breaks everything silently.
- Run `node --check js/creative.js` (it prints nothing when fine).
- Open the browser console for the error.
- Dragging is mouse and pen only. On a touch screen nodes do not move, by design.

## 5. A change in `_config.yml` has no effect

`jekyll serve` does not reload `_config.yml`. Stop it and start it again.

## 6. Analytics shows nothing

- The snippet appears only in production builds with a token set. Check the live page source
  for `cloudflareinsights`. A local `jekyll serve` never includes it.
- In Cloudflare Web Analytics the hostname must match: `www.bpunderscore.com` (and
  `bpunderscore.com` if you use it).
- The first visits can take a few minutes to a few hours to appear. Ad blockers hide your own
  visits.
- Cloudflare Web Analytics cannot count clicks on the contact links (no custom events).

## 7. Local setup problems (macOS)

- `Could not find 'bundler' (2.3.19)`: the system Ruby is 2.6. Install the version the lockfile
  asks for into the project: `gem install bundler:2.3.19`, with
  `bundle config set --local path .gems`, then `bundle install`.
- Run `bundle exec jekyll serve`, not `jekyll serve`.
- `Gemfile.lock` may show as modified after `bundle install` (it adds the macOS platform). Do not
  commit it unless you mean to.

## 8. `git push` is rejected

- `refusing to allow an OAuth App to create or update workflow ... without workflow scope`:
  the GitHub login lacks the `workflow` permission. Run
  `gh auth refresh -h github.com -s workflow`, finish the browser step, push again.
- `403` or `denied to <user>`: you are logged in as the wrong account. Check
  `gh auth status`; the account must have write access to `bpunderscore/bpunderscore`.
- Never push to `upstream` (the template author's repo). Always push to `origin`.
