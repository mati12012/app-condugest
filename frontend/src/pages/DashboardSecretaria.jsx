function DashboardSecretaria() {
  const stats = [
    {
      value: 248,
      label: 'Alumnos activos',
      detail: '+12 este mes',
      detailColor: 'text-emerald-600',
    },
    {
      value: 36,
      label: 'Clases de hoy',
      detail: '8 completadas',
      detailColor: 'text-emerald-600',
    },
    {
      value: 14,
      label: 'Profesores asignados',
      detail: 'Todos disponibles',
      detailColor: 'text-emerald-600',
    },
    {
      value: 9,
      label: 'Solicitudes pendientes',
      detail: 'Requieren atención',
      detailColor: 'text-emerald-600',
    },
  ];

  const agenda = [
    {
      hora: '09:00',
      tipo: 'Práctica',
      profesor: 'Carlos Muñoz',
      sede: 'Sede Concepcion',
      estado: 'Confirmada',
      estadoClasses: 'bg-emerald-100 text-emerald-700',
    },
    {
      hora: '10:30',
      tipo: 'Teórica Online',
      profesor: 'Daniela Rojas',
      sede: 'Zoom',
      estado: 'En curso',
      estadoClasses: 'bg-blue-100 text-blue-700',
    },
    {
      hora: '12:00',
      tipo: 'Psicotécnica',
      profesor: 'Felipe Soto',
      sede: 'Sala 2',
      estado: 'Pendiente',
      estadoClasses: 'bg-amber-100 text-amber-700',
    },
    {
      hora: '15:00',
      tipo: 'Práctica',
      profesor: 'Andrea Pérez',
      sede: 'Sede San Pedro',
      estado: 'Confirmada',
      estadoClasses: 'bg-emerald-100 text-emerald-700',
    },
  ];

  const requests = [
    {
      title: 'Reprogramación de clase práctica',
      description: 'Juan Pérez solicita cambio de horario',
      status: 'Urgente',
      statusClasses: 'bg-red-100 text-red-700',
    },
    {
      title: 'Solicitud de vehículo automático',
      description: 'María González - Clase del martes',
      status: 'Pendiente',
      statusClasses: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Reserva de sala psicotécnica',
      description: '5 alumnos para evaluación del jueves',
      status: 'En revisión',
      statusClasses: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Panel de Secretaría</h1>
          <p className="mt-2 text-slate-500">Gestión operativa diaria de la escuela</p>
        </div>

        <button className="bg-blue-800 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors">
          + Nueva gestión
        </button>
      </header>

      <section className="grid grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <article key={index} className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-5xl font-bold text-slate-900">{stat.value}</h3>
            <p className="mt-3 text-slate-600 text-lg">{stat.label}</p>
            <span className={`mt-2 inline-block text-sm font-medium ${stat.detailColor}`}>
              {stat.detail}
            </span>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-[2fr_1fr] gap-5">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Agenda del día</h2>
            <span className="text-blue-800 text-sm font-medium">Ver todas</span>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-4 px-2">Hora</th>
                <th className="py-4 px-2">Tipo de clase</th>
                <th className="py-4 px-2">Profesor</th>
                <th className="py-4 px-2">Sede</th>
                <th className="py-4 px-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {agenda.map((item, index) => (
                <tr key={index} className="border-b border-slate-200">
                  <td className="py-4 px-2">{item.hora}</td>
                  <td className="py-4 px-2">{item.tipo}</td>
                  <td className="py-4 px-2">{item.profesor}</td>
                  <td className="py-4 px-2">{item.sede}</td>
                  <td className="py-4 px-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.estadoClasses}`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Solicitudes recientes</h2>
            <span className="text-blue-800 text-sm font-medium">Ver todas</span>
          </div>

          <div className="flex flex-col gap-4">
            {requests.map((request, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-slate-900">{request.title}</h4>
                <p className="mt-2 text-slate-600">{request.description}</p>
                <span className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-semibold ${request.statusClasses}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardSecretaria;