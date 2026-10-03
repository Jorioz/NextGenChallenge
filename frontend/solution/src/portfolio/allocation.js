// Pure helpers that turn an account's `allocation` ([{ assetClass, value }], raw CAD) into pie slices
import { NOT_FOUND, formatPercent, isNumber } from './format.js'

// Fixed colour per asset class so a class looks the same on every account
export const ASSET_CLASS_COLORS = {
  Equity: '#2563eb',
  'Fixed Income': '#16a34a',
  Cash: '#f59e0b',
  Alternatives: '#9333ea',
}

// Used in order for any other asset class the API returns
const FALLBACK_COLORS = ['#0891b2', '#db2777', '#65a30d', '#ea580c', '#64748b']

// Slices smaller than this share of the total are drawn at this size so they stay visible
export const MIN_VISIBLE_SHARE = 0.01

// [{ assetClass, value, percent, color }] sorted largest first. Missing, zero or negative values are
// dropped (they can't be drawn as a slice); `percent` is the true share of the remaining total.
export function allocationSlices(allocation = []) {
  const entries = (allocation ?? []).filter((entry) => isNumber(entry?.value) && entry.value > 0)
  const total = entries.reduce((sum, entry) => sum + entry.value, 0)
  let fallback = 0

  return [...entries]
    .sort((a, b) => b.value - a.value)
    .map((entry) => ({
      assetClass: entry.assetClass ?? NOT_FOUND,
      value: entry.value,
      percent: (entry.value / total) * 100,
      color: ASSET_CLASS_COLORS[entry.assetClass] ?? FALLBACK_COLORS[fallback++ % FALLBACK_COLORS.length],
    }))
}

// Arc sizes to draw: every slice is at least MIN_VISIBLE_SHARE of the total, so a <1% class never
// disappears. Only the drawing is padded; labels use the slice's true `percent`.
export function visibleArcValues(slices = []) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  return slices.map((slice) => Math.max(slice.value, total * MIN_VISIBLE_SHARE))
}

// A slice's share as text; a non-zero share too small for two decimals shows "<0.01%" rather than "0.00%"
export function formatShare(percent) {
  if (isNumber(percent) && percent > 0 && percent < 0.005) return '<0.01%'
  return formatPercent(percent)
}
