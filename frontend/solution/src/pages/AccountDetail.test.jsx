import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'
import { SAMPLE_PORTFOLIO, makePortfolio, renderWithContext } from '../test/utils'
import AccountDetail from './AccountDetail'

// jsdom has no canvas; the charts have their own tests
vi.mock('../components/HistoryChart', () => ({ default: ({ title }) => <p>{title}</p> }))
vi.mock('../components/AllocationChart', () => ({
  default: ({ allocation }) => <p>{`Allocation chart: ${allocation.length} classes`}</p>,
}))

// Shows the current URL so tests can check the query string
function CurrentUrl() {
  const { pathname, search } = useLocation()
  return <output>{`${pathname}${search}`}</output>
}

// AccountDetail at /accounts/:accountId with the given portfolio context
function renderDetail(portfolio, route = '/accounts/P-9001', options = {}) {
  return renderWithContext(
    <Routes>
      <Route
        path="/accounts/:accountId"
        element={
          <>
            <AccountDetail />
            <CurrentUrl />
          </>
        }
      />
    </Routes>,
    { portfolio, route, ...options },
  )
}

describe('AccountDetail page', () => {
  test('selects the account from the URL', () => {
    const selectAccount = vi.fn()
    renderDetail(makePortfolio({ accountId: null, status: 'idle', selectAccount }), '/accounts/P-9002')
    expect(selectAccount).toHaveBeenCalledWith('P-9002')
  })

  test("shows the account's summary, value chart and holdings", () => {
    renderDetail(makePortfolio({ data: SAMPLE_PORTFOLIO }))
    expect(screen.getByRole('heading', { level: 1, name: 'Taxable Brokerage' })).toBeInTheDocument()
    expect(screen.getByLabelText('Portfolio summary')).toBeInTheDocument()
    expect(screen.getByText('Account value')).toBeInTheDocument()
    expect(screen.getByLabelText('Holdings')).toBeInTheDocument()
  })

  test('shows loading until the provider has caught up with the URL', () => {
    renderDetail(makePortfolio({ accountId: 'P-9002', data: SAMPLE_PORTFOLIO }))
    expect(screen.getByText('Loading account…')).toBeInTheDocument()
    expect(screen.queryByLabelText('Holdings')).not.toBeInTheDocument()
  })

  test('shows the load error', () => {
    renderDetail(makePortfolio({ status: 'error', error: new Error('Unknown portfolio') }))
    expect(screen.getByRole('alert')).toHaveTextContent('Unknown portfolio')
  })

  test('links back to all accounts, keeping the mock query string', () => {
    renderDetail(makePortfolio({ data: SAMPLE_PORTFOLIO }), '/accounts/P-9001?scenario=empty')
    expect(screen.getByRole('link', { name: '← All accounts' })).toHaveAttribute('href', '/?scenario=empty')
  })
})

describe('AccountDetail Holdings | Breakdown switch', () => {
  test('shows holdings by default', () => {
    renderDetail(makePortfolio({ data: SAMPLE_PORTFOLIO }))
    expect(screen.getByRole('button', { name: 'Holdings' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Holdings')).toBeInTheDocument()
    expect(screen.queryByText(/Allocation chart/)).not.toBeInTheDocument()
  })

  test('switches to the breakdown pie, keeping the mock query string in the URL', () => {
    renderDetail(makePortfolio({ data: SAMPLE_PORTFOLIO }), '/accounts/P-9001?scenario=large')
    fireEvent.click(screen.getByRole('button', { name: 'Breakdown' }))

    expect(screen.getByRole('button', { name: 'Breakdown' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Allocation chart: 4 classes')).toBeInTheDocument()
    expect(screen.queryByLabelText('Holdings')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('/accounts/P-9001?scenario=large&view=breakdown')
  })

  test('opens on the breakdown from the URL and switches back to holdings', () => {
    renderDetail(makePortfolio({ data: SAMPLE_PORTFOLIO }), '/accounts/P-9001?view=breakdown&scenario=large')
    expect(screen.getByText('Allocation chart: 4 classes')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Holdings' }))
    expect(screen.getByLabelText('Holdings')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('/accounts/P-9001?scenario=large')
  })
})
