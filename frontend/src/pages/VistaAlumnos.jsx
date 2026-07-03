import React, { useState, useEffect } from 'react';

const VistaAlumnos = ({ cambiarVista }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  useEffect(() => {
    obtenerAlumnos();
  }, []);

  useEffect(() => {
  setPaginaActual(1);
}, [busqueda, filtroEstado]);

  const obtenerAlumnos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/alumnos`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setAlumnos(respuestaServidor.data);
      } else {
        setError(respuestaServidor.message || "Error al obtener alumnos");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  //Filtro de busqueda por nombre completo
  const alumnosFiltrados = alumnos.filter(alumno => {
    const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  const totalPaginas = Math.ceil(alumnosFiltrados.length / registrosPorPagina);

const indiceUltimoRegistro = paginaActual * registrosPorPagina;
const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;

const alumnosPaginados = alumnosFiltrados.slice(
  indicePrimerRegistro,
  indiceUltimoRegistro
);

  //Para las tarjetas de resumenes
  const totalAlumnos = alumnos.length;
  const alumnosEnCurso = alumnos.filter(a => a.estado === 'En curso').length;
  const matriculadosRecientes = alumnos.filter(a => a.estado === 'Matriculado').length;

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Matriculado': return 'bg-blue-100 text-blue-700';
      case 'En curso': return 'bg-amber-100 text-amber-700';
      case 'Finalizado': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion de Alumnos</h2>
          <p className="text-slate-500 mt-1">Administra las matriculas y revisa el estado de los estudiantes</p>
        </div>
        
        <button 
          onClick={() => cambiarVista('registrar')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <span>+ Nuevo Alumno</span>
        </button>
      </div>

      {/* Tarjetas de resumenes */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Total Alumnos</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalAlumnos}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Clases en Curso</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{alumnosEnCurso}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Recien Matriculados</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{matriculadosRecientes}</p>
        </div>
      </div>

      {/* Mensajes de carga o de error */}
      {cargando && <div className="p-8 text-center text-slate-500">Cargando base de datos...</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

      {/* Tabla de alumnos */}
      {!cargando && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Barra de busqueda */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <input 
              type="text" 
              placeholder="Buscar alumno por nombre o apellido..." 
              className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">Alumno / RUT</th>
                  <th className="p-4 font-semibold">Contacto</th>
                  <th className="p-4 font-semibold">Sede y Licencia</th>
                  <th className="p-4 font-semibold">Progreso</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {alumnosPaginados.map((alumno) => (
                  <tr key={alumno.id_alumno} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{alumno.nombre} {alumno.apellido}</div>
                      <div className="text-sm text-slate-500 font-mono">{alumno.rut}</div>
                    </td>
                    
                    <td className="p-4 text-slate-600 text-sm">{alumno.correo}</td>
                    
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{alumno.licencia}</div>
                      <div className="text-sm text-slate-500">{alumno.sede}</div>
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {alumno.clases_completadas} / {alumno.total_clases} clases
                    </td>
                    
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getColorEstado(alumno.estado)}`}>
                        {alumno.estado}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <button 
                        onClick={() => cambiarVista('perfil', alumno)} 
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Ver perfil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {alumnosFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No se encontraron alumnos registrados.
              </div>
            )}
            {alumnosFiltrados.length > 0 && (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t border-slate-200 bg-white">
    <p className="text-sm text-slate-500">
      Mostrando {indicePrimerRegistro + 1} - {Math.min(indiceUltimoRegistro, alumnosFiltrados.length)} de {alumnosFiltrados.length} alumnos
    </p>

    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={paginaActual === 1}
        onClick={() => setPaginaActual(paginaActual - 1)}
        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-300"
      >
        Anterior
      </button>

      <span className="text-sm font-semibold text-slate-600">
        Página {paginaActual} de {totalPaginas || 1}
      </span>

      <button
        type="button"
        disabled={paginaActual === totalPaginas || totalPaginas === 0}
        onClick={() => setPaginaActual(paginaActual + 1)}
        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-300"
      >
        Siguiente
      </button>
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaAlumnos;