import { useContext } from 'react'
import useCurrency from '../currency/useCurrency'
import { PortfolioContext } from '../portfolio/PortfolioContext'
import { TREND_ICON, formatPercent, isNumber, toPercent, trend, withSign } from '../portfolio/format'

// Headline figures: the value is the biggest thing on the page, day change sits right under it,
// and total return is secondary. Shows the selected account by default; pass `summary` for other
// figures (e.g. all accounts combined).
export default function SummaryCard({ summary, loading, showTotalReturn = true }) {
  const { status, data } = useContext(PortfolioContext) ?? {}
  const { formatMoney, formatSignedMoney } = useCurrency()
  const isLoading = summary === undefined ? status === 'loading' && !data : loading

  if (isLoading) {
    return <section className="hero">Loading portfolio…</section>
  }

  const portfolio = summary ?? data?.portfolio ?? {}
  // Money fields are CAD from the API; useCurrency converts them to the selected currency
  const { totalMarketValue, dayChangeAmount, dayChangePercent, totalReturnSinceInception } = portfolio

  // Day change shares one tone; prefer amount, fall back to percent if amount is missing
  const dayTone = trend(isNumber(dayChangeAmount) ? dayChangeAmount : dayChangePercent)
  // totalReturnSinceInception is a fraction (0.187 => 18.70%)
  const totalReturn = toPercent(totalReturnSinceInception)

  return (
    <section className="hero" aria-label="Portfolio summary">
      <p className="hero__label">Total value</p>
      <p className="hero__value">{formatMoney(totalMarketValue)}</p>
      <p className={`hero__change trend--${dayTone}`}>
        {TREND_ICON[dayTone] && <span aria-hidden="true">{TREND_ICON[dayTone]} </span>}
        {formatSignedMoney(dayChangeAmount)} ({withSign(dayChangePercent, formatPercent(dayChangePercent))})
        <span className="hero__muted"> today</span>
      </p>
      {showTotalReturn && (
        <p className="hero__secondary">
          Total return{' '}
          <span className={`trend--${trend(totalReturn)}`}>{withSign(totalReturn, formatPercent(totalReturn))}</span>
          <span className="hero__muted"> since inception</span>
        </p>
      )}
    </section>
  )
}
