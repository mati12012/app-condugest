import React, { useEffect, useState } from 'react';
import { formatearFechaVisual } from '../utils/formatearFecha';

const VerClasePractica = ({ claseId, cambiarVista, volverA = 'clasesPracticas' }) => {
  const [clase, setClase] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerClasePractica();
  }, [claseId]);

  const obtenerClasePractica = async () => {
    try {
      setCargando(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/clases-practicas/${claseId}`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        setClase(respuestaServidor.data);
      } else {
        setError(respuestaServidor.message || 'No se pudo obtener la clase práctica');
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

  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando clase práctica...
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
          onClick={() => cambiarVista(volverA)}
          className="mt-6 px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!clase) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontró información de la clase práctica.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Clase Práctica
            </h2>

            <p className="text-slate-500 mt-1">
              {formatearFechaVisual(clase.fecha)} · {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
            </p>

            <p className="text-slate-500">
              Sede: <span className="font-semibold text-slate-700">{clase.sede}</span>
            </p>
          </div>

          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border ${obtenerClaseEstado(clase.estado)}`}>
            {clase.estado}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-2">
              Alumno
            </p>

            <p className="text-lg font-bold text-slate-800">
              {clase.alumno_nombre} {clase.alumno_apellido}
            </p>

            <p className="text-sm text-slate-500">
              RUT: {clase.alumno_rut}
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-2">
              Profesor
            </p>

            <p className="text-lg font-bold text-slate-800">
              {clase.profesor_nombre} {clase.profesor_apellido}
            </p>

            <p className="text-sm text-slate-500">
              RUT: {clase.profesor_rut}
            </p>

            <p className="text-sm text-slate-500 break-all">
              {clase.profesor_correo_institucional}
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-2">
              Vehículo
            </p>

            <p className="text-lg font-bold text-slate-800">
              {clase.vehiculo_patente}
            </p>

            <p className="text-sm text-slate-500">
              {clase.vehiculo_marca} {clase.vehiculo_modelo}
            </p>

            <p className="text-sm text-slate-500">
              Clase {clase.vehiculo_licencia_requerida} · {clase.vehiculo_tipo_transmision}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Fecha</p>
            <p className="text-lg font-bold text-slate-800">
              {formatearFechaVisual(clase.fecha)}
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Hora inicio</p>
            <p className="text-lg font-bold text-slate-800">
              {formatearHora(clase.hora_inicio)}
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Hora término</p>
            <p className="text-lg font-bold text-slate-800">
              {formatearHora(clase.hora_fin)}
            </p>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 font-medium mb-2">
            Observación
          </p>

          <p className="text-slate-700">
            {clase.observacion || 'Sin observaciones registradas.'}
          </p>
        </div>

        <div className="pt-6 mt-6 border-t flex flex-col md:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={() => cambiarVista(volverA)}
            className="px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Volver
          </button>

          <button
            type="button"
            onClick={() => cambiarVista('editarClasePractica', clase.id_clase_practica)}
            className="px-6 py-2.5 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
          >
            Editar Clase
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerClasePractica;