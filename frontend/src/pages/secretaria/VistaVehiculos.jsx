import React, { useEffect, useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";

const VistaVehiculos = ({ cambiarVista }) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  useEffect(() => {
    obtenerVehiculos();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado]);

  const obtenerVehiculos = async () => {
    try {
      setCargando(true);

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/vehiculos`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setVehiculos(respuestaServidor.data || []);
        setError(null);
      } else {
        setError(respuestaServidor.message || 'No se pudieron obtener los vehículos');
      }
    } catch (error) {
      console.error(error);
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Disponible') {
      return 'bg-green-100 text-green-700 border-green-200';
    }

    if (estado === 'En mantención') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }

    if (estado === 'Fuera de servicio') {
      return 'bg-red-100 text-red-700 border-red-200';
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const cambiarEstadoOperativo = async (vehiculo, nuevoEstado) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/vehiculos/${vehiculo.id_vehiculo}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estado_operativo: nuevoEstado
          })
        }
      );

      const respuestaServidor = await response.json();

      if (response.ok) {
        setVehiculos(prevVehiculos =>
          prevVehiculos.map(item =>
            item.id_vehiculo === vehiculo.id_vehiculo
              ? { ...item, estado_operativo: nuevoEstado }
              : item
          )
        );
      } else {
        alert(respuestaServidor.message || 'No se pudo actualizar el estado del vehículo');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    }
  };

  const vehiculosFiltrados = vehiculos.filter((vehiculo) => {
    const textoBusqueda = busqueda.toLowerCase();

    const patente = vehiculo.patente?.toLowerCase() || '';
    const marca = vehiculo.marca?.toLowerCase() || '';
    const modelo = vehiculo.modelo?.toLowerCase() || '';
    const sede = vehiculo.sede?.toLowerCase() || '';
    const licencia = vehiculo.licencia_requerida?.toLowerCase() || '';
    const transmision = vehiculo.tipo_transmision?.toLowerCase() || '';

    const coincideBusqueda =
      patente.includes(textoBusqueda) ||
      marca.includes(textoBusqueda) ||
      modelo.includes(textoBusqueda) ||
      sede.includes(textoBusqueda) ||
      licencia.includes(textoBusqueda) ||
      transmision.includes(textoBusqueda);

    const coincideEstado =
      filtroEstado === 'todos' ||
      vehiculo.estado_operativo === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const totalPaginas = Math.ceil(vehiculosFiltrados.length / registrosPorPagina);

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;

  const vehiculosPaginados = vehiculosFiltrados.slice(
    indicePrimerRegistro,
    indiceUltimoRegistro
  );


  const totalVehiculos = vehiculos.length;

  const totalDisponibles = vehiculos.filter(
    vehiculo => vehiculo.estado_operativo === 'Disponible'
  ).length;

  const totalMantencion = vehiculos.filter(
    vehiculo => vehiculo.estado_operativo === 'En mantención'
  ).length;

  const totalFueraServicio = vehiculos.filter(
    vehiculo => vehiculo.estado_operativo === 'Fuera de servicio'
  ).length;

  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando vehículos...
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
          onClick={obtenerVehiculos}
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
            Gestión de Vehículos
          </h1>
          <p className="text-slate-500">
            Administra los vehículos disponibles para clases prácticas.
          </p>
        </div>

        <button
          onClick={() => cambiarVista('registrarVehiculo')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          + Nuevo Vehículo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total vehículos</p>
          <p className="text-3xl font-bold text-slate-800">{totalVehiculos}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Disponibles</p>
          <p className="text-3xl font-bold text-green-600">{totalDisponibles}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">En mantención</p>
          <p className="text-3xl font-bold text-yellow-600">{totalMantencion}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Fuera de servicio</p>
          <p className="text-3xl font-bold text-red-600">{totalFueraServicio}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <input
              type="text"
              placeholder="Buscar por patente, marca, modelo, sede, licencia o transmisión..."
              className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroEstado('todos')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${filtroEstado === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
              >
                Todos
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('Disponible')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${filtroEstado === 'Disponible'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
              >
                Disponibles
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('En mantención')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${filtroEstado === 'En mantención'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
              >
                En mantención
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('Fuera de servicio')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${filtroEstado === 'Fuera de servicio'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
              >
                Fuera de servicio
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-bold">Vehículo</th>
                <th className="p-4 font-bold">Datos técnicos</th>
                <th className="p-4 font-bold">Sede</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {vehiculosPaginados.map((vehiculo) => (
                <tr key={vehiculo.id_vehiculo} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">
                      {vehiculo.patente}
                    </p>
                    <p className="text-sm text-slate-500">
                      {vehiculo.marca} {vehiculo.modelo}
                    </p>
                    <p className="text-xs text-slate-400">
                      Año {vehiculo.anio}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="text-sm text-slate-700">
                      Transmisión: <span className="font-semibold">{vehiculo.tipo_transmision}</span>
                    </p>
                    <p className="text-sm text-slate-700">
                      Licencia: <span className="font-semibold">Clase {vehiculo.licencia_requerida}</span>
                    </p>
                    <p className="text-sm text-slate-700">
                      Kilometraje: <span className="font-semibold">{vehiculo.kilometraje} km</span>
                    </p>
                  </td>

                  <td className="p-4 text-sm text-slate-700">
                    {vehiculo.sede}
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstado(vehiculo.estado_operativo)}`}>
                      {vehiculo.estado_operativo}
                    </span>

                    <select
                      className="mt-2 block w-full max-w-[170px] px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={vehiculo.estado_operativo}
                      onChange={(e) => cambiarEstadoOperativo(vehiculo, e.target.value)}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="En mantención">En mantención</option>
                      <option value="Fuera de servicio">Fuera de servicio</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-start">
                      <button
                        onClick={() => cambiarVista('verVehiculo', vehiculo.id_vehiculo)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Ver Vehículo
                      </button>

                      <button
                        onClick={() => cambiarVista('editarVehiculo', vehiculo.id_vehiculo)}
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

          {vehiculosFiltrados.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron vehículos con los filtros aplicados.
            </div>
          )}
          {vehiculosFiltrados.length > 0 && (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t border-slate-200 bg-white">
    <p className="text-sm text-slate-500">
      Mostrando {indicePrimerRegistro + 1} - {Math.min(indiceUltimoRegistro, vehiculosFiltrados.length)} de {vehiculosFiltrados.length} vehículos
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

export default VistaVehiculos;