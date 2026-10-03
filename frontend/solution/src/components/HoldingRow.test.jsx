import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { SAMPLE_PORTFOLIO, makeCurrency, renderWithContext } from '../test/utils'
import HoldingRow from './HoldingRow'

const [aapl, bnd] = SAMPLE_PORTFOLIO.holdings

// Stand-in holding page that shows the URL it was reached with
function HoldingPage() {
  const { pathname, search } = useLocation()
  return <p>{`Holding page ${pathname}${search}`}</p>
}

// HoldingRow renders an <li>, which must sit inside a list, on an account page (for :accountId)
function renderRow(holding, { route = '/accounts/P-9001', ...options } = {}) {
  renderWithContext(
    <Routes>
      <Route
        path="/accounts/:accountId"
        element={
          <ul>
            <HoldingRow holding={holding} />
          </ul>
        }
      />
      <Route path="/accounts/:accountId/holdings/:ticker" element={<HoldingPage />} />
    </Routes>,
    { route, ...options },
  )
  return screen.getByRole('link')
}

const change = (row) => row.querySelector('.list-row__change')

describe('HoldingRow', () => {
  test("shows ticker, name and asset class, value and today's % as sent by the API", () => {
    const row = renderRow(aapl)
    expect(row.querySelector('.list-row__title')).toHaveTextContent('AAPL')
    expect(row.querySelector('.list-row__sub')).toHaveTextContent('Apple Inc. · Equity')
    expect(row.querySelector('.list-row__value')).toHaveTextContent('$27,300.00 CAD')
    expect(change(row)).toHaveTextContent('▲ +2.40%')
    expect(change(row)).toHaveClass('trend--positive')
  })

  test('links the whole row to its holding page, keeping the mock query string', () => {
    const row = renderRow(aapl, { route: '/accounts/P-9001?scenario=large' })
    expect(row).toHaveAttribute('href', '/accounts/P-9001/holdings/AAPL?scenario=large')
  })

  test('opens the holding page when the row is clicked', () => {
    fireEvent.click(renderRow(aapl))
    expect(screen.getByText('Holding page /accounts/P-9001/holdings/AAPL')).toBeInTheDocument()
  })

  test('styles a down day as negative', () => {
    const row = renderRow({ ...bnd, dayChangeAmount: -12, dayChangePercent: -0.5 })
    expect(change(row)).toHaveTextContent('▼ -0.50%')
    expect(change(row)).toHaveClass('trend--negative')
  })

  test('converts market value but not percents', () => {
    const row = renderRow(aapl, { currency: makeCurrency({ currency: 'USD' }) })
    expect(row.querySelector('.list-row__value')).toHaveTextContent('$19,929.00 USD')
    expect(change(row)).toHaveTextContent('+2.40%')
  })

  test('shows Not found for missing fields and keeps them neutral', () => {
    const row = renderRow({ ticker: 'CASH', name: 'Cash' })
    expect(row.querySelector('.list-row__sub')).toHaveTextContent('Cash')
    expect(row.querySelector('.list-row__value')).toHaveTextContent('Not found')
    expect(change(row)).toHaveTextContent('Not found')
    expect(change(row)).toHaveClass('trend--neutral')
  })
})
