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
    <div className="flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Agenda de clases</h1>
          <p className="mt-2 text-slate-500">Planificación y control semanal de sesiones</p>
        </div>

        <button className="bg-blue-800 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors">
          + Agendar clase
        </button>
      </header>

      <section className="flex flex-wrap gap-3">
        <button className="bg-blue-800 text-white px-4 py-2 rounded-xl">Semana</button>
        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl">Todas las sedes</button>
        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl">Todas las clases</button>
        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl">Todos los profesores</button>
        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl">Todos los estados</button>
        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl">Reprogramar</button>
      </section>

      <section className="grid grid-cols-[2fr_1fr] gap-5">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Planificación semanal</h2>
            <span className="text-blue-800 text-sm font-medium">Semana actual</span>
          </div>

          <div className="grid grid-cols-[100px_repeat(6,1fr)] border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 p-4 font-bold text-center border-b border-slate-200">Hora</div>
            <div className="bg-slate-50 p-4 font-bold text-center border-b border-slate-200">Lunes</div>
            <div className="bg-slate-50 p-4 font-bold text-center border-b border-slate-200">Martes</div>
            <div className="bg-slate-50 p-4 font-bold text-center border-b border-slate-200">Miércoles</div>
            <div className="bg-slate-50 p-4 font-bold text-center border-b border-slate-200">Jueves</div>
            <div className="bg-slate-50 p-4 font-bold text-center border-b border-slate-200">Viernes</div>
            <div className="bg-slate-50 p-4 font-bold text-center border-b border-slate-200">Sábado</div>

            <div className="bg-slate-50 p-3 font-bold border-r border-b border-slate-200">09:00</div>
            <div className="min-h-20 p-2 border-r border-b border-slate-200">
              <div className="bg-emerald-100 text-emerald-900 rounded-xl p-3 font-semibold">
                Práctica - Carlos Muñoz
              </div>
            </div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-b border-slate-200"></div>

            <div className="bg-slate-50 p-3 font-bold border-r border-b border-slate-200">10:00</div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 p-2 border-r border-b border-slate-200">
              <div className="bg-amber-100 text-amber-900 rounded-xl p-3 font-semibold">
                Reprogramada - Camila Díaz
              </div>
            </div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-b border-slate-200"></div>

            <div className="bg-slate-50 p-3 font-bold border-r border-b border-slate-200">12:00</div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 p-2 border-r border-b border-slate-200">
              <div className="bg-violet-100 text-violet-700 rounded-xl p-3 font-semibold">
                Psicotécnica - Felipe Soto
              </div>
            </div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-b border-slate-200"></div>

            <div className="bg-slate-50 p-3 font-bold border-r border-b border-slate-200">15:00</div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 p-2 border-r border-b border-slate-200">
              <div className="bg-emerald-100 text-emerald-900 rounded-xl p-3 font-semibold">
                Práctica - Andrea Pérez
              </div>
            </div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-r border-b border-slate-200"></div>
            <div className="min-h-20 border-b border-slate-200"></div>

            <div className="bg-slate-50 p-3 font-bold border-r border-slate-200">18:00</div>
            <div className="min-h-20 p-2 border-r border-slate-200">
              <div className="bg-blue-100 text-blue-700 rounded-xl p-3 font-semibold">
                Teórica - Daniela Rojas
              </div>
            </div>
            <div className="min-h-20 border-r border-slate-200"></div>
            <div className="min-h-20 border-r border-slate-200"></div>
            <div className="min-h-20 border-r border-slate-200"></div>
            <div className="min-h-20 p-2 border-r border-slate-200">
              <div className="bg-blue-100 text-blue-700 rounded-xl p-3 font-semibold">
                Teórica - Nicolás Fuentes
              </div>
            </div>
            <div className="min-h-20"></div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Resumen de la semana</h2>
            <div className="flex flex-col gap-3">
              {resumenSemana.map((item, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Conflictos detectados</h2>
            <div className="flex flex-col gap-3">
              {conflictos.map((conflicto, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  {conflicto}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Próximas acciones</h2>
            <div className="flex flex-col gap-3">
              {acciones.map((accion, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  {accion}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AgendaClases;