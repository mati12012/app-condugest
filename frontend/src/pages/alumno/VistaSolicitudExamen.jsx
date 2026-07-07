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

async function obtenerRequisitosExamen() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/requisitos-examen`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudieron cargar los requisitos"));
  }

  return data.data || null;
}

function formatearPorcentaje(valor) {
  return `${Number(valor || 0).toLocaleString("es-CL", {
    maximumFractionDigits: 2,
  })}%`;
}

function formatearMonto(valor) {
  return Number(valor || 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

function RequisitoFila({ etiqueta, cumple, detalle }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="font-semibold text-slate-800">{etiqueta}</p>
        {detalle && <p className="text-xs text-slate-500 mt-1">{detalle}</p>}
      </div>
      <span
        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
          cumple
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {cumple ? "Cumple" : "No cumple"}
      </span>
    </div>
  );
}

function TarjetaRequisitosExamen({ requisitos }) {
  if (!requisitos) return null;

  const saldoPendiente = Number(requisitos.saldo_pendiente || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Requisitos para solicitar examen
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Debes cumplir los requisitos academicos y administrativos antes de enviar la solicitud.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
            requisitos.puede_solicitar
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {requisitos.puede_solicitar ? "Puede solicitar" : "Requiere revision"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RequisitoFila
          etiqueta="Matricula activa o finalizada"
          cumple={requisitos.cumple_matricula}
        />
        <RequisitoFila
          etiqueta="Sin solicitud pendiente"
          cumple={requisitos.sin_solicitud_pendiente}
        />
        <RequisitoFila
          etiqueta="Sin solicitud aprobada o gestionada pendiente"
          cumple={requisitos.sin_solicitud_aprobada_o_gestionada_pendiente}
        />
        <RequisitoFila
          etiqueta="Sin examen aprobado previamente"
          cumple={requisitos.sin_examen_aprobado}
        />
        <RequisitoFila
          etiqueta="Asistencia practica minima 80%"
          cumple={requisitos.cumple_asistencia_practica}
          detalle={`Actual: ${formatearPorcentaje(requisitos.porcentaje_asistencia_practica)}`}
        />
        <RequisitoFila
          etiqueta="Asistencia teorica minima 80%"
          cumple={requisitos.cumple_asistencia_teorica}
          detalle={`Actual: ${formatearPorcentaje(requisitos.porcentaje_asistencia_teorica)}`}
        />
        <RequisitoFila
          etiqueta="Evaluaciones practicas registradas"
          cumple={requisitos.tiene_evaluaciones}
        />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="font-semibold text-slate-800">Estado de pago</p>
          <p className="text-xs text-slate-500 mt-1">
            {requisitos.estado_pago || "Sin informacion"} - Saldo: {formatearMonto(saldoPendiente)}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            No bloqueante
          </span>
        </div>
      </div>

      {saldoPendiente > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Tienes saldo pendiente. Puedes solicitar el examen, pero secretaria podria revisarlo antes de gestionar la fecha.
        </div>
      )}

      {requisitos.motivos_bloqueo?.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold mb-2">Motivos de bloqueo</p>
          <ul className="space-y-1">
            {requisitos.motivos_bloqueo.map((motivo) => (
              <li key={motivo}>{motivo}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function VistaSolicitudExamen() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [requisitos, setRequisitos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [formulario, setFormulario] = useState(formularioInicial);

  async function cargarSolicitudes() {
    try {
      setCargando(true);
      setError("");

      const [solicitudesData, requisitosData] = await Promise.all([
        obtenerMisSolicitudesExamen(),
        obtenerRequisitosExamen(),
      ]);
      setSolicitudes(solicitudesData);
      setRequisitos(requisitosData);
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
        const [solicitudesData, requisitosData] = await Promise.all([
          obtenerMisSolicitudesExamen(),
          obtenerRequisitosExamen(),
        ]);

        if (activo) {
          setSolicitudes(solicitudesData);
          setRequisitos(requisitosData);
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
  const puedeSolicitar = Boolean(requisitos?.puede_solicitar) && !solicitudPendiente;

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

      <TarjetaRequisitosExamen requisitos={requisitos} />

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
                disabled={enviando || !puedeSolicitar}
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
