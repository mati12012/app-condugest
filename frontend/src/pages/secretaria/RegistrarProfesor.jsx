import React, { useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";

const RegistrarProfesor = ({ cambiarVista }) => {
  const [datos, setDatos] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    correo_personal: '',
    telefono: '',
    licencia_autorizada: 'B',
    sede: 'Sede Concepcion',
    especialidad: 'Clases prácticas',
    estado: true
  });

  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

const validarRutFormato = (rut) => {
  return /^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])$/.test(rut.trim());
};

const validarCorreo = (correo) => {
  if (correo.trim() === '') return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
};

const validarTelefono = (telefono) => {
  if (telefono.trim() === '') return true;

  const telefonoLimpio = telefono.replace(/\s/g, '').replace(/-/g, '');
  return /^(\+56)?\d{8,9}$/.test(telefonoLimpio);
};

const validarFormulario = () => {
  if (datos.rut.trim() === '') {
    return 'Error: El RUT es obligatorio';
  }

  if (!validarRutFormato(datos.rut)) {
    return 'Error: El RUT debe tener un formato válido. Ejemplo: 12.345.678-9';
  }

  if (datos.nombre.trim() === '') {
    return 'Error: El nombre es obligatorio';
  }

  if (datos.apellido.trim() === '') {
    return 'Error: El apellido es obligatorio';
  }

  if (!validarCorreo(datos.correo_personal)) {
    return 'Error: El correo personal no tiene un formato válido';
  }

  if (!validarTelefono(datos.telefono)) {
    return 'Error: El teléfono no tiene un formato válido. Ejemplo: +56912345678';
  }

  return null;
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensaje(errorValidacion);
      return;
    }

    setCargando(true);

    const datosFinales = {
      rut: datos.rut.trim(),
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      correo_personal:
        datos.correo_personal.trim() === ''
          ? null
          : datos.correo_personal.trim(),
      telefono:
        datos.telefono.trim() === ''
          ? null
          : datos.telefono.replace(/\s/g, '').replace(/-/g, ''),
      licencia_autorizada: datos.licencia_autorizada.trim(),
      sede: datos.sede.trim(),
      especialidad: datos.especialidad.trim(),
      estado: Boolean(datos.estado)
    };

    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      const respuestaServidor = await response.json();

      if (response.ok) {
        const correoCreado = respuestaServidor.data.correo_institucional;

        setMensaje(`Exito: profesor guardado. Su correo institucional es ${correoCreado}`);

        setDatos({
          rut: '',
          nombre: '',
          apellido: '',
          correo_personal: '',
          telefono: '',
          licencia_autorizada: 'B',
          sede: 'Sede Concepcion',
          especialidad: 'Clases prácticas',
          estado: true
        });
      } else {
        if (respuestaServidor.errorDetails && respuestaServidor.errorDetails.length > 0) {
          setMensaje(`Error: ${respuestaServidor.errorDetails.join(', ')}`);
        } else {
          setMensaje(`Error: ${respuestaServidor.message || 'Error desconocido al guardar'}`);
        }
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error: Sin conexion al servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Registrar Nuevo Profesor</h2>
        <p className="text-slate-500">
          Ingrese los datos para registrar un nuevo profesor o instructor en el sistema.
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
            RUT
          </label>
          <input
            type="text"
            placeholder="Ej: 12345678-9"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={datos.rut}
            onChange={e => setDatos({ ...datos, rut: e.target.value })}
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Puede ingresarse con o sin puntos. Ejemplo: 12.345.678-9 o 12345678-9.
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
          <p className="text-xs text-slate-400 mt-1">
            El correo institucional se generará automáticamente.
          </p>
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
          <p className="text-xs text-slate-400 mt-1">
            Campo opcional. Si se ingresa, debe tener formato de correo válido.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Teléfono
          </label>
          <input
            type="text"
            placeholder="Ej: +56912345678"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={datos.telefono}
            onChange={e => setDatos({ ...datos, telefono: e.target.value })}
          />
          <p className="text-xs text-slate-400 mt-1">
            Campo opcional. Ejemplo recomendado: +56912345678 o 912345678.
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
            disabled={cargando}
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors
              ${cargando ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {cargando ? 'Guardando...' : 'Confirmar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarProfesor;