function StatsCards() {
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

  return (
    <section className="stats-grid">
      {stats.map((stat, index) => (
        <article className="stat-card" key={index}>
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
          <span>{stat.detail}</span>
        </article>
      ))}
    </section>
  );
}

export default StatsCards;