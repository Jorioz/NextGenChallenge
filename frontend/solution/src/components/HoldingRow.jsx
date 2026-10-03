import { Link, useLocation, useParams } from 'react-router-dom'
import useCurrency from '../currency/useCurrency'
import { TREND_ICON, formatPercent, isNumber, toPercent, trend, withSign } from '../portfolio/format'

// One holding in an account: what it is, what it's worth, how it moved today.
// Quantity, cost, weight and gain/loss live on the holding's detail page.
export default function HoldingRow({ holding }) {
  const { formatMoney } = useCurrency()
  const { accountId } = useParams()
  const { search } = useLocation()
  const { ticker, name, assetClass, marketValue, dayChangeAmount, dayChangePercent } = holding

  // Holding percentages are decimals (0.0032 => 0.32%), unlike the portfolio's dayChangePercent
  const dayPercent = toPercent(dayChangePercent)
  const tone = trend(isNumber(dayChangeAmount) ? dayChangeAmount : dayPercent)
  const subtitle = [name, assetClass].filter(Boolean).join(' · ')

  // Keep ?scenario= etc. so the detail page loads from the same dataset
  const detailPath = `/accounts/${encodeURIComponent(accountId)}/holdings/${encodeURIComponent(ticker)}${search}`

  return (
    <li>
      <Link to={detailPath} className="list-row">
        <span className="list-row__main">
          <span className="list-row__title">{ticker}</span>
          {subtitle && <span className="list-row__sub">{subtitle}</span>}
        </span>
        <span className="list-row__figures">
          <span className="list-row__value">{formatMoney(marketValue)}</span>
          <span className={`list-row__change trend--${tone}`}>
            {TREND_ICON[tone] && <span aria-hidden="true">{TREND_ICON[tone]} </span>}
            {withSign(dayPercent, formatPercent(dayPercent))}
          </span>
        </span>
        <span className="list-row__chevron" aria-hidden="true">›</span>
      </Link>
    </li>
  )
}
