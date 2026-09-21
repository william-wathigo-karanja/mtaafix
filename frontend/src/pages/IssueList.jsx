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

const PRIORITY_COLORS = {
  low: 'success',
  medium: 'warning',
  high: 'orange',
  critical: 'danger',
}

function IssueList() {
  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ category: '', status: '', priority: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reportsApi.getCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    )
    reportsApi
      .getReports(params)
      .then((res) => setReports(res.data))
      .catch(() => setError('Could not load issues.'))
      .finally(() => setLoading(false))
  }, [filters])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Community Issues</h2>

      <div className="row mb-4 g-2">
        <div className="col-md-4">
          <select
            name="category"
            className="form-select"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            name="status"
            className="form-select"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="col-md-4">
          <select
            name="priority"
            className="form-select"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Loading issues...</p>
      ) : reports.length === 0 ? (
        <p className="text-muted">No issues match these filters.</p>
      ) : (
        <div className="row g-3">
          {reports.map((report) => (
            <div className="col-md-6 col-lg-4" key={report.id}>
              <Link to={`/issues/${report.id}`} className="text-decoration-none text-dark">
                <div className="card h-100 shadow-sm">
                  {report.image && (
                    <img
                      src={report.image}
                      alt={report.title}
                      className="card-img-top"
                      style={{ height: '160px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{report.title}</h5>
                    <p className="text-muted small mb-2">{report.category_name}</p>
                    <span className={`badge bg-${STATUS_COLORS[report.status]} me-2`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    <span className={`badge bg-${PRIORITY_COLORS[report.priority]}`}>
                      {report.priority}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default IssueList