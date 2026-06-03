import React, { useState, useEffect } from 'react';

const EditarClaseTeorica = ({ idClase, cambiarVista }) => {
  const [datos, setDatos] = useState(null);
  const [profesores, setProfesores] = useState([]);
  
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(true);
  const [erroresCampos, setErroresCampos] = useState([]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [idClase]);

  const cargarDatosIniciales = async () => {
    try {
      const resProfesores = await fetch(`${import.meta.env.VITE_BASE_URL}/profesores`);
      const dataProfesores = await resProfesores.json();
      if (resProfesores.ok) setProfesores(dataProfesores.data);

      const resClase = await fetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${idClase}`);
      const dataClase = await resClase.json();

      if (resClase.ok) {
        const c = dataClase.data;
        setDatos({
          tema: c.tema,
          fecha: c.fecha.split('T')[0],
          hora_inicio: String(c.hora_inicio).slice(0, 5),
          hora_fin: String(c.hora_fin).slice(0, 5),
          sede: c.sede,
          estado: c.estado,
          id_profesor: c.profesor ? c.profesor.id_profesor : ''
        });
      }
    } catch (error) {
      console.error(error);
      setErroresCampos(["Error al cargar los datos."]);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErroresCampos([]);
    setCargando(true);

    const datosFinales = {
      ...datos,
      id_profesor: Number(datos.id_profesor)
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas/${idClase}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      const respuestaServidor = await response.json();
      
      if (response.ok) {
        setMensajeExito("Clase teórica actualizada exitosamente.");
        setTimeout(() => cambiarVista('clasesTeoricas'), 1500); 
      } else {
        if (respuestaServidor.errorDetails) {
          const erroresArray = Array.isArray(respuestaServidor.errorDetails) 
            ? respuestaServidor.errorDetails 
            : [respuestaServidor.errorDetails];
          setErroresCampos(erroresArray);
        } else {
          setErroresCampos([respuestaServidor.message || 'Error al actualizar la clase.']);
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

  if (!datos) return <div className="p-8 text-center text-slate-500">Cargando formulario...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Editar Clase Teórica</h2>
          <p className="text-slate-500 mt-1">Modifique los detalles de la sesión.</p>
        </div>
        <button
          type="button"
          onClick={() => cambiarVista('clasesTeoricas')}
          className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
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
            <p className="font-bold mb-1">Por favor corrige los siguientes errores:</p>
            <ul className="list-disc pl-5 space-y-1">
              {erroresCampos.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tema de la clase</label>
          <input 
            type="text" 
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${tieneError('tema') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
            value={datos.tema} 
            onChange={e => setDatos({...datos, tema: e.target.value})} 
            required 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sede o Modalidad</label>
            <select 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
              value={datos.sede} 
              onChange={e => setDatos({...datos, sede: e.target.value})}
            >
              <option value="Sede Concepcion">Presencial - Sede Concepción</option>
              <option value="Sede San Pedro">Presencial - Sede San Pedro</option>
              <option value="Sede Penco">Presencial - Sede Penco</option>
              <option value="Online">Modalidad Online (Zoom)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Profesor Asignado</label>
            <select 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
              value={datos.id_profesor} 
              onChange={e => setDatos({...datos, id_profesor: e.target.value})}
              required
            >
              <option value="">Seleccione un profesor...</option>
              {profesores.map(prof => (
                <option key={prof.id_profesor} value={prof.id_profesor}>
                  {prof.nombre} {prof.apellido} {!prof.estado ? '(Inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha</label>
            <input 
              type="date" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${tieneError('fecha') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              value={datos.fecha} 
              onChange={e => setDatos({...datos, fecha: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Inicio</label>
            <input 
              type="time" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${tieneError('inicio') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              value={datos.hora_inicio} 
              onChange={e => setDatos({...datos, hora_inicio: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Fin</label>
            <input 
              type="time" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${tieneError('fin') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
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
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${cargando ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {cargando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarClaseTeorica;