function RequestsPanel() {
  const requests = [
    {
      title: "Reprogramación de clase práctica",
      description: "Juan Pérez solicita cambio de horario",
      status: "Urgente",
      statusClass: "danger",
    },
    {
      title: "Solicitud de vehículo automático",
      description: "María González - Clase del martes",
      status: "Pendiente",
      statusClass: "warning",
    },
    {
      title: "Reserva de sala psicotécnica",
      description: "5 alumnos para evaluación del jueves",
      status: "En revisión",
      statusClass: "info",
    },
  ];

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