function DashboardSecretaria() {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <h2>ConduGest</h2>
            <p>Sistema de gestión</p>
          </div>

          <nav className="menu">
            <div className="menu-item active">Dashboard</div>
            <div className="menu-item">Alumnos</div>
            <div className="menu-item">Clases teóricas</div>
            <div className="menu-item">Clases prácticas</div>
            <div className="menu-item">Profesores</div>
            <div className="menu-item">Vehículos</div>
            <div className="menu-item">Salas psicotécnicas</div>
            <div className="menu-item">Reprogramaciones</div>
            <div className="menu-item">Reportes</div>
            <div className="menu-item">Configuración</div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <strong>Secretaría Central</strong>
          <p>En línea</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Panel de Secretaría</h1>
            <p>Gestión operativa diaria de la escuela</p>
          </div>

          <button className="primary-button">+ Nueva gestión</button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <h3>248</h3>
            <p>Alumnos activos</p>
            <span>+12 este mes</span>
          </article>

          <article className="stat-card">
            <h3>36</h3>
            <p>Clases de hoy</p>
            <span>8 completadas</span>
          </article>

          <article className="stat-card">
            <h3>14</h3>
            <p>Profesores asignados</p>
            <span>Todos disponibles</span>
          </article>

          <article className="stat-card">
            <h3>9</h3>
            <p>Solicitudes pendientes</p>
            <span>Requieren atención</span>
          </article>
        </section>

        <section className="content-grid">
          <div className="panel large-panel">
            <div className="panel-header">
              <h2>Agenda del día</h2>
              <span>Ver todas</span>
            </div>

            <table className="agenda-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Tipo de clase</th>
                  <th>Profesor</th>
                  <th>Sede</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>09:00</td>
                  <td>Práctica</td>
                  <td>Carlos Muñoz</td>
                  <td>Sede Centro</td>
                  <td><span className="badge success">Confirmada</span></td>
                </tr>
                <tr>
                  <td>10:30</td>
                  <td>Teórica Online</td>
                  <td>Daniela Rojas</td>
                  <td>Zoom</td>
                  <td><span className="badge info">En curso</span></td>
                </tr>
                <tr>
                  <td>12:00</td>
                  <td>Psicotécnica</td>
                  <td>Felipe Soto</td>
                  <td>Sala 2</td>
                  <td><span className="badge warning">Pendiente</span></td>
                </tr>
                <tr>
                  <td>15:00</td>
                  <td>Práctica</td>
                  <td>Andrea Pérez</td>
                  <td>Sede Norte</td>
                  <td><span className="badge success">Confirmada</span></td>
                </tr>
              </tbody>
            </table>
          </div>

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
        </section>
      </main>
    </div>
  );
}

export default DashboardSecretaria;