// =============================================================================
// MONTHLY DATA TEMPLATE — copy this file to data/YYYY-MM.js (e.g. data/2026-08.js)
// and fill in the values below from that month's Azira export + internal
// console/spend numbers. Then add one line to index.html:
//     <script src="data/2026-08.js"></script>
// That's the entire monthly update. See README.md for the full walkthrough.
//
// Rules of thumb:
//  - Leave a field out entirely (or set it to null / an empty array) if you
//    don't have that data for this month — the dashboard will hide that
//    section gracefully instead of showing zeros or breaking.
//  - Every "SOURCE:" comment tells you exactly which tab/column in the Azira
//    export or your console export the number comes from.
//  - Do NOT calculate cost-per-visit, frequency, best week, etc. by hand —
//    the dashboard computes all of that automatically from the raw numbers
//    below. Just paste in what the reports give you.
// =============================================================================

window.REPORTS.push({

  // ---------------------------------------------------------------------
  // IDENTITY
  // ---------------------------------------------------------------------
  month: '2026-08',           // REQUIRED. Format YYYY-MM. This controls sort order and the pill label.
  label: 'August 2026',       // REQUIRED. Human-readable label (not currently displayed but kept for clarity/search).

  // Optional free-text banner shown at the top of this month's Overview and
  // Campaign Detail tabs. Use this to flag anything unusual — a source
  // format change, a missing breakdown, a data gap, etc. Leave as '' to hide it.
  notes: '',

  // ---------------------------------------------------------------------
  // VISITATION — Azira Ad Attribution export → "Cumulative" tab
  // These are THIS MONTH ONLY (the Azira "Visit Dates" window is scoped to
  // the calendar month you're reporting on).
  // ---------------------------------------------------------------------
  visits:   0,   // "Cumulative" tab → "Exposed Visits"
  visitors: 0,   // "Cumulative" tab → "Exposed Visitors"

  // ---------------------------------------------------------------------
  // CAMPAIGN-TO-DATE TOTALS — Azira Ad Attribution export → "Summary" tab
  // IMPORTANT: Azira's impression window runs from campaign start through
  // the end of this month, so these are CUMULATIVE SINCE THE CAMPAIGN
  // STARTED — not just this month. That's normal; the dashboard labels
  // them "to date" and does NOT add them across months.
  // ---------------------------------------------------------------------
  cumulativeImpressions: 0,   // "Summary" tab → "Total Impressions"
  cumulativeClicks: 0,        // "Summary" tab → "Total Clicks"
  cumulativeCtr: 0,           // "Summary" tab → "CTR" (already a %, e.g. 0.72 means 0.72%)

  // ---------------------------------------------------------------------
  // SPEND — from your internal console export, this month's billing only
  // ---------------------------------------------------------------------
  spend: {
    total: 0,                 // this month's total media spend
    // Optional breakdown by tactic — omit or leave empty to hide the
    // "Performance by tactic" charts on the Campaign Detail tab.
    byTactic: [
      // { tactic: 'Display', spend: 0 },
      // { tactic: 'PreRoll / Video', spend: 0 },
      // { tactic: 'cTV / OTT', spend: 0 },
    ],
  },

  // ---------------------------------------------------------------------
  // WEEKLY TREND — Azira Ad Attribution export → "Weeks" tab
  // Include only the weeks that fall within this month's visit-date range.
  // Set partial: true on a week that overlaps into the prior/next month
  // (e.g. a week starting a few days before the 1st) so it's excluded from
  // the automatic "best week" pick but still shown on the chart.
  // Omit this array entirely if a weekly breakdown wasn't provided.
  // ---------------------------------------------------------------------
  weeklyTrends: [
    // { week: '2026-08-02 - 2026-08-08', visits: 0, visitors: 0, impressions: 0, clicks: 0, vpm: 0, partial: false },
  ],

  // ---------------------------------------------------------------------
  // DAY OF WEEK — Azira Ad Attribution export → "Day of Week Visits" tab
  // Optional — omit to hide.
  // ---------------------------------------------------------------------
  dayOfWeek: [
    // { day: 'Sun', visits: 0, visitors: 0 },
    // { day: 'Mon', visits: 0, visitors: 0 },
    // { day: 'Tue', visits: 0, visitors: 0 },
    // { day: 'Wed', visits: 0, visitors: 0 },
    // { day: 'Thu', visits: 0, visitors: 0 },
    // { day: 'Fri', visits: 0, visitors: 0 },
    // { day: 'Sat', visits: 0, visitors: 0 },
  ],

  // ---------------------------------------------------------------------
  // AD SIZE PERFORMANCE — Azira Ad Attribution export → "Ad Size" tab
  // Optional — omit to hide.
  // ---------------------------------------------------------------------
  adSizes: [
    // { size: '300x250', impressions: 0, clicks: 0, visits: 0, visitors: 0, vpm: 0 },
  ],

  // ---------------------------------------------------------------------
  // LINE ITEM ATTRIBUTION — Azira Ad Attribution export → "Line Item Names" tab
  // "tactic" is your own grouping (Display / PreRoll / cTV/OTT / Social / etc)
  // used to roll placements up into the tactic charts. Optional — omit to hide.
  // ---------------------------------------------------------------------
  lineItems: [
    // { name: 'Display — Past Visitor — Mobile', tactic: 'Display', impressions: 0, clicks: 0, visits: 0, visitors: 0, vpm: 0 },
  ],

  // ---------------------------------------------------------------------
  // HOTELS / VENUES — Azira Ad Attribution export → "Top Locations" tab
  // Include ONLY the individual property rows — leave out the aggregate
  // "Santa Rosa, CA Region" row, since that total is already captured by
  // `visits` / `visitors` above.
  //
  // hotelADR (Average Daily Rate) is optional — if you set it, the
  // dashboard will estimate each hotel's revenue as visitors × hotelADR
  // and show an "Est. Revenue" column. Leave it out to hide that column.
  // ---------------------------------------------------------------------
  hotelADR: null,   // e.g. 142.86
  topHotels: [
    // { name: 'Hyatt Regency Sonoma Wine Country', visits: 0, visitors: 0 },
  ],

  // ---------------------------------------------------------------------
  // ORIGIN CITIES — Azira Ad Attribution export → "Visits by Origin City" tab
  // Recommend pasting in the top 15-20 rows by visits. Optional — omit to hide.
  // ---------------------------------------------------------------------
  originCities: [
    // { city: 'Berkeley', state: 'CA', visits: 0, visitors: 0 },
  ],

  // ---------------------------------------------------------------------
  // DMA / STATE BREAKDOWN — only available some months, from the internal
  // console/attribution export. Optional — omit either or both to hide.
  // ---------------------------------------------------------------------
  dma: [
    // { name: 'Sacramento-Stockton-Modesto, CA', uniques: 0, impressions: 0 },
  ],
  states: [
    // { name: 'CA', uniques: 0, impressions: 0 },
  ],

  // ---------------------------------------------------------------------
  // DEMOGRAPHICS — only available when a fresh demographic pull is done
  // (not necessarily every month). Set to null to hide the Demographics
  // tab entirely for this month. If you have data, copy the full shape
  // from a prior month's file (e.g. data/2026-07.js) and update the numbers.
  // ---------------------------------------------------------------------
  demographics: null,

});
