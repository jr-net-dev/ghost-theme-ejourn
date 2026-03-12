# Portfolio Filters

The portfolio section uses a horizontal filter bar to let visitors browse images by category. Each filter is a "pill" link that navigates to a page showing only portfolio posts with that tag.

## How it works

Two pieces work together:

1. **Theme partial** (`partials/portfolio-filter.hbs`) — renders the pill bar with links
2. **Ghost routes.yaml** — defines channel routes that list filtered posts

The pill bar appears on every portfolio page (the main `/portfolio/` page and each filtered page like `/portfolio/tearsheets/`). The active pill is highlighted automatically based on which tag's page you're on.

## Adding a new filter

To add a new category (e.g. "Beauty"):

### Step 1: Create the tag in Ghost Admin

Go to Ghost Admin > Tags and create a tag with slug `beauty` and name `Beauty`.

### Step 2: Add a pill to the theme partial

Edit `partials/portfolio-filter.hbs` and add a new line before the closing `</nav>`:

```handlebars
    <a href="/portfolio/beauty/" class="gh-filter-pill">Beauty</a>
```

The `href` must match the route path (step 3). The active pill is highlighted automatically via JavaScript by matching the current URL to the pill's `href`.

### Step 3: Add a channel route to routes.yaml

Edit your `routes.yaml` (Ghost Admin > Settings > Labs > Routes) and add a new entry under `routes:`:

```yaml
  /portfolio/beauty/:
    controller: channel
    filter: tag:portfolio+tag:beauty
    template: edge-index
    data: tag.beauty
```

- `controller: channel` — tells Ghost to list posts on this page
- `filter: tag:portfolio+tag:beauty` — shows only posts tagged with both "portfolio" AND "beauty"
- `template: edge-index` — uses the portfolio masonry grid layout
- `data: tag.beauty` — makes the tag data available to the template (used for pill highlighting)

### Step 4: Rebuild and upload

```bash
npm run zip
```

Upload the new theme zip via Ghost Admin > Settings > Design > Change theme. Then re-upload your updated routes.yaml via Settings > Labs.

### Step 5: Tag your posts

Add the `beauty` tag as a secondary tag to any portfolio posts that belong in this category. Posts can have multiple secondary tags and will appear in each matching filter.

## Renaming a filter

To rename a filter's display text, edit the link text in `partials/portfolio-filter.hbs`. For example, change `>Editorial</a>` to `>Editorial Work</a>`. No routes.yaml changes needed — the slug stays the same.

To change the URL slug, you need to update three things:
1. The tag slug in Ghost Admin
2. The `href`, `@tag.slug` match, route path, filter, and data values
3. Rebuild and re-upload both the theme and routes.yaml

## Removing a filter

1. Delete the `<a>` line from `partials/portfolio-filter.hbs`
2. Remove the corresponding route block from `routes.yaml`
3. Rebuild and re-upload both

The tag and tagged posts can stay as-is — they just won't have a dedicated filter page anymore. Those posts will still appear on the main `/portfolio/` page.

## Example routes.yaml

```yaml
routes:
  /portfolio/tearsheets/:
    controller: channel
    filter: tag:portfolio+tag:tearsheets
    template: edge-index
    data: tag.tearsheets
  /portfolio/editorial/:
    controller: channel
    filter: tag:portfolio+tag:editorial
    template: edge-index
    data: tag.editorial
  /portfolio/fashion/:
    controller: channel
    filter: tag:portfolio+tag:fashion
    template: edge-index
    data: tag.fashion
  /portfolio/lifestyle/:
    controller: channel
    filter: tag:portfolio+tag:lifestyle
    template: edge-index
    data: tag.lifestyle

collections:
  /:
    permalink: /{slug}/
    template: index
    filter: primary_tag:blog
    data: tag.blog
  /portfolio/:
    permalink: /portfolio/{slug}/
    template: edge-index
    filter: primary_tag:portfolio
    data: tag.portfolio

taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
```
