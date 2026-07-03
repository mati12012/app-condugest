import React, { useEffect, useState } from 'react';
import {formatearFechaVisual} from '../../utils/formatearFecha';

const VistaClasesPracticas = ({ cambiarVista }) => {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  useEffect(() => {
    obtenerClasesPracticas();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado]);

  const obtenerClasesPracticas = async () => {
    try {
      setCargando(true);

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/clases-practicas`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setClases(respuestaServidor.data || []);
        setError(null);
      } else {
        setError(respuestaServidor.message || 'No se pudieron obtener las clases prácticas');
      }
    } catch (error) {
      console.error(error);
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Programada') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }

    if (estado === 'Realizada') {
      return 'bg-green-100 text-green-700 border-green-200';
    }

    if (estado === 'Cancelada') {
      return 'bg-red-100 text-red-700 border-red-200';
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatearHora = (hora) => {
    if (!hora) return '';

    return String(hora).slice(0, 5);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';

    const fechaTexto = String(fecha);

    if (fechaTexto.includes('T')) {
      return fechaTexto.split('T')[0];
    }

    return fechaTexto;
  };

  const cambiarEstadoClase = async (clase, nuevoEstado) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/clases-practicas/${clase.id_clase_practica}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estado: nuevoEstado
          })
        }
      );

      const respuestaServidor = await response.json();

      if (response.ok) {
        setClases(prevClases =>
          prevClases.map(item =>
            item.id_clase_practica === clase.id_clase_practica
              ? { ...item, estado: nuevoEstado }
              : item
          )
        );
      } else {
        alert(respuestaServidor.message || 'No se pudo actualizar el estado de la clase');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    }
  };

  const clasesFiltradas = clases.filter((clase) => {
    const textoBusqueda = busqueda.toLowerCase();

    const alumno = `${clase.alumno_nombre || ''} ${clase.alumno_apellido || ''}`.toLowerCase();
    const profesor = `${clase.profesor_nombre || ''} ${clase.profesor_apellido || ''}`.toLowerCase();
    const vehiculo = `${clase.vehiculo_patente || ''} ${clase.vehiculo_marca || ''} ${clase.vehiculo_modelo || ''}`.toLowerCase();
    const sede = clase.sede?.toLowerCase() || '';
    const fecha = formatearFechaVisual(clase.fecha).toLowerCase();

    const coincideBusqueda =
      alumno.includes(textoBusqueda) ||
      profesor.includes(textoBusqueda) ||
      vehiculo.includes(textoBusqueda) ||
      sede.includes(textoBusqueda) ||
      fecha.includes(textoBusqueda);

    const coincideEstado =
      filtroEstado === 'todas' ||
      clase.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const totalPaginas = Math.ceil(clasesFiltradas.length / registrosPorPagina);

const indiceUltimoRegistro = paginaActual * registrosPorPagina;
const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;

const clasesPaginadas = clasesFiltradas.slice(
  indicePrimerRegistro,
  indiceUltimoRegistro
);

  const totalClases = clases.length;

  const totalProgramadas = clases.filter(
    clase => clase.estado === 'Programada'
  ).length;

  const totalRealizadas = clases.filter(
    clase => clase.estado === 'Realizada'
  ).length;

  const totalCanceladas = clases.filter(
    clase => clase.estado === 'Cancelada'
  ).length;

  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando clases prácticas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
          {error}
        </div>

        <button
          onClick={obtenerClasesPracticas}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Clases Prácticas
          </h1>
          <p className="text-slate-500">
            Administra la asignación de alumnos, profesores, vehículos y horarios.
          </p>
        </div>

        <button
          onClick={() => cambiarVista('registrarClasePractica')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          + Nueva Clase
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
              placeholder="Buscar por alumno, profesor, vehículo, sede o fecha..."
              className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroEstado('todas')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'todas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Todas
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('Programada')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'Programada'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Programadas
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('Realizada')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'Realizada'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Realizadas
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('Cancelada')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filtroEstado === 'Cancelada'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
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
                <th className="p-4 font-bold">Alumno</th>
                <th className="p-4 font-bold">Profesor</th>
                <th className="p-4 font-bold">Vehículo</th>
                <th className="p-4 font-bold">Fecha y horario</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {clasesPaginadas.map((clase) => (
                <tr key={clase.id_clase_practica} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">
                      {clase.alumno_nombre} {clase.alumno_apellido}
                    </p>
                    <p className="text-sm text-slate-500">
                      {clase.alumno_rut}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-800">
                      {clase.profesor_nombre} {clase.profesor_apellido}
                    </p>
                    <p className="text-sm text-slate-500">
                      {clase.profesor_correo_institucional}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-800">
                      {clase.vehiculo_patente}
                    </p>
                    <p className="text-sm text-slate-500">
                      {clase.vehiculo_marca} {clase.vehiculo_modelo}
                    </p>
                    <p className="text-xs text-slate-400">
                      Clase {clase.vehiculo_licencia_requerida} · {clase.vehiculo_tipo_transmision}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-800">
                      {formatearFechaVisual(clase.fecha)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {clase.sede}
                    </p>
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstado(clase.estado)}`}>
                      {clase.estado}
                    </span>

                    <select
                      className="mt-2 block w-full max-w-[150px] px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={clase.estado}
                      onChange={(e) => cambiarEstadoClase(clase, e.target.value)}
                    >
                      <option value="Programada">Programada</option>
                      <option value="Realizada">Realizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-start">
                      <button
                        onClick={() => cambiarVista('verClasePractica', clase.id_clase_practica)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Ver clase
                      </button>

                      <button
                        onClick={() => cambiarVista('editarClasePractica', clase.id_clase_practica)}
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
              No se encontraron clases prácticas con los filtros aplicados.
            </div>
          )}
          {clasesFiltradas.length > 0 && (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t border-slate-200 bg-white">
    <p className="text-sm text-slate-500">
      Mostrando {indicePrimerRegistro + 1} - {Math.min(indiceUltimoRegistro, clasesFiltradas.length)} de {clasesFiltradas.length} clases
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
    </div>
  );
};

export default VistaClasesPracticas;