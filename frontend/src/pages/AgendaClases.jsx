import Sidebar from "../components/Sidebar";

function AgendaClases() {
  const resumenSemana = [
    { label: "Clases programadas", value: 36 },
    { label: "Clases teóricas online", value: 8 },
    { label: "Clases prácticas", value: 20 },
    { label: "Evaluaciones psicotécnicas", value: 5 },
    { label: "Reprogramaciones pendientes", value: 3 },
  ];

  const conflictos = [
    "Profesor Andrea López con solapamiento el jueves",
    "Sala 2 reservada y ocupada a la misma hora",
    "Vehículo automático solicitado sin disponibilidad completa",
    "2 alumnos pendientes de reprogramación",
  ];

  const acciones = [
    "Confirmar clase práctica de las 15:00",
    "Aprobar reprogramación de Camila Díaz",
    "Validar disponibilidad de vehículo automático",
    "Reservar sala psicotécnica para 5 alumnos",
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Agenda de clases</h1>
            <p>Planificación y control semanal de sesiones</p>
          </div>

          <button className="primary-button">+ Agendar clase</button>
        </header>

        <section className="agenda-filters">
          <button className="filter-button active-filter">Semana</button>
          <button className="filter-button">Todas las sedes</button>
          <button className="filter-button">Todas las clases</button>
          <button className="filter-button">Todos los profesores</button>
          <button className="filter-button">Todos los estados</button>
          <button className="filter-button">Reprogramar</button>
        </section>

        <section className="agenda-page-grid">
          <div className="panel agenda-main-panel">
            <div className="panel-header">
              <h2>Planificación semanal</h2>
              <span>Semana actual</span>
            </div>

            <div className="week-grid">
              <div className="week-header">Hora</div>
              <div className="week-header">Lunes</div>
              <div className="week-header">Martes</div>
              <div className="week-header">Miércoles</div>
              <div className="week-header">Jueves</div>
              <div className="week-header">Viernes</div>
              <div className="week-header">Sábado</div>

              <div className="week-cell hour">09:00</div>
              <div className="week-cell event success-event">Práctica - Carlos Muñoz</div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>

              <div className="week-cell hour">10:00</div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell event warning-event">Reprogramada - Camila Díaz</div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>

              <div className="week-cell hour">12:00</div>
              <div className="week-cell"></div>
              <div className="week-cell event purple-event">Psicotécnica - Felipe Soto</div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>

              <div className="week-cell hour">15:00</div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell event success-event">Práctica - Andrea Pérez</div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>

              <div className="week-cell hour">18:00</div>
              <div className="week-cell event info-event">Teórica - Daniela Rojas</div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell"></div>
              <div className="week-cell event info-event">Teórica - Nicolás Fuentes</div>
              <div className="week-cell"></div>
            </div>
          </div>

          <div className="agenda-side-column">
            <div className="panel">
              <div className="panel-header">
                <h2>Resumen de la semana</h2>
              </div>

              <div className="summary-list">
                {resumenSemana.map((item, index) => (
                  <div className="summary-item" key={index}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Conflictos detectados</h2>
              </div>

              <div className="conflict-list">
                {conflictos.map((conflicto, index) => (
                  <div className="conflict-item" key={index}>
                    {conflicto}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Próximas acciones</h2>
              </div>

              <div className="actions-list">
                {acciones.map((accion, index) => (
                  <div className="action-item" key={index}>
                    {accion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AgendaClases;