# Scientific Luxury — Before/After Examples

> Side-by-side comparisons showing generic patterns transformed to Scientific Luxury standard.

---

## Example 1: Bootstrap Card Grid → SL Timeline Layout

### BEFORE (Generic)

```tsx
<div className="min-h-screen bg-gray-50 p-8">
  <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm text-gray-500">Total Users</h3>
      <p className="text-3xl font-bold text-gray-900">1,234</p>
      <span className="text-green-500 text-sm">+12%</span>
    </div>
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm text-gray-500">Revenue</h3>
      <p className="text-3xl font-bold text-gray-900">$50,000</p>
      <span className="text-green-500 text-sm">+8%</span>
    </div>
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm text-gray-500">Active Sessions</h3>
      <p className="text-3xl font-bold text-gray-900">456</p>
    </div>
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm text-gray-500">Error Rate</h3>
      <p className="text-3xl font-bold text-red-500">2.5%</p>
    </div>
  </div>
</div>
```

**Violations**: `bg-gray-50`, `bg-white`, `rounded-lg`, `shadow-md`, `grid-cols-4`, `font-bold`, `text-gray-500`, round numbers, generic shadow.

### AFTER (Scientific Luxury)

```tsx
<div className="min-h-[100dvh] bg-[#050505] px-8 py-8">
  {/* Header */}
  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
    Real-Time Monitoring
  </p>
  <h1 className="text-4xl font-extralight tracking-tight text-white">
    Command Centre
  </h1>

  {/* DataStrip — replaces card grid */}
  <div className="mt-6 flex items-center gap-8 border-[0.5px] border-white/[0.06] bg-white/[0.01] px-6 py-3">
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] tracking-widest text-white/30 uppercase">Users</span>
      <span className="font-mono text-lg font-medium tabular-nums text-[#00F5FF]">1,247</span>
    </div>
    <div className="h-4 w-px bg-white/10" />
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] tracking-widest text-white/30 uppercase">Revenue</span>
      <span className="font-mono text-lg font-medium tabular-nums text-[#00FF88]">$48,720</span>
    </div>
    <div className="h-4 w-px bg-white/10" />
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] tracking-widest text-white/30 uppercase">Sessions</span>
      <span className="font-mono text-lg font-medium tabular-nums text-[#00F5FF]">463</span>
    </div>
    <div className="h-4 w-px bg-white/10" />
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] tracking-widest text-white/30 uppercase">Errors</span>
      <span className="font-mono text-lg font-medium tabular-nums text-[#FF4444]">2.3%</span>
    </div>
  </div>

  {/* Timeline content below */}
  <div className="relative mt-8 pl-4">
    <div className="absolute top-0 bottom-0 left-8 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
    {/* Timeline nodes here */}
  </div>
</div>
```

**Fixes applied**: OLED Black `#050505` background, DataStrip replaces card grid, `font-extralight` title, spectral colours for values, `font-mono tabular-nums` for data, `border-[0.5px]` single-pixel border, organic numbers, timeline layout.

---

## Example 2: Generic Form → SL Form

### BEFORE (Generic)

```tsx
<form className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
  <h2 className="text-xl font-bold text-gray-900 mb-4">Sign In</h2>
  <div className="mb-4">
    <label className="block text-gray-600 text-sm mb-1">Email</label>
    <input
      type="email"
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your email"
    />
  </div>
  <div className="mb-6">
    <label className="block text-gray-600 text-sm mb-1">Password</label>
    <input
      type="password"
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your password"
    />
  </div>
  <button className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-all">
    Sign In
  </button>
</form>
```

**Violations**: `bg-white`, `rounded-xl`, `rounded-lg`, `shadow-lg`, `border-gray-300`, `bg-blue-500`, `focus:ring-blue-500`, `transition-all`, generic placeholder text.

### AFTER (Scientific Luxury)

```tsx
<motion.form
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
  className="max-w-sm mx-auto border-[0.5px] border-white/[0.06] bg-white/[0.01] rounded-sm p-8"
>
  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
    Authentication
  </p>
  <h2 className="mt-1 text-2xl font-light tracking-tight text-white">
    Sign in
  </h2>

  <div className="mt-8 space-y-6">
    <div>
      <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
        Email
      </label>
      <input
        type="email"
        className="w-full bg-transparent border-[0.5px] border-white/[0.06] rounded-sm px-4 py-2.5
                   font-mono text-sm text-white/90 placeholder:text-white/20
                   focus:border-[#00F5FF]/30 focus:outline-none"
        placeholder="admin@local.dev"
      />
    </div>
    <div>
      <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
        Password
      </label>
      <input
        type="password"
        className="w-full bg-transparent border-[0.5px] border-white/[0.06] rounded-sm px-4 py-2.5
                   font-mono text-sm text-white/90 placeholder:text-white/20
                   focus:border-[#00F5FF]/30 focus:outline-none"
        placeholder="••••••••"
      />
    </div>
  </div>

  <motion.button
    type="submit"
    className="mt-8 w-full rounded-sm border-[0.5px] border-[#00F5FF]/30 bg-transparent
               py-2.5 font-mono text-sm uppercase tracking-wide text-[#00F5FF]"
    whileHover={{ backgroundColor: 'rgba(0, 245, 255, 0.05)', boxShadow: '0 0 20px rgba(0,245,255,0.1)' }}
    whileTap={{ scale: 0.98 }}
    transition={{ ease: [0.19, 1, 0.22, 1] }}
  >
    Authenticate
  </motion.button>
</motion.form>
```

**Fixes applied**: Transparent/OLED-safe backgrounds, `rounded-sm`, `border-[0.5px]`, `font-mono` inputs, Framer Motion entry + interactions, spectral Cyan focus state, `text-[10px] uppercase tracking-[0.3em]` labels, no CSS transitions, realistic placeholder.
