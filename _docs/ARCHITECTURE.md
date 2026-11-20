# BP Underscore website: technology and structure

Last updated 2026-11-20. This describes the site as it is on `master`.

## What it is

A one-page marketing site for <https://www.bpunderscore.com>, a small team of technical artists
and pipeline developers (Unreal Engine, Unity, VR, virtual production). The page has a nav, a
hero, About, Services, Contact and a footer. The hero and Contact sections are interactive node
graphs: nodes can be dragged and the wires follow.

There is no backend, no database and no form. The only way to reach the team is the email,
X and Instagram links.

## Technology

| Part | What | Notes |
|---|---|---|
| Generator | Jekyll | Local builds use 4.2.2 (`Gemfile`). GitHub Pages builds with its own pinned Jekyll, see Deployment. |
| Styles | Sass (`.scss`) compiled by Jekyll, Bootstrap 3.4.1 CSS | Custom styles live in `_sass/_hero.scss`. |
| Scripts | jQuery 3.7.1, Bootstrap 3.4.1 JS, jQuery Easing, `js/creative.js` | Plain scripts in the page, no bundler. |
| Fonts | Google Fonts: Open Sans, Merriweather, Bricolage Grotesque, Oswald | Bricolage is the main display font; Oswald is only the "BP" block. |
| Hosting | GitHub Pages, branch `master`, custom domain `www.bpunderscore.com` | `CNAME` file in the repo root. |
| Analytics | Cloudflare Web Analytics | Production builds only, token in `_config.yml`. |

Still loaded but not used by any page (see TODO): Font Awesome 4.3.0, animate.css, wow.js.

## Folder structure

```
_config.yml            site settings: title, contact email, social links, analytics token
_layouts/front.html    page layout: lists the sections in order
_includes/             one file per section (and the page head)
  head.html            <head>: meta tags, fonts, CSS, analytics snippet
  nav.html             top bar: "BP Underscore_" name and three links
  header.html          hero: headline, buttons, hero node graph (inline SVG)
  call-to-action.html  About section ("Our Background"); the file name is a leftover
  services.html        Services: four photo cards
  contact.html         Contact: node graph (inline SVG) and a plain card for phones
  aside.html           footer line
  scripts.html         script tags at the end of the page
  portfolio.html       photo sheet, NOT included in the page right now
_sass/
  _hero.scss           all custom styles (hero, graphs, nav, services, contact)
  _base.scss           styles from the original theme
  _mixins.scss         small Sass mixins from the theme
css/main.scss          Sass entry file: variables, then imports the partials
js/creative.js         page behaviour (see Scripts)
img/header.jpg         the headset photo used by the hero and Services backgrounds
img/portfolio/         six stock photos; 1, 2, 4 and 5 are used by the Services cards
_mockups/              design mockups kept for reference (Jekyll ignores folders starting with _)
_docs/                 these documents (also ignored by Jekyll, so not published)
index.html             front matter only: uses the `front` layout
CNAME, favicon.ico     domain and the "BP" favicon
.gitignore             ignores _site/, .gems/, .bundle/ and other build output
```

## How the page is put together

`_layouts/front.html` includes the sections in this order: head, nav, hero, About, Services,
Contact, footer, scripts. To reorder or remove a section, edit that file.

Contact details are not typed into the templates. The email, X link and Instagram link are in
`_config.yml` (`email`, `x_url`, `instagram_url`) and the templates read them. Changing
`_config.yml` needs a restart of `jekyll serve`.

## The node graphs

The hero (`header.html`) and Contact (`contact.html`) each contain an inline `<svg>` with
nodes and wires. One script drives both. Everything is data in the markup:

- A node is `<g class="node" data-n="name" transform="translate(x y)">` containing a `<rect>`,
  title and pin text, and `<circle>` pins. Pin positions are relative to the node.
- A wire is `<path data-w="fromNode:x,y>toNode:x,y">`. The two `x,y` pairs are pin offsets
  inside each node. The script redraws the curve from these whenever a node moves. The `d`
  attribute in the markup is only the starting shape.
- Special names: a node called `out` or `out2` is an invisible end point far off the right
  edge, so a wire leaves the screen. The hero `out` wire is forced to stay straight. The start
  of a wire may use any name that is not a node (the Contact input wire uses `left`): it then
  counts as a fixed point at 0,0, so its `x,y` are page coordinates in the graph. The end of a
  wire must be a real node, which is why the off-screen ends are invisible nodes.
