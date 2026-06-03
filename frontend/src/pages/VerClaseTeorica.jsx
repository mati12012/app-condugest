import React, { useState, useEffect } from 'react';

const VerClaseTeorica = ({ idClase, cambiarVista }) => {
  const [clase, setClase] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (idClase) obtenerClase();
  }, [idClase]);

  const obtenerClase = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${idClase}`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setClase(respuestaServidor.data);
      } else {
        setError(respuestaServidor.message || 'No se pudo cargar la clase');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const fechaLimpia = String(fecha).split('T')[0];
    const [year, month, day] = fechaLimpia.split('-');
    return `${day}-${month}-${year}`;
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Programada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Realizada': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando detalles de la clase...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  if (!clase) return <div className="p-8 text-center text-slate-500">Clase no encontrada.</div>;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Detalles de la Clase Teórica</h2>
          <p className="text-slate-500 mt-1">Información completa de la sesión agendada.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => cambiarVista('clasesTeoricas')}
            className="px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={() => cambiarVista('editarClaseTeorica', clase.id_clase_teorica)}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
          >
            Editar Clase
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Tema de la clase</h3>
          <p className="text-lg font-bold text-slate-800">{clase.tema}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Estado</h3>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold border ${getColorEstado(clase.estado)}`}>
            {clase.estado}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Profesor Asignado</h3>
          {clase.profesor ? (
            <p className="text-lg font-medium text-slate-800">
              {clase.profesor.nombre} {clase.profesor.apellido}
              <span className="block text-sm text-slate-500 font-normal">{clase.profesor.correo_institucional}</span>
            </p>
          ) : (
            <p className="text-lg text-slate-400 italic">Sin profesor asignado</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Sede / Modalidad</h3>
          <p className="text-lg font-medium text-slate-800">{clase.sede}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha Programada</h3>
          <p className="text-lg font-medium text-slate-800">{formatearFecha(clase.fecha)}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Horario</h3>
          <p className="text-lg font-medium text-slate-800">
            {String(clase.hora_inicio).slice(0, 5)} hrs a {String(clase.hora_fin).slice(0, 5)} hrs
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerClaseTeorica;