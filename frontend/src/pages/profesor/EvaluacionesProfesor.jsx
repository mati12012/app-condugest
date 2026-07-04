import { formatearFechaVisual } from "../../utils/formatearFecha";
import { EstadoClase, TarjetaResumen } from "./profesorPanel.components";
import {
  formatearHora,
  normalizarEstado,
  obtenerNombreAlumno,
  obtenerVehiculo,
  ordenarClases,
} from "./profesorPanel.helpers";

function EvaluacionesProfesor({ clases }) {
  const clasesEvaluables = ordenarClases(clases).filter((clase) => {
    const estado = normalizarEstado(clase.estado);
    return estado === "programada" || estado === "realizada";
  });

  const totalProgramadas = clasesEvaluables.filter(
    (clase) => normalizarEstado(clase.estado) === "programada"
  ).length;

  const totalRealizadas = clasesEvaluables.filter(
    (clase) => normalizarEstado(clase.estado) === "realizada"
  ).length;

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
            Modulo en preparacion
          </span>

          <h2 className="text-2xl font-bold text-slate-900 mt-4">
            Evaluaciones practicas
          </h2>

          <p className="text-slate-500 mt-3 text-base leading-relaxed">
            Aqui podras registrar evaluaciones de clases practicas. Por ahora puedes revisar las clases programadas o realizadas que quedaran disponibles para evaluar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TarjetaResumen
          valor={clasesEvaluables.length}
          etiqueta="Clases para evaluar"
        />
        <TarjetaResumen
          valor={totalProgramadas}
          etiqueta="Programadas"
          color="text-blue-700"
        />
        <TarjetaResumen
          valor={totalRealizadas}
          etiqueta="Realizadas"
          color="text-green-700"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-5">
        El modulo de evaluacion sera implementado posteriormente. El boton de registro esta deshabilitado temporalmente.
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Clases disponibles para evaluacion
            </h3>
            <p className="text-sm text-slate-500">
              Se muestran clases programadas o realizadas asignadas al profesor.
            </p>
          </div>
        </div>

        {clasesEvaluables.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            No tienes clases programadas o realizadas para evaluar por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {clasesEvaluables.map((clase, index) => (
              <article
                key={clase.id_clase_practica || `${clase.fecha}-${clase.hora_inicio}-${index}`}
                className="border border-slate-200 rounded-2xl p-5 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {obtenerNombreAlumno(clase) || "Sin alumno"}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatearFechaVisual(clase.fecha)} - {formatearHora(clase.hora_inicio)} a {formatearHora(clase.hora_fin)}
                    </p>
                  </div>

                  <EstadoClase estado={clase.estado} />
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Vehiculo</p>
                    <p className="font-semibold text-slate-800 mt-1">
                      {obtenerVehiculo(clase)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Sede</p>
                    <p className="font-semibold text-slate-800 mt-1">
                      {clase.sede || "Sin sede"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-5 w-full px-4 py-2.5 rounded-lg bg-slate-200 text-slate-500 font-bold cursor-not-allowed"
                >
                  Registrar evaluacion
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default EvaluacionesProfesor;
