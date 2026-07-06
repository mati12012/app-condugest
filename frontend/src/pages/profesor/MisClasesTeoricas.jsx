import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual, formatearHoraVisual } from "../../utils/formatearFecha";

async function obtenerClasesTeoricasProfesor() {
  const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/mis-clases-teoricas`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "No se pudieron cargar las clases teoricas");
  }

  return data.data || [];
}

function obtenerTextoSala(clase) {
  if (clase.sala_nombre) {
    return `${clase.sala_nombre} - ${clase.sala_sede || clase.sede}`;
  }

  if (clase.modalidad === "Online") return "Clase online";

  return "Sala no asignada";
}

function obtenerClaseModalidad(modalidad) {
  if (modalidad === "Online") return "bg-indigo-100 text-indigo-700";
  if (modalidad === "Híbrida") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function MisClasesTeoricas({ verDetalleClase }) {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarClasesIniciales() {
      try {
        const clasesProfesor = await obtenerClasesTeoricasProfesor();

        if (!cancelado) {
          setClases(clasesProfesor);
        }
      } catch (error) {
        if (!cancelado) {
          console.error(error);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarClasesIniciales();

    return () => {
      cancelado = true;
    };
  }, []);

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando clases teoricas...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Mis Clases Teoricas</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Tema</th>
              <th className="px-4 py-3">Fecha y hora</th>
              <th className="px-4 py-3">Modalidad y sala</th>
              <th className="px-4 py-3">Recursos</th>
              <th className="px-4 py-3">Alumnos inscritos</th>
              <th className="px-4 py-3 text-right">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clases.map((clase) => (
              <tr key={clase.id_clase_teorica} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-800">{clase.tema}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatearFechaVisual(clase.fecha)} <br />
                  <span className="text-xs text-slate-400">
                    {formatearHoraVisual(clase.hora_inicio)} a {formatearHoraVisual(clase.hora_fin)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${obtenerClaseModalidad(clase.modalidad)}`}>
                    {clase.modalidad || clase.sede}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">{obtenerTextoSala(clase)}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 items-start">
                    {clase.link_reunion ? (
                      <a href={clase.link_reunion} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                        Entrar a clase
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Sin link</span>
                    )}
                    {clase.url_grabacion && (
                      <a href={clase.url_grabacion} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                        Ver grabacion
                      </a>
                    )}
                    {clase.codigo_reunion && (
                      <span className="text-xs text-slate-500">Codigo: {clase.codigo_reunion}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">{clase.total_alumnos} alumnos</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => verDetalleClase(clase.id_clase_teorica)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
            {clases.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">
                  No tienes clases teoricas asignadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MisClasesTeoricas;
