import React, { useState, useEffect } from 'react';

const PerfilProfesor = ({ profesorId, cambiarVista }) => {
  const [profesor, setProfesor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerDetalleProfesor = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/profesores/${profesorId}`);
        const respuestaServidor = await response.json();

        if (response.ok) {
          setProfesor(respuestaServidor.data);
        } else {
          setError('No se pudo cargar la información del profesor');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor');
      } finally {
        setCargando(false);
      }
    };

    obtenerDetalleProfesor();
  }, [profesorId]);

  const getColorEstado = (estado) => {
    return estado
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando perfil...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  if (!profesor) return <div className="p-8 text-center text-slate-500">Profesor no encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <button
        onClick={() => cambiarVista('profesores')}
        className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 mb-4"
      >
        ← Volver a la lista
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              {profesor.nombre} {profesor.apellido}
            </h2>

            <p className="text-slate-500 mt-1">
              RUT: {profesor.rut} | {profesor.correo_institucional}
            </p>
          </div>

          <span className={`px-4 py-2 rounded-lg font-bold ${getColorEstado(profesor.estado)}`}>
            {profesor.estado ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8">

          <div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              Datos de contacto
            </h3>

            <p className="text-slate-600">
              <strong>Correo institucional:</strong> {profesor.correo_institucional}
            </p>

            <p className="text-slate-600">
              <strong>Correo personal:</strong> {profesor.correo_personal || 'No registrado'}
            </p>

            <p className="text-slate-600">
              <strong>Teléfono:</strong> {profesor.telefono || 'No registrado'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              Información operativa
            </h3>

            <p className="text-slate-600">
              <strong>Sede:</strong> {profesor.sede}
            </p>

            <p className="text-slate-600">
              <strong>Licencia autorizada:</strong> {profesor.licencia_autorizada}
            </p>

            <p className="text-slate-600">
              <strong>Especialidad:</strong> {profesor.especialidad}
            </p>
          </div>

        </div>

        <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase">
            Observación del sistema
          </h3>

          <p className="text-slate-600 mt-2">
            Este profesor queda disponible para futuras asignaciones de clases según su estado,
            sede, licencia autorizada y especialidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerfilProfesor;