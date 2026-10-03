import { useMemo } from 'react'
import { Pie } from 'react-chartjs-2'
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import Money from '../currency/Money'
import useCurrency from '../currency/useCurrency'
import { allocationSlices, formatShare, visibleArcValues } from '../portfolio/allocation'

ChartJS.register(ArcElement, Tooltip)

// Pie of how an account is split across asset classes, with a legend giving each class's colour,
// true share and value (money follows the CAD/USD toggle). `allocation` is the API's raw CAD
// [{ assetClass, value }]. Tiny slices are drawn at a minimum size but labelled with their real share.
export default function AllocationChart({ allocation, title = 'Asset allocation' }) {
  const { formatMoney } = useCurrency()
  const slices = useMemo(() => allocationSlices(allocation), [allocation])

  if (slices.length === 0) {
    return (
      <section className="allocation-chart" aria-label={title}>
        <h2 className="allocation-chart__title">{title}</h2>
        <p>No allocation data for this account.</p>
      </section>
    )
  }

  const data = {
    labels: slices.map((slice) => slice.assetClass),
    datasets: [
      {
        data: visibleArcValues(slices),
        backgroundColor: slices.map((slice) => slice.color),
        borderColor: '#fff',
        // A single class is one full disc; a border would draw a seam at 12 o'clock
        borderWidth: slices.length === 1 ? 0 : 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // The HTML legend below replaces Chart.js's own
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const slice = slices[ctx.dataIndex]
            return `${formatShare(slice.percent)} (${formatMoney(slice.value)})`
          },
        },
      },
    },
  }

  const summary = slices.map((slice) => `${slice.assetClass} ${formatShare(slice.percent)}`).join(', ')

  return (
    <section className="allocation-chart" aria-label={title}>
      <h2 className="allocation-chart__title">{title}</h2>
      <div className="allocation-chart__body">
        <div className="allocation-chart__canvas">
          <Pie data={data} options={options} role="img" aria-label={`${title}: ${summary}`} />
        </div>
        <ul className="allocation-chart__legend">
          {slices.map((slice, i) => (
            <li key={`${slice.assetClass}-${i}`} className="allocation-chart__item">
              <span className="allocation-chart__swatch" style={{ backgroundColor: slice.color }} aria-hidden="true" />
              <span className="allocation-chart__class">{slice.assetClass}</span>
              <span className="allocation-chart__percent">{formatShare(slice.percent)}</span>
              <Money amount={slice.value} className="allocation-chart__value" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
