# Visit Santa Rosa — Cumulative Reporting Dashboard

A single, free-to-host web page for Visit Santa Rosa's monthly reporting. It replaces having to
regenerate a brand-new Claude dashboard every month — instead, each month gets added to this one
page, so the client (and you) can look back at any past month, or see a year-to-date rollup, at any time.

No build tools, no server, no npm install. It's plain HTML/JS that loads React and the chart
library from a CDN. You can even open `index.html` directly in a browser to preview it before
publishing.

## What's in this folder

```
index.html          The page shell. The ONLY file you add a line to each month.
app.js               All of the dashboard's logic and layout. You should not need to touch this
                      for a normal monthly update.
style.css            Minor global styling.
data/
  TEMPLATE.js         Copy this every month. Heavily commented — tells you exactly which tab and
                      column in the Azira export (or your console export) each field comes from.
  2026-07.js          July 2026's data, already filled in, as an example to copy the pattern from.
```

## One-time setup: publish this to GitHub Pages (free hosting)

1. Create a new **private** GitHub repository (e.g. `visit-santa-rosa-dashboard`). Private is fine —
   GitHub Pages can serve a private repo's site if you're on a paid GitHub plan; if you're on a free
   plan the repo (and therefore the published page) will be public, so don't put anything in here you
   wouldn't want the general public to see if they had the link.
2. Upload every file in this folder into that repository (drag-and-drop on github.com works, or use
   `git push` if you're comfortable with git), keeping the `data/` folder structure intact.
3. In the repo, go to **Settings → Pages**. Under "Build and deployment," set **Source** to
   "Deploy from a branch," pick the `main` branch and `/ (root)` folder, then **Save**.
4. GitHub will give you a URL like `https://<your-username>.github.io/visit-santa-rosa-dashboard/`.
   That's the link you can bookmark, share internally, or eventually share with the client.

It can take a minute or two after each update for GitHub Pages to refresh.

## Adding a new month (do this every reporting cycle)

1. **Duplicate the template.** Copy `data/TEMPLATE.js` to a new file named after the month, e.g.
   `data/2026-08.js` for August 2026.
2. **Fill in the numbers.** Open your new file and, using that month's Azira Ad Attribution export
   and your internal console/spend export, fill in each field. Every field has a comment telling you
   exactly which tab and column it comes from. If a section isn't available that month (like the
   DMA/state breakdown that Azira stopped including), just leave that array empty — the dashboard
   will hide that section instead of showing broken or zeroed-out charts.
   - Don't calculate cost-per-visit, frequency, or "best week" yourself — the dashboard works those
     out automatically from the raw numbers you enter.
3. **Add one line to `index.html`.** Find this block near the bottom of the file:
   ```html
   <script src="data/2026-07.js"></script>
   <!-- <script src="data/2026-08.js"></script> -->
   ```
   Uncomment (or add) a line for your new month:
   ```html
   <script src="data/2026-07.js"></script>
   <script src="data/2026-08.js"></script>
   ```
4. **Push the changes to GitHub** (upload the new `data/2026-08.js` file and the updated
   `index.html`). The live page updates automatically once GitHub Pages rebuilds.

That's it — the new month appears as its own tab, and the "Year to Date" view automatically rolls
it into the trend charts and totals.

## What the dashboard shows

- **Year to Date** — a rollup across every month loaded so far: total visits, total spend, blended
  cost per visit, campaign-to-date impressions/clicks/CTR, and month-by-month trend charts and a
  comparison table. If you ever report across more than one calendar year, a year selector appears
  automatically.
- **Each month's tab** — Overview, Visitation (hotels/venues + origin markets), Demographics (only
  shown if that month has a demographics pull), and Campaign Detail (spend by tactic, ad size
  performance, line-item attribution).

## A note on the numbers

Azira's export reports **impressions, clicks, and CTR as campaign-to-date cumulative totals** (the
impression window runs from campaign launch through the current month), while **visits and unique
visitors are scoped to that specific month**. The dashboard is built around that distinction — it
never adds cumulative impression figures across months (that would double-count), but it does sum
visits, visitors, and spend across months for the Year-to-Date totals. If Azira's export format
changes again in the future, just adjust what you paste into the monthly data file — the dashboard's
math doesn't need to change.

## Troubleshooting

- **A month doesn't show up on the page.** Check that you added its `<script>` line in `index.html`
  and that the filename matches exactly (including the `.js` extension).
- **A section is missing or shows "Not available."** That's expected if you left that field's array
  empty in the month's data file — it means that data wasn't available that month, not a bug.
- **The page is blank / shows an error.** Open the file in a text editor and check for a missing
  comma or bracket in the data file you just edited — that's the most common cause. Comparing
  against `data/2026-07.js`'s structure can help spot the mismatch.
