import Sidebar from "../components/Sidebar";
import StatsCards from "../components/StatsCards";
import AgendaTable from "../components/AgendaTable";
import RequestsPanel from "../components/RequestsPanel";

function DashboardSecretaria() {
  const stats = [
    {
      value: 248,
      label: "Alumnos activos",
      detail: "+12 este mes",
    },
    {
      value: 36,
      label: "Clases de hoy",
      detail: "8 completadas",
    },
    {
      value: 14,
      label: "Profesores asignados",
      detail: "Todos disponibles",
    },
    {
      value: 9,
      label: "Solicitudes pendientes",
      detail: "Requieren atención",
    },
  ];

  const agenda = [
    {
      hora: "09:00",
      tipo: "Práctica",
      profesor: "Carlos Muñoz",
      sede: "Sede Centro",
      estado: "Confirmada",
      claseEstado: "success",
    },
    {
      hora: "10:30",
      tipo: "Teórica Online",
      profesor: "Daniela Rojas",
      sede: "Zoom",
      estado: "En curso",
      claseEstado: "info",
    },
    {
      hora: "12:00",
      tipo: "Psicotécnica",
      profesor: "Felipe Soto",
      sede: "Sala 2",
      estado: "Pendiente",
      claseEstado: "warning",
    },
    {
      hora: "15:00",
      tipo: "Práctica",
      profesor: "Andrea Pérez",
      sede: "Sede Norte",
      estado: "Confirmada",
      claseEstado: "success",
    },
  ];

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
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Panel de Secretaría</h1>
            <p>Gestión operativa diaria de la escuela</p>
          </div>

          <button className="primary-button">+ Nueva gestión</button>
        </header>

        <StatsCards stats={stats} />

        <section className="content-grid">
          <AgendaTable agenda={agenda} />
          <RequestsPanel requests={requests} />
        </section>
      </main>
    </div>
  );
}

export default DashboardSecretaria;