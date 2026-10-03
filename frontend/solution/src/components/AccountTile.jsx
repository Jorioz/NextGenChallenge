import { Link } from 'react-router-dom'
import Money from '../currency/Money'
import { NOT_FOUND, TREND_ICON, formatPercent, isNumber, trend, withSign } from '../portfolio/format'

// One account row on the dashboard: name, value, today's % move. Links to the account's detail view.
export default function AccountTile({ accountId, portfolio = {} }) {
  const { label, totalMarketValue, dayChangeAmount, dayChangePercent } = portfolio
  const tone = trend(isNumber(dayChangeAmount) ? dayChangeAmount : dayChangePercent)

  return (
    <li>
      <Link to={`/accounts/${encodeURIComponent(accountId)}`} className="list-row">
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
