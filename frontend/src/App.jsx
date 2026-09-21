import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import IssueList from './pages/IssueList'
import IssueMap from './pages/IssueMap'
import ReportIssue from './pages/ReportIssue'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import MyReports from './pages/MyReports'
import IssueDetail from './pages/IssueDetail'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/issues" element={<IssueList />} />
        <Route path="/map" element={<IssueMap />} />
        <Route path="/register" element={<Register />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
           path="/my-reports"
           element={
             <ProtectedRoute>
              <MyReports />
             </ProtectedRoute>
           }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App