function StatsCards({ stats }) {
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