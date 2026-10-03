import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { SAMPLE_PORTFOLIO, makeCurrency, makePortfolio, renderWithContext } from '../test/utils'
import SummaryCard from './SummaryCard'

// Renders the card for a portfolio summary merged over the sample one
function renderSummary(portfolioOverrides = {}, options = {}) {
  const data = { ...SAMPLE_PORTFOLIO, portfolio: { ...SAMPLE_PORTFOLIO.portfolio, ...portfolioOverrides } }
  return renderWithContext(<SummaryCard />, { portfolio: makePortfolio({ data }), ...options })
}

// Headline value and the lines under it
const value = () => document.querySelector('.hero__value')
const dayChange = () => document.querySelector('.hero__change')
const totalReturn = () => document.querySelector('.hero__secondary')

describe('SummaryCard', () => {
  test('shows value, day change and total return for the sample data', () => {
    renderSummary()
    expect(screen.getByText('Total value')).toBeInTheDocument()
    expect(value()).toHaveTextContent('$65,680.00 CAD')
    expect(dayChange()).toHaveTextContent('▲ +$397.25 CAD (+0.61%) today')
    expect(totalReturn()).toHaveTextContent('Total return +18.70% since inception')
  })

  test('converts money to USD but leaves percentages alone', () => {
    renderSummary({}, { currency: makeCurrency({ currency: 'USD' }) })
    expect(value()).toHaveTextContent('$47,946.40 USD')
    expect(dayChange()).toHaveTextContent('+$289.99 USD (+0.61%)')
    expect(totalReturn()).toHaveTextContent('+18.70%')
  })

  test('styles negative and zero day changes', () => {
    const { unmount } = renderSummary({ dayChangeAmount: -120.5, dayChangePercent: -0.18 })
    expect(dayChange()).toHaveClass('trend--negative')
    expect(dayChange()).toHaveTextContent('▼ -$120.50 CAD (-0.18%)')
    unmount()

    renderSummary({ dayChangeAmount: 0, dayChangePercent: 0 })
    expect(dayChange()).toHaveClass('trend--neutral')
    expect(dayChange()).toHaveTextContent('$0.00 CAD (0.00%)')
  })

  test('shows Not found for missing fields', () => {
    renderSummary({ totalMarketValue: undefined, totalReturnSinceInception: undefined })
    expect(value()).toHaveTextContent('Not found')
    expect(totalReturn()).toHaveTextContent('Not found')
  })

  test('shows given summary figures instead of the selected account', () => {
    const summary = { label: 'All accounts', totalMarketValue: 1000, dayChangeAmount: -10, dayChangePercent: -0.99 }
    const { unmount } = renderWithContext(<SummaryCard summary={summary} showTotalReturn={false} />, {
      portfolio: makePortfolio({ status: 'error', error: new Error('ignored') }),
    })
    expect(value()).toHaveTextContent('$1,000.00 CAD')
    expect(dayChange()).toHaveTextContent('▼ -$10.00 CAD (-0.99%)')
    expect(totalReturn()).not.toBeInTheDocument()
    unmount()

    renderWithContext(<SummaryCard summary={summary} loading />)
    expect(screen.getByText('Loading portfolio…')).toBeInTheDocument()
  })

  test('shows loading and error states', () => {
    const { unmount } = renderWithContext(<SummaryCard />, { portfolio: makePortfolio({ status: 'loading' }) })
    expect(screen.getByText('Loading portfolio…')).toBeInTheDocument()
    unmount()

    renderWithContext(<SummaryCard />, {
      portfolio: makePortfolio({ status: 'error', error: new Error('Simulated failure') }),
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load portfolio: Simulated failure')
  })
})
