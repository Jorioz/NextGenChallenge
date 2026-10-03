import AccountTile from '../components/AccountTile'
import OverviewPanel from '../components/OverviewPanel'
import usePortfolios from '../portfolio/usePortfolios'

// Dashboard: combined overview of every account (figures + value chart), then one row per
// account linking to its detail page. One usePortfolios load feeds both.
export default function Home() {
  // One load feeds both the combined overview and the per-account rows
  const { status, portfolios, error } = usePortfolios()

  return (
    <>
      <h1 className="page-title">Portfolio Overview</h1>
      <OverviewPanel status={status} portfolios={portfolios} error={error} />
      <section className="list-section" aria-labelledby="accounts-title">
        <h2 id="accounts-title" className="section-title">
          Accounts
        </h2>
        {status === 'success' && portfolios.length === 0 && <p className="empty">No accounts found.</p>}
        {portfolios.length > 0 && (
          <ul className="list">
            {portfolios.map((p) => (
              <AccountTile key={p.accountId} accountId={p.accountId} portfolio={p.portfolio} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
