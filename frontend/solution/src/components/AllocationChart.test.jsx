import { screen, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { SAMPLE_PORTFOLIO, makeCurrency, renderWithContext } from '../test/utils'
import AllocationChart from './AllocationChart'

// jsdom has no canvas, so replace the Chart.js pie with a stub that records its props
const pieProps = vi.hoisted(() => ({ current: null }))
vi.mock('react-chartjs-2', () => ({
  Pie: (props) => {
    pieProps.current = props
    return <div data-testid="pie" role={props.role} aria-label={props['aria-label']} />
  },
}))

// Legend rows as [class, share, value]
const legendRows = () =>
  screen.getAllByRole('listitem').map((row) => [...row.children].slice(1).map((cell) => cell.textContent))

describe('AllocationChart', () => {
  test('draws one coloured slice per class and labels each with name, share and value', () => {
    renderWithContext(<AllocationChart allocation={SAMPLE_PORTFOLIO.allocation} />)

    expect(screen.getByRole('heading', { name: 'Asset allocation' })).toBeInTheDocument()
    expect(legendRows()).toEqual([
      ['Equity', '47.27%', '$31,050.00 CAD'],
      ['Fixed Income', '32.93%', '$21,630.00 CAD'],
      ['Cash', '12.18%', '$8,000.00 CAD'],
      ['Alternatives', '7.61%', '$5,000.00 CAD'],
    ])
    const [dataset] = pieProps.current.data.datasets
    expect(pieProps.current.data.labels).toEqual(['Equity', 'Fixed Income', 'Cash', 'Alternatives'])
    expect(new Set(dataset.backgroundColor).size).toBe(4)
    expect(dataset.borderWidth).toBe(2)
  })

  test('describes the pie for screen readers', () => {
    renderWithContext(<AllocationChart allocation={SAMPLE_PORTFOLIO.allocation} />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Asset allocation: Equity 47.27%, Fixed Income 32.93%, Cash 12.18%, Alternatives 7.61%',
    )
  })

  test('shows values and tooltips in the selected currency, shares unchanged', () => {
    renderWithContext(<AllocationChart allocation={SAMPLE_PORTFOLIO.allocation} />, {
      currency: makeCurrency({ currency: 'USD' }),
    })
    expect(legendRows()[0]).toEqual(['Equity', '47.27%', '$22,666.50 USD'])
    const label = pieProps.current.options.plugins.tooltip.callbacks.label({ dataIndex: 0 })
    expect(label).toBe('47.27% ($22,666.50 USD)')
  })

  test('draws a single class as one full disc at 100%', () => {
    renderWithContext(<AllocationChart allocation={[{ assetClass: 'Equity', value: 31050 }]} />)
    expect(legendRows()).toEqual([['Equity', '100.00%', '$31,050.00 CAD']])
    const [dataset] = pieProps.current.data.datasets
    expect(dataset.data).toEqual([31050])
    expect(dataset.borderWidth).toBe(0)
  })

  test('keeps a tiny slice visible while labelling its true share', () => {
    const tiny = [
      { assetClass: 'Equity', value: 4.78 },
      { assetClass: 'Fixed Income', value: 21630 },
      { assetClass: 'Cash', value: 8000 },
      { assetClass: 'Alternatives', value: 5000 },
    ]
    renderWithContext(<AllocationChart allocation={tiny} />)

    const equity = within(screen.getAllByRole('listitem').at(-1))
    expect(equity.getByText('Equity')).toBeInTheDocument()
    expect(equity.getByText('0.01%')).toBeInTheDocument()
    // Drawn at 1% of the total instead of 0.014%
    expect(pieProps.current.data.datasets[0].data.at(-1)).toBeCloseTo(34634.78 * 0.01)
  })

  test('shows a message when there is no allocation', () => {
    renderWithContext(<AllocationChart allocation={[]} />)
    expect(screen.getByText('No allocation data for this account.')).toBeInTheDocument()
    expect(screen.queryByTestId('pie')).not.toBeInTheDocument()
  })
})