- To add a node or wire: copy an existing `<g class="node">` or `<path data-w>`, give the node
  a new `data-n`, and point wires at its pins. Keep the pin offsets in the wire in sync with the
  circles in the node.

### What `js/creative.js` does

1. Smooth scrolling for links with `class="page-scroll"`. It stops 68px above the section so
   the fixed nav does not cover the heading.
2. Scrollspy: highlights the nav link of the section you are in. Its offset (69) must stay just
   above the scroll offset (68), or the clicked link will not highlight.
3. Closes the mobile menu when a link is tapped.
4. Dragging: mouse and pen only. Touch is ignored on purpose so the page keeps scrolling. Hero
   nodes can move anywhere in the hero section below the nav. Contact nodes can move anywhere
   in the contact section. After a drag, the next click is cancelled so a drag that starts on a
   link does not open it.
5. Frosted glass: for every node it creates an HTML panel with `backdrop-filter: blur`, placed
   under the SVG and kept in the same position as the node. SVG cannot blur what is behind it,
   which is why these panels exist.
6. Glow: it copies each wire and pin colour into a CSS variable (`--w`) that the glow uses.

### Responsive behaviour

- Hero graph: hidden below 576px. Between 576 and 991px it sits under the headline. From 992px
  it sits to the right of the text and may reach into the right margin.
- Contact graph: shown from 768px. Below that a plain card with the same three links is shown.
- Services cards: four across, two across below 992px, one across below 576px.

## Styles

`css/main.scss` sets two variables (`$theme-primary` blue `#0048b1`, `$theme-dark`), then imports
`mixins`, `base` and `hero` in that order. `hero` loads last so it can override the theme.

`_sass/_hero.scss` is split into labelled blocks: colour tokens, the hero, the shared node and
wire styles (glass, glow), frosted panels, the nav, About (white blueprint grid), Services,
Contact (Unreal-style grid) and the unused photo sheet (`.work`). The colour tokens at the top
(`$ink`, `$panel`, `$text`, `$pin-teal`, `$pin-magenta`, `$pin-gold`) are the shared palette.

Things that are easy to trip over:

- Bootstrap 3 sets the root font size to 10px, so `rem` units come out tiny. The custom styles
  use `px`.
- Bootstrap's clearfix gives `.navbar-collapse::before` `display: table`, which collapses
  absolutely positioned pseudo-elements unless you set `display: block`.
- The nav is styled through `#mainNav` (an id) on purpose, so it wins over the old theme rules.

## Build and run

```
bundle config set --local path .gems    # first time only; the macOS system Ruby is 2.6
bundle install
bundle exec jekyll serve                # http://127.0.0.1:4000
```

Analytics is added only when `JEKYLL_ENV=production` and a token is set, so local runs are not
counted. To check the production output locally: `JEKYLL_ENV=production bundle exec jekyll build`.

## Deployment

Pushing to `master` publishes the site. GitHub Pages is set to build from `master`, folder `/`,
with the "legacy" build type, and the custom domain `www.bpunderscore.com`.

Because the build type is legacy, GitHub builds with its own pinned Jekyll version and ignores
the Jekyll version in `Gemfile`. The site currently compiles correctly there (checked on
2026-11-20), but local builds (Jekyll 4.2.2) and GitHub's build are not guaranteed to match.
After changing Sass, check the live CSS.

HTTPS is not enforced yet, see the to-do list.

## Git

- `origin` is `github.com/bpunderscore/bpunderscore`: push here.
- `upstream` is the original template (`volny/creative-theme-jekyll`). Never push or open pull
  requests there. The repo started as a fork of that template.
- `master` is the live branch. Feature work goes on a branch and is merged into `master` when
  it should go live.
- A GitHub Action file exists locally (`.github/workflows/check.yml`) but is not in git yet,
  because the GitHub login needs the `workflow` permission to push it.

## Browser notes

- The frosted glass needs `backdrop-filter`. Without it the nodes show only the lighter
  translucent fill.
- The hero uses `overflow: hidden` to hide the output wire that runs off the right edge.
- Dragging works with mouse and pen. Touch devices scroll normally and cannot move nodes.
- The graphs are not keyboard operable. They are decoration; every contact link is also a
  normal link (on the contact graph and the phone card).
