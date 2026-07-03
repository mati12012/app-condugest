import React, { useEffect, useState } from 'react';

const VerVehiculo = ({ vehiculoId, cambiarVista }) => {
  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerVehiculo();
  }, [vehiculoId]);

  const obtenerVehiculo = async () => {
    try {
      setCargando(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/vehiculos/${vehiculoId}`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setVehiculo(respuestaServidor.data);
      } else {
        setError(respuestaServidor.message || 'No se pudo obtener el vehículo');
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

  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando vehículo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
          {error}
        </div>

        <button
          onClick={() => cambiarVista('vehiculos')}
          className="mt-6 px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontró información del vehículo.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              {vehiculo.marca} {vehiculo.modelo}
            </h2>

            <p className="text-slate-500 mt-1">
              Patente: <span className="font-bold text-slate-700">{vehiculo.patente}</span>
            </p>

            <p className="text-slate-500">
              Año: <span className="font-semibold text-slate-700">{vehiculo.anio}</span>
            </p>
          </div>

          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border ${obtenerClaseEstado(vehiculo.estado_operativo)}`}>
            {vehiculo.estado_operativo}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Marca</p>
            <p className="text-lg font-bold text-slate-800">{vehiculo.marca}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Modelo</p>
            <p className="text-lg font-bold text-slate-800">{vehiculo.modelo}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Tipo de transmisión</p>
            <p className="text-lg font-bold text-slate-800">{vehiculo.tipo_transmision}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Licencia requerida</p>
            <p className="text-lg font-bold text-slate-800">
              Clase {vehiculo.licencia_requerida}
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Sede asignada</p>
            <p className="text-lg font-bold text-slate-800">{vehiculo.sede}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Kilometraje</p>
            <p className="text-lg font-bold text-slate-800">
              {vehiculo.kilometraje} km
            </p>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 font-medium mb-2">Observación</p>
          <p className="text-slate-700">
            {vehiculo.observacion || 'Sin observaciones registradas.'}
          </p>
        </div>

        <div className="pt-6 mt-6 border-t flex flex-col md:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={() => cambiarVista('vehiculos')}
            className="px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Volver
          </button>

          <button
            type="button"
            onClick={() => cambiarVista('editarVehiculo', vehiculo.id_vehiculo)}
            className="px-6 py-2.5 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
          >
            Editar Vehículo
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerVehiculo;