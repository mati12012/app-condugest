import React, { useState, useEffect } from 'react';

const PerfilAlumno = ({ alumnoId, cambiarVista }) => {
  const [alumno, setAlumno] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Busca en el backend el alumno
    const obtenerDetalleAlumno = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/alumnos/${alumnoId}`);
        const respuestaServidor = await response.json();

        if (response.ok) {
          setAlumno(respuestaServidor.data);
        } else {
          setError('No se pudo cargar la informacion del alumno');
        }
      } catch (err) {
        setError('Error de conexion con el servidor');
      } finally {
        setCargando(false);
      }
    };

    obtenerDetalleAlumno();
  }, [alumnoId]);

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando perfil...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  if (!alumno) return <div className="p-8 text-center text-slate-500">Alumno no encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Boton para volver a la tabla */}
      <button 
        onClick={() => cambiarVista('alumnos')} 
        className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 mb-4"
      >
        ← Volver a la lista
      </button>

      {/* Tarjeta con la informacion principal */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{alumno.nombre} {alumno.apellido}</h2>
            <p className="text-slate-500 mt-1">RUT: {alumno.rut} | {alumno.correo}</p>
          </div>
          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold">
            {alumno.estado}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Detalles del Plan</h3>
            <p className="text-slate-600"><strong>Licencia:</strong> {alumno.licencia}</p>
            <p className="text-slate-600"><strong>Sede:</strong> {alumno.sede}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase">Progreso de Clases</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {alumno.clases_completadas} <span className="text-xl text-slate-400">/ {alumno.total_clases}</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PerfilAlumno;