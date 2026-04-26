function StatsCards() {
  return (
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
  );
}

export default StatsCards;