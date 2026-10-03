import { useContext } from 'react'
import { PortfolioContext } from '../portfolio/PortfolioContext'
import HoldingRow from './HoldingRow'

// Every position in the selected account, one HoldingRow each. Reads PortfolioContext and shows
// loading, error and empty states.
export default function HoldingsList() {
  const { status, data, error } = useContext(PortfolioContext) ?? {}

  if (status === 'error') {
    return (
      <section className="list-section" role="alert">
        Could not load holdings: {error?.message ?? 'unknown error'}
      </section>
    )
  }

  if (!data) {
    return <section className="list-section">Loading holdings…</section>
  }

  const holdings = data.holdings ?? []

  return (
    <section className="list-section" aria-labelledby="holdings-title">
      <h2 id="holdings-title" className="section-title">
        Holdings
      </h2>
      {holdings.length === 0 ? (
        <p className="empty">No holdings</p>
      ) : (
        <ul className="list">
          {holdings.map((holding) => (
            <HoldingRow key={holding.holdingId ?? holding.ticker} holding={holding} />
          ))}
        </ul>
      )}
    </section>
  )
}
