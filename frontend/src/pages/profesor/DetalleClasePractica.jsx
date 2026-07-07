import { useState } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { EstadoClase } from "./profesorPanel.components";
import {
  formatearHora,
  obtenerNombreAlumno,
  obtenerVehiculo,
} from "./profesorPanel.helpers";
import { apiFetch } from "../../utils/apiFetch";

function obtenerClaseAsistencia(estado) {
  if (estado === "Presente") return "bg-emerald-100 text-emerald-800";
  if (estado === "Justificado") return "bg-amber-100 text-amber-800";
  if (estado === "Pendiente") return "bg-slate-100 text-slate-700";
  return "bg-red-100 text-red-800";
}

function DetalleClasePractica({ claseId, clases, volver, cargarMisClases }) {
  const [procesando, setProcesando] = useState(false);
  const [observacionesEditadas, setObservacionesEditadas] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const clase = clases.find((c) => c.id_clase_practica === claseId);

  if (!clase) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Clase no encontrada.
        <br />
        <button
          onClick={volver}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
        >
          Volver a mis clases
        </button>
      </div>
    );
  }

  const observacion =
    observacionesEditadas[clase.id_clase_practica] ??
    clase.asistencia_observacion ??
    "";

  const actualizarObservacion = (valor) => {
    setObservacionesEditadas((actual) => ({
      ...actual,
      [clase.id_clase_practica]: valor,
    }));
  };

  const manejarAsistencia = async (estadoAsistencia) => {
    if (procesando) return;

    setProcesando(true);
    setMensaje("");
    setError("");

    try {
      const res = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/profesor/clase-practica/${clase.id_clase_practica}/asistencia`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado_asistencia: estadoAsistencia,
            observacion,
          }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo guardar la asistencia.");
        return;
      }

      setMensaje(data.message || "Asistencia guardada correctamente.");
      await cargarMisClases();
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  const asistenciaActual = clase.asistencia || "Pendiente";
  const yaRegistrada = asistenciaActual !== "Pendiente";

  return (
    <section className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button
            onClick={volver}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-2 flex items-center gap-1"
          >
            {"<-"} Volver a la lista
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            Detalle de Clase Practica
          </h2>
          <p className="text-slate-500 mt-1">
            Gestion de asistencia y registro del alumno.
          </p>
        </div>
        <EstadoClase estado={clase.estado} />
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Datos de la sesion
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Alumno</p>
              <p className="font-bold text-slate-800 text-lg">
                {obtenerNombreAlumno(clase) || "Sin alumno"}
              </p>
              <p className="text-sm text-slate-600">RUT: {clase.alumno_rut}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fecha y hora</p>
              <p className="font-semibold text-slate-800">
                {formatearFechaVisual(clase.fecha)}
              </p>
              <p className="text-sm text-slate-600">
                {formatearHora(clase.hora_inicio)} a{" "}
                {formatearHora(clase.hora_fin)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Vehiculo y sede</p>
              <p className="font-semibold text-slate-800">
                {obtenerVehiculo(clase)}
              </p>
              <p className="text-sm text-slate-600">{clase.sede}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Registro de asistencia
          </h3>

          <label className="block mb-5">
            <span className="text-sm font-semibold text-slate-700">
              Observacion
            </span>
            <textarea
              value={observacion}
              onChange={(evento) => actualizarObservacion(evento.target.value)}
              rows={3}
              maxLength={500}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ejemplo: alumno llego puntual y completo la practica."
            />
            <p className="mt-1 text-xs text-slate-400">
              Opcional. Se guardara en el historial de asistencia practica.
            </p>
          </label>

          <div className="flex-1 flex flex-col justify-center">
            {yaRegistrada ? (
              <div className="text-center space-y-4">
                <div
                  className={`inline-block px-6 py-3 rounded-xl font-bold text-lg ${obtenerClaseAsistencia(asistenciaActual)}`}
                >
                  El alumno quedo {asistenciaActual}
                </div>
                <p className="text-sm text-slate-500">
                  La asistencia ya fue registrada. Si hubo un error, puedes
                  actualizarla o dejarla pendiente.
                </p>
                {clase.asistencia_fecha_registro && (
                  <p className="text-xs text-slate-400">
                    Ultimo registro:{" "}
                    {formatearFechaVisual(clase.asistencia_fecha_registro)}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Presente", "Ausente", "Justificado", "Pendiente"].map(
                    (estado) => (
                      <button
                        key={estado}
                        disabled={procesando}
                        onClick={() => manejarAsistencia(estado)}
                        className={`w-full py-3 rounded-xl border font-bold transition-colors ${obtenerClaseAsistencia(estado)} hover:opacity-80 disabled:opacity-60`}
                      >
                        {estado}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center mb-6">
                  Elige el estado de asistencia de la clase practica.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    disabled={procesando}
                    onClick={() => manejarAsistencia("Presente")}
                    className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Presente
                  </button>
                  <button
                    disabled={procesando}
                    onClick={() => manejarAsistencia("Ausente")}
                    className="w-full py-3 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold hover:bg-red-100 transition-colors"
                  >
                    Ausente
                  </button>
                  <button
                    disabled={procesando}
                    onClick={() => manejarAsistencia("Justificado")}
                    className="w-full py-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold hover:bg-amber-100 transition-colors"
                  >
                    Justificado
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-6 text-center">
        <p className="text-slate-500 font-medium">
          Modulo de Evaluaciones (Proximamente)
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Una vez marcada la asistencia como "Presente", aqui podras llenar la
          rubrica de evaluacion del alumno.
        </p>
      </div>
    </section>
  );
}

export default DetalleClasePractica;
