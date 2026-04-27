function AgendaTable({ agenda }) {
  return (
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
          {agenda.map((item, index) => (
            <tr key={index}>
              <td>{item.hora}</td>
              <td>{item.tipo}</td>
              <td>{item.profesor}</td>
              <td>{item.sede}</td>
              <td>
                <span className={`badge ${item.claseEstado}`}>
                  {item.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgendaTable;