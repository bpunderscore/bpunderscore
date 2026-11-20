# BP Underscore website: dev log and to-do

Newest first. Last updated 2026-11-20.

## To do

### Soon
- [ ] **Enforce HTTPS (in progress).** The `www` CNAME pointed at `bpunderscore.com` instead of
      `bpunderscore.github.io`, so GitHub could not issue a certificate. It was changed on
      2026-11-20 and is live on public DNS. Wait for GitHub to issue the certificate, then tick
      "Enforce HTTPS" in the repo's Pages settings. See `TROUBLESHOOTING.md` section 1.
- [ ] **Check analytics is receiving data.** Visit the live site, then open Cloudflare Web
      Analytics. If nothing shows after a few hours, check the hostname (`www` or not).
- [ ] **Add the GitHub Action.** `.github/workflows/check.yml` exists locally. Run
      `gh auth refresh -h github.com -s workflow`, then commit and push it. It checks that
      `js/creative.js` parses and the site builds. Note it builds with Jekyll 4, not GitHub's
      legacy builder.
- [ ] **Decide about `Gemfile.lock`.** It has a local change (adds the macOS platform, drops the
      Windows-only `wdm`). Either commit it or revert it with `git checkout Gemfile.lock`.
- [ ] **Test on real devices.** Not yet tried: real touch devices, Safari, older iOS, a slow
      laptop while dragging.

### Cleanup (from the 2026-11-20 audit, not done yet)
- [ ] Delete the unused Font Awesome, `fonts/` (Bootstrap glyphs), `css/animate.min.css` and
      `js/wow.min.js`, the matching `<link>` and `<script>` lines, and `new WOW().init()`.
      About 90 KB less per page load and about 1 MB less in the repo.
- [ ] Delete the old navbar rules in `_sass/_base.scss` (the `#mainNav` rules override them),
      the `affix` call in `js/creative.js`, and unused theme classes (`.btn-default`,
      `.text-primary`, `.no-gutter`, `.no-padding`, `.portfolio-box`).
- [ ] Decide what to do with the hidden photo sheet: delete `_includes/portfolio.html`,
      `img/portfolio/3.jpg`, `6.jpg` and the `.work` styles, or bring it back on the page.

### Open design questions
- [ ] Hero nodes are 200 wide, the contact nodes are 240. Matching them would mean stacking the
      hero nodes or putting the graph below the text.
- [ ] The hero text cannot be selected or copied (on purpose, so dragging does not highlight
      it). A narrower fix would block selection only while dragging.
- [ ] Cloudflare Web Analytics has no custom events, so clicks on Email us, X and Instagram are
      not counted. Plausible or Google Analytics would count them.
- [ ] The nav name ("Underscore_") went through several versions; confirm it is final.

### Ideas
- [ ] Social share image and `og:` tags so links to the site preview nicely.
- [ ] A name and description for the contact graph for screen readers.
- [ ] A contrast check with a tool on the hero paragraph over the photo (only checked by eye).
- [ ] Measure drag frame rate; the glow and frosted panels are the likely cost.
- [ ] Upgrade the local Ruby (2.6 is old) so setup is simpler.

## Dev log

### 2026-11-20: analytics, audit round 2, docs
- Added Cloudflare Web Analytics. It loads only in production builds when
  `cloudflare_analytics_token` is set in `_config.yml`.
- Second audit. Fixed: nav highlight lag after a click (scrollspy offset 69), sideways scroll in
  old Safari (`overflow: hidden`), page not scrolling over the graph on touch (touch no longer
  drags), lighter hero paragraph for contrast, cheaper pin glow (a ring instead of a filter).
  Moved the contact email and social links into `_config.yml`. Replaced the template README.
- Saved the node-style mockup in `_mockups/node-styles.html` (not published).
- Moved the "Get in touch" node up so its output wire is flat.
- Checked deployment: GitHub Pages, legacy build from `master`, live site matches the repo.
- Found why HTTPS could not be enforced: the `www` CNAME pointed at the main domain. The user
  changed it to `bpunderscore.github.io`; confirmed live on GoDaddy and public resolvers.
- Wrote the documents in `_docs/` (architecture, dev log and to-do, troubleshooting).

### 2026-11-20: glass nodes and look
- All nodes use the glass style. Real frosted blur comes from HTML panels under the SVG that
  follow the nodes (SVG cannot blur its background). Wires and pins glow in their own colour.
- Hero and Services use the lighter glass photo background. Contact uses an Unreal-style
  dark gray grid. About has a white blueprint grid on the brand blue.
- Hero nodes made bigger (200 wide, 14px text) to match the contact nodes. The graph column
  was widened and the headline now wraps to five lines.
- Site name "Underscore_" made bigger.

### 2026-11-20: node graphs and nav
- Contact became two draggable nodes ("Start a project", "Get in touch") with coloured wires.
  A wire runs in from the left edge and one out to the right. Phones get a plain card.
- Nodes in both graphs roam their whole section. A drag that starts on a link does not open it.
- Hero got an output pin and a wire that runs straight off the right edge.
- Nav redesigned: BP block and name, coloured pin beside each link, no box and no wire.
  Several versions were tried and reversed; the current one is "Underscore_".
- Services: four cards with stock photos tinted brand blue; the photo turns to colour on hover.

### 2026-11-19: setup, first fixes, first redesign
- Cloned `bpunderscore/bpunderscore`, a fork of the Creative theme. Built it locally. The
  macOS system Ruby is 2.6, so gems install into `./.gems`.
- Removed the dead `oss.maxcdn.com` scripts. Contact links set to `contact@bpunderscore.com`,
  `x.com/BpUnderscore` and Instagram. Pushed to `origin` only.
- First audit and fixes: upgraded jQuery to 3.7.1 and Bootstrap to 3.4.1 (known XSS issues in
  the old versions), added meta description, fixed an unclosed contact `div`, added
  accessible names to icon links, recompressed `header.jpg` (422 KB to 179 KB), generated the
  copyright year, deleted unused vendor files and `img/archive`.
- First redesign pass of the hero and contact: Bricolage Grotesque, node-editor look, draggable
  nodes, wires that draw in on load.

## Lessons and gotchas

- **Mockup pages drift.** The review mockups on claude.ai were edited by an automatic reply
  while the repo was edited by hand. Keep one source of truth (the repo) and republish the
  mockup from it, not the other way round.
- **`rem` is tiny** in this site because Bootstrap sets the root font to 10px.
- **Clearfix collapses pseudo-elements.** Set `display: block` on `::before` or `::after` you
  position absolutely inside Bootstrap containers.
- **A script syntax error fails silently** and breaks scrolling, the nav and dragging at once.
  Run `node --check js/creative.js` before pushing.
- **Pushing workflow files** needs the `workflow` permission on the GitHub login.
- **GitHub builds with its own Jekyll.** After changing Sass, look at the live CSS, not only
  the local build.
- **Headless Chrome does not run animated scrolls**, so test scroll-dependent behaviour by
  setting the scroll position directly.
