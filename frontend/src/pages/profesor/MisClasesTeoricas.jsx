import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";

async function obtenerClasesTeoricasProfesor() {
  const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/mis-clases-teoricas`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "No se pudieron cargar las clases teoricas");
  }

  return data.data || [];
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

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando clases teóricas...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Mis Clases Teóricas</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Tema</th>
              <th className="px-4 py-3">Fecha y Hora</th>
              <th className="px-4 py-3">Sede/Modalidad</th>
              <th className="px-4 py-3">Alumnos Inscritos</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clases.map(clase => (
              <tr key={clase.id_clase_teorica} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-800">{clase.tema}</td>
                <td className="px-4 py-3 text-slate-600">
                  {String(clase.fecha).split('T')[0]} <br/>
                  <span className="text-xs text-slate-400">{String(clase.hora_inicio).slice(0,5)} a {String(clase.hora_fin).slice(0,5)}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{clase.sede}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{clase.total_alumnos} alumnos</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => verDetalleClase(clase.id_clase_teorica)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    Ingresar
                  </button>
                </td>
              </tr>
            ))}
            {clases.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-500">No tienes clases teóricas asignadas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MisClasesTeoricas;
