# Anti-patterns reference

Detailed before/after Recharts JSX examples for each of the 8 banned chart patterns. Use these to calibrate detection and correction.


## 1. Grey gridlines on white background

**Before**:
```tsx
<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
</LineChart>
```

**Why it's bad**: The default `CartesianGrid` renders medium-grey lines on a white background at full opacity, creating a visual cage that competes with the data line. On OLED screens, the white background wastes power and causes eye strain. The grid has no hierarchy — horizontal and vertical lines carry equal weight, even though vertical gridlines add no value for time-series data.

**After**:
```tsx
<LineChart width={600} height={300} data={data} style={{ background: '#050505' }}>
  <CartesianGrid
    horizontal={true}
    vertical={false}
    stroke="rgba(255,255,255,0.05)"
  />
  <XAxis
    dataKey="month"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
  />
  <YAxis
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    label={{ value: 'Revenue (AUD)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)' }}
  />
  <Line type="monotoneX" dataKey="revenue" stroke="#00F5FF" strokeWidth={2} dot={false} />
</LineChart>
```

**Detection cue**: A `<CartesianGrid>` with no custom `stroke` prop, or a `strokeDasharray` without explicit colour and opacity. Any chart component rendered without a dark background.


## 2. Pie chart with more than 4 segments

**Before**:
```tsx
<PieChart width={400} height={400}>
  <Pie data={departmentSpend} dataKey="value" nameKey="department" cx="50%" cy="50%" outerRadius={120}>
    {departmentSpend.map((entry, index) => (
      <Cell key={index} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Legend />
  <Tooltip />
</PieChart>
```

**Why it's bad**: With 7 departments, the reader is comparing angles between slices that differ by 2-3%. Human angle perception fails above 4 slices — the chart becomes a colour wheel that requires the legend to decode, defeating the purpose of a visual representation.

**After**:
```tsx
<BarChart
  width={600}
  height={350}
  data={departmentSpend.sort((a, b) => b.value - a.value)}
  layout="vertical"
  style={{ background: '#050505' }}
>
  <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
  <XAxis
    type="number"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    label={{ value: 'Spend (AUD)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)' }}
  />
  <YAxis
    type="category"
    dataKey="department"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    width={120}
  />
  <Bar dataKey="value" fill="#00F5FF" radius={[0, 4, 4, 0]} />
</BarChart>
```

**Detection cue**: A `<Pie>` or `<PieChart>` component where the data array has more than 4 entries. Also watch for the `COLORS` array cycling pattern (`COLORS[index % COLORS.length]`), which is a signal that the number of slices is unbounded.


## 3. Rainbow colour palette

**Before**:
```tsx
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  {metrics.map((metric, index) => (
    <Line key={metric} type="monotone" dataKey={metric} stroke={COLORS[index]} />
  ))}
  <Legend />
</LineChart>
```

**Why it's bad**: The seven colours carry no semantic meaning. The reader cannot infer from the colour whether a line represents a positive or negative metric. The palette also fails protanopia and deuteranopia colour blindness tests — red and green lines become indistinguishable.

**After**:
```tsx
const SPECTRAL = {
  primary: '#00F5FF',
  positive: '#00FF88',
  warning: '#FFB800',
  negative: '#FF4444',
  neutral: 'rgba(255,255,255,0.4)',
  accent: '#FF00FF',
};

// Map each metric to its semantic meaning
const metricColours: Record<string, string> = {
  revenue: SPECTRAL.positive,
  costs: SPECTRAL.negative,
  target: SPECTRAL.neutral,
};

<LineChart width={600} height={300} data={data} style={{ background: '#050505' }}>
  <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
  <XAxis
    dataKey="month"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
  />
  <YAxis
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    label={{ value: 'Amount (AUD)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)' }}
  />
  {Object.entries(metricColours).map(([metric, colour]) => (
    <Line key={metric} type="monotoneX" dataKey={metric} stroke={colour} strokeWidth={2} dot={false} />
  ))}
</LineChart>
```

**Detection cue**: An array of hex colours with no semantic naming (just `COLORS[0]`, `COLORS[1]`), or a palette that includes both red and green without semantic differentiation. Any colour assignment that uses array index rather than data meaning.


## 4. Oversized legend consuming more than 15% of chart area

**Before**:
```tsx
<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Line type="monotone" dataKey="users" stroke="#8884d8" />
  <Line type="monotone" dataKey="sessions" stroke="#82ca9d" />
  <Line type="monotone" dataKey="pageViews" stroke="#ffc658" />
  <Legend
    wrapperStyle={{ padding: '20px', border: '1px solid #ccc', background: '#f5f5f5' }}
    iconSize={20}
  />
</LineChart>
```

**Why it's bad**: The legend has a background, border, large icons, and 20px padding. It occupies roughly 25% of the chart height. The reader's eye travels between the legend box and the data lines, doubling the cognitive effort needed to decode the chart. The legend is a separate document appended to the visualisation.

**After**:
```tsx
<LineChart width={600} height={300} data={data} style={{ background: '#050505' }}>
  <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
  <XAxis
    dataKey="month"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
  />
  <YAxis
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
  />
  <Line type="monotoneX" dataKey="users" stroke="#00F5FF" strokeWidth={2} dot={false}>
    <LabelList dataKey="users" position="right" fill="#00F5FF" fontSize={11} fontFamily="JetBrains Mono" />
  </Line>
  <Line type="monotoneX" dataKey="sessions" stroke="#00FF88" strokeWidth={2} dot={false}>
    <LabelList dataKey="sessions" position="right" fill="#00FF88" fontSize={11} fontFamily="JetBrains Mono" />
  </Line>
</LineChart>
```

