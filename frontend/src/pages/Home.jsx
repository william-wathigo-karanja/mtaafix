import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as reportsApi from '../services/reportsApi'

const STEPS = [
  {
    title: 'Report',
    text: 'Spot a problem? Pin it on the map, add a photo and a short description. It takes about a minute.',
  },
  {
    title: 'Track',
    text: 'Your report is reviewed and assigned to the right people. Follow every status change in real time.',
  },
  {
    title: 'Improve',
    text: 'Once the issue is fixed, it is marked resolved. Everyone can see what got done in their area.',
  },
]

function Home() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    reportsApi
      .getReports()
      .then((res) => {
        const reports = res.data
        setStats({
          total: reports.length,
          resolved: reports.filter((r) => r.status === 'resolved').length,
          inProgress: reports.filter((r) =>
            ['under_review', 'assigned', 'in_progress'].includes(r.status)
          ).length,
        })
      })
      .catch(() => setStats(null))
  }, [])

  return (
    <div>
      <div className="flag-stripe" />

      <div className="container py-5 text-center" style={{ maxWidth: '640px' }}>
        <h1 className="fw-bold mb-2" style={{ color: 'var(--bs-secondary)' }}>MtaaFix</h1>
        <p className="fs-4 mb-1" style={{ color: 'var(--bs-primary)' }}>Report. Track. Improve.</p>
        <p className="text-muted fst-italic mb-3">Ripoti. Fuatilia. Boresha.</p>
        <p className="text-muted mb-4">
          Help make your community better by reporting local problems that need attention:
          potholes, blocked drains, broken streetlights, and more.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/report" className="btn btn-primary btn-lg px-4">Report an Issue</Link>
          <Link to="/issues" className="btn btn-outline-secondary btn-lg px-4">View Issues</Link>
        </div>
      </div>

      {stats && (
        <div className="container pb-5" style={{ maxWidth: '720px' }}>
          <div className="row g-3 text-center">
            <div className="col-4">
              <div className="stat-number">{stats.total}</div>
              <div className="text-muted small">Issues reported</div>
            </div>
            <div className="col-4">
              <div className="stat-number">{stats.inProgress}</div>
              <div className="text-muted small">Being handled</div>
            </div>
            <div className="col-4">
              <div className="stat-number">{stats.resolved}</div>
              <div className="text-muted small">Resolved</div>
            </div>
          </div>
        </div>
      )}

      <div className="container pb-5" style={{ maxWidth: '900px' }}>
        <h2 className="text-center h4 fw-bold mb-4">How it works</h2>
        <div className="row g-4">
          {STEPS.map((step, index) => (
            <div className="col-md-4 text-center" key={step.title}>
              <div className="step-circle">{index + 1}</div>
              <h3 className="h5 fw-semibold">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home