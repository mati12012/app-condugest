import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";
import {
  normalizarRutBasico,
  normalizarTexto,
  validarNombrePersona,
  validarRutBasico,
  validarTelefonoChile,
} from "../../utils/validacionesFormulario";

const EditarProfesor = ({ profesorId, cambiarVista }) => {
  const [datos, setDatos] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    correo_institucional: '',
    correo_personal: '',
    telefono: '',
    licencia_autorizada: 'B',
    sede: 'Sede Concepcion',
    especialidad: 'Clases prácticas',
    estado: true
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const obtenerProfesor = useCallback(async () => {
    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesores/${profesorId}`);
      const respuestaServidor = await response.json();

      if (response.ok) {
        const profesor = respuestaServidor.data;

        setDatos({
          rut: profesor.rut || '',
          nombre: profesor.nombre || '',
          apellido: profesor.apellido || '',
          correo_institucional: profesor.correo_institucional || '',
          correo_personal: profesor.correo_personal || '',
          telefono: profesor.telefono || '',
          licencia_autorizada: profesor.licencia_autorizada || 'B',
          sede: profesor.sede || 'Sede Concepcion',
          especialidad: profesor.especialidad || 'Clases prácticas',
          estado: Boolean(profesor.estado)
        });
      } else {
        setMensaje('Error: No se pudo cargar el profesor');
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error: Sin conexión al servidor');
    } finally {
      setCargando(false);
    }
  }, [profesorId]);

  useEffect(() => {
    Promise.resolve().then(obtenerProfesor);
  }, [obtenerProfesor]);

  const validarRutFormato = (rut) => {
    return !validarRutBasico(rut);
  }

  const validarCorreo = (correo) => {
    if (correo.trim() === '') return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  };

  const validarTelefono = (telefono) => {
    return !validarTelefonoChile(telefono, false);
  };

  const validarFormulario = () => {
    if (datos.rut.trim() === '') {
      return 'Error: El RUT es obligatorio';
    }

    if (!validarRutFormato(datos.rut)) {
      return 'Error: El RUT debe tener un formato válido. Ejemplo: 12.345.678-9';
    }

    const errorNombre = validarNombrePersona(datos.nombre, 'nombre');
    if (errorNombre) {
      return `Error: ${errorNombre}`;
    }

    const errorApellido = validarNombrePersona(datos.apellido, 'apellido');
    if (errorApellido) {
      return `Error: ${errorApellido}`;
    }

    if (!validarCorreo(datos.correo_personal)) {
      return 'Error: El correo personal no tiene un formato válido';
    }

    if (!validarTelefono(datos.telefono)) {
      return 'Error: El teléfono no tiene un formato válido. Ejemplo: +56912345678';
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

    return respuestaServidor.message || 'No se pudo actualizar el profesor';
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
      rut: normalizarRutBasico(datos.rut),
      nombre: normalizarTexto(datos.nombre),
      apellido: normalizarTexto(datos.apellido),
      correo_personal:
        datos.correo_personal.trim() === ''
          ? null
          : datos.correo_personal.trim(),
      telefono:
        datos.telefono.trim() === ''
          ? null
          : datos.telefono.replace(/\s/g, ''),
      licencia_autorizada: datos.licencia_autorizada,
      sede: datos.sede,
      especialidad: datos.especialidad,
      estado: Boolean(datos.estado)
    };

    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesores/${profesorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });

      const respuestaServidor = await response.json();

      if (response.ok) {
        setMensaje('Exito: profesor actualizado correctamente');
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

  if (cargando) {
    return <div className="p-8 text-center text-slate-500">Cargando datos del profesor...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Editar Profesor</h2>
        <p className="text-slate-500">
          Modifica los datos administrativos del profesor o instructor.
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
            Correo institucional
          </label>
          <input
            type="text"
            value={datos.correo_institucional}
            disabled
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">
            Este correo es generado por el sistema y no se edita manualmente.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            RUT
          </label>
          <input
            type="text"
            placeholder="12.345.678-9"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={datos.rut}
            onChange={e => setDatos({ ...datos, rut: e.target.value })}
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Puede ingresarse con o sin puntos. Se normalizara antes de guardar.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre
          </label>
          <input
            type="text"
            placeholder="Ej: Juan"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={datos.nombre}
            onChange={e => setDatos({ ...datos, nombre: e.target.value })}
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            2 a 50 caracteres. Solo letras, espacios simples, apostrofe o guion.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Apellido
          </label>
          <input
            type="text"
            placeholder="Ej: Perez"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={datos.apellido}
            onChange={e => setDatos({ ...datos, apellido: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Correo personal
          </label>
          <input
            type="email"
            placeholder="Ej: profesor@gmail.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={datos.correo_personal}
            onChange={e => setDatos({ ...datos, correo_personal: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Teléfono
          </label>
          <input
            type="text"
            placeholder="+56912345678"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={datos.telefono}
            onChange={e => setDatos({ ...datos, telefono: e.target.value })}
          />
          <p className="text-xs text-slate-400 mt-1">
            Campo opcional. Debe usar formato chileno +569XXXXXXXX.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Licencia Autorizada
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.licencia_autorizada}
              onChange={e => setDatos({ ...datos, licencia_autorizada: e.target.value })}
            >
              <option value="B">Clase B</option>
              <option value="C">Clase C</option>
              <option value="A2">Clase A2</option>
              <option value="A3">Clase A3</option>
              <option value="A4">Clase A4</option>
              <option value="A5">Clase A5</option>
              <option value="D">Clase D</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sede Asignada
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.sede}
              onChange={e => setDatos({ ...datos, sede: e.target.value })}
            >
              <option value="Sede Concepcion">Sede Concepcion</option>
              <option value="Sede San Pedro">Sede San Pedro</option>
              <option value="Sede Penco">Sede Penco</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Especialidad
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.especialidad}
              onChange={e => setDatos({ ...datos, especialidad: e.target.value })}
            >
              <option value="Clases prácticas">Clases prácticas</option>
              <option value="Clases teóricas">Clases teóricas</option>
              <option value="Evaluación psicotécnica">Evaluación psicotécnica</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Estado
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={String(datos.estado)}
              onChange={e => setDatos({ ...datos, estado: e.target.value === 'true' })}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => cambiarVista('profesores')}
            className="px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Volver
          </button>

          <button
            type="submit"
            disabled={guardando}
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors
              ${guardando ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarProfesor;
