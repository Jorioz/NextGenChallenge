import { Link, useLocation, useParams } from 'react-router-dom'

// Placeholder for the buy/sell flow; `side` is 'buy' or 'sell'
export default function TradePage({ side }) {
  const { accountId, ticker } = useParams()
  const { search } = useLocation()
  const title = side === 'buy' ? 'Buy page' : 'Sell page'

  return (
    <>
      <Link
        to={`/accounts/${encodeURIComponent(accountId)}/holdings/${encodeURIComponent(ticker)}${search}`}
        className="back-link"
      >
        ← Back to {ticker}
      </Link>
      <section className="card">
        <h1 className="section-title">{title}</h1>
        <p>{ticker}</p>
      </section>
    </>
  )
}
