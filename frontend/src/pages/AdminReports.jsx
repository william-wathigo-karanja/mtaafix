import { useState, useEffect } from 'react'
import * as reportsApi from '../services/reportsApi'

const STATUS_OPTIONS = ['reported', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected']

const STATUS_COLORS = {
  reported: 'secondary',
  under_review: 'info',
  assigned: 'primary',
  in_progress: 'warning',
  resolved: 'success',
  rejected: 'danger',
}

function AdminReports() {
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ category: '', status: '', priority: '' })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    reportsApi.getCategories().then((res) => setCategories(res.data))
    reportsApi.getUsers().then((res) => setUsers(res.data)).catch(() => {})
  }, [])

  const loadReports = () => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    reportsApi
      .getReports(params)
      .then((res) => setReports(res.data))
      .catch(() => setError('Could not load reports.'))
      .finally(() => setLoading(false))
  }

  useEffect(loadReports, [filters])

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  const handleStatusChange = async (reportId, newStatus) => {
    setActionError('')
    setBusyId(reportId)
    try {
      await reportsApi.changeReportStatus(reportId, newStatus)
      loadReports()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Could not update status.')
    } finally {
      setBusyId(null)
    }
  }

  const handleAssign = async (reportId, userId) => {
    setActionError('')
    setBusyId(reportId)
    try {
      await reportsApi.assignReport(reportId, userId || null)
      loadReports()
    } catch (err) {
      setActionError('Could not assign report.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Manage Reports</h2>

      <div className="row mb-3 g-2">
        <div className="col-md-4">
          <select name="category" className="form-select" value={filters.category} onChange={handleFilterChange}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select name="priority" className="form-select" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td>{report.category_name}</td>
                  <td>{report.priority}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm border-${STATUS_COLORS[report.status]}`}
                      value={report.status}
                      disabled={busyId === report.id}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={report.assigned_to || ''}
                      disabled={busyId === report.id}
                      onChange={(e) => handleAssign(report.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {users
                       .filter((u) => ['admin', 'officer'].includes(u.role))
                       .map((u) => (
                          <option key={u.id} value={u.id}>{u.username}</option>
                       ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminReports