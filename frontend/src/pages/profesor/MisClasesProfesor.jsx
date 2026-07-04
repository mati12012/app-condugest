import { useMemo, useState } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { EstadoClase } from "./profesorPanel.components";
import {
  CLASES_POR_PAGINA,
  ESTADOS_FILTRO_CLASES,
  formatearHora,
  obtenerNombreAlumno,
  obtenerTextoBusquedaClase,
  obtenerVehiculo,
  normalizarEstado,
  ordenarClases,
} from "./profesorPanel.helpers";

function MisClasesProfesor({ clases, cargarMisClases }) {
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const clasesOrdenadas = useMemo(() => ordenarClases(clases), [clases]);
  const busquedaNormalizada = busqueda.trim().toLowerCase();

  const clasesFiltradas = useMemo(() => {
    return clasesOrdenadas.filter((clase) => {
      const coincideEstado =
        filtroEstado === "todas" || normalizarEstado(clase.estado) === filtroEstado;
      const coincideBusqueda =
        !busquedaNormalizada ||
        obtenerTextoBusquedaClase(clase).includes(busquedaNormalizada);

      return coincideEstado && coincideBusqueda;
    });
  }, [busquedaNormalizada, clasesOrdenadas, filtroEstado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(clasesFiltradas.length / CLASES_POR_PAGINA)
  );

  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaSegura - 1) * CLASES_POR_PAGINA;
  const clasesPagina = clasesFiltradas.slice(
    indiceInicio,
    indiceInicio + CLASES_POR_PAGINA
  );
  const mensajeVacio =
    clases.length === 0
      ? "Aun no tienes clases practicas asignadas."
      : "No hay clases que coincidan con los filtros actuales.";

  const cambiarFiltro = (nuevoFiltro) => {
    setFiltroEstado(nuevoFiltro);
    setPaginaActual(1);
  };

  const manejarBusqueda = (evento) => {
    setBusqueda(evento.target.value);
    setPaginaActual(1);
  };

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Todas tus clases practicas
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Revisa las clases asignadas, filtra por estado o busca por alumno, patente o sede.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarMisClases}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
          >
            Actualizar
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4">
          <div>
            <label htmlFor="buscar-clases-profesor" className="block text-sm font-medium text-slate-600 mb-2">
              Buscar
            </label>
            <input
              id="buscar-clases-profesor"
              type="text"
              value={busqueda}
              onChange={manejarBusqueda}
              placeholder="Alumno, patente o sede"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-slate-600 mb-2">
              Estado
            </p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS_FILTRO_CLASES.map((opcion) => {
                const estaActivo = filtroEstado === opcion.valor;

                return (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => cambiarFiltro(opcion.valor)}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      estaActivo
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opcion.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Clases encontradas
            </h3>
            <p className="text-sm text-slate-500">
              {clasesFiltradas.length} registro{clasesFiltradas.length === 1 ? "" : "s"}
            </p>
          </div>

          {clasesFiltradas.length > 0 && (
            <p className="text-sm text-slate-500">
              Pagina {paginaSegura} de {totalPaginas}
            </p>
          )}
        </div>

        {clasesFiltradas.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            {mensajeVacio}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3">Alumno</th>
                    <th className="px-4 py-3">RUT</th>
                    <th className="px-4 py-3">Licencia</th>
                    <th className="px-4 py-3">Vehiculo</th>
                    <th className="px-4 py-3">Sede</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Observacion</th>
                  </tr>
                </thead>

                <tbody>
                  {clasesPagina.map((clase, index) => (
                    <tr
                      key={clase.id_clase_practica || `${clase.fecha}-${clase.hora_inicio}-${index}`}
                      className="border-b border-slate-100 hover:bg-slate-50 align-top"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                        {formatearFechaVisual(clase.fecha)}
                      </td>

                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                      </td>

                      <td className="px-4 py-3 text-slate-700 min-w-40">
                        {obtenerNombreAlumno(clase) || "Sin alumno"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {clase.alumno_rut || "No informado"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {clase.alumno_licencia || "No informada"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 min-w-48">
                        {obtenerVehiculo(clase)}
                      </td>

                      <td className="px-4 py-3 text-slate-600 min-w-32">
                        {clase.sede || "Sin sede"}
                      </td>

                      <td className="px-4 py-3">
                        <EstadoClase estado={clase.estado} />
                      </td>

                      <td className="px-4 py-3 text-slate-600 min-w-56">
                        {clase.observacion ? (
                          clase.observacion
                        ) : (
                          <span className="text-slate-400">Sin observacion</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-5">
              <p className="text-sm text-slate-500">
                Mostrando {indiceInicio + 1}-
                {Math.min(indiceInicio + CLASES_POR_PAGINA, clasesFiltradas.length)} de{" "}
                {clasesFiltradas.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={paginaSegura === 1}
                  onClick={() => setPaginaActual(paginaSegura - 1)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={paginaSegura === totalPaginas}
                  onClick={() => setPaginaActual(paginaSegura + 1)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default MisClasesProfesor;
