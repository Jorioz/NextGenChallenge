import { useContext } from 'react'
import { PortfolioContext } from '../portfolio/PortfolioContext'
import HoldingRow from './HoldingRow'

export default function HoldingsList() {
  const { status, data } = useContext(PortfolioContext) ?? {}

  if (status === 'loading' && !data) {
    return <section className="list-section">Loading holdings…</section>
  }

  const holdings = data?.holdings ?? []

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
