function AgendaTable() {
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