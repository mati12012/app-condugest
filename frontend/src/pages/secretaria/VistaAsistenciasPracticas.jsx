import { useEffect, useMemo, useState } from "react";
import {
  formatearFechaVisual,
  formatearHoraVisual,
} from "../../utils/formatearFecha";
import { apiFetch } from "../../utils/apiFetch";

const estadosAsistencia = [
  "Todos",
  "Presente",
  "Ausente",
  "Justificado",
  "Pendiente",
];

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" | ");
  }

  return data?.message || fallback;
}

function obtenerClaseEstadoAsistencia(estado) {
  if (estado === "Presente") return "bg-emerald-100 text-emerald-700";
  if (estado === "Ausente") return "bg-red-100 text-red-700";
  if (estado === "Justificado") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function obtenerNombreCompleto(nombre, apellido) {
  return `${nombre || ""} ${apellido || ""}`.trim() || "Sin registro";
}

function obtenerTextoVehiculo(asistencia) {
  return (
    `${asistencia.vehiculo_marca || ""} ${asistencia.vehiculo_modelo || ""}`.trim() ||
    "Sin vehiculo"
  );
}

function coincideBusqueda(asistencia, busqueda) {
  const texto = [
    asistencia.alumno_nombre,
    asistencia.alumno_apellido,
    asistencia.alumno_rut,
    asistencia.profesor_nombre,
    asistencia.profesor_apellido,
    asistencia.profesor_rut,
    asistencia.vehiculo_patente,
    asistencia.vehiculo_marca,
    asistencia.vehiculo_modelo,
    asistencia.clase_sede,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return texto.includes(busqueda.toLowerCase().trim());
}

function calcularResumen(asistencias) {
  return asistencias.reduce(
    (resumen, asistencia) => {
      const estado = asistencia.estado_asistencia || "Pendiente";

      resumen.total += 1;
      if (estado === "Presente") resumen.presentes += 1;
      if (estado === "Ausente") resumen.ausentes += 1;
      if (estado === "Justificado") resumen.justificados += 1;
      if (estado === "Pendiente") resumen.pendientes += 1;

      return resumen;
    },
    {
      total: 0,
      presentes: 0,
      ausentes: 0,
      justificados: 0,
      pendientes: 0,
    }
  );
}

function TarjetaResumen({ etiqueta, valor, clase }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {etiqueta}
      </p>
      <p className={`mt-2 text-2xl font-bold ${clase}`}>{valor}</p>
    </div>
  );
}

function VistaAsistenciasPracticas() {
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  async function cargarAsistencias() {
    try {
      setCargando(true);
      setError("");

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/asistencias-practicas`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(data, "No se pudo cargar el historial")
        );
      }

      setAsistencias(data.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar el historial");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const response = await apiFetch(
          `${import.meta.env.VITE_BASE_URL}/asistencias-practicas`
        );
        const data = await response.json();

        if (!activo) return;

        if (!response.ok) {
          throw new Error(
            obtenerMensajeError(data, "No se pudo cargar el historial")
          );
        }

        setAsistencias(data.data || []);
      } catch (err) {
        if (activo) {
          setError(err.message || "No se pudo cargar el historial");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

  const asistenciasFiltradas = useMemo(() => {
    return asistencias.filter((asistencia) => {
      const coincideEstado =
        estadoFiltro === "Todos" ||
        asistencia.estado_asistencia === estadoFiltro;
      const coincideTexto =
        busqueda.trim().length === 0 || coincideBusqueda(asistencia, busqueda);

      return coincideEstado && coincideTexto;
    });
  }, [asistencias, busqueda, estadoFiltro]);

  const resumen = useMemo(
    () => calcularResumen(asistenciasFiltradas),
    [asistenciasFiltradas]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Asistencias practicas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historial consultable por alumno, profesor y clase.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por alumno, profesor, sede o vehiculo"
            className="w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={estadoFiltro}
            onChange={(evento) => setEstadoFiltro(evento.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {estadosAsistencia.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={cargarAsistencias}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <TarjetaResumen etiqueta="Total" valor={resumen.total} clase="text-slate-900" />
        <TarjetaResumen etiqueta="Presente" valor={resumen.presentes} clase="text-emerald-700" />
        <TarjetaResumen etiqueta="Ausente" valor={resumen.ausentes} clase="text-red-700" />
        <TarjetaResumen etiqueta="Justificado" valor={resumen.justificados} clase="text-amber-700" />
        <TarjetaResumen etiqueta="Pendiente" valor={resumen.pendientes} clase="text-slate-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando historial de asistencia...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3">Fecha y hora</th>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">Profesor</th>
                  <th className="px-4 py-3">Clase</th>
                  <th className="px-4 py-3">Asistencia</th>
                  <th className="px-4 py-3">Observacion</th>
                  <th className="px-4 py-3">Registro</th>
                </tr>
              </thead>
              <tbody>
                {asistenciasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No hay asistencias para mostrar.
                    </td>
                  </tr>
                ) : (
                  asistenciasFiltradas.map((asistencia) => (
                    <tr
                      key={asistencia.id_clase_practica}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <p>{formatearFechaVisual(asistencia.fecha)}</p>
                        <p className="text-xs text-slate-500">
                          {formatearHoraVisual(asistencia.hora_inicio)} -{" "}
                          {formatearHoraVisual(asistencia.hora_fin)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {obtenerNombreCompleto(
                            asistencia.alumno_nombre,
                            asistencia.alumno_apellido
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {asistencia.alumno_rut || "Sin RUT"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {obtenerNombreCompleto(
                            asistencia.profesor_nombre,
                            asistencia.profesor_apellido
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {asistencia.profesor_rut || "Sin RUT"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {obtenerTextoVehiculo(asistencia)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {asistencia.vehiculo_patente || "Sin patente"} -{" "}
                          {asistencia.clase_sede || "Sin sede"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerClaseEstadoAsistencia(
                            asistencia.estado_asistencia
                          )}`}
                        >
                          {asistencia.estado_asistencia || "Pendiente"}
                        </span>
                        <p className="text-xs text-slate-500 mt-2">
                          Clase {asistencia.clase_estado || "Sin estado"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs">
                        {asistencia.observacion || "Sin observaciones."}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {asistencia.fecha_registro ? (
                          <>
                            <p>{formatearFechaVisual(asistencia.fecha_registro)}</p>
                            <p className="text-xs">
                              {asistencia.registrado_por_correo || "Usuario registrado"}
                            </p>
                          </>
                        ) : (
                          "Pendiente de registro"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default VistaAsistenciasPracticas;
