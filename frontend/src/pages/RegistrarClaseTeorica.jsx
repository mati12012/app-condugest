import React, { useState, useEffect } from 'react';

const RegistrarClaseTeorica = ({ cambiarVista }) => {
  const [datos, setDatos] = useState({ 
    tema: '',
    fecha: '', 
    hora_inicio: '',
    hora_fin: '', 
    id_profesor: '',
    estado: 'Programada'
  });
  
  const [profesores, setProfesores] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [erroresCampos, setErroresCampos] = useState([]);

  useEffect(() => {
    obtenerProfesores();
  }, []);

  const obtenerProfesores = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/profesores`);
      const respuestaServidor = await response.json();
      if (response.ok) {
        setProfesores(respuestaServidor.data);
      }
    } catch (error) {
      console.error("No se pudieron cargar los profesores", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErroresCampos([]);
    setCargando(true);

    if (!datos.id_profesor) {
      setErroresCampos(['Debe seleccionar un profesor para la clase.']);
      setCargando(false);
      return;
    }

    const datosFinales = {
      ...datos,
      id_profesor: Number(datos.id_profesor)
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      const respuestaServidor = await response.json();
      
      if (response.ok) {
        setMensajeExito("Clase teórica programada exitosamente.");
        setErroresCampos([]);
        setDatos({ tema: '', fecha: '', hora_inicio: '', hora_fin: '', id_profesor: '', estado: 'Programada' });
      } else {
        if (respuestaServidor.errorDetails) {
          const erroresArray = Array.isArray(respuestaServidor.errorDetails) 
            ? respuestaServidor.errorDetails 
            : [respuestaServidor.errorDetails];
          setErroresCampos(erroresArray);
        } else {
          setErroresCampos([respuestaServidor.message || 'Error al guardar la clase.']);
        }
      }
    } catch (error) {
      console.error(error);
      setErroresCampos(['Error: Sin conexión con el servidor.']);
    } finally {
      setCargando(false);
    }
  };

  const tieneError = (campo) => erroresCampos.some(err => err.toLowerCase().includes(campo));

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Programar Clase Teórica</h2>
          <p className="text-slate-500 mt-1">Ingrese los detalles para agendar una nueva clase.</p>
        </div>
        <button
          type="button"
          onClick={() => cambiarVista('clasesTeoricas')}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          Volver
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tema de la clase</label>
          <input 
            type="text" 
            placeholder="Ej: Leyes del tránsito y señaléticas" 
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
              tieneError('tema') ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
            }`}
            value={datos.tema} 
            onChange={e => setDatos({...datos, tema: e.target.value})} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Profesor Asignado</label>
          <select 
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white transition-shadow ${
              tieneError('profesor') ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
            }`}
            value={datos.id_profesor} 
            onChange={e => setDatos({...datos, id_profesor: e.target.value})}
            required
          >
            <option value="">Seleccione un profesor...</option>
            {profesores.map(prof => (
              <option key={prof.id_profesor} value={prof.id_profesor}>
                {prof.nombre} {prof.apellido} - {prof.especialidad || 'Sin especialidad'}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha</label>
            <input 
              type="date" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
                tieneError('fecha') ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
              }`}
              value={datos.fecha} 
              onChange={e => setDatos({...datos, fecha: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Inicio</label>
            <input 
              type="time" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
                tieneError('inicio') ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
              }`}
              value={datos.hora_inicio} 
              onChange={e => setDatos({...datos, hora_inicio: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Fin</label>
            <input 
              type="time" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
                tieneError('fin') ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30' : 'border-slate-300 focus:ring-2 focus:ring-blue-600'
              }`}
              value={datos.hora_fin} 
              onChange={e => setDatos({...datos, hora_fin: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="pt-4 border-t mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => cambiarVista('clasesTeoricas')}
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
            {cargando ? 'Guardando...' : 'Programar Clase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarClaseTeorica;