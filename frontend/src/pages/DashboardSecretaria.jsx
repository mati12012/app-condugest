import Sidebar from "../components/Sidebar";
import StatsCards from "../components/StatsCards";
import AgendaTable from "../components/AgendaTable";
import RequestsPanel from "../components/RequestsPanel";

function DashboardSecretaria() {
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

        <StatsCards />

        <section className="content-grid">
          <AgendaTable />
          <RequestsPanel />
        </section>
      </main>
    </div>
  );
}

export default DashboardSecretaria;