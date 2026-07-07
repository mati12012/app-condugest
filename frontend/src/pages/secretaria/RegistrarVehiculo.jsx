import { useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";
import RevisionTecnicaAsistente from "../../components/RevisionTecnicaAsistente";

const MAX_REVISION_BYTES = 5 * 1024 * 1024;
const EXTENSIONES_REVISION = [".pdf", ".jpg", ".jpeg", ".png"];

const RegistrarVehiculo = ({ cambiarVista }) => {
  const [datos, setDatos] = useState({
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    tipo_transmision: 'Manual',
    licencia_requerida: 'B',
    sede: 'Sede Concepcion',
    kilometraje: '',
    estado_operativo: 'Disponible',
    observacion: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState('');
  const [archivoInputKey, setArchivoInputKey] = useState(0);
  const [analisisRevision, setAnalisisRevision] = useState(null);
  const [vehiculoRegistradoId, setVehiculoRegistradoId] = useState(null);
  const [guardandoRevision, setGuardandoRevision] = useState(false);

  const limpiarPatente = (patente) => {
    return patente
      .trim()
      .toUpperCase()
      .replace(/\s/g, '')
      .replace(/-/g, '')
      .replace(/\./g, '');
  };

  const validarPatente = (patente) => {
    const patenteLimpia = limpiarPatente(patente);

    return /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2})$/.test(patenteLimpia);
  };

  const validarFormulario = () => {
    if (datos.patente.trim() === '') {
      return 'Error: La patente es obligatoria';
    }

    if (!validarPatente(datos.patente)) {
      return 'Error: La patente debe tener formato chileno válido. Ejemplo: AB1234 o ABCD12';
    }

    if (datos.marca.trim() === '') {
      return 'Error: La marca es obligatoria';
    }

    if (datos.modelo.trim() === '') {
      return 'Error: El modelo es obligatorio';
    }

    if (datos.anio === '') {
      return 'Error: El año es obligatorio';
    }

    const anioNumero = Number(datos.anio);

    if (Number.isNaN(anioNumero)) {
      return 'Error: El año debe ser un número';
    }

    if (anioNumero < 1990 || anioNumero > 2030) {
      return 'Error: El año debe estar entre 1990 y 2030';
    }

    if (datos.kilometraje !== '') {
      const kilometrajeNumero = Number(datos.kilometraje);

      if (Number.isNaN(kilometrajeNumero)) {
        return 'Error: El kilometraje debe ser un número';
      }

      if (kilometrajeNumero < 0) {
        return 'Error: El kilometraje no puede ser negativo';
      }
    }

    return null;
  };

  const validarArchivoRevision = (archivoSeleccionado) => {
    if (!archivoSeleccionado) return '';

    if (archivoSeleccionado.size > MAX_REVISION_BYTES) {
      return 'Error: El documento no puede superar los 5 MB';
    }

    const nombre = archivoSeleccionado.name.toLowerCase();
    const extensionValida = EXTENSIONES_REVISION.some((extension) =>
      nombre.endsWith(extension)
    );

    if (!extensionValida) {
      return 'Error: Solo se permiten archivos PDF, JPG o PNG';
    }

    return '';
  };

  const manejarCambioArchivo = (e) => {
    const archivoSeleccionado = e.target.files?.[0] || null;
    const errorValidacion = validarArchivoRevision(archivoSeleccionado);

    if (errorValidacion) {
      setArchivo(null);
      setErrorArchivo(errorValidacion);
      setArchivoInputKey((key) => key + 1);
      return;
    }

    setArchivo(archivoSeleccionado);
    setErrorArchivo('');
  };

  const obtenerMensajeErrorServidor = (respuestaServidor) => {
    if (Array.isArray(respuestaServidor.errorDetails)) {
      return respuestaServidor.errorDetails.join(' | ');
    }

    if (Array.isArray(respuestaServidor.details)) {
      return respuestaServidor.details.join(' | ');
    }

    return respuestaServidor.message || 'No se pudo registrar el vehículo';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensaje(errorValidacion);
      return;
    }

    const errorValidacionArchivo = validarArchivoRevision(archivo);

    if (errorValidacionArchivo) {
      setErrorArchivo(errorValidacionArchivo);
      return;
    }

    setCargando(true);

    const datosFinales = {
      patente: limpiarPatente(datos.patente),
      marca: datos.marca.trim(),
      modelo: datos.modelo.trim(),
      anio: Number(datos.anio),
      tipo_transmision: datos.tipo_transmision,
      licencia_requerida: datos.licencia_requerida,
      sede: datos.sede,
      kilometraje: datos.kilometraje === '' ? 0 : Number(datos.kilometraje),
      estado_operativo: datos.estado_operativo,
      observacion: datos.observacion.trim() === '' ? null : datos.observacion.trim()
    };

    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      const respuestaServidor = await response.json();

      if (response.ok) {
        const idNuevoVehiculo = respuestaServidor.data?.id_vehiculo || respuestaServidor.data?.id;
        setVehiculoRegistradoId(idNuevoVehiculo || null);
        setAnalisisRevision(null);

        if (archivo && idNuevoVehiculo) {
          setMensaje('Vehículo creado. Subiendo documento...');
          const formData = new FormData();
          formData.append('documento', archivo);

          const responseDocumento = await apiFetch(`${import.meta.env.VITE_BASE_URL}/vehiculos/${idNuevoVehiculo}/revision-tecnica`, {
            method: 'POST',
            body: formData
          });

          const respuestaDocumento = await responseDocumento.json();

          if (!responseDocumento.ok) {
            throw new Error(obtenerMensajeErrorServidor(respuestaDocumento));
          }

          setAnalisisRevision(
            respuestaDocumento.data?.vehiculo ||
              respuestaDocumento.data?.analisis_revision_tecnica ||
              null
          );
        }

        setMensaje('Éxito: vehículo y documentos registrados correctamente');
        setDatos({
          patente: '', marca: '', modelo: '', anio: '', tipo_transmision: 'Manual',
          licencia_requerida: 'B', sede: 'Sede Concepcion', kilometraje: '',
          estado_operativo: 'Disponible', observacion: ''
        });
        setArchivo(null); 
        setErrorArchivo('');
        setArchivoInputKey((key) => key + 1);

      } else {
        setMensaje(`Error: ${obtenerMensajeErrorServidor(respuestaServidor)}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje(`Error: ${error.message || 'Sin conexion al servidor'}`);
    } finally {
      setCargando(false);
    }
  };

  const confirmarFechaRevision = async (fechaManual) => {
    if (!vehiculoRegistradoId) return;

    try {
      setGuardandoRevision(true);
      setMensaje('');

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/vehiculos/${vehiculoRegistradoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_vencimiento_revision_tecnica: fechaManual
        })
      });
      const respuestaServidor = await response.json();

      if (!response.ok) {
        setMensaje(`Error: ${obtenerMensajeErrorServidor(respuestaServidor)}`);
        return;
      }

      setAnalisisRevision(respuestaServidor.data);
      setMensaje('Fecha de revision tecnica confirmada correctamente');
    } catch (error) {
      console.error(error);
      setMensaje('Error: No se pudo confirmar la fecha de revision tecnica');
    } finally {
      setGuardandoRevision(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Registrar Nuevo Vehículo</h2>
        <p className="text-slate-500">
          Ingrese los datos del vehículo que será utilizado para las clases prácticas.
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
            Patente
          </label>
          <input
            type="text"
            placeholder="Ej: ABCD12 o AB1234"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
            value={datos.patente}
            onChange={e => setDatos({ ...datos, patente: e.target.value })}
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Puede ingresarse con o sin guion. Ejemplo: ABCD12, AB-CD-12 o AB1234.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              placeholder="Ej: Toyota"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={datos.marca}
              onChange={e => setDatos({ ...datos, marca: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Modelo
            </label>
            <input
              type="text"
              placeholder="Ej: Yaris"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={datos.modelo}
              onChange={e => setDatos({ ...datos, modelo: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Año
            </label>
            <input
              type="number"
              placeholder="Ej: 2020"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={datos.anio}
              onChange={e => setDatos({ ...datos, anio: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Kilometraje
            </label>
            <input
              type="number"
              placeholder="Ej: 45000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={datos.kilometraje}
              onChange={e => setDatos({ ...datos, kilometraje: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de transmisión
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.tipo_transmision}
              onChange={e => setDatos({ ...datos, tipo_transmision: e.target.value })}
            >
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Licencia requerida
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.licencia_requerida}
              onChange={e => setDatos({ ...datos, licencia_requerida: e.target.value })}
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
              Sede asignada
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
              Estado operativo
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              value={datos.estado_operativo}
              onChange={e => setDatos({ ...datos, estado_operativo: e.target.value })}
            >
              <option value="Disponible">Disponible</option>
              <option value="En mantención">En mantención</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Observación
          </label>
          <textarea
            placeholder="Ej: Vehículo usado para clases prácticas de licencia B"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[100px]"
            value={datos.observacion}
            onChange={e => setDatos({ ...datos, observacion: e.target.value })}
          />
          <p className="text-xs text-slate-400 mt-1">
            Campo opcional. Puedes registrar detalles de mantención, uso o disponibilidad.
          </p>
        </div>

        <div className="pt-6 border-t mt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Documento de Revisión Técnica (PDF, JPG, PNG) - Opcional
          </label>
          <div className="flex items-center gap-3">
            <input 
              key={archivoInputKey}
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={manejarCambioArchivo}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Puedes adjuntar el documento ahora o hacerlo más tarde desde la opción "Editar". Tamaño máximo: 5 MB.
          </p>
          {archivo && (
            <p className="text-xs font-semibold text-blue-700 mt-2">
              Archivo seleccionado: {archivo.name}
            </p>
          )}
          {errorArchivo && (
            <p className="text-xs font-semibold text-red-600 mt-2">
              {errorArchivo}
            </p>
          )}
        </div>

        {analisisRevision && (
          <RevisionTecnicaAsistente
            key={`${analisisRevision.fecha_vencimiento_revision_tecnica || 'sin-fecha'}-${analisisRevision.estado_revision_tecnica || 'manual'}`}
            revision={analisisRevision}
            onConfirmarFecha={confirmarFechaRevision}
            guardando={guardandoRevision}
          />
        )}

        <div className="pt-4 border-t mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => cambiarVista('vehiculos')}
            className="px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Volver
          </button>

          <button
            type="submit"
            disabled={cargando}
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
              cargando ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {cargando ? 'Guardando...' : 'Confirmar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarVehiculo;
