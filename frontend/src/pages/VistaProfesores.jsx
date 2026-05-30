import React, { useState, useEffect } from 'react';

const VistaProfesores = ({ cambiarVista }) => {
  const [profesores, setProfesores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    obtenerProfesores();
  }, []);

  const obtenerProfesores = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/profesores`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setProfesores(respuestaServidor.data);
      } else {
        setError(respuestaServidor.message || "Error al obtener profesores");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoProfesor = async (profesor) => {
    const nuevoEstado = !profesor.estado;

    const confirmar = window.confirm(
      nuevoEstado
        ? "¿Seguro que deseas activar este profesor?"
        : "¿Seguro que deseas desactivar este profesor?"
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/profesores/${profesor.id_profesor}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const respuestaServidor = await response.json();

      if (response.ok) {
        obtenerProfesores();
      } else {
        alert(respuestaServidor.message || "Error al actualizar el estado del profesor");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  const profesoresFiltrados = profesores.filter(profesor => {
    const nombreCompleto = `${profesor.nombre} ${profesor.apellido}`.toLowerCase();
    const rut = profesor.rut?.toLowerCase() || "";
    const correo = profesor.correo_institucional?.toLowerCase() || "";

    return (
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      rut.includes(busqueda.toLowerCase()) ||
      correo.includes(busqueda.toLowerCase())
    );
  });

  const totalProfesores = profesores.length;
  const profesoresActivos = profesores.filter(p => p.estado === true).length;
  const profesoresInactivos = profesores.filter(p => p.estado === false).length;

  const getColorEstado = (estado) => {
    return estado
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Profesores</h2>
          <p className="text-slate-500 mt-1">
            Administra los profesores e instructores registrados en el sistema
          </p>
        </div>

        <button
          onClick={() => cambiarVista('registrarProfesor')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <span>+ Nuevo Profesor</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Total Profesores</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalProfesores}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Profesores Activos</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{profesoresActivos}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Profesores Inactivos</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{profesoresInactivos}</p>
        </div>
      </div>

      {cargando && <div className="p-8 text-center text-slate-500">Cargando profesores...</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

      {!cargando && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <input
              type="text"
              placeholder="Buscar profesor por nombre, RUT o correo..."
              className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">Profesor / RUT</th>
                  <th className="p-4 font-semibold">Contacto</th>
                  <th className="p-4 font-semibold">Sede y Licencia</th>
                  <th className="p-4 font-semibold">Especialidad</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {profesoresFiltrados.map((profesor) => (
                  <tr key={profesor.id_profesor} className="hover:bg-slate-50 transition-colors">

                    <td className="p-4">
                      <div className="font-bold text-slate-800">
                        {profesor.nombre} {profesor.apellido}
                      </div>
                      <div className="text-sm text-slate-500 font-mono">
                        {profesor.rut}
                      </div>
                    </td>

                    <td className="p-4 text-slate-600 text-sm">
                      <div>{profesor.correo_institucional}</div>

                      {profesor.correo_personal && (
                        <div className="text-xs text-slate-400 mt-1">
                          Personal: {profesor.correo_personal}
                        </div>
                      )}

                      {profesor.telefono && (
                        <div className="text-xs text-slate-400 mt-1">
                          Tel: {profesor.telefono}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-800">
                        {profesor.licencia_autorizada}
                      </div>
                      <div className="text-sm text-slate-500">
                        {profesor.sede}
                      </div>
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {profesor.especialidad}
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getColorEstado(profesor.estado)}`}>
                        {profesor.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <button
                          onClick={() => cambiarVista('perfilProfesor', profesor.id_profesor)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Ver perfil
                        </button>

                        <button
                          onClick={() => cambiarEstadoProfesor(profesor)}
                          className={`text-sm font-medium hover:underline ${
                            profesor.estado ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {profesor.estado ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {profesoresFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No se encontraron profesores registrados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaProfesores;