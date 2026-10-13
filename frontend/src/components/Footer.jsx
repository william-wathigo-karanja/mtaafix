import { Link } from 'react-router-dom'
import Logo from './Logo'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="flag-stripe" />
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Logo size={26} />
              <strong className="fs-5">MtaaFix</strong>
            </div>
            <p className="mb-1">Ripoti. Fuatilia. Boresha.</p>
            <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Pamoja tujenge mtaa wetu.
            </p>
          </div>

          <div className="col-6 col-md-3">
            <h6>Explore</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-1"><Link to="/issues">Issues</Link></li>
              <li className="mb-1"><Link to="/map">Map</Link></li>
              <li className="mb-1"><Link to="/report">Report an Issue</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-4">
            <h6>Project</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-1">
                <a
                  href="https://github.com/william-wathigo-karanja/mtaafix"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source code on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        <div
          className="small d-flex justify-content-between flex-wrap gap-2"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          <span>© {new Date().getFullYear()} MtaaFix. Made in Kenya.</span>
          <span>Built by William Wathigo</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer