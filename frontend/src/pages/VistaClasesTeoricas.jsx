import React, { useState, useEffect } from 'react';

const VistaClasesTeoricas = ({ cambiarVista }) => {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerClases();
  }, []);

  const obtenerClases = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setClases(respuestaServidor.data);
      } else {
        setError(respuestaServidor.message || "Error al obtener las clases teóricas");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fechaString) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-CL', opciones);
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Programada': return 'bg-blue-100 text-blue-700';
      case 'Realizada': return 'bg-green-100 text-green-700';
      case 'Cancelada': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clases Teóricas</h2>
          <p className="text-slate-500 mt-1">Administra la programación y el estado de las clases teóricas</p>
        </div>
        
        <button 
          onClick={() => cambiarVista('registrarClaseTeorica')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <span>+ Nueva Clase</span>
        </button>
      </div>

      {cargando && <div className="p-8 text-center text-slate-500">Cargando base de datos...</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

      {!cargando && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">Tema</th>
                  <th className="p-4 font-semibold">Fecha</th>
                  <th className="p-4 font-semibold">Horario</th>
                  <th className="p-4 font-semibold">Profesor Asignado</th>
                  <th className="p-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clases.map((clase) => (
                  <tr key={clase.id_clase_teorica} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{clase.tema}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {formatearFecha(clase.fecha)}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {clase.hora_inicio} - {clase.hora_fin}
                    </td>
                    <td className="p-4">
                      {clase.profesor ? (
                        <div className="font-medium text-slate-800">
                          {clase.profesor.nombre} {clase.profesor.apellido}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400 italic">Sin profesor asignado</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getColorEstado(clase.estado)}`}>
                        {clase.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {clases.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No hay clases teóricas programadas en el sistema.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaClasesTeoricas;