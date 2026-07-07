import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual, formatearHoraVisual } from "../../utils/formatearFecha";

const ESTADOS_SOLICITUD = [
  "Pendiente",
  "Contactado",
  "Matriculado",
  "Descartado",
];

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return `${formatearFechaVisual(fecha)} ${formatearHoraVisual(fecha)}`;
}

function formatearPesos(valor) {
  const valorNumerico = Number(valor);

  if (!Number.isFinite(valorNumerico)) {
    return "$0";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valorNumerico);
}

function obtenerClaseEstado(estado) {
  if (estado === "Pendiente") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (estado === "Contactado") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (estado === "Matriculado") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (estado === "Descartado") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function obtenerMensajeError(data, mensajeFallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  return data?.message || mensajeFallback;
}

function VistaSolicitudesMatricula() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);

  const obtenerSolicitudes = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/solicitudes-matricula`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudieron obtener las solicitudes de matricula"
        );
      }

      setSolicitudes(data.data || []);
    } catch (error) {
      setError(error.message || "Error de conexion con el servidor");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(obtenerSolicitudes);
  }, [obtenerSolicitudes]);

  const solicitudesFiltradas = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return solicitudes.filter((solicitud) => {
      const nombreCompleto = `${solicitud.nombre || ""} ${solicitud.apellido || ""}`.toLowerCase();
      const rut = solicitud.rut?.toLowerCase() || "";
      const correo = solicitud.correo?.toLowerCase() || "";

      const coincideBusqueda =
        !textoBusqueda ||
        nombreCompleto.includes(textoBusqueda) ||
        rut.includes(textoBusqueda) ||
        correo.includes(textoBusqueda);

      const coincideEstado =
        filtroEstado === "Todos" || solicitud.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtroEstado, solicitudes]);

  const totalSolicitudes = solicitudes.length;
  const totalPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "Pendiente"
  ).length;
  const totalContactadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "Contactado"
  ).length;
  const totalMatriculadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "Matriculado"
  ).length;

  async function cambiarEstadoSolicitud(solicitud, nuevoEstado) {
    if (!solicitud?.id_solicitud || solicitud.estado === nuevoEstado) return;

    if (
      nuevoEstado === "Matriculado"
      && !window.confirm("Esta acción creará el alumno y su matrícula asociada. ¿Deseas continuar?")
    ) {
      return;
    }

    try {
      setActualizandoId(solicitud.id_solicitud);
      setError("");
      setMensaje("");

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/solicitudes-matricula/${solicitud.id_solicitud}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(data, "No se pudo actualizar el estado")
        );
      }

      const solicitudActualizada = data.data || {
        ...solicitud,
        estado: nuevoEstado,
      };

      if (nuevoEstado === "Matriculado") {
        await obtenerSolicitudes();
      } else {
        setSolicitudes((solicitudesActuales) =>
          solicitudesActuales.map((item) =>
            item.id_solicitud === solicitud.id_solicitud
              ? { ...item, ...solicitudActualizada }
              : item
          )
        );
      }

      if (detalle?.id_solicitud === solicitud.id_solicitud) {
        setDetalle((detalleActual) => ({
          ...detalleActual,
          ...solicitudActualizada,
        }));
      }

      setMensaje(data.message || "Estado de la solicitud actualizado exitosamente.");
    } catch (error) {
      setError(error.message || "No se pudo actualizar el estado");
    } finally {
      setActualizandoId(null);
    }
  }

  async function abrirDetalleSolicitud(idSolicitud) {
    try {
      setDetalle(null);
      setErrorDetalle("");
      setCargandoDetalle(true);

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/solicitudes-matricula/${idSolicitud}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudo obtener el detalle de la solicitud"
        );
      }

      setDetalle(data.data);
    } catch (error) {
      setErrorDetalle(error.message || "Error al cargar el detalle");
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrarDetalle() {
    setDetalle(null);
    setErrorDetalle("");
    setCargandoDetalle(false);
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Solicitudes de matricula
          </h1>
          <p className="text-slate-500">
            Revisa los contactos recibidos desde la pagina publica y gestiona su estado.
          </p>
        </div>

        <button
          type="button"
          onClick={obtenerSolicitudes}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total solicitudes</p>
          <p className="text-3xl font-bold text-slate-800">{totalSolicitudes}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{totalPendientes}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Contactadas</p>
          <p className="text-3xl font-bold text-blue-600">{totalContactadas}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Matriculadas</p>
          <p className="text-3xl font-bold text-green-600">{totalMatriculadas}</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o correo..."
              className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando solicitudes de matricula...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">Solicitante</th>
                  <th className="p-4 font-bold">Contacto</th>
                  <th className="p-4 font-bold">Plan solicitado</th>
                  <th className="p-4 font-bold">Fecha</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {solicitudesFiltradas.map((solicitud) => (
                  <tr
                    key={solicitud.id_solicitud}
                    className="hover:bg-slate-50 align-top"
                  >
                    <td className="p-4 min-w-48">
                      <p className="font-bold text-slate-800">
                        {solicitud.nombre} {solicitud.apellido}
                      </p>
                      <p className="text-sm text-slate-500 font-mono">
                        {solicitud.rut}
                      </p>
                    </td>

                    <td className="p-4 min-w-56">
                      <p className="text-sm text-slate-700 break-all">
                        {solicitud.correo}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {solicitud.telefono}
                      </p>
                    </td>

                    <td className="p-4 min-w-56">
                      <p className="font-semibold text-slate-800">
                        {solicitud.plan_nombre || "Plan no disponible"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {solicitud.plan_tipo || "Sin tipo"}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatearFecha(solicitud.fecha_solicitud)}
                    </td>

                    <td className="p-4 min-w-44">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstado(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>

                      <select
                        className="mt-2 block w-full max-w-[170px] px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={solicitud.estado}
                        disabled={actualizandoId === solicitud.id_solicitud}
                        onChange={(e) => cambiarEstadoSolicitud(solicitud, e.target.value)}
                      >
                        {ESTADOS_SOLICITUD.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => abrirDetalleSolicitud(solicitud.id_solicitud)}
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
                  ? "Aun no hay solicitudes de matricula registradas."
                  : "No se encontraron solicitudes con los filtros aplicados."}
              </div>
            )}
          </div>
        )}
      </div>

      {(detalle || cargandoDetalle || errorDetalle) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 px-4 py-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Detalle de solicitud
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {detalle
                    ? `${detalle.nombre} ${detalle.apellido}`
                    : "Cargando solicitud..."}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarDetalle}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            {cargandoDetalle && (
              <div className="p-8 text-center text-slate-500">
                Cargando detalle...
              </div>
            )}

            {errorDetalle && (
              <div className="m-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {errorDetalle}
              </div>
            )}

            {detalle && !cargandoDetalle && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">RUT</p>
                    <p className="font-bold text-slate-900 mt-1">{detalle.rut}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Fecha solicitud</p>
                    <p className="font-bold text-slate-900 mt-1">
                      {formatearFecha(detalle.fecha_solicitud)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Correo</p>
                    <p className="font-bold text-slate-900 mt-1 break-all">
                      {detalle.correo}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Telefono</p>
                    <p className="font-bold text-slate-900 mt-1">
                      {detalle.telefono}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-700 font-semibold">
                        Plan solicitado
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {detalle.plan_nombre}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {detalle.plan_tipo} - {formatearPesos(detalle.plan_valor)}
                      </p>
                    </div>

                    <div className="text-sm text-slate-600">
                      <p>
                        Practicas:{" "}
                        <span className="font-bold">
                          {detalle.plan_clases_practicas}
                        </span>
                      </p>
                      <p>
                        Teoricas:{" "}
                        <span className="font-bold">
                          {detalle.plan_clases_teoricas}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado de solicitud
                  </label>
                  <select
                    value={detalle.estado}
                    disabled={actualizandoId === detalle.id_solicitud}
                    onChange={(e) => cambiarEstadoSolicitud(detalle, e.target.value)}
                    className="w-full md:max-w-xs px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {ESTADOS_SOLICITUD.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Mensaje</p>
                  <p className="text-slate-700 mt-2 whitespace-pre-wrap">
                    {detalle.mensaje || "Sin mensaje adicional."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VistaSolicitudesMatricula;
