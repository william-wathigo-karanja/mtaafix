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

const STAGES = [
  { key: 'reported', text: 'Report received' },
  { key: 'under_review', text: 'Being reviewed by the team' },
  { key: 'assigned', text: 'Assigned to someone to handle' },
  { key: 'in_progress', text: 'Work has started' },
  { key: 'resolved', text: 'The issue has been fixed' },
]

const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })

function StatusStepper({ report }) {
  const history = report.status_history || []

  // latest time the report entered a given stage (null if it never did)
  const dateFor = (stage) => {
    if (stage === 'reported') return report.created_at
    const entry = [...history].reverse().find((e) => e.new_status === stage)
    return entry ? entry.created_at : null
  }

  if (report.status === 'rejected') {
    const entry = [...history].reverse().find((e) => e.new_status === 'rejected')
    return (
      <div className="alert alert-danger mb-0">
        <strong>This report was rejected.</strong> It was judged invalid or outside the scope of
        this platform.
        {entry && <div className="small mt-1">{formatDateTime(entry.created_at)}</div>}
      </div>
    )
  }

  const currentIndex = STAGES.findIndex((s) => s.key === report.status)

  return (
    <ol className="status-stepper">
      {STAGES.map((stage, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending'
        const date = dateFor(stage.key)
        return (
          <li
            key={stage.key}
            className={`status-step ${state}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="status-dot">{state === 'done' ? '✓' : index + 1}</span>
            <div className="fw-semibold">{STATUS_LABELS[stage.key]}</div>
            <div className="small text-muted">{stage.text}</div>
            {date && state !== 'pending' && (
              <div className="small text-muted">{formatDateTime(date)}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
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
    <div className="container mt-5 mb-5" style={{ maxWidth: '700px' }}>
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
        {new Date(report.created_at).toLocaleDateString('en-KE')}
      </p>

      <hr />

      <h5 className="mb-3">Progress</h5>
      <StatusStepper report={report} />
    </div>
  )
}

export default IssueDetail