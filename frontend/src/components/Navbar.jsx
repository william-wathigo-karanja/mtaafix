import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  const handleLogout = async () => {
    closeMenu()
    await logoutUser()
    navigate('/')
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link
          className="navbar-brand fw-bold d-flex align-items-center gap-2"
          to="/"
          onClick={closeMenu}
        >
          <Logo />
          MtaaFix
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-nav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div id="main-nav" className={`collapse navbar-collapse${open ? ' show' : ''}`}>
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <NavLink className={linkClass} to="/" end onClick={closeMenu}>Home</NavLink>
            <NavLink className={linkClass} to="/issues" onClick={closeMenu}>Issues</NavLink>
            <NavLink className={linkClass} to="/map" onClick={closeMenu}>Map</NavLink>

            {user ? (
              <>
                <NavLink className={linkClass} to="/report" onClick={closeMenu}>Report an Issue</NavLink>
                <NavLink className={linkClass} to="/my-reports" onClick={closeMenu}>My Reports</NavLink>
                {user.role === 'admin' && (
                  <NavLink className={linkClass} to="/admin" onClick={closeMenu}>Admin</NavLink>
                )}
                <button className="btn btn-outline-light btn-sm mt-2 mt-lg-0" onClick={handleLogout}>
                  Logout ({user.username})
                </button>
              </>
            ) : (
              <>
                <NavLink className={linkClass} to="/login" onClick={closeMenu}>Login</NavLink>
                <NavLink className={linkClass} to="/register" onClick={closeMenu}>Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar