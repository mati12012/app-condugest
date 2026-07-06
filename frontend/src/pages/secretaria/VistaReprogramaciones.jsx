import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";

const ESTADOS_REPROGRAMACION = ["Pendiente", "Aprobada", "Rechazada", "Cancelada"];
const ESTADOS_ACCION = ["Aprobada", "Rechazada", "Cancelada"];

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" | ");
  }

  return data?.message || fallback;
}

function obtenerClaseEstado(estado) {
  if (estado === "Aprobada") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (estado === "Rechazada") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (estado === "Cancelada") {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}

function formatearFechaHora(fecha, horaInicio, horaFin) {
  const fechaTexto = formatearFechaVisual(fecha);
  const inicio = String(horaInicio || "").slice(0, 5);
  const fin = String(horaFin || "").slice(0, 5);

  return `${fechaTexto}${inicio ? ` (${inicio}${fin ? ` - ${fin}` : ""})` : ""}`;
}

async function obtenerSolicitudesReprogramacion() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/reprogramaciones`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudieron cargar las solicitudes"));
  }

  return data.data || [];
}

function VistaReprogramaciones() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [actualizandoId, setActualizandoId] = useState(null);
  const [respuestas, setRespuestas] = useState({});

  async function cargarSolicitudes() {
    try {
      setCargando(true);
      setError("");

      const solicitudesData = await obtenerSolicitudesReprogramacion();
      setSolicitudes(solicitudesData);
      setRespuestas(
        solicitudesData.reduce((mapa, solicitud) => {
          mapa[solicitud.id_solicitud] = solicitud.respuesta_secretaria || "";
          return mapa;
        }, {})
      );
    } catch (errorCarga) {
      setError(errorCarga.message || "No se pudieron cargar las solicitudes");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const solicitudesData = await obtenerSolicitudesReprogramacion();

        if (activo) {
          setSolicitudes(solicitudesData);
          setRespuestas(
            solicitudesData.reduce((mapa, solicitud) => {
              mapa[solicitud.id_solicitud] = solicitud.respuesta_secretaria || "";
              return mapa;
            }, {})
          );
        }
      } catch (errorCarga) {
        if (activo) {
          setError(errorCarga.message || "No se pudieron cargar las solicitudes");
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

  const solicitudesFiltradas = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return solicitudes.filter((solicitud) => {
      const nombreAlumno = `${solicitud.alumno_nombre || ""} ${solicitud.alumno_apellido || ""}`.toLowerCase();
      const rut = solicitud.alumno_rut?.toLowerCase() || "";
      const correo = solicitud.alumno_correo?.toLowerCase() || "";

      const coincideBusqueda =
        !textoBusqueda ||
        nombreAlumno.includes(textoBusqueda) ||
        rut.includes(textoBusqueda) ||
        correo.includes(textoBusqueda);

      const coincideEstado =
        filtroEstado === "Todos" || solicitud.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtroEstado, solicitudes]);

  const totalPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "Pendiente"
  ).length;

  async function actualizarSolicitud(solicitud, estado = null) {
    if (!solicitud?.id_solicitud) return;

    try {
      setActualizandoId(solicitud.id_solicitud);
      setError("");
      setMensaje("");

      const payload = {
        respuesta_secretaria: respuestas[solicitud.id_solicitud] || null,
      };

      if (estado) {
        payload.estado = estado;
      }

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/reprogramaciones/${solicitud.id_solicitud}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo actualizar la solicitud"));
      }

      const solicitudActualizada = data.data || solicitud;

      setSolicitudes((actuales) =>
        actuales.map((item) =>
          item.id_solicitud === solicitud.id_solicitud
            ? { ...item, ...solicitudActualizada }
            : item
        )
      );

      setRespuestas((actuales) => ({
        ...actuales,
        [solicitud.id_solicitud]: solicitudActualizada.respuesta_secretaria || "",
      }));

      setMensaje(
        estado
          ? `Solicitud marcada como ${estado}. La clase debe editarse manualmente si corresponde.`
          : "Respuesta de secretaría guardada correctamente."
      );
    } catch (errorActualizacion) {
      setError(errorActualizacion.message || "No se pudo actualizar la solicitud");
    } finally {
      setActualizandoId(null);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Solicitudes de reprogramación
          </h1>
          <p className="text-slate-500">
            Revisa solicitudes de alumnos y define si se aprueban, rechazan o cancelan.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarSolicitudes}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
        >
          Actualizar
        </button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
        Aprobar una solicitud no modifica automáticamente la clase práctica. Si se aprueba, secretaría debe editar manualmente la clase desde el módulo de clases prácticas.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total solicitudes</p>
          <p className="text-3xl font-bold text-slate-800">{solicitudes.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-amber-600">{totalPendientes}</p>
        </div>

        {["Aprobada", "Rechazada"].map((estado) => (
          <div key={estado} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">{estado}</p>
            <p className={`text-3xl font-bold ${estado === "Aprobada" ? "text-emerald-600" : "text-red-600"}`}>
              {solicitudes.filter((solicitud) => solicitud.estado === estado).length}
            </p>
          </div>
        ))}
      </div>

      {mensaje && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <input
            type="text"
            placeholder="Buscar por alumno, RUT o correo..."
            className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {["Todos", ...ESTADOS_REPROGRAMACION].map((estado) => {
              const activo = filtroEstado === estado;

              return (
                <button
                  key={estado}
                  type="button"
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    activo
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {estado}
                </button>
              );
            })}
          </div>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando solicitudes de reprogramación...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">Alumno</th>
                  <th className="p-4 font-bold">Clase original</th>
                  <th className="p-4 font-bold">Solicitud</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Respuesta</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id_solicitud} className="hover:bg-slate-50 align-top">
                    <td className="p-4 min-w-56">
                      <p className="font-bold text-slate-800">
                        {solicitud.alumno_nombre} {solicitud.alumno_apellido}
                      </p>
                      <p className="text-sm text-slate-500 font-mono">
                        {solicitud.alumno_rut}
                      </p>
                      <p className="text-sm text-slate-500 break-all">
                        {solicitud.alumno_correo}
                      </p>
                    </td>

                    <td className="p-4 min-w-56">
                      <p className="font-semibold text-slate-800">
                        {formatearFechaHora(solicitud.clase_fecha, solicitud.clase_hora_inicio, solicitud.clase_hora_fin)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Prof. {solicitud.profesor_nombre} {solicitud.profesor_apellido}
                      </p>
                      <p className="text-xs text-slate-500">
                        {solicitud.vehiculo_patente} · {solicitud.clase_sede}
                      </p>
                    </td>

                    <td className="p-4 min-w-64">
                      <p className="font-semibold text-slate-800">
                        {formatearFechaHora(
                          solicitud.fecha_solicitada,
                          solicitud.hora_inicio_solicitada,
                          solicitud.hora_fin_solicitada
                        )}
                      </p>
                      <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
                        {solicitud.motivo}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseEstado(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                    </td>

                    <td className="p-4 min-w-72">
                      <textarea
                        value={respuestas[solicitud.id_solicitud] || ""}
                        onChange={(evento) =>
                          setRespuestas((actuales) => ({
                            ...actuales,
                            [solicitud.id_solicitud]: evento.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Respuesta para el alumno"
                      />
                      <button
                        type="button"
                        disabled={actualizandoId === solicitud.id_solicitud}
                        onClick={() => actualizarSolicitud(solicitud)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 disabled:opacity-50"
                      >
                        Guardar respuesta
                      </button>
                    </td>

                    <td className="p-4 min-w-48">
                      <div className="flex flex-col gap-2">
                        {ESTADOS_ACCION.map((estado) => (
                          <button
                            key={estado}
                            type="button"
                            disabled={actualizandoId === solicitud.id_solicitud}
                            onClick={() => actualizarSolicitud(solicitud, estado)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                              estado === "Aprobada"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : estado === "Rechazada"
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {estado}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!error && solicitudesFiltradas.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                {solicitudes.length === 0
                  ? "Aún no hay solicitudes de reprogramación registradas."
                  : "No se encontraron solicitudes con los filtros aplicados."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VistaReprogramaciones;
