import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";

const ESTADOS_SOLICITUD = [
  "Pendiente",
  "Aprobada",
  "Rechazada",
  "Gestionada",
  "Cancelada",
];

const RESULTADOS_EXAMEN = [
  "Pendiente",
  "Aprobado",
  "Reprobado",
  "No presentado",
];

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" | ");
  }

  return data?.message || fallback;
}

function obtenerClaseEstado(estado) {
  if (estado === "Aprobada" || estado === "Gestionada") {
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

function obtenerClaseResultado(resultado) {
  if (resultado === "Aprobado") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (resultado === "Reprobado") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (resultado === "No presentado") {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
}

async function obtenerSolicitudesExamen() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/solicitudes-examen`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudieron cargar las solicitudes"));
  }

  return data.data || [];
}

async function obtenerDetalleSolicitudExamen(idSolicitud) {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/solicitudes-examen/${idSolicitud}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudo cargar el detalle"));
  }

  return data.data;
}

function VistaSolicitudesExamen() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [formulario, setFormulario] = useState({
    estado: "Pendiente",
    resultado_examen: "Pendiente",
    respuesta_secretaria: "",
  });
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroResultado, setFiltroResultado] = useState("Todos");

  async function cargarSolicitudes() {
    try {
      setCargando(true);
      setError("");

      const solicitudesData = await obtenerSolicitudesExamen();
      setSolicitudes(solicitudesData);
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
        const solicitudesData = await obtenerSolicitudesExamen();

        if (activo) {
          setSolicitudes(solicitudesData);
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

      const coincideResultado =
        filtroResultado === "Todos" ||
        solicitud.resultado_examen === filtroResultado;

      return coincideBusqueda && coincideEstado && coincideResultado;
    });
  }, [busqueda, filtroEstado, filtroResultado, solicitudes]);

  const totalPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "Pendiente"
  ).length;
  const totalGestionadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "Gestionada"
  ).length;
  const totalAprobados = solicitudes.filter(
    (solicitud) => solicitud.resultado_examen === "Aprobado"
  ).length;

  function sincronizarFormulario(solicitud) {
    setFormulario({
      estado: solicitud.estado || "Pendiente",
      resultado_examen: solicitud.resultado_examen || "Pendiente",
      respuesta_secretaria: solicitud.respuesta_secretaria || "",
    });
  }

  async function verDetalle(solicitud) {
    try {
      setCargandoDetalle(true);
      setError("");
      setMensaje("");

      const detalle = await obtenerDetalleSolicitudExamen(
        solicitud.id_solicitud_examen
      );

      setSolicitudSeleccionada(detalle);
      sincronizarFormulario(detalle);
    } catch (errorDetalle) {
      setError(errorDetalle.message || "No se pudo cargar el detalle");
    } finally {
      setCargandoDetalle(false);
    }
  }

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardarCambios(evento) {
    evento.preventDefault();

    if (!solicitudSeleccionada?.id_solicitud_examen) return;

    try {
      setActualizando(true);
      setError("");
      setMensaje("");

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/solicitudes-examen/${solicitudSeleccionada.id_solicitud_examen}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: formulario.estado,
            resultado_examen: formulario.resultado_examen,
            respuesta_secretaria:
              formulario.respuesta_secretaria.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo actualizar la solicitud"));
      }

      const solicitudActualizada = data.data;

      setSolicitudSeleccionada(solicitudActualizada);
      sincronizarFormulario(solicitudActualizada);
      setSolicitudes((actuales) =>
        actuales.map((item) =>
          item.id_solicitud_examen === solicitudActualizada.id_solicitud_examen
            ? solicitudActualizada
            : item
        )
      );
      setMensaje("Solicitud de examen actualizada correctamente.");
    } catch (errorActualizacion) {
      setError(errorActualizacion.message || "No se pudo actualizar la solicitud");
    } finally {
      setActualizando(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Solicitudes de examen municipal
          </h1>
          <p className="text-slate-500">
            Revisa solicitudes, responde a alumnos y registra resultados.
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total solicitudes</p>
          <p className="text-3xl font-bold text-slate-800">{solicitudes.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-amber-600">{totalPendientes}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Gestionadas</p>
          <p className="text-3xl font-bold text-emerald-600">{totalGestionadas}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Aprobados</p>
          <p className="text-3xl font-bold text-blue-600">{totalAprobados}</p>
        </div>
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

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <input
                type="text"
                placeholder="Buscar por alumno, RUT o correo..."
                className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />

              <div className="flex flex-wrap gap-2">
                {["Todos", ...ESTADOS_SOLICITUD].map((estado) => {
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

            <div className="flex flex-wrap gap-2">
              {["Todos", ...RESULTADOS_EXAMEN].map((resultado) => {
                const activo = filtroResultado === resultado;

                return (
                  <button
                    key={resultado}
                    type="button"
                    onClick={() => setFiltroResultado(resultado)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      activo
                        ? "bg-slate-800 text-white"
                        : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {resultado}
                  </button>
                );
              })}
            </div>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-slate-500">
              Cargando solicitudes de examen...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-sm">
                  <tr>
                    <th className="p-4 font-bold">Alumno</th>
                    <th className="p-4 font-bold">Solicitud</th>
                    <th className="p-4 font-bold">Plan asociado</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold">Resultado</th>
                    <th className="p-4 font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.id_solicitud_examen} className="hover:bg-slate-50 align-top">
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

                      <td className="p-4 min-w-52">
                        <p className="font-semibold text-slate-800">
                          {formatearFechaVisual(solicitud.fecha_solicitada)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {solicitud.tipo_vehiculo}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Creada el {formatearFechaVisual(solicitud.fecha_solicitud)}
                        </p>
                      </td>

                      <td className="p-4 min-w-52">
                        <p className="font-semibold text-slate-800">
                          {solicitud.plan_nombre}
                        </p>
                        <p className="text-sm text-slate-500">
                          Matricula {solicitud.matricula_estado}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseEstado(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseResultado(solicitud.resultado_examen)}`}>
                          {solicitud.resultado_examen}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => verDetalle(solicitud)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!error && solicitudesFiltradas.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  {solicitudes.length === 0
                    ? "Aun no hay solicitudes de examen registradas."
                    : "No se encontraron solicitudes con los filtros aplicados."}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-800">
            Detalle
          </h2>

          {cargandoDetalle ? (
            <div className="p-6 text-center text-slate-500">
              Cargando detalle...
            </div>
          ) : !solicitudSeleccionada ? (
            <p className="text-slate-500 mt-3">
              Selecciona una solicitud para ver y actualizar sus datos.
            </p>
          ) : (
            <div className="mt-4 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-800">
                  {solicitudSeleccionada.alumno_nombre} {solicitudSeleccionada.alumno_apellido}
                </p>
                <p className="text-sm text-slate-500 font-mono">
                  {solicitudSeleccionada.alumno_rut}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Fecha solicitada: {formatearFechaVisual(solicitudSeleccionada.fecha_solicitada)}
                </p>
                <p className="text-sm text-slate-500">
                  Vehiculo: {solicitudSeleccionada.tipo_vehiculo}
                </p>
                <p className="text-sm text-slate-500">
                  {solicitudSeleccionada.plan_nombre} · Matricula {solicitudSeleccionada.matricula_estado}
                </p>
              </div>

              {solicitudSeleccionada.mensaje && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Mensaje del alumno
                  </p>
                  <p className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600 whitespace-pre-line">
                    {solicitudSeleccionada.mensaje}
                  </p>
                </div>
              )}

              <form onSubmit={guardarCambios} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Estado
                  </span>
                  <select
                    value={formulario.estado}
                    onChange={(evento) => actualizarCampo("estado", evento.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ESTADOS_SOLICITUD.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Resultado examen
                  </span>
                  <select
                    value={formulario.resultado_examen}
                    onChange={(evento) => actualizarCampo("resultado_examen", evento.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {RESULTADOS_EXAMEN.map((resultado) => (
                      <option key={resultado} value={resultado}>
                        {resultado}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Respuesta secretaria
                  </span>
                  <textarea
                    value={formulario.respuesta_secretaria}
                    onChange={(evento) => actualizarCampo("respuesta_secretaria", evento.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Respuesta visible para el alumno"
                  />
                </label>

                <button
                  type="submit"
                  disabled={actualizando}
                  className="w-full px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actualizando ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default VistaSolicitudesExamen;
