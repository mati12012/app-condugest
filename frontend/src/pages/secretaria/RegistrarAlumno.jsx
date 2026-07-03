import React, { useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";

const RegistrarAlumno = ({ cambiarVista }) => {
  const [datos, setDatos] = useState({ 
    rut: '',
    nombre: '', 
    apellido: '',
    licencia: 'Clase B', 
    sede: 'Sede Concepcion',
    total_clases: 10
  });
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [erroresCampos, setErroresCampos] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErroresCampos([]);
    setCargando(true);

    if (datos.rut.trim() === '') {
      setErroresCampos(['El RUT es obligatorio']);
      setCargando(false);
      return;
    }

    if (datos.nombre.trim() === '') {
      setErroresCampos(['El nombre es obligatorio']);
      setCargando(false);
      return;
    }

    if (datos.apellido.trim() === '') {
      setErroresCampos(['El apellido es obligatorio']);
      setCargando(false);
      return;
    }

    const datosFinales = {
      ...datos,
      total_clases: Number(datos.total_clases),
      clases_completadas: 0,
      estado: 'Matriculado',
      correo: 'autogenerado@condugest.cl' 
    };

    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      const respuestaServidor = await response.json();
      
      if (response.ok) {
        const correoCreado = respuestaServidor.data?.correo || '';
        setMensajeExito(`¡Alumno guardado con éxito! Correo institucional: ${correoCreado}`);
        setErroresCampos([]);
        setDatos({ rut: '', nombre: '', apellido: '', licencia: 'Clase B', sede: 'Sede Concepcion', total_clases: 10 });
      } else {
        if (respuestaServidor.errorDetails && respuestaServidor.errorDetails.length > 0) {
          setErroresCampos(respuestaServidor.errorDetails);
        } else {
          setErroresCampos([respuestaServidor.message || 'Error al guardar el alumno.']);
        }
      }
    } catch (error) {
      console.error(error);
      setErroresCampos(['Error: Sin conexión con el servidor.']);
    } finally {
      setCargando(false);
    }
  };

  // Funcion para saber si un campo especifico fallo y pintarlo de rojo
  const tieneError = (campo) => erroresCampos.some(err => err.toLowerCase().includes(campo));

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registrar Nuevo Alumno</h2>
          <p className="text-slate-500 mt-1">Ingrese los datos para registrar a un nuevo estudiante en el sistema.</p>
        </div>
        {/* Botón para Volver Atrás */}
        <button
          type="button"
          onClick={() => cambiarVista('alumnos')}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          ← Volver
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {mensajeExito && (
          <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg font-medium text-sm">
            {mensajeExito}
          </div>
        )}

        {erroresCampos.length > 0 && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium">
            <p className="font-bold mb-1">Por favor corrige los siguientes datos:</p>
            <ul className="list-disc pl-5 space-y-1">
              {erroresCampos.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">RUT</label>
          <input 
            type="text" 
            placeholder="Ej: 12345678-9" 
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
              tieneError('rut') 
                ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' 
                : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
            }`}
            value={datos.rut} 
            onChange={e => setDatos({...datos, rut: e.target.value})} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
          <input 
            type="text" 
            placeholder="Ej: Matias" 
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
              tieneError('nombre') 
                ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' 
                : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
            }`}
            value={datos.nombre} 
            onChange={e => setDatos({...datos, nombre: e.target.value})} 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Apellido</label>
          <input 
            type="text" 
            placeholder="Ej: Perez"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
              tieneError('apellido') 
                ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' 
                : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
            }`}
            value={datos.apellido} 
            onChange={e => setDatos({...datos, apellido: e.target.value})} 
            required 
          />
          <p className="text-xs text-slate-400 mt-1">El correo institucional se generará automáticamente.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Licencia</label>
            <select 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white" 
              value={datos.licencia} 
              onChange={e => setDatos({...datos, licencia: e.target.value})}
            >
              <option value="Clase B">Clase B (Auto)</option>
              <option value="Clase C">Clase C (Moto)</option>
              <option value="Clase A2">Clase A2 (Profesional)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sede Asignada</label>
            <select 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white" 
              value={datos.sede} 
              onChange={e => setDatos({...datos, sede: e.target.value})}
            >
              <option value="Sede Concepcion">Sede Concepcion</option>
              <option value="Sede San Pedro">Sede San Pedro</option>
              <option value="Sede Penco">Sede Penco</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Plan contratado (Clases)</label>
            <input 
              type="number" 
              min="1"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
                tieneError('clases') || tieneError('plan')
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' 
                  : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
              }`}
              value={datos.total_clases} 
              onChange={e => setDatos({...datos, total_clases: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="pt-4 border-t mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => cambiarVista('alumnos')}
            className="px-5 py-2.5 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={cargando}
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors
              ${cargando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {cargando ? 'Guardando...' : 'Confirmar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarAlumno;