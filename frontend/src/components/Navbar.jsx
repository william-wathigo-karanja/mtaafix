import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">MtaaFix</Link>
        <div className="navbar-nav ms-auto d-flex flex-row gap-3">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/issues">Issues</Link>
          <Link className="nav-link" to="/map">Map</Link>

          {user ? (
            <>
              <Link className="nav-link" to="/report">Report an Issue</Link>
              <Link className="nav-link" to="/my-reports">My Reports</Link>
              {user.role === 'admin' && (
                <Link className="nav-link" to="/admin">Admin</Link>
              )}
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout ({user.username})
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar