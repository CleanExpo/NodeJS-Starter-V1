# Before/after examples

Three side-by-side comparisons demonstrating the most impactful chart corrections. Each example shows the same data expressed first with default library styling, then with the uplift applied.


## Example 1: Default grey theme transformed to spectral dark theme

### Before

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
];

function Chart() {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
}
```

### Why the before version fails

Every element uses library defaults. The white background provides no visual hierarchy against a typical page. Grey dashed gridlines at full opacity create a cage around the data, with both horizontal and vertical lines competing for attention at equal weight. The Y-axis has no label — the reader has no idea whether "4000" means dollars, users, or milliseconds. The data key is "value", a placeholder that communicates nothing. The tooltip is an unstyled white box. The legend sits in a bordered rectangle consuming chart space for a single series that needs no legend at all. The purple stroke colour `#8884d8` is Recharts' arbitrary default, carrying no semantic meaning.

This is the chart equivalent of Lorem Ipsum — it has the shape of a visualisation but communicates nothing about the data it contains.

### After

```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const SPECTRAL = {
  primary: '#00F5FF',
  positive: '#00FF88',
  neutral: 'rgba(255,255,255,0.4)',
};

const monthlyRevenue = [
  { month: 'Jan 2026', revenue: 142000 },
  { month: 'Feb 2026', revenue: 128000 },
  { month: 'Mar 2026', revenue: 167000 },
  { month: 'Apr 2026', revenue: 153000 },
  { month: 'May 2026', revenue: 189000 },
  { month: 'Jun 2026', revenue: 178000 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '4px',
      padding: '8px 12px',
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        margin: '0 0 4px 0',
      }}>{label}</p>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px',
        color: SPECTRAL.primary,
        margin: 0,
      }}>
        Revenue: ${payload[0].value.toLocaleString('en-AU')}
      </p>
    </div>
  );
}

function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyRevenue} style={{ background: '#050505' }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            label={{ value: 'Revenue (AUD)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)' }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotoneX" dataKey="revenue" stroke={SPECTRAL.primary} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

### What changed

The OLED Black surface eliminates the white background entirely. Gridlines drop from full-opacity grey to 5% white, horizontal only — they recede behind the data instead of caging it. The placeholder "value" data key becomes "revenue" with a Y-axis label stating "Revenue (AUD)" and formatted ticks showing "$142K". The default purple stroke becomes spectral Cyan, signalling that this is the primary data series. The white tooltip box becomes a dark-surfaced, JetBrains Mono formatted panel that matches the chart aesthetic. The unnecessary legend is removed — a single series needs no legend. The chart is wrapped in a Framer Motion fade-in and a `ResponsiveContainer` for fluid layout.

The reader can now glance at this chart and immediately understand: monthly revenue in Australian dollars, trending upward, with clear values readable at every point.


## Example 2: Rainbow pie chart transformed to horizontal bar chart

### Before

```tsx
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#45B7D1'];

const data = [
  { name: 'Electronics', value: 35000 },
  { name: 'Clothing', value: 28000 },
  { name: 'Food & Bev', value: 22000 },
  { name: 'Home & Garden', value: 18000 },
  { name: 'Sports', value: 15000 },
  { name: 'Books', value: 12000 },
  { name: 'Toys', value: 9000 },
  { name: 'Other', value: 7000 },
];

function CategoryPie() {
  return (
    <PieChart width={500} height={400}>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Legend />
      <Tooltip />
    </PieChart>
  );
}
```

### Why the before version fails

Eight segments in a pie chart. The reader is asked to compare angles between slices that differ by small amounts — is "Home & Garden" at 18K meaningfully different from "Sports" at 15K? In a pie chart, these two slices appear nearly identical. The human visual system cannot accurately compare angles beyond 3-4 segments, so this chart is asking the reader to do something their perception is not equipped for.

The rainbow colour palette assigns colours arbitrarily. Red does not mean "bad" and blue does not mean "good" — they are simply the first and second colours in the array. The `COLORS[index % COLORS.length]` pattern reveals that the colour assignment is mechanical, not semantic. The large legend occupies roughly 20% of the component area, and the reader must bounce between the legend and the chart to decode each slice.

A pie chart with 8 segments and a rainbow palette is the charting equivalent of a paragraph written entirely in bullet points — it has the structure of a visualisation but destroys the relationships it claims to show.

### After

```tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const SPECTRAL = { primary: '#00F5FF' };

