import React, { useState } from 'react';

const VistaAlumnos = ({ cambiarVista }) => {
  const [busqueda, setBusqueda] = useState('');

  // por ahora son datos falsos para que la tabla se vea llena
  // despues los cambiaremos por un fetch a la base de datos
  const alumnosLista = [
    { id: 1, nombre: 'Juan Perez', correo: 'juan.perez@alumnos.condugest.cl', licencia: 'Clase B', sede: 'Sede Concepcion', estado: 'Activo' },
    { id: 2, nombre: 'Maria Gonzalez', correo: 'maria.gonzalez@alumnos.condugest.cl', licencia: 'Clase C', sede: 'Sede San Pedro', estado: 'Inactivo' },
    { id: 3, nombre: 'Carlos Silva', correo: 'carlos.silva@alumnos.condugest.cl', licencia: 'Clase B', sede: 'Sede Penco', estado: 'Activo' },
    { id: 4, nombre: 'Ana Rojas', correo: 'ana.rojas@alumnos.condugest.cl', licencia: 'Clase A2', sede: 'Sede Concepcion', estado: 'Activo' },
  ];

  // solo un filtro simple para la barra de busqueda
  const alumnosFiltrados = alumnosLista.filter(alumno => 
    alumno.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* cabecera principal */}
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

      {/* tarjetas resumen*/}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Total Alumnos Activos</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">248</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Matriculas este mes</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Alumnos con problemas</p>
          <p className="text-3xl font-bold text-red-600 mt-2">3</p>
        </div>
      </div>

      {/* tabla de alumnos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* barra de busqueda de la tabla */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <input 
            type="text" 
            placeholder="Buscar alumno por nombre..." 
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* estructura de la tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Nombre Completo</th>
                <th className="p-4 font-semibold">Correo Institucional</th>
                <th className="p-4 font-semibold">Licencia</th>
                <th className="p-4 font-semibold">Sede</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {alumnosFiltrados.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-800 font-medium">{alumno.nombre}</td>
                  <td className="p-4 text-slate-500">{alumno.correo}</td>
                  <td className="p-4 text-slate-600">{alumno.licencia}</td>
                  <td className="p-4 text-slate-600">{alumno.sede}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${alumno.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {alumno.estado}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline text-sm font-medium">Ver perfil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {alumnosFiltrados.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron alumnos con ese nombre.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default VistaAlumnos;