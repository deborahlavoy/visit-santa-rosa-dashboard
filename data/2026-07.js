// =============================================================================
// July 2026 — Visit Santa Rosa
// Source: Santa_Rosa_Ad_Attribution_-_July_Only_(2).xlsx (Azira) + internal
//         console spend export. Demographics from the Aug 18 2026 CSV pull.
// This file was built from the dashboard you were already generating for
// July, so the numbers here should match that report exactly.
// =============================================================================

window.REPORTS.push({
  month: '2026-07',
  label: 'July 2026',

  notes: "Starting this month, Azira's Ad Attribution export no longer separates hotel visits from citywide visits, and no longer includes weekly hotel-level or DMA/state-level breakdowns. Visit and visitor totals below reflect all exposed visits/visitors across the Santa Rosa region; the hotel table shows individual property visits, which are a subset already included in that regional total (not additional visits on top of it).",

  // Azira "Cumulative" tab — this month only (Visit Dates: 2026-07-01 to 2026-07-31)
  visits: 129564,
  visitors: 17018,

  // Azira "Summary" tab — campaign-to-date (Impression Dates: 2026-01-01 to 2026-07-31)
  cumulativeImpressions: 3871825,
  cumulativeClicks: 27855,
  cumulativeCtr: 0.72,

  // Internal console export — July billing
  spend: {
    total: 15030.06,
    byTactic: [
      { tactic: 'Display', spend: 11153.54 },
      { tactic: 'PreRoll / Video', spend: 2578.14 },
      { tactic: 'cTV / OTT', spend: 1298.38 },
    ],
  },

  // Azira "Weeks" tab — weeks falling in July's visit-date window
  // (Jun 28-Jul 4 is a partial cross-month week, included for continuity but
  // excluded from the automatic "best week" pick)
  weeklyTrends: [
    { week: 'Jun 28 - Jul 4',  impressions: 318294, clicks: 1145, visits: 13028, visitors: 5891,  vpm: 40.93, partial: true  },
    { week: 'Jul 5 - 11',      impressions: 382003, clicks: 1252, visits: 25402, visitors: 8083,  vpm: 66.50, partial: false },
    { week: 'Jul 12 - 18',     impressions: 377329, clicks: 1728, visits: 26123, visitors: 8289,  vpm: 69.23, partial: false },
    { week: 'Jul 19 - 25',     impressions: 470105, clicks: 2043, visits: 31776, visitors: 10654, vpm: 67.59, partial: false },
    { week: 'Jul 26 - 31',     impressions: 436170, clicks: 1275, visits: 33235, visitors: 11546, vpm: 76.20, partial: false },
  ],

  // Azira "Day of Week Visits" tab
  dayOfWeek: [
    { day: 'Sun', visits: 15838, visitors: 8051 },
    { day: 'Mon', visits: 16957, visitors: 8472 },
    { day: 'Tue', visits: 17804, visitors: 8812 },
    { day: 'Wed', visits: 21536, visitors: 9462 },
    { day: 'Thu', visits: 21278, visitors: 9476 },
    { day: 'Fri', visits: 20700, visitors: 9292 },
    { day: 'Sat', visits: 15451, visitors: 7803 },
  ],

  // Azira "Ad Size" tab
  adSizes: [
    { size: '320x50',    impressions: 1181548, clicks: 8352, visits: 83179, visitors: 9390, vpm: 70.40  },
    { size: '300x250',   impressions: 1112617, clicks: 9015, visits: 61309, visitors: 7795, vpm: 55.10  },
    { size: '728x90',    impressions: 739080,  clicks: 3942, visits: 47847, visitors: 6238, vpm: 64.74  },
    { size: '960x540',   impressions: 280352,  clicks: 1213, visits: 23580, visitors: 5585, vpm: 84.11  },
    { size: '300x600',   impressions: 258059,  clicks: 2255, visits: 14224, visitors: 2228, vpm: 55.12  },
    { size: '160x600',   impressions: 274825,  clicks: 2026, visits: 11335, visitors: 1825, vpm: 41.24  },
    { size: '970x250',   impressions: 12265,   clicks: 934,  visits: 5906,  visitors: 732,  vpm: 481.53 },
    { size: '1920x1080', impressions: 13079,   clicks: 118,  visits: 0,     visitors: 0,    vpm: 0      },
  ],

  // Azira "Line Item Names" tab
  lineItems: [
    { name: 'Display — Past Visitor — Mobile',            tactic: 'Display',           impressions: 573091, clicks: 5739, visits: 86323, visitors: 8798, vpm: 150.63 },
    { name: 'Display — Past Visitor — Desktop',           tactic: 'Display',           impressions: 711923, clicks: 3531, visits: 22478, visitors: 3872, vpm: 31.57  },
    { name: 'Video — Past Visitor — Pre-roll Mobile',     tactic: 'PreRoll / Video',   impressions: 63995,  clicks: 443,  visits: 18558, visitors: 4017, vpm: 289.99 },
    { name: 'Display — Behavioral — Mobile',              tactic: 'Display',           impressions: 574143, clicks: 4896, visits: 12681, visitors: 2375, vpm: 22.09  },
    { name: 'Display — Retargeting — Desktop',            tactic: 'Display',           impressions: 290247, clicks: 1745, visits: 11719, visitors: 1807, vpm: 40.38  },
    { name: 'Added Value Display — Behavioral — Mobile',  tactic: 'Display',           impressions: 152063, clicks: 975,  visits: 8205,  visitors: 1444, vpm: 53.96  },
    { name: 'Display — Retargeting — Mobile',             tactic: 'Display',           impressions: 250571, clicks: 2790, visits: 8018,  visitors: 933,  vpm: 32.00  },
    { name: 'Display — Behavioral — Desktop',             tactic: 'Display',           impressions: 594847, clicks: 1586, visits: 7848,  visitors: 1664, vpm: 13.19  },
    { name: 'Added Value Display — Behavioral — Desktop', tactic: 'Display',           impressions: 153902, clicks: 547,  visits: 4660,  visitors: 861,  vpm: 30.28  },
    { name: 'Video — Past Visitor — Pre-roll Desktop',    tactic: 'PreRoll / Video',   impressions: 69981,  clicks: 155,  visits: 3851,  visitors: 1069, vpm: 55.03  },
    { name: 'Video — Behavioral — Pre-roll Mobile',       tactic: 'PreRoll / Video',   impressions: 62758,  clicks: 402,  visits: 1601,  visitors: 482,  vpm: 25.51  },
    { name: 'Video — Behavioral — CTV/OTT',               tactic: 'cTV / OTT',         impressions: 33054,  clicks: 234,  visits: 294,   visitors: 138,  vpm: 8.89   },
    { name: 'Video — Behavioral — Pre-roll Desktop',      tactic: 'PreRoll / Video',   impressions: 63643,  clicks: 97,   visits: 461,   visitors: 215,  vpm: 7.24   },
    { name: 'Display — FeBREW-ary — Desktop',             tactic: 'Display',           impressions: 138776, clicks: 2207, visits: 0,     visitors: 0,    vpm: 0      },
    { name: 'Display — FeBREW-ary — Mobile',              tactic: 'Display',           impressions: 138831, clicks: 2508, visits: 0,     visitors: 0,    vpm: 0      },
  ],

  // Azira "Top Locations" tab, minus the aggregate "Santa Rosa, CA Region" row
  // (that total is already captured in `visits` / `visitors` above).
  // hotelADR is an assumed average daily rate used to estimate hotel revenue.
  hotelADR: 142.86,
  topHotels: [
    { name: 'Hyatt Regency Sonoma Wine Country',                    visits: 329, visitors: 213 },
    { name: 'Courtyard by Marriott Santa Rosa',                     visits: 134, visitors: 89  },
    { name: 'Vinaroa Resort And Spa',                               visits: 98,  visitors: 60  },
    { name: 'La Quinta Inn & Suites by Wyndham',                    visits: 66,  visitors: 44  },
    { name: 'Hampton Inn & Suites Santa Rosa Sonoma Wine Country',  visits: 62,  visitors: 45  },
    { name: 'Best Western Garden Inn',                              visits: 59,  visitors: 39  },
    { name: 'Flamingo Resort & Spa (Tapestry by Hilton)',           visits: 52,  visitors: 35  },
    { name: 'Holiday Inn Express Santa Rosa North (IHG)',           visits: 37,  visitors: 24  },
    { name: 'Hilton Garden Inn Sonoma County Airport',              visits: 34,  visitors: 14  },
    { name: 'AC Hotel Santa Rosa Sonoma Wine Country',              visits: 29,  visitors: 26  },
    { name: 'The Sandman (Ascend Hotel Collection)',                visits: 10,  visitors: 9   },
  ],

  // Azira "Visits by Origin City" tab — top 15 by visits
  originCities: [
    { city: 'Berkeley',          state: 'CA', visits: 4506, visitors: 432 },
    { city: 'Fremont',           state: 'CA', visits: 1939, visitors: 374 },
    { city: 'Daly City',         state: 'CA', visits: 1414, visitors: 243 },
    { city: 'Antioch',           state: 'CA', visits: 1106, visitors: 204 },
    { city: 'Alameda',           state: 'CA', visits: 1074, visitors: 183 },
    { city: 'Cotati',            state: 'CA', visits: 1011, visitors: 117 },
    { city: 'Dublin',            state: 'CA', visits: 947,  visitors: 180 },
    { city: 'Fairfield',         state: 'CA', visits: 885,  visitors: 197 },
    { city: 'Brentwood',         state: 'CA', visits: 842,  visitors: 134 },
    { city: 'Concord',           state: 'CA', visits: 841,  visitors: 157 },
    { city: 'Elk Grove',         state: 'CA', visits: 713,  visitors: 87  },
    { city: 'Castro Valley',     state: 'CA', visits: 682,  visitors: 133 },
    { city: 'Belvedere Tiburon', state: 'CA', visits: 519,  visitors: 87  },
    { city: 'Corte Madera',      state: 'CA', visits: 488,  visitors: 66  },
    { city: 'Cloverdale',        state: 'CA', visits: 409,  visitors: 71  },
  ],

  // Not available from Azira's new Ad Attribution export format this month.
  dma: [],
  states: [],

  // Demographics — uploaded separately Aug 18 2026 (not a monthly refresh)
  demographics: {
    gender: [
      { label: 'Male',   count: 297092 },
      { label: 'Female', count: 289267 },
    ],
    age: [
      { band: '18–24', pct: 4.11  },
      { band: '25–29', pct: 8.07  },
      { band: '30–34', pct: 8.37  },
      { band: '35–39', pct: 9.36  },
      { band: '40–44', pct: 8.46  },
      { band: '45–49', pct: 7.95  },
      { band: '50–54', pct: 7.83  },
      { band: '55–59', pct: 8.81  },
      { band: '60–64', pct: 8.75  },
      { band: '65–69', pct: 8.13  },
      { band: '70+',   pct: 20.15 },
    ],
    income: [
      { band: 'Under $15K',  count: 5297   },
      { band: '$15K–$25K',   count: 19832  },
      { band: '$25K–$35K',   count: 26542  },
      { band: '$35K–$50K',   count: 26732  },
      { band: '$50K–$75K',   count: 53261  },
      { band: '$75K–$100K',  count: 81383  },
      { band: '$100K–$150K', count: 110548 },
      { band: '$150K–$200K', count: 71128  },
      { band: '$200K–$250K', count: 47264  },
      { band: '$250K+',      count: 144372 },
    ],
    maritalStatus:    { married: 87952,  notMarried: 104761 },
    homeOwnership:    { owner: 209590,   notOwner: 45235    },
    dwellingType:     { singleFamily: 483251, multiFamily: 51853 },
    presenceChildren: 40346,
    seniorsPresent:   141830,
    veteransPresent:  42589,
    charity: [
      { label: 'Children',       count: 14401 },
      { label: 'Environment',    count: 14033 },
      { label: 'Health',         count: 13784 },
      { label: 'Religious',      count: 13330 },
      { label: 'Animal Welfare', count: 9492  },
      { label: 'Veterans',       count: 9400  },
      { label: 'Arts/Culture',   count: 2042  },
    ],
    media: [
      { label: 'Movie Collector',   count: 44452 },
      { label: 'TV/Movies Watcher', count: 26045 },
      { label: 'Gaming',            count: 10518 },
    ],
    interests: [
      { label: 'Travel',                   count: 99529 },
      { label: 'Home Furnishings & Decor', count: 90279 },
      { label: 'Home & Gardening',         count: 71916 },
      { label: 'Interest in Pets',         count: 71781 },
      { label: 'Crafts',                   count: 65418 },
      { label: 'Collectibles/Antiques',    count: 63491 },
      { label: 'Cruise Vacations',         count: 30923 },
      { label: 'Diet & Weight Loss',       count: 30512 },
      { label: 'Exercise — Walking',       count: 26214 },
      { label: 'Education Online',         count: 22767 },
      { label: 'Golf',                     count: 22058 },
      { label: 'Domestic Travel',          count: 19800 },
      { label: 'Exercise — Aerobic',       count: 18343 },
      { label: 'Children Interests',       count: 18109 },
      { label: 'Avid Collector',           count: 15252 },
      { label: 'Collectibles (General)',   count: 15252 },
      { label: 'Self Improvement',         count: 13658 },
      { label: 'Exercise — Running',       count: 12825 },
      { label: 'Collectibles — Coins',     count: 10476 },
      { label: 'Snow Skiing',              count: 9941  },
      { label: 'NASCAR',                   count: 9422  },
      { label: 'Hunting/Shooting',         count: 8959  },
      { label: 'Woodworking',              count: 8703  },
      { label: 'Arts & Antiques',          count: 7361  },
      { label: 'Arts',                     count: 7361  },
      { label: 'Dog Owner',                count: 7197  },
      { label: 'Fishing',                  count: 6932  },
      { label: 'Photography',              count: 6340  },
      { label: 'Camping',                  count: 6071  },
      { label: 'Collectibles — Stamps',    count: 5831  },
      { label: 'Cat Owner',                count: 5562  },
      { label: 'Motorcycling',             count: 2406  },
      { label: 'Tennis',                   count: 1942  },
      { label: 'Scuba Diving',             count: 488   },
    ],
  },
});
