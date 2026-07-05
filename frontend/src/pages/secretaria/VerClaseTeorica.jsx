import React, { useState, useEffect } from 'react';
import { apiFetch } from "../../utils/apiFetch";

const VerClaseTeorica = ({ idClase, cambiarVista }) => {
  const [clase, setClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]); 
  const [inscritos, setInscritos] = useState([]); 
  const [idAlumnoSeleccionado, setIdAlumnoSeleccionado] = useState('');
  
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (idClase) obtenerDatosCompletos();
  }, [idClase]);

  const obtenerDatosCompletos = async () => {
    try {
      setCargando(true);
      const [resClase, resAlumnos, resInscritos] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${idClase}`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/alumnos`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${idClase}/alumnos`)
      ]);

      const dataClase = await resClase.json();
      const dataAlumnos = await resAlumnos.json();
      const dataInscritos = await resInscritos.json();

      if (resClase.ok) setClase(dataClase.data);
      if (resAlumnos.ok) setAlumnos(dataAlumnos.data || []);
      if (resInscritos.ok) setInscritos(dataInscritos.data || []);
      
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleInscribir = async () => {
    if (!idAlumnoSeleccionado) return;
    setProcesando(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${idClase}/alumnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_alumno: idAlumnoSeleccionado })
      });
      if (res.ok) {
        setIdAlumnoSeleccionado('');
        await obtenerDatosCompletos(); 
      } else {
        const data = await res.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error de conexión al inscribir alumno');
    } finally {
      setProcesando(false);
    }
  };

  const handleQuitar = async (idAlumno, nombre) => {
    if (!window.confirm(`¿Remover a ${nombre} de esta clase?`)) return;
    setProcesando(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${idClase}/alumnos/${idAlumno}`, {
        method: 'DELETE'
      });
      if (res.ok) await obtenerDatosCompletos();
    } catch (error) {
      alert('Error de conexión al remover alumno');
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = String(fecha).split('T')[0].split('-');
    return `${day}-${month}-${year}`;
  };

  const alumnosDisponibles = alumnos.filter(a => !inscritos.some(i => i.id_alumno === a.id_alumno) && a.estado !== 'Cancelado');

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando detalles y lista de alumnos...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  if (!clase) return <div className="p-8 text-center text-slate-500">Clase no encontrada.</div>;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Detalles de la Clase Teórica</h2>
            <p className="text-slate-500 mt-1">{clase.tema}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => cambiarVista('clasesTeoricas')} className="px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Volver</button>
            <button onClick={() => cambiarVista('editarClaseTeorica', clase.id_clase_teorica)} className="px-4 py-2 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors">Editar Clase</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase">Profesor</p>
            <p className="text-lg font-bold text-slate-800">{clase.profesor ? `${clase.profesor.nombre} ${clase.profesor.apellido}` : 'Sin asignar'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase">Sede/Modalidad</p>
            <p className="text-lg font-bold text-slate-800">{clase.sede}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase">Fecha y Hora</p>
            <p className="text-lg font-bold text-slate-800">{formatearFecha(clase.fecha)}</p>
            <p className="text-sm text-slate-500">{String(clase.hora_inicio).slice(0, 5)} - {String(clase.hora_fin).slice(0, 5)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase">Estado</p>
            <p className="text-lg font-bold text-slate-800">{clase.estado}</p>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Lista de Asistencia ({inscritos.length} inscritos)</h3>
          
          <div className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <select 
              value={idAlumnoSeleccionado} 
              onChange={(e) => setIdAlumnoSeleccionado(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">Seleccione un alumno para inscribir...</option>
              {alumnosDisponibles.map(a => (
                <option key={a.id_alumno} value={a.id_alumno}>{a.nombre} {a.apellido} - {a.rut}</option>
              ))}
            </select>
            <button 
              onClick={handleInscribir} 
              disabled={procesando || !idAlumnoSeleccionado}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
            >
              {procesando ? 'Procesando...' : 'Inscribir a la clase'}
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">Alumno</th>
                  <th className="p-4 font-semibold">RUT</th>
                  <th className="p-4 font-semibold">Estado Asistencia</th>
                  <th className="p-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inscritos.map(alumno => (
                  <tr key={alumno.id_asistencia} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-800">{alumno.nombre} {alumno.apellido}</td>
                    <td className="p-4 text-slate-600">{alumno.rut}</td>
                    <td className="p-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         alumno.estado_asistencia === 'Presente' ? 'bg-emerald-100 text-emerald-800' :
                         alumno.estado_asistencia === 'Ausente' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                       }`}>
                         {alumno.estado_asistencia}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleQuitar(alumno.id_alumno, alumno.nombre)}
                        disabled={procesando}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50"
                      >
                        Quitar de la lista
                      </button>
                    </td>
                  </tr>
                ))}
                {inscritos.length === 0 && (
                  <tr><td colSpan="4" className="p-6 text-center text-slate-500">No hay alumnos inscritos en esta clase todavía.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerClaseTeorica;