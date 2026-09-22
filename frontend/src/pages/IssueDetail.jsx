import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as reportsApi from '../services/reportsApi'

const STATUS_COLORS = {
  reported: 'secondary',
  under_review: 'info',
  assigned: 'primary',
  in_progress: 'warning',
  resolved: 'success',
  rejected: 'danger',
}

const PRIORITY_COLORS = {
  low: 'success',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
}

const STATUS_LABELS = {
  reported: 'Reported',
  under_review: 'Under Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

function IssueDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    reportsApi
      .getReport(id)
      .then((res) => setReport(res.data))
      .catch(() => setError('Could not load this issue. It may not exist.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="container mt-5">Loading...</div>
  }

  if (error || !report) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || 'Issue not found.'}</div>
        <Link to="/issues">← Back to Issues</Link>
      </div>
    )
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '700px' }}>
      <Link to="/issues" className="d-inline-block mb-3">← Back to Issues</Link>

      {report.image && (
        <img
          src={report.image}
          alt={report.title}
          className="img-fluid rounded mb-3"
          style={{ maxHeight: '350px', width: '100%', objectFit: 'cover' }}
        />
      )}

      <h2>{report.title}</h2>
      <p className="text-muted">{report.category_name}</p>

      <div className="mb-3">
        <span className={`badge bg-${STATUS_COLORS[report.status]} me-2`}>
          {STATUS_LABELS[report.status]}
        </span>
        <span className={`badge bg-${PRIORITY_COLORS[report.priority]}`}>
          {report.priority} priority
        </span>
      </div>

      <p>{report.description}</p>

      {report.location_description && (
        <p className="text-muted">
          <strong>Location:</strong> {report.location_description}
        </p>
      )}
      <p className="text-muted small">
        Coordinates: {report.latitude}, {report.longitude}
      </p>

      <p className="text-muted small">
        Reported by {report.reported_by_username} on{' '}
        {new Date(report.created_at).toLocaleDateString()}
      </p>

      <hr />

      <h5>Status Timeline</h5>
      {report.status_history && report.status_history.length > 0 ? (
        <ul className="list-group">
          {report.status_history.map((entry) => (
            <li key={entry.id} className="list-group-item">
              <strong>{STATUS_LABELS[entry.old_status] || entry.old_status || 'Created'}</strong>
              {' → '}
              <strong>{STATUS_LABELS[entry.new_status] || entry.new_status}</strong>
              <div className="text-muted small">
                {new Date(entry.created_at).toLocaleString()}
                {entry.changed_by_name && ` · by ${entry.changed_by_name}`}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No status changes yet — still at "Reported."</p>
      )}
    </div>
  )
}

export default IssueDetail