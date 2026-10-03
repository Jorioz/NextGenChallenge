import { Link, useLocation } from 'react-router-dom'
import Money from '../currency/Money'
import { NOT_FOUND, TREND_ICON, formatPercent, isNumber, trend, withSign } from '../portfolio/format'

// One account row on the dashboard: name, market value (follows the CAD/USD toggle) and today's
// % move. Links to that account's detail view, keeping any mock ?scenario= in the URL.
export default function AccountTile({ accountId, portfolio = {} }) {
  const { search } = useLocation()
  const { label, totalMarketValue, dayChangeAmount, dayChangePercent } = portfolio
  const tone = trend(isNumber(dayChangeAmount) ? dayChangeAmount : dayChangePercent)

  return (
    <li>
      <Link to={{ pathname: `/accounts/${encodeURIComponent(accountId)}`, search }} className="list-row">
        <span className="list-row__main">
          <span className="list-row__title">{label ?? NOT_FOUND}</span>
        </span>
        <span className="list-row__figures">
          <Money amount={totalMarketValue} className="list-row__value" />
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
