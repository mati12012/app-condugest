import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { EstadoClase, TarjetaResumen } from "./profesorPanel.components";
import {
  formatearHora,
  normalizarEstado,
  obtenerNombreAlumno,
  obtenerVehiculo,
  ordenarClases,
} from "./profesorPanel.helpers";

const nivelesEvaluacion = [
  "Logrado",
  "En proceso",
  "No logrado",
  "No evaluado",
];

const camposEvaluacion = [
  { nombre: "nivel_general", etiqueta: "Nivel general" },
  { nombre: "manejo_vehiculo", etiqueta: "Manejo del vehiculo" },
  { nombre: "normas_transito", etiqueta: "Normas de transito" },
  { nombre: "seguridad", etiqueta: "Seguridad" },
  { nombre: "estacionamiento", etiqueta: "Estacionamiento" },
];

const evaluacionInicial = {
  nivel_general: "No evaluado",
  manejo_vehiculo: "No evaluado",
  normas_transito: "No evaluado",
  seguridad: "No evaluado",
  estacionamiento: "No evaluado",
  observacion: "",
  recomendacion: "",
};

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" | ");
  }

  return data?.message || fallback;
}

async function obtenerEvaluacionesProfesor() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/evaluaciones`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudieron cargar las evaluaciones"));
  }

  return data.data || [];
}

function normalizarEvaluacionFormulario(evaluacion) {
  if (!evaluacion) return evaluacionInicial;

  return {
    nivel_general: evaluacion.nivel_general || "No evaluado",
    manejo_vehiculo: evaluacion.manejo_vehiculo || "No evaluado",
    normas_transito: evaluacion.normas_transito || "No evaluado",
    seguridad: evaluacion.seguridad || "No evaluado",
    estacionamiento: evaluacion.estacionamiento || "No evaluado",
    observacion: evaluacion.observacion || "",
    recomendacion: evaluacion.recomendacion || "",
  };
}

function EvaluacionesProfesor({ clases }) {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState(true);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [formulario, setFormulario] = useState(evaluacionInicial);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const clasesRealizadas = useMemo(
    () =>
      ordenarClases(clases).filter(
        (clase) => normalizarEstado(clase.estado) === "realizada"
      ),
    [clases]
  );

  const evaluacionesPorClase = useMemo(() => {
    return evaluaciones.reduce((mapa, evaluacion) => {
      mapa.set(Number(evaluacion.id_clase_practica), evaluacion);
      return mapa;
    }, new Map());
  }, [evaluaciones]);

  const totalEvaluadas = clasesRealizadas.filter((clase) =>
    evaluacionesPorClase.has(Number(clase.id_clase_practica))
  ).length;

  const totalPendientes = Math.max(clasesRealizadas.length - totalEvaluadas, 0);
  const modoEdicion = Boolean(evaluacionSeleccionada);

  async function cargarEvaluaciones() {
    try {
      setCargandoEvaluaciones(true);
      setError("");
      const evaluacionesProfesor = await obtenerEvaluacionesProfesor();
      setEvaluaciones(evaluacionesProfesor);
    } catch (errorCarga) {
      setError(errorCarga.message || "Error al cargar las evaluaciones");
    } finally {
      setCargandoEvaluaciones(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const evaluacionesProfesor = await obtenerEvaluacionesProfesor();

        if (activo) {
          setEvaluaciones(evaluacionesProfesor);
        }
      } catch (errorCarga) {
        if (activo) {
          setError(errorCarga.message || "Error al cargar las evaluaciones");
        }
      } finally {
        if (activo) {
          setCargandoEvaluaciones(false);
        }
      }
    }

    cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

  function abrirFormulario(clase, evaluacion = null) {
    if (normalizarEstado(clase.estado) !== "realizada") {
      setError("Solo se pueden evaluar clases realizadas.");
      return;
    }

    setClaseSeleccionada(clase);
    setEvaluacionSeleccionada(evaluacion);
    setFormulario(normalizarEvaluacionFormulario(evaluacion));
    setMensaje("");
    setError("");
  }

  function cerrarFormulario() {
    setClaseSeleccionada(null);
    setEvaluacionSeleccionada(null);
    setFormulario(evaluacionInicial);
    setGuardando(false);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardarEvaluacion(evento) {
    evento.preventDefault();

    if (!claseSeleccionada || normalizarEstado(claseSeleccionada.estado) !== "realizada") {
      setError("Solo se pueden evaluar clases realizadas.");
      return;
    }

    const payload = {
      ...formulario,
      observacion: formulario.observacion.trim() || null,
      recomendacion: formulario.recomendacion.trim() || null,
    };

    if (!modoEdicion) {
      payload.id_clase_practica = Number(claseSeleccionada.id_clase_practica);
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const url = modoEdicion
        ? `${import.meta.env.VITE_BASE_URL}/profesor/evaluaciones/${evaluacionSeleccionada.id_evaluacion}`
        : `${import.meta.env.VITE_BASE_URL}/profesor/evaluaciones`;

      const response = await apiFetch(url, {
        method: modoEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo guardar la evaluacion"));
      }

      setMensaje(
        modoEdicion
          ? "Evaluacion actualizada correctamente."
          : "Evaluacion registrada correctamente."
      );
      cerrarFormulario();
      await cargarEvaluaciones();
    } catch (errorGuardado) {
      setError(errorGuardado.message || "Error al guardar la evaluacion");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
            Evaluaciones practicas
          </span>

          <h2 className="text-2xl font-bold text-slate-900 mt-4">
            Registro de desempeño practico
          </h2>

          <p className="text-slate-500 mt-3 text-base leading-relaxed">
            Registra o actualiza la evaluacion de clases practicas realizadas.
            Las clases programadas o canceladas no quedan disponibles para evaluar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TarjetaResumen
          valor={clasesRealizadas.length}
          etiqueta="Clases realizadas"
          color="text-green-700"
        />
        <TarjetaResumen
          valor={totalEvaluadas}
          etiqueta="Evaluadas"
          color="text-blue-700"
        />
        <TarjetaResumen
          valor={totalPendientes}
          etiqueta="Pendientes de evaluacion"
          color="text-amber-700"
        />
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

      {claseSeleccionada && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {modoEdicion ? "Editar evaluacion" : "Registrar evaluacion"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {obtenerNombreAlumno(claseSeleccionada) || "Sin alumno"} · {formatearFechaVisual(claseSeleccionada.fecha)}
              </p>
            </div>

            <button
              type="button"
              onClick={cerrarFormulario}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={guardarEvaluacion} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {camposEvaluacion.map((campo) => (
                <label key={campo.nombre} className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    {campo.etiqueta}
                  </span>
                  <select
                    value={formulario[campo.nombre]}
                    onChange={(evento) => actualizarCampo(campo.nombre, evento.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {nivelesEvaluacion.map((nivel) => (
                      <option key={nivel} value={nivel}>
                        {nivel}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Observacion
                </span>
                <textarea
                  value={formulario.observacion}
                  onChange={(evento) => actualizarCampo("observacion", evento.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comentarios sobre el desempeno observado"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Recomendacion
                </span>
                <textarea
                  value={formulario.recomendacion}
                  onChange={(evento) => actualizarCampo("recomendacion", evento.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sugerencias para la siguiente practica"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarFormulario}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {guardando ? "Guardando..." : modoEdicion ? "Guardar cambios" : "Registrar evaluacion"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Clases realizadas
            </h3>
            <p className="text-sm text-slate-500">
              Solo las clases realizadas pueden registrar evaluacion practica.
            </p>
          </div>
        </div>

        {cargandoEvaluaciones ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            Cargando evaluaciones...
          </div>
        ) : clasesRealizadas.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            No tienes clases realizadas para evaluar por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {clasesRealizadas.map((clase, index) => {
              const evaluacion = evaluacionesPorClase.get(Number(clase.id_clase_practica));

              return (
                <article
                  key={clase.id_clase_practica || `${clase.fecha}-${clase.hora_inicio}-${index}`}
                  className="border border-slate-200 rounded-2xl p-5 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {obtenerNombreAlumno(clase) || "Sin alumno"}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatearFechaVisual(clase.fecha)} - {formatearHora(clase.hora_inicio)} a {formatearHora(clase.hora_fin)}
                      </p>
                    </div>

                    <EstadoClase estado={clase.estado} />
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Vehiculo</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {obtenerVehiculo(clase)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Evaluacion</p>
                      <p className={`font-semibold mt-1 ${evaluacion ? "text-emerald-700" : "text-amber-700"}`}>
                        {evaluacion ? "Registrada" : "Pendiente"}
                      </p>
                    </div>
                  </div>

                  {evaluacion && (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-700 font-semibold">Nivel general</p>
                      <p className="font-bold text-emerald-900 mt-1">
                        {evaluacion.nivel_general}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => abrirFormulario(clase, evaluacion)}
                    className={`mt-5 w-full px-4 py-2.5 rounded-lg font-bold transition-colors ${
                      evaluacion
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {evaluacion ? "Editar evaluacion" : "Registrar evaluacion"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default EvaluacionesProfesor;
