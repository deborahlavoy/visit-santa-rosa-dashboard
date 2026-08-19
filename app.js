// =============================================================================
// Q1MEDIA CVB DASHBOARD — VISIT SANTA ROSA
// Cumulative, multi-month reporting dashboard.
//
// How this file fits together:
//  - Each month's numbers live in their own file under /data (e.g. data/2026-07.js).
//    Every one of those files just does: window.REPORTS.push({ ...that month's data... })
//  - This file (app.js) never needs to be edited for a normal monthly update. It reads
//    whatever is sitting in window.REPORTS, sorts it by month, and renders the dashboard.
//  - See README.md for the exact steps to add a new month.
// =============================================================================

const { useState, useMemo } = React;
const {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} = Recharts;

if (!window.REPORTS) window.REPORTS = [];

// -----------------------------------------------------------------------------
// BRAND TOKENS
// -----------------------------------------------------------------------------
const brand = {
  purple:          '#3d1d6b',
  purpleSecondary: '#6b2fb3',
  magenta:         '#c724b1',
  lightBlue:       '#7dd3f7',
  textPrimary:     '#1a1a2e',
  textSecondary:   '#6b7280',
  textTertiary:    '#9ca3af',
  bgPage:          '#ffffff',
  bgSurface:       '#f8fafc',
  bgTint:          '#f5f0fa',
  border:          '#e5e7eb',
  success:         '#10b981',
  warning:         '#f59e0b',
  danger:          '#ef4444',
};
const chartColors = [brand.purple, brand.magenta, brand.lightBlue, brand.purpleSecondary, '#9ca3af'];

// -----------------------------------------------------------------------------
// FORMATTERS — every one is null-safe so a field a teammate hasn't filled in
// yet just renders as "—" instead of crashing the page.
// -----------------------------------------------------------------------------
const fmt = {
  number: (n) => (n === null || n === undefined || Number.isNaN(n)) ? '—' : Number(n).toLocaleString('en-US'),
  compact: (n) => {
    if (n === null || n === undefined) return '—';
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return String(n);
  },
  currencyExact: (n) => {
    if (n === null || n === undefined || Number.isNaN(n)) return '—';
    const decimals = Math.abs(n) < 1 ? 4 : 2;
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  },
  currencyCompact: (n) => {
    if (n === null || n === undefined) return '—';
    return '$' + fmt.compact(n);
  },
  percent: (n) => (n === null || n === undefined || Number.isNaN(n)) ? '—' : Number(n).toFixed(2) + '%',
  decimal2: (n) => (n === null || n === undefined || Number.isNaN(n)) ? '—' : Number(n).toFixed(2),
};

const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};
const monthShort = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

// -----------------------------------------------------------------------------
// DATA ENRICHMENT — turns the raw values a teammate typed into data/YYYY-MM.js
// into every derived number the dashboard displays (cost per visit, frequency,
// best week, hotel subtotals, etc). Nothing below this point should ever need
// to be typed by hand into a monthly data file.
// -----------------------------------------------------------------------------
function enrichMonth(raw) {
  const visits = raw.visits ?? null;
  const visitors = raw.visitors ?? null;
  const spendTotal = raw.spend && raw.spend.total != null ? raw.spend.total : null;

  const costPerVisit = (spendTotal != null && visits) ? spendTotal / visits : null;
  const costPerVisitor = (spendTotal != null && visitors) ? spendTotal / visitors : null;
  const frequency = (visits != null && visitors) ? visits / visitors : null;

  let bestWeek = null;
  if (raw.weeklyTrends && raw.weeklyTrends.length) {
    const candidates = raw.weeklyTrends.filter((w) => !w.partial);
    const pool = candidates.length ? candidates : raw.weeklyTrends;
    bestWeek = pool.reduce((best, w) => (best === null || w.visits > best.visits ? w : best), null);
  }

  let hotelVisits = null, hotelVisitors = null, hotelFrequency = null;
  if (raw.topHotels && raw.topHotels.length) {
    hotelVisits = raw.topHotels.reduce((s, h) => s + (h.visits || 0), 0);
    hotelVisitors = raw.topHotels.reduce((s, h) => s + (h.visitors || 0), 0);
    hotelFrequency = hotelVisitors ? hotelVisits / hotelVisitors : null;
  }

  return {
    ...raw,
    visits, visitors, spendTotal,
    costPerVisit, costPerVisitor, frequency,
    bestWeek, hotelVisits, hotelVisitors, hotelFrequency,
  };
}

// -----------------------------------------------------------------------------
// REUSABLE UI PIECES
// -----------------------------------------------------------------------------
const KpiCard = ({ label, value, sub, accent = false }) => (
  <div style={{
    background: brand.bgPage, border: `1px solid ${brand.border}`,
    borderRadius: 12, padding: '16px 18px', minHeight: 100,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  }}>
    <div style={{ fontSize: 11, fontWeight: 500, color: brand.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 600, color: accent ? brand.magenta : brand.textPrimary, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: brand.textTertiary, marginTop: 3 }}>{sub}</div>}
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children, height = 280, note }) => (
  <div style={{ background: brand.bgPage, border: `1px solid ${brand.border}`, borderRadius: 12, padding: 18 }}>
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: brand.textPrimary }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: brand.textSecondary, marginTop: 2 }}>{subtitle}</div>}
    </div>
    <div style={{ width: '100%', height }}>{children}</div>
    {note && <div style={{ marginTop: 10, fontSize: 11, color: brand.textTertiary, lineHeight: 1.5, borderTop: `1px solid ${brand.border}`, paddingTop: 8 }}>{note}</div>}
  </div>
);