**Detection cue**: A `<Legend>` component with `wrapperStyle` that includes `padding`, `border`, or `background`. Also any legend where `iconSize` exceeds 14px or where the legend is positioned to the right (consuming horizontal space from the chart).


## 5. "Value" / "Label" / "Series 1" axis labels

**Before**:
```tsx
<BarChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="value" fill="#8884d8" />
  <Tooltip />
</BarChart>
```

**Why it's bad**: The X-axis shows "name" tick values with no context about what those names represent. The Y-axis has no label at all — the reader cannot determine whether the values are dollars, percentages, milliseconds, or headcount. The data key "value" is a placeholder that reveals nothing about the metric being measured.

**After**:
```tsx
<BarChart width={600} height={300} data={quarterlyRevenue} style={{ background: '#050505' }}>
  <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
  <XAxis
    dataKey="quarter"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    label={{ value: 'Quarter', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)' }}
  />
  <YAxis
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    label={{ value: 'Revenue (AUD)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)' }}
    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
  />
  <Bar dataKey="revenue" fill="#00F5FF" radius={[4, 4, 0, 0]} />
</BarChart>
```

**Detection cue**: `dataKey` values of "value", "data", "label", "name", "series1". A `<YAxis>` with no `label` prop. A `<XAxis>` where the `dataKey` is a generic term rather than a domain-specific field name.


## 6. Default browser tooltips or unstyled tooltip boxes

**Before**:
```tsx
<LineChart width={600} height={300} data={data}>
  <XAxis dataKey="month" />
  <YAxis />
  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
  <Tooltip />
</LineChart>
```

**Why it's bad**: The default Recharts tooltip renders a white box with a border, black text, and the library's default formatting. On a dark chart, this creates a jarring white flash that breaks visual continuity. The tooltip label uses the raw dataKey name ("revenue") rather than a human-readable label with units.

**After**:
```tsx
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '4px',
      padding: '8px 12px',
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        margin: '0 0 4px 0',
      }}>
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '13px',
          color: entry.color,
          margin: 0,
        }}>
          {entry.name}: ${entry.value.toLocaleString('en-AU')}
        </p>
      ))}
    </div>
  );
};

<LineChart width={600} height={300} data={data} style={{ background: '#050505' }}>
  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
  <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
  <Line type="monotoneX" dataKey="revenue" stroke="#00F5FF" strokeWidth={2} dot={false} />
  <Tooltip content={<CustomTooltip />} />
</LineChart>
```

**Detection cue**: A bare `<Tooltip />` with no `content` prop or `contentStyle` override. Any tooltip that renders with a white or light-grey background.


## 7. Equal-weight bidirectional gridlines

**Before**:
```tsx
<AreaChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
  <XAxis dataKey="date" />
  <YAxis />
  <Area type="monotone" dataKey="traffic" fill="#8884d8" stroke="#8884d8" />
</AreaChart>
```

**Why it's bad**: Both horizontal and vertical gridlines render at the same weight and colour (`#ccc`). This creates a rectangular cage that fragments the area fill into cells. For time-series data, vertical gridlines add no information — the X-axis ticks already mark time intervals. The grid visually competes with the filled area, reducing the area chart's primary strength: communicating volume through shape.

**After**:
```tsx
<AreaChart width={600} height={300} data={data} style={{ background: '#050505' }}>
  <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
  <XAxis
    dataKey="date"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
  />
  <YAxis
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    label={{ value: 'Sessions', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)' }}
  />
  <defs>
    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#00F5FF" stopOpacity={0.15} />
      <stop offset="100%" stopColor="#00F5FF" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area type="monotoneX" dataKey="traffic" fill="url(#trafficGradient)" stroke="#00F5FF" strokeWidth={2} />
</AreaChart>
```

**Detection cue**: A `<CartesianGrid>` without explicit `horizontal` and `vertical` boolean props, or with both set to `true`. Any grid where the `stroke` colour is a solid grey (`#ccc`, `#ddd`, `#999`) rather than a low-opacity white.


## 8. Vertical bar chart with more than 8 categories

**Before**:
```tsx
<BarChart width={600} height={300} data={productCategories}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
  <YAxis />
  <Bar dataKey="sales" fill="#8884d8" />
</BarChart>
```

**Why it's bad**: With 12 product categories, the X-axis labels rotate to -45 degrees and still overlap. The reader tilts their head to read diagonal text. The 80px height allocation for the X-axis steals chart space from the data. Rotated labels are a symptom of a wrong chart orientation, not a layout problem to solve with CSS transforms.

**After**:
```tsx
<BarChart
  width={600}
  height={500}
  data={productCategories.sort((a, b) => b.sales - a.sales)}
  layout="vertical"
  style={{ background: '#050505' }}
>
  <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
  <XAxis
    type="number"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    label={{ value: 'Sales (AUD)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)' }}
    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
  />
  <YAxis
    type="category"
    dataKey="category"
    tick={{ fill: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
    width={140}
  />
  <Bar dataKey="sales" fill="#00F5FF" radius={[0, 4, 4, 0]} />
</BarChart>
```

**Detection cue**: An `<XAxis>` with `angle={-45}` or `angle={-90}`, or any `textAnchor="end"` on an X-axis. A `<BarChart>` without `layout="vertical"` where the data array has more than 8 entries.
