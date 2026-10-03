import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { RANGES, breakGaps, combineHistories, filterHistory } from '../portfolio/history'
import useCurrency from '../currency/useCurrency'
import { trend } from '../portfolio/format'

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Filler)

// Mirrors --positive / --negative / --accent in index.css (canvas can't read CSS variables directly)
const LINE_COLOR = {
  positive: { line: '#15803d', fill: 'rgba(21, 128, 61, 0.08)' },
  negative: { line: '#b91c1c', fill: 'rgba(185, 28, 28, 0.08)' },
  neutral: { line: '#2563eb', fill: 'rgba(37, 99, 235, 0.08)' },
}

// `histories` is a list of [{ date, value }] series (raw CAD), summed into a single line.
// Pass one series for a single account or a single security's price.
// `simple` drops the axes and title for an at-a-glance trend line; hover still shows values.
export default function HistoryChart({ histories = [], title, simple = false }) {
  const [range, setRange] = useState('ALL')
  // Values stay CAD in the dataset; formatMoney converts to the selected currency for display
  const { formatMoney } = useCurrency()

  const combined = useMemo(() => combineHistories(histories), [histories])
  const points = useMemo(() => breakGaps(filterHistory(combined, range)), [combined, range])

  const realPoints = points.filter((p) => p.value !== null).length
  // Show dots when there are too few points to form a readable line
  const pointRadius = realPoints <= 2 ? 4 : 0

  // Color the line by whether the range ended up or down
  const values = points.map((p) => p.value).filter((v) => v !== null)
  const tone = trend(values.length > 1 ? values[values.length - 1] - values[0] : 0)
  const color = LINE_COLOR[tone]

  const data = {
    datasets: [
      {
        data: points.map((p) => ({ x: p.date, y: p.value })),
        borderColor: color.line,
        backgroundColor: color.fill,
        fill: true,
        spanGaps: false,
        pointRadius,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        type: 'time',
        time: { tooltipFormat: 'MMM d, yyyy' },
        display: !simple,
        grid: { display: false },
        ticks: { maxTicksLimit: 6, color: '#6b7280' },
        border: { display: false },
        // A lone point would otherwise get a zero-width axis
        ...(realPoints === 1 && {
          min: Date.parse(points[0].date) - 86400000,
          max: Date.parse(points[0].date) + 86400000,
        }),
      },
      y: {
        display: !simple,
        grid: { color: '#f0f1f3' },
        border: { display: false },
        ticks: { maxTicksLimit: 5, color: '#6b7280', callback: (value) => formatMoney(value) },
      },
    },
    plugins: {
      tooltip: {
        callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) },
      },
    },
  }

  return (
    <section className={simple ? 'value-chart value-chart--simple' : 'value-chart'} aria-label={title}>
      <div className="value-chart__header">
        {!simple && <h2 className="value-chart__title">{title}</h2>}
        <div className="value-chart__ranges" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={r === range}
              className={r === range ? 'value-chart__range value-chart__range--active' : 'value-chart__range'}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="value-chart__canvas">
        {realPoints === 0 ? <p>No history available for this range.</p> : <Line data={data} options={options} />}
      </div>
    </section>
  )
}
