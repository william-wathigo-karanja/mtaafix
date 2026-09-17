import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet's default marker icon paths, which break under Vite's bundler
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const NAIROBI_CENTER = [-1.286389, 36.817223]

function LocationMarker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position ? <Marker position={position} /> : null
}

function LocationPicker({ latitude, longitude, onChange }) {
  const [geoError, setGeoError] = useState('')
  const [locating, setLocating] = useState(false)

  const position = latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : null

  const handleSelect = (lat, lng) => {
    onChange(lat.toFixed(6), lng.toFixed(6))
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    setGeoError('')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSelect(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      () => {
        setGeoError('Could not get your location. You can still click the map to set it manually.')
        setLocating(false)
      }
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0">Location</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={useCurrentLocation}
          disabled={locating}
        >
          {locating ? 'Locating...' : '📍 Use my current location'}
        </button>
      </div>
      {geoError && <div className="alert alert-warning py-2 small">{geoError}</div>}
      <p className="text-muted small">Click anywhere on the map to place a marker.</p>
      <MapContainer
        center={position || NAIROBI_CENTER}
        zoom={13}
        style={{ height: '350px', width: '100%', borderRadius: '6px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onSelect={handleSelect} />
      </MapContainer>
      {position && (
        <p className="text-muted small mt-2">
          Selected: {position[0]}, {position[1]}
        </p>
      )}
    </div>
  )
}

export default LocationPicker