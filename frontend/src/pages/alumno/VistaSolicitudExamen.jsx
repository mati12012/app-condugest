import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";

const TIPOS_VEHICULO = ["Automático", "Mecánico"];

const formularioInicial = {
  tipo_vehiculo: "Automático",
  fecha_solicitada: "",
  mensaje: "",
};

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

async function obtenerMisSolicitudesExamen() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/mis-solicitudes-examen`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudieron cargar tus solicitudes"));
  }

  return data.data || [];
}

function VistaSolicitudExamen() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [formulario, setFormulario] = useState(formularioInicial);

  async function cargarSolicitudes() {
    try {
      setCargando(true);
      setError("");

      const solicitudesData = await obtenerMisSolicitudesExamen();
      setSolicitudes(solicitudesData);
    } catch (errorCarga) {
      setError(errorCarga.message || "No se pudieron cargar tus solicitudes");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const solicitudesData = await obtenerMisSolicitudesExamen();

        if (activo) {
          setSolicitudes(solicitudesData);
        }
      } catch (errorCarga) {
        if (activo) {
          setError(errorCarga.message || "No se pudieron cargar tus solicitudes");
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

  const solicitudPendiente = useMemo(() => {
    return solicitudes.find((solicitud) => solicitud.estado === "Pendiente");
  }, [solicitudes]);

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function enviarSolicitud(evento) {
    evento.preventDefault();

    try {
      setEnviando(true);
      setError("");
      setMensaje("");

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/solicitudes-examen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_vehiculo: formulario.tipo_vehiculo,
          fecha_solicitada: formulario.fecha_solicitada,
          mensaje: formulario.mensaje.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo enviar la solicitud"));
      }

      setMensaje("Solicitud enviada correctamente. Secretaria revisara tu solicitud.");
      setFormulario(formularioInicial);
      await cargarSolicitudes();
    } catch (errorEnvio) {
      setError(errorEnvio.message || "No se pudo enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center text-slate-500">
        Cargando solicitudes de examen...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {mensaje && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-semibold">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Solicitud de examen municipal
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Puedes solicitar una fecha cuando tengas una matricula activa o finalizada.
            </p>
          </div>

          {solicitudPendiente && (
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              Solicitud pendiente
            </span>
          )}
        </div>

        {solicitudPendiente ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            Ya tienes una solicitud pendiente. Podras crear otra cuando secretaria la gestione, rechace, apruebe o cancele.
          </div>
        ) : (
          <form onSubmit={enviarSolicitud} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Tipo de vehiculo
                </span>
                <select
                  value={formulario.tipo_vehiculo}
                  onChange={(evento) => actualizarCampo("tipo_vehiculo", evento.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIPOS_VEHICULO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Fecha solicitada
                </span>
                <input
                  type="date"
                  value={formulario.fecha_solicitada}
                  onChange={(evento) => actualizarCampo("fecha_solicitada", evento.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Mensaje opcional
              </span>
              <textarea
                value={formulario.mensaje}
                onChange={(evento) => actualizarCampo("mensaje", evento.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Puedes indicar disponibilidad horaria o informacion relevante"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={enviando}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Mis solicitudes anteriores
        </h2>

        {solicitudes.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            Aun no tienes solicitudes de examen registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3">Fecha solicitada</th>
                  <th className="px-4 py-3">Tipo vehiculo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Respuesta secretaria</th>
                  <th className="px-4 py-3">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id_solicitud_examen} className="border-b border-slate-100 hover:bg-slate-50 align-top">
                    <td className="px-4 py-3 font-medium">
                      {formatearFechaVisual(solicitud.fecha_solicitada)}
                      <p className="text-xs text-slate-500 mt-1">
                        Solicitada el {formatearFechaVisual(solicitud.fecha_solicitud)}
                      </p>
                    </td>
                    <td className="px-4 py-3">{solicitud.tipo_vehiculo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseEstado(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 min-w-64">
                      {solicitud.respuesta_secretaria || "Sin respuesta aun."}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseResultado(solicitud.resultado_examen)}`}>
                        {solicitud.resultado_examen}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default VistaSolicitudExamen;
