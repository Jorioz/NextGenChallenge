import { useContext, useEffect, useMemo } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import AllocationChart from '../components/AllocationChart'
import HoldingsTable from '../components/HoldingsTable'
import HistoryChart from '../components/HistoryChart'
import SummaryCard from '../components/SummaryCard'
import { PortfolioContext } from '../portfolio/PortfolioContext'
import { fromPerformanceHistory } from '../portfolio/history'

// Ways to show the account's positions; the choice lives in the URL as ?view= (Holdings is the default)
const VIEWS = [
  { id: 'holdings', label: 'Holdings' },
  { id: 'breakdown', label: 'Breakdown' },
]

// One account's figures, value history and positions, for the account in the URL
// (/accounts/:accountId). Selecting it in PortfolioProvider triggers the load. The positions
// switch between the holdings table and the asset-allocation pie (?view=breakdown).
export default function AccountDetail() {
  const { accountId } = useParams()
  const { search } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { accountId: selectedId, selectAccount, status, data, error } = useContext(PortfolioContext)
  const view = searchParams.get('view') === 'breakdown' ? 'breakdown' : 'holdings'

  // The URL is the source of truth; sync it into the provider that loads the portfolio
  useEffect(() => {
    selectAccount(accountId)
  }, [accountId, selectAccount])

  const histories = useMemo(() => [fromPerformanceHistory(data?.performanceHistory)], [data])
  // Until the provider catches up, its data may belong to a previously viewed account
  const isCurrent = selectedId === accountId && status !== 'loading'

  // Switches the positions view, keeping every other query param (e.g. a mock ?scenario=)
  const selectView = (next) => {
    setSearchParams(
      (params) => {
        const updated = new URLSearchParams(params)
        if (next === 'holdings') updated.delete('view')
        else updated.set('view', next)
        return updated
      },
      { replace: true },
    )
  }

  return (
    <>
      <Link to={{ pathname: '/', search }} className="back-link">
        ← All accounts
      </Link>
      {!isCurrent && <p>Loading account…</p>}
      {isCurrent && status === 'error' && <p role="alert">{error.message}</p>}
      {isCurrent && status === 'success' && (
        <>
          <h1>{data.portfolio?.label ?? accountId}</h1>
          <section className="overview-panel" aria-label="Account overview">
            <SummaryCard />
            <HistoryChart histories={histories} title="Account value" />
          </section>
          <div className="view-switch" role="group" aria-label="Positions view">
            {VIEWS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                className={view === id ? 'value-chart__range value-chart__range--active' : 'value-chart__range'}
                onClick={() => selectView(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {view === 'breakdown' ? <AllocationChart allocation={data.allocation} /> : <HoldingsTable />}
        </>
      )}
    </>
  )
}
