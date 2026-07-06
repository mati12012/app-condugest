import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from '../../utils/formatearFecha';

const VistaClasesTeoricas = ({ cambiarVista }) => {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  const obtenerClases = useCallback(async () => {
    try {
      setCargando(true);
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setClases(respuestaServidor.data || []);
        setError(null);
      } else {
        setError(respuestaServidor.message || "Error al obtener las clases teóricas");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  const formatearFecha = (fecha) => {
    return formatearFechaVisual(fecha);
  };

  useEffect(() => {
    Promise.resolve().then(obtenerClases);
  }, [obtenerClases]);

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Programada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Realizada': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const cambiarEstadoClase = async (id, nuevoEstado) => {
    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      const respuestaServidor = await response.json();

      if (response.ok) {
        obtenerClases(); 
      } else {
        let detalles = '';
        if (respuestaServidor.errorDetails) {
          detalles = Array.isArray(respuestaServidor.errorDetails) 
            ? respuestaServidor.errorDetails.join(', ') 
            : respuestaServidor.errorDetails;
        }
        alert(`Error: ${respuestaServidor.message} \n${detalles}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al servidor al intentar actualizar.");
    }
  };

  const clasesFiltradas = clases.filter((clase) => {
    const textoBusqueda = busqueda.toLowerCase();
    
    const tema = (clase.tema || '').toLowerCase();
    const profesor = clase.profesor ? `${clase.profesor.nombre} ${clase.profesor.apellido}`.toLowerCase() : 'sin profesor asignado';
    const sede = (clase.sede || '').toLowerCase();
    const fecha = formatearFecha(clase.fecha).toLowerCase();

    const coincideBusqueda = 
      tema.includes(textoBusqueda) || 
      profesor.includes(textoBusqueda) || 
      sede.includes(textoBusqueda) || 
      fecha.includes(textoBusqueda);
      
    const coincideEstado = filtroEstado === 'todas' || clase.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const totalClases = clases.length;
  const totalProgramadas = clases.filter(clase => clase.estado === 'Programada').length;
  const totalRealizadas = clases.filter(clase => clase.estado === 'Realizada').length;
  const totalCanceladas = clases.filter(clase => clase.estado === 'Cancelada').length;

  if (cargando) {
    return <div className="p-8 text-center text-slate-500">Cargando clases teóricas...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">{error}</div>
        <button onClick={obtenerClases} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Clases Teóricas</h1>
          <p className="text-slate-500">Administra la programación, profesores y estado de las clases teóricas.</p>
        </div>
        
        <button 
          onClick={() => cambiarVista('registrarClaseTeorica')} 
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+ Nueva Clase</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total clases</p>
          <p className="text-3xl font-bold text-slate-800">{totalClases}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Programadas</p>
          <p className="text-3xl font-bold text-blue-600">{totalProgramadas}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Realizadas</p>
          <p className="text-3xl font-bold text-green-600">{totalRealizadas}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Canceladas</p>
          <p className="text-3xl font-bold text-red-600">{totalCanceladas}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <input
              type="text"
              placeholder="Buscar por tema, profesor, sede o fecha..."
              className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroEstado('todas')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'todas' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('Programada')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'Programada' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Programadas
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('Realizada')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'Realizada' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Realizadas
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('Cancelada')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'Cancelada' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Canceladas
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-bold">Tema</th>
                <th className="p-4 font-bold">Fecha y horario</th>
                <th className="p-4 font-bold">Profesor Asignado</th>
                <th className="p-4 font-bold">Estado y Sede</th>
                <th className="p-4 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clasesFiltradas.map((clase) => (
                <tr key={clase.id_clase_teorica} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{clase.tema}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{formatearFecha(clase.fecha)}</p>
                    <p className="text-sm text-slate-500">
                      {String(clase.hora_inicio).slice(0, 5)} - {String(clase.hora_fin).slice(0, 5)}
                    </p>
                  </td>
                  <td className="p-4">
                    {clase.profesor ? (
                      <p className="font-bold text-slate-800">
                        {clase.profesor.nombre} {clase.profesor.apellido}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Sin profesor asignado</p>
                    )}
                  </td>
                    <td className="p-4">
                      <select
                        className={`text-xs font-bold px-2 py-1 rounded-full outline-none border cursor-pointer ${getColorEstado(clase.estado)}`}
                        value={clase.estado}
                        onChange={(e) => cambiarEstadoClase(clase.id_clase_teorica, e.target.value)}
                      >
                        <option value="Programada">Programada</option>
                        <option value="Realizada">Realizada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                      <div className="text-xs text-slate-400 mt-2 font-medium">{clase.sede}</div>
                    </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-start">
                      <button
                        onClick={() => cambiarVista('verClaseTeorica', clase.id_clase_teorica)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Ver clase
                      </button>
                      <button
                        onClick={() => cambiarVista('editarClaseTeorica', clase.id_clase_teorica)}
                        className="text-amber-600 hover:underline text-sm font-medium"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {clasesFiltradas.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron clases teóricas con los filtros aplicados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VistaClasesTeoricas;
