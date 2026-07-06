import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual, formatearHoraVisual } from "../../utils/formatearFecha";

async function obtenerDetalleClaseTeorica(claseId) {
  const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/alumnos`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "No se pudo cargar la lista del curso");
  }

  if (Array.isArray(data.data)) {
    return { clase: null, alumnos: data.data };
  }

  return {
    clase: data.data?.clase || null,
    alumnos: data.data?.alumnos || [],
  };
}

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  if (typeof data?.errorDetails === "string") {
    return data.errorDetails;
  }

  return data?.message || fallback;
}

function obtenerTextoSala(clase) {
  if (!clase) return "Sin informacion";

  if (clase.sala_nombre) {
    return `${clase.sala_nombre} - ${clase.sala_sede || clase.sede}`;
  }

  if (clase.modalidad === "Online") return "Clase online";

  return "Sala no asignada";
}

function DetalleClaseTeoricaProf({ claseId, volver }) {
  const [clase, setClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [recursos, setRecursos] = useState({
    link_reunion: "",
    codigo_reunion: "",
    url_grabacion: "",
  });
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [guardandoRecursos, setGuardandoRecursos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const estadosAsistencia = [
    {
      estado: "Presente",
      activo: "bg-emerald-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700",
    },
    {
      estado: "Ausente",
      activo: "bg-red-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-700",
    },
    {
      estado: "Justificado",
      activo: "bg-amber-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700",
    },
    {
      estado: "Pendiente",
      activo: "bg-blue-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-700",
    },
  ];

  useEffect(() => {
    let cancelado = false;

    async function cargarDetalleInicial() {
      try {
        const detalle = await obtenerDetalleClaseTeorica(claseId);

        if (!cancelado) {
          setClase(detalle.clase);
          setAlumnos(detalle.alumnos);
          setRecursos({
            link_reunion: detalle.clase?.link_reunion || "",
            codigo_reunion: detalle.clase?.codigo_reunion || "",
            url_grabacion: detalle.clase?.url_grabacion || "",
          });
        }
      } catch (errorCarga) {
        if (!cancelado) {
          setError(errorCarga.message || "No se pudo cargar la clase.");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarDetalleInicial();

    return () => {
      cancelado = true;
    };
  }, [claseId]);

  function actualizarRecurso(campo, valor) {
    setRecursos((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  const marcarAsistencia = async (idAsistencia, nuevoEstado) => {
    if (procesando) return;
    setProcesando(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/asistencia-teorica/${idAsistencia}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setAlumnos((prev) => prev.map((a) => (
          a.id_asistencia === idAsistencia ? { ...a, estado_asistencia: nuevoEstado } : a
        )));
      } else {
        setError("No se pudo guardar la asistencia.");
      }
    } catch (errorMarcado) {
      console.error(errorMarcado);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  async function guardarRecursos(evento) {
    evento.preventDefault();

    try {
      setGuardandoRecursos(true);
      setMensaje("");
      setError("");

      if ((clase?.modalidad === "Online" || clase?.modalidad === "Híbrida") && !recursos.link_reunion.trim()) {
        throw new Error("Para clases online o hibridas, ingresa el link de Meet/Zoom.");
      }

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/recursos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link_reunion: recursos.link_reunion.trim() || null,
          codigo_reunion: recursos.codigo_reunion.trim() || null,
          url_grabacion: recursos.url_grabacion.trim() || null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudieron guardar los recursos."));
      }

      setClase((actual) => ({
        ...actual,
        link_reunion: data.data?.link_reunion || null,
        codigo_reunion: data.data?.codigo_reunion || null,
        url_grabacion: data.data?.url_grabacion || null,
      }));
      setMensaje("Recursos actualizados correctamente.");
    } catch (errorGuardado) {
      setError(errorGuardado.message || "No se pudieron guardar los recursos.");
    } finally {
      setGuardandoRecursos(false);
    }
  }

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando lista del curso...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <button onClick={volver} className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-3">Volver</button>
            <h2 className="text-xl font-bold text-slate-900">{clase?.tema || "Clase teorica"}</h2>
            {clase && (
              <p className="text-sm text-slate-500 mt-1">
                {formatearFechaVisual(clase.fecha)} · {formatearHoraVisual(clase.hora_inicio)} a {formatearHoraVisual(clase.hora_fin)}
              </p>
            )}
          </div>
          {clase && (
            <div className="text-right">
              <span className="inline-flex rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold">
                {clase.modalidad || clase.sede}
              </span>
              <p className="text-xs text-slate-500 mt-2">{obtenerTextoSala(clase)}</p>
            </div>
          )}
        </div>

        {mensaje && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-semibold">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={guardarRecursos} className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Recursos de la clase</h3>
            <p className="text-xs text-slate-500 mt-1">Puedes editar solo links, codigo de reunion y grabacion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Link de reunion</span>
              <input
                type="url"
                value={recursos.link_reunion}
                onChange={(evento) => actualizarRecurso("link_reunion", evento.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Codigo de reunion</span>
              <input
                type="text"
                value={recursos.codigo_reunion}
                onChange={(evento) => actualizarRecurso("codigo_reunion", evento.target.value)}
                placeholder="Ej: 123 456 789"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">URL de grabacion</span>
              <input
                type="url"
                value={recursos.url_grabacion}
                onChange={(evento) => actualizarRecurso("url_grabacion", evento.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              {clase?.link_reunion && (
                <a href={clase.link_reunion} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                  Entrar a clase
                </a>
              )}
              {clase?.url_grabacion && (
                <a href={clase.url_grabacion} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                  Ver grabacion
                </a>
              )}
            </div>
            <button
              type="submit"
              disabled={guardandoRecursos}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardandoRecursos ? "Guardando..." : "Guardar recursos"}
            </button>
          </div>
        </form>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Pase de Lista ({alumnos.length} inscritos)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">RUT</th>
                <th className="px-4 py-3 text-center">Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alumnos.map((alumno) => (
                <tr key={alumno.id_asistencia} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{alumno.nombre} {alumno.apellido}</td>
                  <td className="px-4 py-3 text-slate-600">{alumno.rut}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {estadosAsistencia.map((opcion) => (
                        <button
                          key={opcion.estado}
                          disabled={procesando}
                          onClick={() => marcarAsistencia(alumno.id_asistencia, opcion.estado)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                            alumno.estado_asistencia === opcion.estado
                              ? opcion.activo
                              : opcion.inactivo
                          }`}
                        >
                          {opcion.estado}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {alumnos.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-slate-500">
                    El curso aun no tiene alumnos inscritos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DetalleClaseTeoricaProf;
