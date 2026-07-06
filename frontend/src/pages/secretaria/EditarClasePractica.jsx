import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";
import { validarHorarioAtencion } from "../../utils/validacionesFormulario";

const formatearFechaInput = (fecha) => {
  if (!fecha) return '';

  const fechaTexto = String(fecha);

  if (fechaTexto.includes('T')) {
    return fechaTexto.split('T')[0];
  }

  return fechaTexto;
};

const formatearHoraInput = (hora) => {
  if (!hora) return '';

  return String(hora).slice(0, 5);
};

const EditarClasePractica = ({ claseId, cambiarVista }) => {
  const [datos, setDatos] = useState({
    id_alumno: '',
    id_profesor: '',
    id_vehiculo: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    sede: 'Sede Concepcion',
    estado: 'Programada',
    observacion: ''
  });

  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setCargandoDatos(true);
      setMensaje('');

      const [resClase, resAlumnos, resProfesores, resVehiculos] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-practicas/${claseId}`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/alumnos`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/profesores`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/vehiculos`)
      ]);

      const dataClase = await resClase.json();
      const dataAlumnos = await resAlumnos.json();
      const dataProfesores = await resProfesores.json();
      const dataVehiculos = await resVehiculos.json();

      if (!resClase.ok) {
        throw new Error(dataClase.message || 'No se pudo cargar la clase práctica');
      }

      if (!resAlumnos.ok) {
        throw new Error(dataAlumnos.message || 'No se pudieron cargar los alumnos');
      }

      if (!resProfesores.ok) {
        throw new Error(dataProfesores.message || 'No se pudieron cargar los profesores');
      }

      if (!resVehiculos.ok) {
        throw new Error(dataVehiculos.message || 'No se pudieron cargar los vehículos');
      }

      const clase = dataClase.data;

      setDatos({
        id_alumno: clase.id_alumno || '',
        id_profesor: clase.id_profesor || '',
        id_vehiculo: clase.id_vehiculo || '',
        fecha: formatearFechaInput(clase.fecha),
        hora_inicio: formatearHoraInput(clase.hora_inicio),
        hora_fin: formatearHoraInput(clase.hora_fin),
        sede: clase.sede || 'Sede Concepcion',
        estado: clase.estado || 'Programada',
        observacion: clase.observacion || ''
      });

      setAlumnos(dataAlumnos.data || []);
      setProfesores(dataProfesores.data || []);
      setVehiculos(dataVehiculos.data || []);
    } catch (error) {
      console.error(error);
      setMensaje(`Error: ${error.message || 'No se pudieron cargar los datos'}`);
    } finally {
      setCargandoDatos(false);
    }
  }, [claseId]);

  useEffect(() => {
    Promise.resolve().then(cargarDatosIniciales);
  }, [cargarDatosIniciales]);

  const profesorSeleccionado = profesores.find(
    (profesor) => String(profesor.id_profesor) === String(datos.id_profesor)
  );

  const profesoresParaSelect = profesores.filter((profesor) => {
    return (
      profesor.estado === true ||
      String(profesor.id_profesor) === String(datos.id_profesor)
    );
  });

  const vehiculosDisponibles = vehiculos.filter((vehiculo) => {
    return (
      vehiculo.estado_operativo === 'Disponible' ||
      String(vehiculo.id_vehiculo) === String(datos.id_vehiculo)
    );
  });

  const vehiculosFiltrados = profesorSeleccionado
    ? vehiculosDisponibles.filter((vehiculo) => {
        return (
          vehiculo.licencia_requerida === profesorSeleccionado.licencia_autorizada ||
          String(vehiculo.id_vehiculo) === String(datos.id_vehiculo)
        );
      })
    : vehiculosDisponibles;

  const convertirHoraAMinutos = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  };

  const validarFormulario = () => {
    if (!datos.id_alumno) {
      return 'Error: Debe seleccionar un alumno';
    }

    if (!datos.id_profesor) {
      return 'Error: Debe seleccionar un profesor';
    }

    if (!datos.id_vehiculo) {
      return 'Error: Debe seleccionar un vehículo';
    }

    if (!datos.fecha) {
      return 'Error: Debe seleccionar una fecha';
    }

    if (!datos.hora_inicio) {
      return 'Error: Debe ingresar la hora de inicio';
    }

    if (!datos.hora_fin) {
      return 'Error: Debe ingresar la hora de término';
    }

    const errorHorarioAtencion = validarHorarioAtencion(datos.hora_inicio, datos.hora_fin);
    if (errorHorarioAtencion) {
      return `Error: ${errorHorarioAtencion}`;
    }

    if (convertirHoraAMinutos(datos.hora_fin) <= convertirHoraAMinutos(datos.hora_inicio)) {
      return 'Error: La hora de término debe ser mayor que la hora de inicio';
    }

    if (!datos.sede.trim()) {
      return 'Error: La sede es obligatoria';
    }

    return null;
  };

  const obtenerMensajeErrorServidor = (respuestaServidor) => {
    if (Array.isArray(respuestaServidor.errorDetails)) {
      return respuestaServidor.errorDetails.join(' | ');
    }

    if (Array.isArray(respuestaServidor.details)) {
      return respuestaServidor.details.join(' | ');
    }

    return respuestaServidor.message || 'No se pudo actualizar la clase práctica';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensaje(errorValidacion);
      return;
    }

    setGuardando(true);

    const datosActualizados = {
      id_alumno: Number(datos.id_alumno),
      id_profesor: Number(datos.id_profesor),
      id_vehiculo: Number(datos.id_vehiculo),
      fecha: datos.fecha,
      hora_inicio: datos.hora_inicio,
      hora_fin: datos.hora_fin,
      sede: datos.sede.trim(),
      estado: datos.estado,
      observacion: datos.observacion.trim() === '' ? null : datos.observacion.trim()
    };

    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-practicas/${claseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });

      const respuestaServidor = await response.json();

      if (response.ok) {
        setMensaje('Éxito: clase práctica actualizada correctamente');
      } else {
        setMensaje(`Error: ${obtenerMensajeErrorServidor(respuestaServidor)}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error: Sin conexión al servidor');
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando datos de la clase práctica...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Editar Clase Práctica
        </h2>
        <p className="text-slate-500">
          Modifica la asignación, horario, estado u observación de la clase práctica.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mensaje && (
          <div className={`p-4 rounded-lg font-medium text-sm ${
            mensaje.toLowerCase().includes('error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {mensaje}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Alumno
          </label>
          <select
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
            value={datos.id_alumno}
            onChange={(e) => setDatos({ ...datos, id_alumno: e.target.value })}
            required
          >
            <option value="">Seleccione un alumno</option>

            {alumnos.map((alumno) => (
              <option key={alumno.id_alumno} value={alumno.id_alumno}>
                {alumno.nombre} {alumno.apellido} - {alumno.rut}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Profesor
          </label>
          <select
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
            value={datos.id_profesor}
            onChange={(e) =>
              setDatos({
                ...datos,
                id_profesor: e.target.value,
                id_vehiculo: ''
              })
            }
            required
          >
            <option value="">Seleccione un profesor</option>

            {profesoresParaSelect.map((profesor) => (
              <option key={profesor.id_profesor} value={profesor.id_profesor}>
                {profesor.nombre} {profesor.apellido} - Licencia {profesor.licencia_autorizada}
                {profesor.estado ? '' : ' (inactivo)'}
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-400 mt-1">
            Para clases programadas, el backend solo permitirá profesores activos.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Vehículo
          </label>
          <select
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
            value={datos.id_vehiculo}
            onChange={(e) => setDatos({ ...datos, id_vehiculo: e.target.value })}
            required
          >
            <option value="">
              {profesorSeleccionado
                ? 'Seleccione un vehículo compatible'
                : 'Seleccione primero un profesor'}
            </option>

            {vehiculosFiltrados.map((vehiculo) => (
              <option key={vehiculo.id_vehiculo} value={vehiculo.id_vehiculo}>
                {vehiculo.patente} - {vehiculo.marca} {vehiculo.modelo} - Clase {vehiculo.licencia_requerida}
                {vehiculo.estado_operativo === 'Disponible' ? '' : ` (${vehiculo.estado_operativo})`}
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-400 mt-1">
            Para clases programadas, el backend solo permitirá vehículos disponibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={datos.fecha}
              onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hora inicio
            </label>
            <input
              type="time"
              min="09:00"
              max="20:00"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={datos.hora_inicio}
              onChange={(e) => setDatos({ ...datos, hora_inicio: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hora término
            </label>
            <input
              type="time"
              min="09:00"
              max="20:00"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={datos.hora_fin}
              onChange={(e) => setDatos({ ...datos, hora_fin: e.target.value })}
              required
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 -mt-3">
          Horario de atencion permitido: 09:00 a 20:00. La hora de termino debe ser posterior al inicio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sede
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.sede}
              onChange={(e) => setDatos({ ...datos, sede: e.target.value })}
            >
              <option value="Sede Concepcion">Sede Concepcion</option>
              <option value="Sede San Pedro">Sede San Pedro</option>
              <option value="Sede Penco">Sede Penco</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Estado
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.estado}
              onChange={(e) => setDatos({ ...datos, estado: e.target.value })}
            >
              <option value="Programada">Programada</option>
              <option value="Realizada">Realizada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Observación
          </label>
          <textarea
            placeholder="Ej: Clase reagendada por disponibilidad del alumno"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[100px]"
            value={datos.observacion}
            onChange={(e) => setDatos({ ...datos, observacion: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t mt-6 flex flex-col md:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={() => cambiarVista('clasesPracticas')}
            className="px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Volver
          </button>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => cambiarVista('verClasePractica', claseId)}
              className="px-6 py-2.5 rounded-lg font-bold text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors"
            >
              Ver Clase
            </button>

            <button
              type="submit"
              disabled={guardando}
              className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
                guardando ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditarClasePractica;