const SectionHeading = ({ children }) => (
  <div style={{ margin: '24px 0 12px' }}>
    <div style={{ fontSize: 16, fontWeight: 600, color: brand.textPrimary, display: 'inline-block', paddingBottom: 4, borderBottom: `3px solid ${brand.lightBlue}` }}>{children}</div>
  </div>
);

const NoteBanner = ({ children }) => (
  <div style={{ margin: '0 0 16px', padding: '12px 16px', background: brand.bgTint, borderRadius: 8, border: `1px solid ${brand.purple}22`, fontSize: 12.5, color: brand.textSecondary, lineHeight: 1.6 }}>
    <strong style={{ color: brand.purple }}>Note: </strong>{children}
  </div>
);

const EmptyState = ({ children }) => (
  <div style={{ padding: '28px 16px', textAlign: 'center', color: brand.textTertiary, fontSize: 13, background: brand.bgPage, border: `1px dashed ${brand.border}`, borderRadius: 12 }}>
    {children}
  </div>
);

// Generic ranked table: hotels, origin cities, DMAs, states — anything that's
// "a name plus a few numeric columns, sorted and with an optional share bar."
const RankedTable = ({ rows, getName, columns, shareKey, maxHeight = 420 }) => {
  const sorted = [...rows].sort((a, b) => (b[shareKey] || 0) - (a[shareKey] || 0));
  const max = sorted.length ? (sorted[0][shareKey] || 0) : 0;
  const total = sorted.reduce((s, r) => s + (r[shareKey] || 0), 0);
  return (
    <div style={{ maxHeight, overflowY: 'auto' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${brand.border}` }}>
            <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: brand.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: 'right', padding: '8px 6px', fontSize: 11, color: brand.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{c.label}</th>
            ))}
            <th style={{ textAlign: 'right', padding: '8px 6px', fontSize: 11, color: brand.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const shareVal = row[shareKey] || 0;
            const sharePct = total ? (shareVal / total) * 100 : 0;
            return (
              <tr key={i} style={{ borderBottom: `1px solid ${brand.border}` }}>
                <td style={{ padding: '10px 6px', color: brand.textPrimary, fontWeight: i < 3 ? 600 : 400 }}>{getName(row)}</td>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: '10px 6px', textAlign: 'right', color: c.key === shareKey ? brand.textPrimary : brand.textSecondary, fontWeight: c.key === shareKey && i < 3 ? 600 : 400 }}>
                    {c.format ? c.format(row[c.key]) : fmt.number(row[c.key])}
                  </td>
                ))}
                <td style={{ padding: '10px 6px', minWidth: 110 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, color: brand.textSecondary, minWidth: 38, textAlign: 'right' }}>{sharePct.toFixed(1)}%</span>
                    <div style={{ flex: 1, maxWidth: 60, height: 5, background: brand.border, borderRadius: 3 }}>
                      <div style={{ width: `${max ? (shareVal / max) * 100 : 0}%`, height: 5, background: brand.purple, borderRadius: 3 }} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const SplitDonut = ({ a, b, colorA, colorB }) => {
  const total = a.count + b.count;
  const data = [
    { name: a.label, value: a.count, pct: total ? ((a.count / total) * 100).toFixed(1) : '0.0' },
    { name: b.label, value: b.count, pct: total ? ((b.count / total) * 100).toFixed(1) : '0.0' },
  ];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270}>
            <Cell fill={colorA} /><Cell fill={colorB} />
          </Pie>
          <Tooltip formatter={(v, name, props) => [`${fmt.number(v)} (${props.payload.pct}%)`, name]} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: colorA }}>{data[0].pct}%</div>
        <div style={{ fontSize: 9, color: brand.textTertiary, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3, maxWidth: 52 }}>{data[0].name}</div>
      </div>
    </div>
  );
};

const DonutLegend = ({ items }) => (
  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
        <span style={{ fontSize: 11, color: brand.textSecondary }}>{item.label}</span>
        <span style={{ fontSize: 11, color: brand.textTertiary }}>·</span>
        <span style={{ fontSize: 11, color: brand.textPrimary, fontWeight: 500 }}>{item.pct}%</span>
      </div>
    ))}
  </div>
);

const INTERESTS_PAGE_SIZE = 8;
const InterestsCarousel = ({ data }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / INTERESTS_PAGE_SIZE);
  const slice = data.slice(page * INTERESTS_PAGE_SIZE, (page + 1) * INTERESTS_PAGE_SIZE);
  const maxCount = data[0].count;
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {slice.map((item, i) => {
          const rank = page * INTERESTS_PAGE_SIZE + i + 1;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, textAlign: 'right', fontSize: 11, color: brand.textTertiary, flexShrink: 0 }}>{rank}</div>
              <div style={{ width: 176, fontSize: 13, color: brand.textPrimary, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
              <div style={{ flex: 1, height: 16, background: brand.bgSurface, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(item.count / maxCount) * 100}%`, height: '100%', borderRadius: 3, background: rank <= 3 ? `linear-gradient(90deg, ${brand.purple}, ${brand.purpleSecondary})` : brand.purple, opacity: Math.max(0.4, 1 - (rank - 1) * 0.018) }} />
              </div>
              <div style={{ width: 64, textAlign: 'right', fontSize: 12, color: brand.textSecondary, flexShrink: 0 }}>{fmt.number(item.count)}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
          style={{ padding: '5px 14px', fontSize: 12, borderRadius: 7, fontWeight: 500, cursor: page === 0 ? 'not-allowed' : 'pointer', background: page === 0 ? brand.bgSurface : brand.bgTint, color: page === 0 ? brand.textTertiary : brand.purple, border: `1px solid ${brand.border}` }}>← Prev</button>
        <span style={{ fontSize: 12, color: brand.textTertiary }}>{page + 1} / {totalPages} · {data.length} categories</span>
        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
          style={{ padding: '5px 14px', fontSize: 12, borderRadius: 7, fontWeight: 500, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', background: page === totalPages - 1 ? brand.bgSurface : brand.bgTint, color: page === totalPages - 1 ? brand.textTertiary : brand.purple, border: `1px solid ${brand.border}` }}>Next →</button>
      </div>
    </div>
  );
};

// =============================================================================
// TAB: OVERVIEW (single month)
// =============================================================================
const TabOverview = ({ m }) => (
  <>
    {m.notes && <NoteBanner>{m.notes}</NoteBanner>}
    <SectionHeading>Visitation impact</SectionHeading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
      <KpiCard label="Total visits"     value={fmt.number(m.visits)}    sub="Exposed visits, this month" accent />
      <KpiCard label="Unique visitors"  value={fmt.number(m.visitors)}  sub="Deduplicated devices" />
      <KpiCard label="Cost per visit"   value={fmt.currencyExact(m.costPerVisit)}   sub="Media spend ÷ visits" />
      <KpiCard label="Cost per visitor" value={fmt.currencyExact(m.costPerVisitor)} sub="Media spend ÷ unique visitors" />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: m.bestWeek ? '1.2fr 1fr' : '1fr', gap: 12, marginBottom: 12 }}>
      {m.bestWeek && (
        <div style={{ background: brand.bgTint, border: `1px solid ${brand.purple}22`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>★</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: brand.purple, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Best week</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: brand.textPrimary }}>{fmt.number(m.bestWeek.visits)} visits</div>
            <div style={{ fontSize: 11, color: brand.textSecondary, marginTop: 2 }}>{m.bestWeek.week} · {fmt.number(m.bestWeek.visitors)} unique visitors</div>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: m.hotelFrequency != null ? '1fr 1fr' : '1fr', gap: 12 }}>
        <KpiCard label="Visit frequency" value={fmt.decimal2(m.frequency)} sub="Avg visits per visitor" />
        {m.hotelFrequency != null && <KpiCard label="Hotel visit frequency" value={fmt.decimal2(m.hotelFrequency)} sub="Avg visits per hotel visitor" />}
      </div>
    </div>

    <SectionHeading>Campaign performance</SectionHeading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
      <KpiCard label="Total media spend"        value={fmt.currencyExact(m.spendTotal)}          sub={`${monthLabel(m.month)} billing`} />
      <KpiCard label="Impressions (to date)"    value={fmt.number(m.cumulativeImpressions)}      sub="Campaign-to-date, per source" />
      <KpiCard label="Clicks (to date)"         value={fmt.number(m.cumulativeClicks)}            sub="Campaign-to-date, per source" />
      <KpiCard label="CTR (to date)"            value={fmt.percent(m.cumulativeCtr)}              sub="Campaign-to-date, per source" />
    </div>

    {m.weeklyTrends && m.weeklyTrends.length ? (
      <ChartCard title="Weekly trends" subtitle={`Exposed visits by week — ${monthLabel(m.month)}`} height={280}>
        <ResponsiveContainer>
          <LineChart data={m.weeklyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" stroke={brand.textSecondary} fontSize={10} />
            <YAxis stroke={brand.textSecondary} fontSize={11} tickFormatter={fmt.compact} />
            <Tooltip formatter={(v, name) => [fmt.number(v), name]} />
            <Line type="monotone" dataKey="visits" name="Visits" stroke={brand.purple} strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isBest = m.bestWeek && payload.week === m.bestWeek.week;
                return isBest
                  ? <circle key={`d-${cx}`} cx={cx} cy={cy} r={6} fill={brand.magenta} stroke="#fff" strokeWidth={2} />
                  : <circle key={`d-${cx}`} cx={cx} cy={cy} r={3.5} fill={payload.partial ? brand.textTertiary : brand.purple} />;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    ) : (
      <EmptyState>No weekly breakdown provided for {monthLabel(m.month)}.</EmptyState>
    )}

    <div style={{ marginTop: 12 }}>
      {m.topHotels && m.topHotels.length ? (
        <ChartCard title="Top hotels by exposed visits" subtitle={`Individual property breakdown — ${monthLabel(m.month)}`} height={430}>
          <RankedTable
            rows={m.topHotels.map((h) => ({ ...h, _revenue: m.hotelADR != null ? h.visitors * m.hotelADR : null }))}
            getName={(r) => r.name}
            shareKey="visits"
            columns={[
              { key: 'visits', label: 'Visits' },
              { key: 'visitors', label: 'Visitors' },
              ...(m.hotelADR != null ? [{ key: '_revenue', label: 'Est. Revenue', format: (v) => fmt.currencyExact(v) }] : []),
            ]}
          />
        </ChartCard>
      ) : (
        <EmptyState>No hotel-level breakdown provided for {monthLabel(m.month)}.</EmptyState>
      )}
    </div>
  </>
);

// =============================================================================
// TAB: VISITATION (single month)
// =============================================================================
const TabVisitation = ({ m }) => {
  const hotelsWithRevenue = (m.topHotels || []).map((h) => ({ ...h, _revenue: m.hotelADR != null ? h.visitors * m.hotelADR : null }));
  return (
    <>
      <SectionHeading>Hotel visitation</SectionHeading>
      {m.topHotels && m.topHotels.length ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <KpiCard label="Hotel exposed visits"  value={fmt.number(m.hotelVisits)}    sub="Sum across tracked properties" />
            <KpiCard label="Hotel unique visitors" value={fmt.number(m.hotelVisitors)}  sub="Sum across tracked properties" />
            {m.hotelADR != null && (
              <KpiCard label="Hotel est. revenue" value={fmt.currencyExact(m.hotelVisitors * m.hotelADR)} sub={`Visitors × $${m.hotelADR} ADR`} accent />
            )}
          </div>
          <ChartCard title="Hotel breakdown" subtitle="All tracked properties — visits, visitors, and estimated revenue" height={430}>
            <RankedTable
              rows={hotelsWithRevenue}
              getName={(r) => r.name}
              shareKey="visits"
              columns={[
                { key: 'visits', label: 'Visits' },
                { key: 'visitors', label: 'Visitors' },
                ...(m.hotelADR != null ? [{ key: '_revenue', label: 'Est. Revenue', format: (v) => fmt.currencyExact(v) }] : []),
              ]}
            />
          </ChartCard>
        </>
      ) : (
        <EmptyState>No hotel-level breakdown provided for {monthLabel(m.month)}.</EmptyState>
      )}

      <div style={{ marginTop: 12 }}>
        {m.weeklyTrends && m.weeklyTrends.length ? (
          <ChartCard title="Weekly detail" subtitle={`Exposed visits by week — ${monthLabel(m.month)}`} height={280}>
            <ResponsiveContainer>
              <LineChart data={m.weeklyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" stroke={brand.textSecondary} fontSize={10} />
                <YAxis stroke={brand.textSecondary} fontSize={11} tickFormatter={fmt.compact} />
                <Tooltip formatter={(v, name) => [fmt.number(v), name]} />
                <Line type="monotone" dataKey="visits" name="Visits" stroke={brand.purple} strokeWidth={2.5} dot={{ fill: brand.purple, r: 3.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : null}
      </div>

      <SectionHeading>Origin markets</SectionHeading>
      {m.originCities && m.originCities.length ? (
        <ChartCard title="Top origin cities" subtitle={`Exposed visits and visitors by city — ${monthLabel(m.month)}`} height={410}>
          <RankedTable
            rows={m.originCities}
            getName={(r) => `${r.city}, ${r.state}`}
            shareKey="visits"
            columns={[{ key: 'visits', label: 'Visits' }, { key: 'visitors', label: 'Visitors' }]}
          />
        </ChartCard>
      ) : (
        <EmptyState>No origin-city breakdown provided for {monthLabel(m.month)}.</EmptyState>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        {m.dma && m.dma.length ? (
          <ChartCard title="Top performing DMAs" subtitle="By audience uniques" height={330}>
            <RankedTable rows={m.dma} getName={(r) => r.name} shareKey="uniques" columns={[{ key: 'uniques', label: 'Uniques' }, { key: 'impressions', label: 'Impressions' }]} />
          </ChartCard>
        ) : (
          <EmptyState>DMA breakdown not included in this month's source data.</EmptyState>
        )}
        {m.states && m.states.length ? (
          <ChartCard title="Top performing states" subtitle="By audience uniques" height={330}>
            <RankedTable rows={m.states} getName={(r) => r.name} shareKey="uniques" columns={[{ key: 'uniques', label: 'Uniques' }, { key: 'impressions', label: 'Impressions' }]} />
          </ChartCard>
        ) : (
          <EmptyState>State breakdown not included in this month's source data.</EmptyState>
        )}
      </div>
    </>
  );
};

// =============================================================================
// TAB: DEMOGRAPHICS (single month, optional)
// =============================================================================
const TabDemographics = ({ dem }) => {
  const genderTotal  = dem.gender[0].count + dem.gender[1].count;
  const maritalTotal = dem.maritalStatus.married + dem.maritalStatus.notMarried;
  const ownerTotal   = dem.homeOwnership.owner + dem.homeOwnership.notOwner;
  const dwellTotal   = dem.dwellingType.singleFamily + dem.dwellingType.multiFamily;
  const gpct = (v) => ((v / genderTotal)  * 100).toFixed(1);
  const mpct = (v) => ((v / maritalTotal) * 100).toFixed(1);
  const opct = (v) => ((v / ownerTotal)   * 100).toFixed(1);
  const dpct = (v) => ((v / dwellTotal)   * 100).toFixed(1);
  return (
    <>
      <SectionHeading>Demographics</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
        <ChartCard title="Gender" subtitle="Audience gender composition" height={210}>
          <div style={{ height: 158 }}>
            <SplitDonut a={{ label: dem.gender[0].label, count: dem.gender[0].count }} b={{ label: dem.gender[1].label, count: dem.gender[1].count }} colorA={brand.purple} colorB={brand.magenta} />
          </div>
          <DonutLegend items={[
            { label: dem.gender[0].label, pct: gpct(dem.gender[0].count), color: brand.purple },
            { label: dem.gender[1].label, pct: gpct(dem.gender[1].count), color: brand.magenta },
          ]} />
        </ChartCard>
        <ChartCard title="Age distribution" subtitle="Audience age band breakdown (% of audience)" height={210}>
          <ResponsiveContainer>
            <BarChart data={dem.age} margin={{ top: 5, right: 10, left: -14, bottom: 0 }}>
              <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="band" stroke={brand.textSecondary} fontSize={10} />
              <YAxis stroke={brand.textSecondary} fontSize={10} tickFormatter={(v) => v + '%'} />
              <Tooltip formatter={(v) => v + '%'} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {dem.age.map((entry, i) => (
                  <Cell key={i} fill={i === dem.age.length - 1 ? brand.magenta : i % 2 === 0 ? brand.purple : brand.purpleSecondary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ marginBottom: 12 }}>
        <ChartCard title="Household income" subtitle="Distribution by income band — household count" height={240}>
          <ResponsiveContainer>
            <BarChart data={dem.income} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="band" stroke={brand.textSecondary} fontSize={10} interval={0} tick={{ angle: -18, textAnchor: 'end' }} height={44} />
              <YAxis stroke={brand.textSecondary} fontSize={10} tickFormatter={fmt.compact} />
              <Tooltip formatter={(v) => fmt.number(v) + ' households'} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {dem.income.map((_, i) => <Cell key={i} fill={i >= dem.income.length - 3 ? brand.magenta : brand.purple} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionHeading>Household profile</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <ChartCard title="Marital status" subtitle="" height={190}>
          <div style={{ height: 136 }}>
            <SplitDonut a={{ label: 'Married', count: dem.maritalStatus.married }} b={{ label: 'Not married', count: dem.maritalStatus.notMarried }} colorA={brand.purple} colorB={brand.lightBlue} />
          </div>
          <DonutLegend items={[
            { label: 'Married', pct: mpct(dem.maritalStatus.married), color: brand.purple },
            { label: 'Not married', pct: mpct(dem.maritalStatus.notMarried), color: brand.lightBlue },
          ]} />
        </ChartCard>
        <ChartCard title="Home ownership" subtitle="" height={190}>
          <div style={{ height: 136 }}>
            <SplitDonut a={{ label: 'Owner', count: dem.homeOwnership.owner }} b={{ label: 'Non-owner', count: dem.homeOwnership.notOwner }} colorA={brand.purple} colorB={brand.lightBlue} />
          </div>
          <DonutLegend items={[
            { label: 'Owner', pct: opct(dem.homeOwnership.owner), color: brand.purple },
            { label: 'Non-owner', pct: opct(dem.homeOwnership.notOwner), color: brand.lightBlue },
          ]} />
        </ChartCard>
        <ChartCard title="Dwelling type" subtitle="" height={190}>
          <div style={{ height: 136 }}>
            <SplitDonut a={{ label: 'Single family', count: dem.dwellingType.singleFamily }} b={{ label: 'Multi-family', count: dem.dwellingType.multiFamily }} colorA={brand.purple} colorB={brand.lightBlue} />
          </div>
          <DonutLegend items={[
            { label: 'Single family', pct: dpct(dem.dwellingType.singleFamily), color: brand.purple },
            { label: 'Multi-family', pct: dpct(dem.dwellingType.multiFamily), color: brand.lightBlue },
          ]} />
        </ChartCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <KpiCard label="Households w/ children" value={fmt.number(dem.presenceChildren)} sub="One or more children present" />
          <KpiCard label="Households w/ seniors"  value={fmt.number(dem.seniorsPresent)}   sub="Senior adult present" />
          <KpiCard label="Households w/ veterans" value={fmt.number(dem.veteransPresent)}  sub="Veteran present" />
        </div>
      </div>

      <SectionHeading>Interests & giving</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, marginBottom: 12 }}>
        <ChartCard title="Audience interests" subtitle={`Top interest categories by household count — ${dem.interests.length} total`} height={330}>
          <InterestsCarousel data={dem.interests} />
        </ChartCard>
        <ChartCard title="Charitable giving" subtitle="Donors by cause category" height={330}>
          <ResponsiveContainer>
            <BarChart data={dem.charity} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid stroke={brand.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke={brand.textSecondary} fontSize={10} tickFormatter={fmt.compact} />
              <YAxis type="category" dataKey="label" stroke={brand.textSecondary} fontSize={11} width={95} />
              <Tooltip formatter={(v) => fmt.number(v) + ' donors'} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {dem.charity.map((_, i) => <Cell key={i} fill={i === 0 ? brand.magenta : brand.purple} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {dem.media && dem.media.length ? (
        <>
          <SectionHeading>Media consumption</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dem.media.length}, 1fr)`, gap: 12 }}>
            {dem.media.map((item, i) => (
              <KpiCard key={i} label={item.label} value={fmt.number(item.count)} sub="Audience segment — household count" accent={i === 0} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
};

// =============================================================================
// TAB: CAMPAIGN DETAIL (single month)
// =============================================================================
const TabCampaignDetail = ({ m }) => {
  const byTactic = (m.spend && m.spend.byTactic) || [];
  const spendKnownTotal = byTactic.reduce((s, t) => s + (t.spend || 0), 0);
  const activeLines = (m.lineItems || []).filter((r) => r.impressions > 0);

  return (
    <>
      {byTactic.length ? (
        <>
          <SectionHeading>Performance by tactic</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${byTactic.length}, 1fr)`, gap: 12, marginBottom: 12 }}>
            {byTactic.map((t, i) => (
              <KpiCard key={i} label={t.tactic} value={fmt.currencyExact(t.spend)} sub={spendKnownTotal ? `${((t.spend / spendKnownTotal) * 100).toFixed(2)}% of total spend` : ''} accent={i === 0} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <ChartCard title="Spend by tactic" subtitle={`Media cost allocation — ${monthLabel(m.month)}`} height={240}>
              <ResponsiveContainer>
                <BarChart data={byTactic} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="tactic" stroke={brand.textSecondary} fontSize={11} />
                  <YAxis stroke={brand.textSecondary} fontSize={11} tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'K'} />
                  <Tooltip formatter={(v) => fmt.currencyExact(v)} />
                  <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                    {byTactic.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Spend share" subtitle="% of total media spend by tactic" height={240}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byTactic} cx="50%" cy="50%" outerRadius={85} dataKey="spend" nameKey="tactic"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} labelLine={false}>
                    {byTactic.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt.currencyExact(v)} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      ) : (
        <EmptyState>No spend-by-tactic breakdown provided for {monthLabel(m.month)}.</EmptyState>
      )}

      <SectionHeading>Performance by ad format</SectionHeading>
      {m.adSizes && m.adSizes.length ? (
        <ChartCard title="Ad size performance" subtitle="Exposed visits and visits/1K impressions by format" height={320}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${brand.border}` }}>
                  {['Ad Size', 'Impressions', 'Clicks', 'Exp. Visits', 'Exp. Visitors', 'Visits / 1K Impr'].map((h) => (
                    <th key={h} style={{ textAlign: h === 'Ad Size' ? 'left' : 'right', padding: '8px 6px', fontSize: 11, color: brand.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...m.adSizes].sort((a, b) => b.visits - a.visits).map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${brand.border}`, opacity: row.visits === 0 ? 0.45 : 1 }}>
                    <td style={{ padding: '10px 6px', color: brand.textPrimary, fontFamily: 'monospace', fontSize: 12 }}>{row.size}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.number(row.impressions)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.number(row.clicks)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textPrimary, fontWeight: row.visits > 50000 ? 700 : row.visits > 10000 ? 600 : 400 }}>{fmt.number(row.visits)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textPrimary }}>{fmt.number(row.visitors)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: row.vpm > 100 ? brand.magenta : brand.textSecondary, fontWeight: row.vpm > 100 ? 600 : 400 }}>{fmt.decimal2(row.vpm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      ) : (
        <EmptyState>No ad-size breakdown provided for {monthLabel(m.month)}.</EmptyState>
      )}

      <SectionHeading>Visit attribution by line item</SectionHeading>
      {activeLines.length ? (
        <ChartCard title="Line item visit performance" subtitle="Exposed visits and visits/1K by placement — sorted by exposed visits" height={400}>
          <div style={{ maxHeight: 380, overflowX: 'auto', overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${brand.border}` }}>
                  {['Line Item', 'Tactic', 'Impressions', 'Clicks', 'Exp. Visits', 'Exp. Visitors', 'Visits / 1K'].map((h) => (
                    <th key={h} style={{ textAlign: h === 'Line Item' || h === 'Tactic' ? 'left' : 'right', padding: '8px 6px', fontSize: 11, color: brand.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...activeLines].sort((a, b) => b.visits - a.visits).map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${brand.border}`, opacity: row.visits === 0 ? 0.45 : 1 }}>
                    <td style={{ padding: '10px 6px', color: brand.textPrimary, maxWidth: 260 }}>{row.name}</td>
                    <td style={{ padding: '10px 6px', color: brand.textSecondary, whiteSpace: 'nowrap' }}>{row.tactic}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.number(row.impressions)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.number(row.clicks)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textPrimary, fontWeight: row.visits > 10000 ? 700 : row.visits > 3000 ? 600 : 400 }}>{fmt.number(row.visits)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textPrimary }}>{fmt.number(row.visitors)}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', color: row.vpm > 100 ? brand.magenta : brand.textSecondary, fontWeight: row.vpm > 100 ? 600 : 400 }}>{fmt.decimal2(row.vpm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      ) : (
        <EmptyState>No line-item breakdown provided for {monthLabel(m.month)}.</EmptyState>
      )}

      {m.notes && (
        <div style={{ marginTop: 12, padding: '14px 16px', background: brand.bgTint, borderRadius: 8, border: `1px solid ${brand.border}`, fontSize: 12, color: brand.textSecondary, lineHeight: 1.7 }}>
          <strong style={{ color: brand.purple }}>Data source note: </strong>{m.notes}
        </div>
      )}
    </>
  );
};

// =============================================================================
// TAB: YEAR TO DATE / TRENDS (across all months)
// =============================================================================
const TabTrends = ({ months, year, setYear, years }) => {
  const inYear = months.filter((m) => m.month.startsWith(year));
  if (!inYear.length) return <EmptyState>No months loaded for {year} yet.</EmptyState>;

  const totalVisits = inYear.reduce((s, m) => s + (m.visits || 0), 0);
  const totalVisitors = inYear.reduce((s, m) => s + (m.visitors || 0), 0);
  const totalSpend = inYear.reduce((s, m) => s + (m.spendTotal || 0), 0);
  const hasSpend = inYear.some((m) => m.spendTotal != null);
  const avgCostPerVisit = hasSpend && totalVisits ? totalSpend / totalVisits : null;
  const avgCostPerVisitor = hasSpend && totalVisitors ? totalSpend / totalVisitors : null;
  const latest = inYear[inYear.length - 1];

  const chartData = inYear.map((m) => ({
    month: monthShort(m.month),
    visits: m.visits,
    visitors: m.visitors,
    spend: m.spendTotal,
    costPerVisit: m.costPerVisit,
    cumulativeImpressions: m.cumulativeImpressions,
    cumulativeCtr: m.cumulativeCtr,
  }));

  return (
    <>
      {years.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)} style={{
              padding: '6px 16px', fontSize: 13, fontWeight: 500, borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${y === year ? brand.purple : brand.border}`,
              background: y === year ? brand.purple : brand.bgPage,
              color: y === year ? '#fff' : brand.textSecondary,
            }}>{y}</button>
          ))}
        </div>
      )}

      <SectionHeading>{year} year-to-date summary</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <KpiCard label="Total visits (YTD)"   value={fmt.number(totalVisits)}   sub={`Sum across ${inYear.length} month${inYear.length > 1 ? 's' : ''} reported`} accent />
        <KpiCard label="Total visitors (YTD)" value={fmt.number(totalVisitors)} sub="Sum of monthly uniques — may include repeat visitors across months" />
        <KpiCard label="Total media spend (YTD)" value={fmt.currencyExact(hasSpend ? totalSpend : null)} sub={`${year} billing to date`} />
        <KpiCard label="Blended cost per visit"  value={fmt.currencyExact(avgCostPerVisit)} sub="YTD spend ÷ YTD visits" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <KpiCard label="Impressions (to date)" value={fmt.number(latest.cumulativeImpressions)} sub={`As of ${monthLabel(latest.month)}, per source`} />
        <KpiCard label="Clicks (to date)"      value={fmt.number(latest.cumulativeClicks)}      sub={`As of ${monthLabel(latest.month)}, per source`} />
        <KpiCard label="CTR (to date)"         value={fmt.percent(latest.cumulativeCtr)}        sub={`As of ${monthLabel(latest.month)}, per source`} />
        <KpiCard label="Blended cost per visitor" value={fmt.currencyExact(avgCostPerVisitor)}  sub="YTD spend ÷ YTD unique visitors" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <ChartCard title="Visits & visitors by month" subtitle={`Monthly totals — ${year}`} height={280}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke={brand.textSecondary} fontSize={11} />
              <YAxis stroke={brand.textSecondary} fontSize={11} tickFormatter={fmt.compact} />
              <Tooltip formatter={(v, name) => [fmt.number(v), name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="visits" name="Visits" fill={brand.purple} radius={[4, 4, 0, 0]} />
              <Bar dataKey="visitors" name="Visitors" fill={brand.lightBlue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Media spend by month" subtitle={`Monthly billing — ${year}`} height={280}>
          {hasSpend ? (
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke={brand.textSecondary} fontSize={11} />
                <YAxis stroke={brand.textSecondary} fontSize={11} tickFormatter={(v) => '$' + fmt.compact(v)} />
                <Tooltip formatter={(v) => fmt.currencyExact(v)} />
                <Line type="monotone" dataKey="spend" name="Spend" stroke={brand.magenta} strokeWidth={2.5} dot={{ fill: brand.magenta, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState>No spend data entered yet for {year}.</EmptyState>}
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <ChartCard title="Campaign-to-date impressions" subtitle="Cumulative build-up, as reported by source each month" height={260}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke={brand.textSecondary} fontSize={11} />
              <YAxis stroke={brand.textSecondary} fontSize={11} tickFormatter={fmt.compact} />
              <Tooltip formatter={(v) => fmt.number(v)} />
              <Line type="monotone" dataKey="cumulativeImpressions" name="Impressions to date" stroke={brand.purpleSecondary} strokeWidth={2.5} dot={{ fill: brand.purpleSecondary, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Cost per visit by month" subtitle="Monthly spend ÷ monthly visits" height={260}>
          {hasSpend ? (
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke={brand.textSecondary} fontSize={11} />
                <YAxis stroke={brand.textSecondary} fontSize={11} tickFormatter={(v) => '$' + v.toFixed(2)} />
                <Tooltip formatter={(v) => fmt.currencyExact(v)} />
                <Line type="monotone" dataKey="costPerVisit" name="Cost / visit" stroke={brand.success} strokeWidth={2.5} dot={{ fill: brand.success, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState>No spend data entered yet for {year}.</EmptyState>}
        </ChartCard>
      </div>

      <SectionHeading>Month-by-month comparison</SectionHeading>
      <ChartCard title={`${year} monthly detail`} subtitle="Every month reported so far" height={Math.min(60 + inYear.length * 40, 460)}>
        <div style={{ overflowX: 'auto', height: '100%' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${brand.border}` }}>
                {['Month', 'Visits', 'Visitors', 'Spend', 'Cost/Visit', 'Cost/Visitor', 'Impr. to date', 'CTR to date'].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Month' ? 'left' : 'right', padding: '8px 6px', fontSize: 11, color: brand.textSecondary, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inYear.map((m) => (
                <tr key={m.month} style={{ borderBottom: `1px solid ${brand.border}` }}>
                  <td style={{ padding: '10px 6px', color: brand.textPrimary, fontWeight: 600 }}>{monthLabel(m.month)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textPrimary }}>{fmt.number(m.visits)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.number(m.visitors)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.currencyExact(m.spendTotal)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.currencyExact(m.costPerVisit)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.currencyExact(m.costPerVisitor)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.number(m.cumulativeImpressions)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: brand.textSecondary }}>{fmt.percent(m.cumulativeCtr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </>
  );
};

// =============================================================================
// MAIN APP
// =============================================================================
const SUB_TABS_BASE = [
  { id: 'overview',   label: 'Overview'       },
  { id: 'visitation', label: 'Visitation'     },
  { id: 'campaign',   label: 'Campaign Detail' },
];

function App() {
  const months = useMemo(
    () => window.REPORTS.map(enrichMonth).sort((a, b) => a.month.localeCompare(b.month)),
    []
  );
  const years = useMemo(() => [...new Set(months.map((m) => m.month.slice(0, 4)))], [months]);
  const [year, setYear] = useState(years.length ? years[years.length - 1] : String(new Date().getFullYear()));
  const [activeView, setActiveView] = useState(months.length ? months[months.length - 1].month : 'trends');
  const [subTab, setSubTab] = useState('overview');

  if (!months.length) {
    return (
      <div style={{ background: brand.bgSurface, minHeight: '100vh', padding: '48px 32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: brand.textPrimary, marginBottom: 10 }}>No monthly reports loaded yet</div>
          <div style={{ fontSize: 14, color: brand.textSecondary, lineHeight: 1.6 }}>
            Add your first month by copying <code>data/TEMPLATE.js</code> to <code>data/YYYY-MM.js</code>, filling in
            the values, and adding a <code>&lt;script&gt;</code> line for it in <code>index.html</code>. See README.md.
          </div>
        </div>
      </div>
    );
  }

  const activeMonth = activeView !== 'trends' ? months.find((m) => m.month === activeView) : null;
  const subTabs = activeMonth && activeMonth.demographics ? [...SUB_TABS_BASE, { id: 'demographics', label: 'Demographics' }] : SUB_TABS_BASE;

  return (
    <div style={{ background: brand.bgSurface, minHeight: '100vh', padding: '24px 32px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: brand.textPrimary }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 20 }} className="no-print">
        <div>
          <div style={{ fontSize: 12, color: brand.magenta, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Q1Media Visitation Report</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: brand.textPrimary, marginTop: 4 }}>Visit Santa Rosa</div>
          <div style={{ fontSize: 13, color: brand.textSecondary, marginTop: 4 }}>
            {activeView === 'trends' ? `${year} year-to-date` : monthLabel(activeView)}
          </div>
        </div>
        <button onClick={() => window.print()} style={{ fontSize: 12, padding: '7px 14px', background: brand.magenta, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', height: 'fit-content' }}>Export / Print</button>
      </div>

      {/* MONTH / YTD NAV */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }} className="no-print">
        <button onClick={() => setActiveView('trends')} style={{
          padding: '8px 18px', fontSize: 13, fontWeight: 600, borderRadius: 20, cursor: 'pointer',
          border: `1px solid ${activeView === 'trends' ? brand.purple : brand.border}`,
          background: activeView === 'trends' ? brand.purple : brand.bgPage,
          color: activeView === 'trends' ? '#fff' : brand.textSecondary,
        }}>Year to Date</button>
        {months.map((m) => (
          <button key={m.month} onClick={() => { setActiveView(m.month); setSubTab('overview'); }} style={{
            padding: '8px 18px', fontSize: 13, fontWeight: 500, borderRadius: 20, cursor: 'pointer',
            border: `1px solid ${activeView === m.month ? brand.purple : brand.border}`,
            background: activeView === m.month ? brand.purple : brand.bgPage,
            color: activeView === m.month ? '#fff' : brand.textSecondary,
          }}>{monthShort(m.month)}</button>
        ))}
      </div>

      {activeView === 'trends' ? (
        <TabTrends months={months} year={year} setYear={setYear} years={years} />
      ) : (
        <>
          {/* SUB TAB NAV */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${brand.border}`, marginBottom: 20 }} className="no-print">
            {subTabs.map((tab) => (
              <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{
                padding: '12px 20px', fontSize: 13, fontWeight: 500,
                color: subTab === tab.id ? brand.purple : brand.textSecondary,
                background: 'transparent', border: 'none',
                borderBottom: subTab === tab.id ? `3px solid ${brand.magenta}` : '3px solid transparent',
                cursor: 'pointer',
              }}>{tab.label}</button>
            ))}
          </div>
          {subTab === 'overview' && <TabOverview m={activeMonth} />}
          {subTab === 'visitation' && <TabVisitation m={activeMonth} />}
          {subTab === 'demographics' && activeMonth.demographics && <TabDemographics dem={activeMonth.demographics} />}
          {subTab === 'campaign' && <TabCampaignDetail m={activeMonth} />}
        </>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: brand.textTertiary }}>
        <div>Powered by Q1Media location intelligence</div>
        <div>{months.length} month{months.length > 1 ? 's' : ''} loaded · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
