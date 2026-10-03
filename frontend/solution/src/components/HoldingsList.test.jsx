import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { SAMPLE_PORTFOLIO, makePortfolio, renderWithContext } from '../test/utils'
import HoldingsList from './HoldingsList'

describe('HoldingsList', () => {
  test('renders a heading and one item per holding', () => {
    renderWithContext(<HoldingsList />, {
      portfolio: makePortfolio({ data: SAMPLE_PORTFOLIO }),
      route: '/accounts/P-9001',
    })
    expect(screen.getByRole('heading', { name: 'Holdings' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  test('shows an empty state', () => {
    renderWithContext(<HoldingsList />, {
      portfolio: makePortfolio({ data: { ...SAMPLE_PORTFOLIO, holdings: [] } }),
    })
    expect(screen.getByText('No holdings')).toBeInTheDocument()
  })

  test('shows loading while there is no data', () => {
    renderWithContext(<HoldingsList />, { portfolio: makePortfolio({ status: 'loading' }) })
    expect(screen.getByText('Loading holdings…')).toBeInTheDocument()
  })

  test('shows the error instead of an empty list', () => {
    renderWithContext(<HoldingsList />, {
      portfolio: makePortfolio({ status: 'error', error: new Error('Simulated failure') }),
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load holdings: Simulated failure')
    expect(screen.queryByText('No holdings')).not.toBeInTheDocument()
  })
})
