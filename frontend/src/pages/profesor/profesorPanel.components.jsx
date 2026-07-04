import { formatearFechaVisual } from "../../utils/formatearFecha";
import {
  formatearHora,
  mostrarEstado,
  obtenerClaseEstado,
  obtenerNombreAlumno,
  obtenerVehiculo,
} from "./profesorPanel.helpers";

export function TarjetaResumen({ valor, etiqueta, color = "text-slate-900" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className={`text-4xl font-bold ${color}`}>{valor}</p>
      <p className="text-slate-500 mt-2">{etiqueta}</p>
    </div>
  );
}

export function EstadoClase({ estado }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${obtenerClaseEstado(estado)}`}>
      {mostrarEstado(estado)}
    </span>
  );
}

export function TablaClases({ clases, vacio = "No hay clases para mostrar." }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3">Alumno</th>
              <th className="px-4 py-3">Vehiculo</th>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {clases.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                  {vacio}
                </td>
              </tr>
            ) : (
              clases.map((clase, index) => (
                <tr
                  key={clase.id_clase_practica || `${clase.fecha}-${clase.hora_inicio}-${index}`}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {formatearFechaVisual(clase.fecha)}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {obtenerNombreAlumno(clase) || "Sin alumno"}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {obtenerVehiculo(clase)}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {clase.sede || "Sin sede"}
                  </td>

                  <td className="px-4 py-3">
                    <EstadoClase estado={clase.estado} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AgendaHoy({ clasesHoy, breve = false, titulo = "Agenda de hoy" }) {
  const clasesMostradas = breve ? clasesHoy.slice(0, 4) : clasesHoy;
  const clasesOcultas = clasesHoy.length - clasesMostradas.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-5">{titulo}</h2>

      <div className="space-y-4">
        {clasesHoy.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-500">
            Hoy no tienes clases programadas. Puedes usar este espacio para revisar tus proximas actividades.
          </div>
        ) : (
          <>
            {clasesMostradas.map((clase, index) => (
              <div
                key={clase.id_clase_practica || `${clase.fecha}-${clase.hora_inicio}-${index}`}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                    </p>

                    <p className="text-slate-600 mt-1">
                      {obtenerNombreAlumno(clase) || "Sin alumno"}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {clase.vehiculo_patente || "Sin patente"} - {clase.sede || "Sin sede"}
                    </p>
                  </div>

                  <span className="h-fit">
                    <EstadoClase estado={clase.estado} />
                  </span>
                </div>
              </div>
            ))}

            {clasesOcultas > 0 && (
              <p className="text-sm text-slate-500">
                Tienes {clasesOcultas} clase{clasesOcultas === 1 ? "" : "s"} mas para hoy.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
