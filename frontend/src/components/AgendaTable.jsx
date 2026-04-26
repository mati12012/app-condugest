function AgendaTable() {
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
  );
}

export default AgendaTable;