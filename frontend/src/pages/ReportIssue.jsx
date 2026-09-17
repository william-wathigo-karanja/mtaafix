import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as reportsApi from '../services/reportsApi'
import LocationPicker from '../components/LocationPicker'

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

    if (!formData.latitude || !formData.longitude) {
      setError('Please select a location on the map.')
      setLoading(false)
      return
    }

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
          <label className="form-label">Location description (optional)</label>
          <input
            type="text"
            name="location_description"
            className="form-control"
            value={formData.location_description}
            onChange={handleChange}
            placeholder="e.g. Near Kenyatta Avenue roundabout"
          />
        </div>

        <div className="mb-3">
          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}

export default ReportIssue