import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as reportsApi from '../services/reportsApi'

function ReportIssue() {
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    latitude: '',
    longitude: '',
    location_description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    reportsApi
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setError('Could not load categories. Please refresh the page.'))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await reportsApi.createReport(formData)
      navigate('/my-reports')
    } catch (err) {
      const data = err.response?.data
      const message = data
        ? Object.entries(data).map(([field, msgs]) => `${field}: ${msgs}`).join(' ')
        : 'Could not submit report. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2>Report an Issue</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Issue Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Priority</label>
          <select
            name="priority"
            className="form-select"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Location description (optional for now)</label>
          <input
            type="text"
            name="location_description"
            className="form-control"
            value={formData.location_description}
            onChange={handleChange}
            placeholder="e.g. Near Kenyatta Avenue roundabout"
          />
        </div>

        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              className="form-control"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="-1.286389"
              required
            />
          </div>
          <div className="col">
            <label className="form-label">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              className="form-control"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="36.817223"
              required
            />
          </div>
        </div>
        <p className="text-muted small">
          We'll replace these with an interactive map picker in the next step.
        </p>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}

export default ReportIssue