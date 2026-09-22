import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as reportsApi from '../services/reportsApi'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportsApi
      .getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load dashboard statistics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mt-5">Loading dashboard...</div>
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>

  const maxCategoryCount = Math.max(...stats.by_category.map((c) => c.count), 1)

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="row g-3 mb-5">
        <StatCard label="Total Issues" value={stats.total_issues} color="dark" />
        <StatCard label="Open Issues" value={stats.open_issues} color="secondary" />
        <StatCard label="In Progress" value={stats.in_progress_issues} color="warning" />
        <StatCard label="Resolved" value={stats.resolved_issues} color="success" />
        <StatCard label="Critical Issues" value={stats.critical_issues} color="danger" />
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <h5>Issues by Category</h5>
          <div className="border rounded p-3">
            {stats.by_category.map((cat) => (
              <div key={cat.category__name} className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>{cat.category__name}</span>
                  <span>{cat.count}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <h5>Recent Reports</h5>
          <div className="list-group">
            {stats.recent_reports.map((report) => (
              <Link
                key={report.id}
                to={`/issues/${report.id}`}
                className="list-group-item list-group-item-action"
              >
                <div className="d-flex justify-content-between">
                  <span>{report.title}</span>
                  <span className="badge bg-secondary">{report.status.replace('_', ' ')}</span>
                </div>
                <small className="text-muted">{report.category_name}</small>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="col-6 col-md-2">
      <div className={`card text-white bg-${color} text-center`}>
        <div className="card-body">
          <h3 className="mb-0">{value}</h3>
          <small>{label}</small>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard