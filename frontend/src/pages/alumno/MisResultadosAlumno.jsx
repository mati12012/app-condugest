import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";

const criteriosEvaluacion = [
  { campo: "nivel_general", etiqueta: "Nivel general" },
  { campo: "manejo_vehiculo", etiqueta: "Manejo del vehículo" },
  { campo: "normas_transito", etiqueta: "Normas de tránsito" },
  { campo: "seguridad", etiqueta: "Seguridad" },
  { campo: "estacionamiento", etiqueta: "Estacionamiento" },
];

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" | ");
  }

  return data?.message || fallback;
}

function obtenerClaseNivel(nivel) {
  if (nivel === "Logrado") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (nivel === "En proceso") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (nivel === "No logrado") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

function formatearFechaResultado(fecha) {
  if (!fecha) return "Sin fecha";

  const fechaTexto = String(fecha);
  const fechaLimpia = fechaTexto.includes(" ")
    ? fechaTexto.split(" ")[0]
    : fechaTexto;

  return formatearFechaVisual(fechaLimpia);
}

function NivelBadge({ nivel }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseNivel(nivel)}`}>
      {nivel || "No evaluado"}
    </span>
  );
}

async function obtenerEvaluacionesAlumno() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/mis-evaluaciones`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data, "No se pudieron cargar tus evaluaciones"));
  }

  return data.data || [];
}

function TarjetaEvaluacion({ evaluacion }) {
  const profesor = `${evaluacion.profesor_nombre || ""} ${evaluacion.profesor_apellido || ""}`.trim();

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Evaluación práctica
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Profesor: {profesor || "Sin profesor"}
          </p>
        </div>

        <NivelBadge nivel={evaluacion.nivel_general} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Fecha de evaluación</p>
          <p className="font-bold text-slate-900 mt-1">
            {formatearFechaResultado(evaluacion.fecha_evaluacion)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Fecha de clase práctica</p>
          <p className="font-bold text-slate-900 mt-1">
            {formatearFechaResultado(evaluacion.clase_fecha)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {criteriosEvaluacion.map((criterio) => (
          <div key={criterio.campo} className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              {criterio.etiqueta}
            </p>
            <NivelBadge nivel={evaluacion[criterio.campo]} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Observación</p>
          <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">
            {evaluacion.observacion || "Sin observación registrada."}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Recomendación</p>
          <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">
            {evaluacion.recomendacion || "Sin recomendación registrada."}
          </p>
        </div>
      </div>
    </article>
  );
}

function MisResultadosAlumno() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarEvaluaciones() {
      try {
        const evaluacionesAlumno = await obtenerEvaluacionesAlumno();

        if (activo) {
          setEvaluaciones(evaluacionesAlumno);
        }
      } catch (errorCarga) {
        if (activo) {
          setError(errorCarga.message || "No se pudieron cargar tus evaluaciones");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarEvaluaciones();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-slate-500">
        Cargando resultados...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
        {error}
      </div>
    );
  }

  if (evaluaciones.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center text-slate-500">
        Aún no tienes evaluaciones registradas.
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {evaluaciones.map((evaluacion) => (
        <TarjetaEvaluacion
          key={evaluacion.id_evaluacion}
          evaluacion={evaluacion}
        />
      ))}
    </section>
  );
}

export default MisResultadosAlumno;
