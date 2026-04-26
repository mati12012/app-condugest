function RequestsPanel() {
  return (
    <div className="panel side-panel">
      <div className="panel-header">
        <h2>Solicitudes recientes</h2>
        <span>Ver todas</span>
      </div>

      <div className="request-card">
        <h4>Reprogramación de clase práctica</h4>
        <p>Juan Pérez solicita cambio de horario</p>
        <span className="badge danger">Urgente</span>
      </div>

      <div className="request-card">
        <h4>Solicitud de vehículo automático</h4>
        <p>María González - Clase del martes</p>
        <span className="badge warning">Pendiente</span>
      </div>

      <div className="request-card">
        <h4>Reserva de sala psicotécnica</h4>
        <p>5 alumnos para evaluación del jueves</p>
        <span className="badge info">En revisión</span>
      </div>
    </div>
  );
}

export default RequestsPanel;