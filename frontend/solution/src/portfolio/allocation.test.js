import { describe, expect, test } from 'vitest'
import { ASSET_CLASS_COLORS, allocationSlices, formatShare, visibleArcValues } from './allocation.js'

// The spec's sample breakdown
const SPEC_SAMPLE = [
  { assetClass: 'Equity', value: 289410.0 },
  { assetClass: 'Fixed Income', value: 120500.0 },
  { assetClass: 'Cash', value: 42340.12 },
  { assetClass: 'Alternatives', value: 30100.0 },
]

describe('allocationSlices', () => {
  test('gives each class its true share, largest first, with its fixed colour', () => {
    const slices = allocationSlices(SPEC_SAMPLE)
    expect(slices.map((s) => s.assetClass)).toEqual(['Equity', 'Fixed Income', 'Cash', 'Alternatives'])
    expect(slices.map((s) => Number(s.percent.toFixed(2)))).toEqual([60.0, 24.98, 8.78, 6.24])
    expect(slices.reduce((sum, s) => sum + s.percent, 0)).toBeCloseTo(100)
    expect(slices[0].color).toBe(ASSET_CLASS_COLORS.Equity)
  })

  test('a single class is 100%', () => {
    expect(allocationSlices([{ assetClass: 'Equity', value: 31050 }])).toEqual([
      { assetClass: 'Equity', value: 31050, percent: 100, color: ASSET_CLASS_COLORS.Equity },
    ])
  })

  test('drops missing, zero and negative values', () => {
    const slices = allocationSlices([
      { assetClass: 'Equity', value: 100 },
      { assetClass: 'Cash', value: 0 },
      { assetClass: 'Alternatives', value: null },
      { assetClass: 'Fixed Income', value: -5 },
    ])
    expect(slices).toHaveLength(1)
    expect(slices[0].percent).toBe(100)
  })

  test('handles an empty or missing allocation', () => {
    expect(allocationSlices([])).toEqual([])
    expect(allocationSlices(undefined)).toEqual([])
    expect(allocationSlices(null)).toEqual([])
  })

  test('gives unknown classes distinct fallback colours and a Not found label when unnamed', () => {
    const slices = allocationSlices([
      { assetClass: 'Crypto', value: 2 },
      { value: 1 },
    ])
    expect(slices[0].color).not.toBe(slices[1].color)
    expect(slices[1].assetClass).toBe('Not found')
  })
})

describe('visibleArcValues', () => {
  test('pads slices under 1% up to 1% of the total and leaves others alone', () => {
    const slices = allocationSlices([
      { assetClass: 'Fixed Income', value: 21630 },
      { assetClass: 'Equity', value: 4.78 },
    ])
    const total = 21634.78
    expect(visibleArcValues(slices)).toEqual([21630, total * 0.01])
  })

  test('keeps a single slice as is', () => {
    expect(visibleArcValues(allocationSlices([{ assetClass: 'Equity', value: 31050 }]))).toEqual([31050])
  })
})

describe('formatShare', () => {
  test('formats shares with two decimals', () => {
    expect(formatShare(60)).toBe('60.00%')
    expect(formatShare(0.0138)).toBe('0.01%')
  })

  test('shows <0.01% for a non-zero share that would round to zero', () => {
    expect(formatShare(0.001)).toBe('<0.01%')
  })

  test('shows Not found for a missing share', () => {
    expect(formatShare(undefined)).toBe('Not found')
  })
})
