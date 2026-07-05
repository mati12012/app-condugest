import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";

function DetalleClaseTeoricaProf({ claseId, volver }) {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarAlumnos();
  }, [claseId]);

  const cargarAlumnos = async () => {
    try {
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/alumnos`);
      const data = await res.json();
      if (res.ok) setAlumnos(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const marcarAsistencia = async (idAsistencia, nuevoEstado) => {
    if (procesando) return;
    setProcesando(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/asistencia-teorica/${idAsistencia}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        setAlumnos(prev => prev.map(a => a.id_asistencia === idAsistencia ? { ...a, estado_asistencia: nuevoEstado } : a));
      } else {
        alert("Error al guardar asistencia");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando lista del curso...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
        <button onClick={volver} className="text-sm font-bold text-slate-500 hover:text-slate-800">← Volver</button>
        <h2 className="text-xl font-bold text-slate-900">Pase de Lista ({alumnos.length} inscritos)</h2>
      </div>

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
            {alumnos.map(alumno => (
              <tr key={alumno.id_asistencia} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-800">{alumno.nombre} {alumno.apellido}</td>
                <td className="px-4 py-3 text-slate-600">{alumno.rut}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => marcarAsistencia(alumno.id_asistencia, 'Presente')}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${alumno.estado_asistencia === 'Presente' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}
                    >
                      Presente
                    </button>
                    <button 
                      onClick={() => marcarAsistencia(alumno.id_asistencia, 'Ausente')}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${alumno.estado_asistencia === 'Ausente' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-700'}`}
                    >
                      Ausente
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {alumnos.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-500">El curso aún no tiene alumnos inscritos.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DetalleClaseTeoricaProf;