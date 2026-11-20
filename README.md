# BP Underscore website

The one-page site for <https://www.bpunderscore.com>, built with Jekyll on top of the
[Creative theme](https://github.com/volny/creative-theme-jekyll) (Start Bootstrap).

## Run it locally

```
bundle config set --local path .gems   # needed with the old system Ruby on macOS (2.6)
bundle install
bundle exec jekyll serve               # http://127.0.0.1:4000
```

Changes to `_config.yml` need a restart of `jekyll serve`.

## Where things are

- Contact email and social links: `_config.yml` (`email`, `x_url`, `instagram_url`)
- Page order: `_layouts/front.html`; each section is a file in `_includes/`
- Hero node graph: `_includes/header.html`; contact node graph: `_includes/contact.html`
- Styles for the hero, nav, services and contact: `_sass/_hero.scss`
- Dragging, wire drawing and frosted panels: `js/creative.js`
- Design mockups (not published): `_mockups/`

The theme is licensed under Apache 2.0, see `LICENCE`.
