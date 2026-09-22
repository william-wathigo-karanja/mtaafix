import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import * as reportsApi from '../services/reportsApi'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const NAIROBI_CENTER = [-1.286389, 36.817223]

const STATUS_COLORS = {
  reported: 'secondary',
  under_review: 'info',
  assigned: 'primary',
  in_progress: 'warning',
  resolved: 'success',
  rejected: 'danger',
}

function IssueMap() {
  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ category: '', status: '', priority: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    reportsApi.getCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    )
    reportsApi
      .getReports(params)
      .then((res) => setReports(res.data))
      .catch(() => setError('Could not load issues.'))
  }, [filters])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">Issue Map</h2>

      <div className="row mb-3 g-2">
        <div className="col-md-3">
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
        <div className="col-md-3">
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
        <div className="col-md-3">
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

      <MapContainer
        center={NAIROBI_CENTER}
        zoom={12}
        style={{ height: '65vh', width: '100%', borderRadius: '6px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
          >
            <Popup>
              <strong>{report.title}</strong>
              <br />
              {report.category_name}
              <br />
              <span className={`badge bg-${STATUS_COLORS[report.status]}`}>
                {report.status.replace('_', ' ')}
              </span>
              <br />
              <Link to={`/issues/${report.id}`}>View full issue →</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <p className="text-muted small mt-2">{reports.length} issue(s) shown</p>
    </div>
  )
}

export default IssueMap