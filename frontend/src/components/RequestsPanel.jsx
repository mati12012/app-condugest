function RequestsPanel({ requests }) {
  return (
    <div className="panel side-panel">
      <div className="panel-header">
        <h2>Solicitudes recientes</h2>
        <span>Ver todas</span>
      </div>

      {requests.map((request, index) => (
        <div className="request-card" key={index}>
          <h4>{request.title}</h4>
          <p>{request.description}</p>
          <span className={`badge ${request.statusClass}`}>
            {request.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RequestsPanel;