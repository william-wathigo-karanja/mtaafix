import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as reportsApi from '../services/reportsApi'

const STATUS_COLORS = {
  reported: 'secondary',
  under_review: 'info',
  assigned: 'primary',
  in_progress: 'warning',
  resolved: 'success',
  rejected: 'danger',
}

function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reportsApi
      .getMyReports()
      .then((res) => setReports(res.data))
      .catch(() => setError('Could not load your reports.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Reports</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading your reports...</p>
      ) : reports.length === 0 ? (
        <div>
          <p className="text-muted">You haven't submitted any reports yet.</p>
          <Link to="/report" className="btn btn-primary">Report an Issue</Link>
        </div>
      ) : (
        <div className="list-group">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/issues/${report.id}`}
              className="list-group-item list-group-item-action"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{report.title}</strong>
                  <div className="text-muted small">{report.category_name}</div>
                </div>
                <span className={`badge bg-${STATUS_COLORS[report.status]}`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyReports