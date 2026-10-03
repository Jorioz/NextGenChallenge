import { Link, useLocation, useParams } from 'react-router-dom'
import useCurrency from '../currency/useCurrency'
import { TREND_ICON, formatPercent, isNumber, trend, withSign } from '../portfolio/format'

// One holding in an account: what it is, what it's worth (follows the CAD/USD toggle), how it
// moved today. Links to its detail page (/accounts/:accountId/holdings/:ticker), where quantity,
// cost, weight and gain/loss live.
export default function HoldingRow({ holding }) {
  const { formatMoney } = useCurrency()
  const { accountId } = useParams()
  const { search } = useLocation()
  const { ticker, name, assetClass, marketValue, dayChangeAmount, dayChangePercent } = holding

  // Holding dayChangePercent is already a percent (2.4 => 2.4%), see PORTFOLIO-API.md
  const tone = trend(isNumber(dayChangeAmount) ? dayChangeAmount : dayChangePercent)
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
            {withSign(dayChangePercent, formatPercent(dayChangePercent))}
          </span>
        </span>
        <span className="list-row__chevron" aria-hidden="true">›</span>
      </Link>
    </li>
  )
}
