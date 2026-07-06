import { useEffect, useMemo, useState } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { apiFetch } from "../../utils/apiFetch";
import { validarHorarioAtencion } from "../../utils/validacionesFormulario";

const formularioInicial = {
  motivo: "",
  fecha_solicitada: "",
  hora_inicio_solicitada: "",
  hora_fin_solicitada: "",
};

function obtenerClaseEstado(estado) {
  if (estado === "Realizada") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (estado === "Cancelada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

function obtenerClaseEstadoSolicitud(estado) {
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

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" | ");
  }

  return data?.message || fallback;
}

function formatearFechaHora(fecha, horaInicio, horaFin) {
  const fechaTexto = formatearFechaVisual(fecha);
  const inicio = String(horaInicio || "").slice(0, 5);
  const fin = String(horaFin || "").slice(0, 5);

  return `${fechaTexto}${inicio ? ` (${inicio}${fin ? ` - ${fin}` : ""})` : ""}`;
}

async function obtenerMisReprogramaciones() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/mis-reprogramaciones`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudieron cargar tus solicitudes"));
  }

  return data.data || [];
}

function TablaClases({
  datos,
  esHistorial,
  esTeorica,
  solicitudesPendientesPorClase,
  abrirFormularioReprogramacion,
}) {
  const columnas = esHistorial ? 5 : 4;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <th className="px-4 py-3">Fecha y Hora</th>
            <th className="px-4 py-3">Profesor</th>
            <th className="px-4 py-3">{esTeorica ? "Tema / Módulo" : "Vehículo"}</th>
            <th className="px-4 py-3">Estado</th>
            {esHistorial && <th className="px-4 py-3">Observación</th>}
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan={columnas} className="px-4 py-8 text-center text-slate-500">
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            datos.map((clase) => {
              const solicitudPendiente = solicitudesPendientesPorClase.get(Number(clase.id_clase_practica));

              return (
                <tr key={clase.id_clase_practica || clase.id_clase_teorica} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    {formatearFechaVisual(clase.fecha)} ({String(clase.hora_inicio).slice(0, 5)})
                  </td>
                  <td className="px-4 py-3">{clase.profesor_nombre} {clase.profesor_apellido}</td>
                  <td className="px-4 py-3">
                    {esTeorica
                      ? clase.tema || "Teoría General"
                      : `${clase.vehiculo_marca || ""} ${clase.vehiculo_modelo || ""}`.trim() || "Sin vehículo"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerClaseEstado(clase.estado)}`}>
                        {clase.estado}
                      </span>
                      {!esHistorial && !esTeorica && clase.estado === "Programada" && (
                        solicitudPendiente ? (
                          <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold">
                            Solicitud pendiente
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => abrirFormularioReprogramacion(clase)}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 font-semibold transition-colors"
                          >
                            Solicitar reprogramación
                          </button>
                        )
                      )}
                    </div>
                  </td>
                  {esHistorial && (
                    <td className="px-4 py-3 text-slate-600">
                      {clase.observacion || (clase.estado === "Cancelada" ? "Clase cancelada." : "Sin observaciones.")}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function VistaMisClases({ clasesPracticas, clasesTeoricas }) {
  const [pestanaActiva, setPestanaActiva] = useState("practicas");
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [errorSolicitudes, setErrorSolicitudes] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [claseSolicitud, setClaseSolicitud] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [enviando, setEnviando] = useState(false);

  const proximasPracticas = clasesPracticas.filter(
    (clase) => clase.estado === "Programada"
  );
  const historialPracticas = clasesPracticas.filter((clase) =>
    ["Realizada", "Cancelada"].includes(clase.estado)
  );

  const proximasTeoricas = clasesTeoricas.filter(
    (clase) => clase.estado === "Programada"
  );
  const historialTeoricas = clasesTeoricas.filter((clase) =>
    ["Realizada", "Cancelada"].includes(clase.estado)
  );

  const solicitudesPendientesPorClase = useMemo(() => {
    return solicitudes.reduce((mapa, solicitud) => {
      if (solicitud.estado === "Pendiente") {
        mapa.set(Number(solicitud.id_clase_practica), solicitud);
      }
      return mapa;
    }, new Map());
  }, [solicitudes]);

  async function cargarSolicitudes() {
    try {
      setCargandoSolicitudes(true);
      setErrorSolicitudes("");
      const solicitudesAlumno = await obtenerMisReprogramaciones();
      setSolicitudes(solicitudesAlumno);
    } catch (error) {
      setErrorSolicitudes(error.message || "No se pudieron cargar tus solicitudes");
    } finally {
      setCargandoSolicitudes(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const solicitudesAlumno = await obtenerMisReprogramaciones();

        if (activo) {
          setSolicitudes(solicitudesAlumno);
        }
      } catch (error) {
        if (activo) {
          setErrorSolicitudes(error.message || "No se pudieron cargar tus solicitudes");
        }
      } finally {
        if (activo) {
          setCargandoSolicitudes(false);
        }
      }
    }

    cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

  function abrirFormularioReprogramacion(clase) {
    setClaseSolicitud(clase);
    setFormulario(formularioInicial);
    setMensaje("");
    setErrorSolicitudes("");
  }

  function cerrarFormulario() {
    setClaseSolicitud(null);
    setFormulario(formularioInicial);
    setEnviando(false);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function enviarSolicitud(evento) {
    evento.preventDefault();

    if (!claseSolicitud) return;

    try {
      setEnviando(true);
      setMensaje("");
      setErrorSolicitudes("");

      const errorHorario = validarHorarioAtencion(
        formulario.hora_inicio_solicitada,
        formulario.hora_fin_solicitada
      );

      if (errorHorario) {
        throw new Error(errorHorario);
      }

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/reprogramaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_clase_practica: Number(claseSolicitud.id_clase_practica),
          motivo: formulario.motivo,
          fecha_solicitada: formulario.fecha_solicitada,
          hora_inicio_solicitada: formulario.hora_inicio_solicitada,
          hora_fin_solicitada: formulario.hora_fin_solicitada,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo enviar la solicitud"));
      }

      setMensaje("Solicitud enviada correctamente. Secretaría revisará tu solicitud.");
      cerrarFormulario();
      await cargarSolicitudes();
    } catch (error) {
      setErrorSolicitudes(error.message || "No se pudo enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  }

  const mostrandoPracticas = pestanaActiva === "practicas";

  return (
    <section className="space-y-6">
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setPestanaActiva("practicas")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            mostrandoPracticas
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Clases Prácticas
        </button>
        <button
          onClick={() => setPestanaActiva("teoricas")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            pestanaActiva === "teoricas"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Clases Teóricas
        </button>
      </div>

      {mensaje && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-semibold">
          {mensaje}
        </div>
      )}

      {errorSolicitudes && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
          {errorSolicitudes}
        </div>
      )}

      {claseSolicitud && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Solicitar reprogramación</h2>
              <p className="text-sm text-slate-500 mt-1">
                Clase original: {formatearFechaHora(claseSolicitud.fecha, claseSolicitud.hora_inicio, claseSolicitud.hora_fin)}
              </p>
            </div>
            <button
              type="button"
              onClick={cerrarFormulario}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={enviarSolicitud} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Motivo</span>
              <textarea
                value={formulario.motivo}
                onChange={(evento) => actualizarCampo("motivo", evento.target.value)}
                rows={3}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explica por qué necesitas reprogramar la clase"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Fecha solicitada</span>
                <input
                  type="date"
                  value={formulario.fecha_solicitada}
                  onChange={(evento) => actualizarCampo("fecha_solicitada", evento.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Hora inicio solicitada</span>
                <input
                  type="time"
                  min="09:00"
                  max="20:00"
                  value={formulario.hora_inicio_solicitada}
                  onChange={(evento) => actualizarCampo("hora_inicio_solicitada", evento.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Hora fin solicitada</span>
                <input
                  type="time"
                  min="09:00"
                  max="20:00"
                  value={formulario.hora_fin_solicitada}
                  onChange={(evento) => actualizarCampo("hora_fin_solicitada", evento.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
            <p className="text-xs text-slate-400 -mt-2">
              Horario de atencion permitido: 09:00 a 20:00. La hora de fin debe ser posterior al inicio.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarFormulario}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Próximas clases</h2>
        <TablaClases
          datos={mostrandoPracticas ? proximasPracticas : proximasTeoricas}
          esHistorial={false}
          esTeorica={!mostrandoPracticas}
          solicitudesPendientesPorClase={solicitudesPendientesPorClase}
          abrirFormularioReprogramacion={abrirFormularioReprogramacion}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Historial de clases</h2>
        <TablaClases
          datos={mostrandoPracticas ? historialPracticas : historialTeoricas}
          esHistorial
          esTeorica={!mostrandoPracticas}
          solicitudesPendientesPorClase={solicitudesPendientesPorClase}
          abrirFormularioReprogramacion={abrirFormularioReprogramacion}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Mis solicitudes de reprogramación</h2>
        {cargandoSolicitudes ? (
          <div className="p-6 text-center text-slate-500">Cargando solicitudes...</div>
        ) : solicitudes.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No tienes solicitudes de reprogramación registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3">Clase original</th>
                  <th className="px-4 py-3">Fecha solicitada</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Respuesta secretaría</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id_solicitud} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {formatearFechaHora(solicitud.clase_fecha, solicitud.clase_hora_inicio, solicitud.clase_hora_fin)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Prof. {solicitud.profesor_nombre} {solicitud.profesor_apellido}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {formatearFechaHora(
                        solicitud.fecha_solicitada,
                        solicitud.hora_inicio_solicitada,
                        solicitud.hora_fin_solicitada
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseEstadoSolicitud(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {solicitud.respuesta_secretaria || "Sin respuesta aún."}
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

export default VistaMisClases;
