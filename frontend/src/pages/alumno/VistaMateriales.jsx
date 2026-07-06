import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";

const API_ORIGIN = import.meta.env.VITE_BASE_URL.replace("/api", "");

function obtenerMensajeError(data, mensajeFallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  return data?.message || mensajeFallback;
}

function obtenerClaseTipo(tipo) {
  const clasesPorTipo = {
    PDF: "bg-red-50 text-red-700",
    Video: "bg-purple-50 text-purple-700",
    Link: "bg-blue-50 text-blue-700",
    Documento: "bg-amber-50 text-amber-700",
    Otro: "bg-slate-100 text-slate-700",
  };

  return clasesPorTipo[tipo] || clasesPorTipo.Otro;
}

function obtenerUrlAbrirMaterial(urlMaterial) {
  if (!urlMaterial) return "";

  if (urlMaterial.startsWith("http")) {
    return urlMaterial;
  }

  if (urlMaterial.startsWith("/uploads")) {
    return `${API_ORIGIN}${urlMaterial}`;
  }

  return urlMaterial;
}

function DetalleClase({ clase }) {
  if (!clase) return null;

  const inicio = String(clase.hora_inicio || "").slice(0, 5);
  const fin = String(clase.hora_fin || "").slice(0, 5);

  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm text-slate-600">
      <p className="font-semibold text-slate-800">{clase.tema}</p>
      <p className="mt-1">
        {formatearFechaVisual(clase.fecha)}
        {inicio ? ` | ${inicio}${fin ? ` - ${fin}` : ""}` : ""}
      </p>
      {clase.sede && <p className="mt-1">{clase.sede}</p>}
    </div>
  );
}

function VistaMateriales() {
  const [materiales, setMateriales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarMateriales() {
      try {
        setCargando(true);
        setError("");

        const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/materiales`);
        const respuestaServidor = await response.json();

        if (!response.ok) {
          throw new Error(
            obtenerMensajeError(respuestaServidor, "No se pudieron cargar los materiales")
          );
        }

        if (activo) {
          setMateriales(respuestaServidor.data || []);
        }
      } catch (errorCarga) {
        if (activo) {
          setError(errorCarga.message || "Error de conexion con el servidor");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarMateriales();

    return () => {
      activo = false;
    };
  }, []);

  function abrirMaterial(material) {
    window.open(obtenerUrlAbrirMaterial(material.url_material), "_blank", "noopener,noreferrer");
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center text-slate-500">
        Cargando materiales...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  if (materiales.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-900">Materiales</h2>
        <p className="text-slate-500 mt-2">No hay materiales disponibles.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {materiales.map((material) => (
        <article
          key={material.id_material}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{material.titulo}</h2>
              <p className="text-slate-500 mt-2">
                {material.descripcion || "Sin descripcion registrada."}
              </p>
            </div>

            <span className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${obtenerClaseTipo(material.tipo)}`}>
              {material.tipo}
            </span>
          </div>

          <DetalleClase clase={material.clase_teorica} />

          <div className="pt-2 mt-auto">
            <button
              type="button"
              onClick={() => abrirMaterial(material)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Abrir material
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

export default VistaMateriales;
