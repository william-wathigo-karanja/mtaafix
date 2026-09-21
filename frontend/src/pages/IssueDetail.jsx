import { useParams } from 'react-router-dom'

function IssueDetail() {
  const { id } = useParams()
  return (
    <div className="container mt-5">
      <h2>Issue #{id}</h2>
      <p className="text-muted">Full details coming next.</p>
    </div>
  )
}

export default IssueDetail