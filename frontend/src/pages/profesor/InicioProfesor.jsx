import { formatearFechaVisual } from "../../utils/formatearFecha";
import {
  AgendaHoy,
  TablaClases,
  TarjetaResumen,
} from "./profesorPanel.components";
import { obtenerResumenClases } from "./profesorPanel.helpers";

function InicioProfesor({ usuario, clases, cargarMisClases, irAMisClases }) {
  const {
    fechaHoy,
    clasesHoy,
    proximasClases,
    clasesRealizadas,
    clasesCanceladas,
  } = obtenerResumenClases(clases);

  const noTieneClases = clases.length === 0;

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="max-w-3xl">
            <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
              Panel profesor
            </span>

            <h2 className="text-3xl font-bold text-slate-900 mt-4">
              Hola, {usuario?.correo || "profesor"}
            </h2>

            <p className="text-slate-500 mt-3 text-base leading-relaxed">
              Esta es tu vista de inicio. Aqui tienes a mano tu agenda del dia, tus proximas clases y el avance general de tus actividades.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 min-w-full xl:min-w-72">
            <p className="text-sm text-slate-500">Jornada de hoy</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatearFechaVisual(fechaHoy)}
            </p>
            <p className="text-sm text-slate-600 mt-3">
              {clasesHoy.length === 0
                ? "Sin clases programadas para hoy."
                : `${clasesHoy.length} clase${clasesHoy.length === 1 ? "" : "s"} programada${clasesHoy.length === 1 ? "" : "s"} para hoy.`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <TarjetaResumen valor={clases.length} etiqueta="Clases asignadas" />
        <TarjetaResumen valor={clasesHoy.length} etiqueta="Clases de hoy" color="text-blue-700" />
        <TarjetaResumen valor={proximasClases.length} etiqueta="Proximas clases" color="text-indigo-700" />
        <TarjetaResumen valor={clasesRealizadas.length} etiqueta="Realizadas" color="text-green-700" />
        <TarjetaResumen valor={clasesCanceladas.length} etiqueta="Canceladas" color="text-red-700" />
      </div>

      {noTieneClases && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-5">
          Aun no tienes clases asignadas. Cuando secretaria programe clases para ti, apareceran en este inicio.
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Proximas clases
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Un vistazo rapido a las clases pendientes.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={cargarMisClases}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
              >
                Actualizar
              </button>

              <button
                type="button"
                onClick={irAMisClases}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all"
              >
                Ver todas
              </button>
            </div>
          </div>

          <TablaClases
            clases={proximasClases.slice(0, 5)}
            vacio="No tienes proximas clases por ahora. Disfruta el respiro."
          />
        </div>

        <AgendaHoy
          clasesHoy={clasesHoy}
          breve
          titulo="Agenda breve de hoy"
        />
      </section>
    </section>
  );
}

export default InicioProfesor;