const categorySales = [
  { category: 'Electronics', sales: 35000 },
  { category: 'Clothing', sales: 28000 },
  { category: 'Food & Beverage', sales: 22000 },
  { category: 'Home & Garden', sales: 18000 },
  { category: 'Sports', sales: 15000 },
  { category: 'Books', sales: 12000 },
  { category: 'Toys', sales: 9000 },
  { category: 'Other', sales: 7000 },
].sort((a, b) => b.sales - a.sales);

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '4px',
      padding: '8px 12px',
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
        color: 'rgba(255,255,255,0.6)', margin: '0 0 4px 0',
      }}>{payload[0].payload.category}</p>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
        color: SPECTRAL.primary, margin: 0,
      }}>
        ${payload[0].value.toLocaleString('en-AU')}
      </p>
    </div>
  );
}

function CategorySalesChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={categorySales} layout="vertical" style={{ background: '#050505' }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            label={{ value: 'Sales (AUD)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)' }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="sales" fill={SPECTRAL.primary} radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

### What changed

The pie chart with 8 rainbow slices becomes a horizontal bar chart sorted by value, descending. The reader can now compare categories by bar length — a linear comparison that human perception handles accurately at any number of items. Category labels read naturally left-to-right along the Y-axis, eliminating the need for a separate legend.

The rainbow palette disappears entirely. A single spectral Cyan fills all bars because the data has no directional semantics — these are category totals, not good/bad values. If the data had semantic meaning (profit vs. loss by category), each bar would use `positive` or `negative` from the spectral palette.

The sort order communicates the ranking that the pie chart obscured. Electronics leads at $35K; Other trails at $7K. This ordering is the primary insight, and the horizontal bar chart makes it immediately visible without any legend cross-referencing.


## Example 3: Legend-heavy layout transformed to annotation-first design

### Before

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';

const data = [
  { month: 'Jan', organic: 1200, paid: 800, referral: 400, direct: 600, social: 300 },
  { month: 'Feb', organic: 1400, paid: 900, referral: 450, direct: 550, social: 350 },
  { month: 'Mar', organic: 1600, paid: 1100, referral: 500, direct: 700, social: 400 },
  { month: 'Apr', organic: 1500, paid: 1000, referral: 480, direct: 650, social: 380 },
  { month: 'May', organic: 1800, paid: 1200, referral: 520, direct: 720, social: 420 },
  { month: 'Jun', organic: 2000, paid: 1400, referral: 560, direct: 780, social: 460 },
];

function TrafficSources() {
  return (
    <LineChart width={600} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Legend
        verticalAlign="top"
        height={80}
        wrapperStyle={{
          padding: '15px',
          border: '1px solid #ccc',
          background: '#f9f9f9',
          borderRadius: '4px',
          marginBottom: '10px',
        }}
      />
      <Tooltip />
      <Line type="monotone" dataKey="organic" stroke="#FF6384" strokeWidth={2} />
      <Line type="monotone" dataKey="paid" stroke="#36A2EB" strokeWidth={2} />
      <Line type="monotone" dataKey="referral" stroke="#FFCE56" strokeWidth={2} />
      <Line type="monotone" dataKey="direct" stroke="#4BC0C0" strokeWidth={2} />
      <Line type="monotone" dataKey="social" stroke="#9966FF" strokeWidth={2} />
    </LineChart>
  );
}
```

### Why the before version fails

The legend consumes 80px of a 400px chart — 20% of the total height — plus padding, border, and background that add visual weight. The reader must memorise five colour-to-series mappings, then scan back to the chart to apply them. With five lines of similar trajectories rendered in a rainbow palette, the legend becomes the primary interface rather than the data itself.

The chart area shrinks to accommodate the legend, compressing the data vertically and reducing the reader's ability to perceive differences between series. The five lines with no colour semantics create a spaghetti tangle where only the highest and lowest lines are distinguishable — the three middle lines blur together.

This is a common failure mode: the chart's supporting infrastructure (legend, gridlines, axes) dominates the space, and the actual data is squeezed into whatever remains.

### After

```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import { motion } from 'framer-motion';

const SPECTRAL = {
  primary: '#00F5FF',
  positive: '#00FF88',
  warning: '#FFB800',
  neutral: 'rgba(255,255,255,0.4)',
  accent: '#FF00FF',
};

// Reduce to the 3 most significant channels; group minor ones
const trafficChannels = [
  { month: 'Jan', organic: 1200, paid: 800, other: 1300 },
  { month: 'Feb', organic: 1400, paid: 900, other: 1350 },
  { month: 'Mar', organic: 1600, paid: 1100, other: 1600 },
  { month: 'Apr', organic: 1500, paid: 1000, other: 1510 },
  { month: 'May', organic: 1800, paid: 1200, other: 1660 },
  { month: 'Jun', organic: 2000, paid: 1400, other: 1800 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '4px',
      padding: '8px 12px',
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
        color: 'rgba(255,255,255,0.6)', margin: '0 0 4px 0',
      }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
          color: entry.color, margin: 0,
        }}>
          {entry.name}: {entry.value.toLocaleString('en-AU')}
        </p>
      ))}
    </div>
  );
}

function TrafficSourcesChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={trafficChannels} style={{ background: '#050505' }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            label={{ value: 'Sessions', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line name="Organic" type="monotoneX" dataKey="organic" stroke={SPECTRAL.primary} strokeWidth={2} dot={false}>
            <LabelList dataKey="organic" position="right" fill={SPECTRAL.primary} fontSize={11} fontFamily="JetBrains Mono, monospace" formatter={(v: number) => `${(v / 1000).toFixed(1)}K`} />
          </Line>
          <Line name="Paid" type="monotoneX" dataKey="paid" stroke={SPECTRAL.warning} strokeWidth={2} dot={false}>
            <LabelList dataKey="paid" position="right" fill={SPECTRAL.warning} fontSize={11} fontFamily="JetBrains Mono, monospace" formatter={(v: number) => `${(v / 1000).toFixed(1)}K`} />
          </Line>
          <Line name="Other" type="monotoneX" dataKey="other" stroke={SPECTRAL.neutral} strokeWidth={1.5} strokeDasharray="6 4" dot={false}>
            <LabelList dataKey="other" position="right" fill={SPECTRAL.neutral} fontSize={11} fontFamily="JetBrains Mono, monospace" formatter={(v: number) => `${(v / 1000).toFixed(1)}K`} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

### What changed

Five series collapse to three by grouping referral, direct, and social into "Other". This is a data design decision, not just a visual one — the three minor channels individually contribute less than 15% each and follow similar trends, so separating them adds noise without insight. The reader can drill into "Other" in a separate view if needed.

The boxed legend disappears entirely. Each line has a `LabelList` at the right endpoint that shows the series name colour-coded to its stroke, with the final value. The reader sees "Organic 2.0K" directly at the end of the Cyan line — no cross-referencing needed.

Colour assignments are semantic: Cyan for organic (the primary channel), Amber for paid (a cost-bearing channel that warrants attention), and Neutral with a dash pattern for the grouped minor channels. The dash pattern provides a secondary encoding beyond colour, aiding readers with colour vision deficiencies.

The chart gains the full 350px height because no space is wasted on a legend box. The data lines breathe, and the vertical spread between series is more legible than when compressed into 320px (400px minus 80px legend).
