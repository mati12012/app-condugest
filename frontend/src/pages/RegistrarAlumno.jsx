import React, { useState } from 'react';

const RegistrarAlumno = () => {
  const [datos, setDatos] = useState({ 
    rut: '',
    nombre: '', 
    apellido: '',
    licencia: 'Clase B', 
    sede: 'Sede Concepcion' ,
    total_clases: 10
  });
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setCargando(true);

    if (datos.rut.trim() === '') {
      setMensaje('Error: El RUT es obligatorio');
      setCargando(false);
      return;
    }

    if (datos.nombre.trim() === '') {
      setMensaje('Error: El nombre es obligatorio');
      setCargando(false);
      return;
    }

    if (datos.apellido.trim() === '') {
      setMensaje('Error: El apellido es obligatorio');
      setCargando(false);
      return;
    }

    const datosFinales = {
      ...datos,
      total_clases: Number(datos.total_clases)
    };

    try {
      console.log("La URL es:", import.meta.env.VITE_BASE_URL);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/alumnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      const respuestaServidor = await response.json();
      
      if (response.ok) {
        const correoCreado = respuestaServidor.data.correo;
        setMensaje(`Exito: alumno guardado. Su correo institucional es ${correoCreado}`);
        setDatos({ rut: '', nombre: '', apellido: '', licencia: 'Clase B', sede: 'Sede Concepcion', total_clases: 10 });
      } else {
        setMensaje(`Error: ${respuestaServidor.message} ${respuestaServidor.errorDetails ? '- Revisa los datos ingresados' : ''}`);
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
        <h2 className="text-2xl font-bold text-slate-800">Registrar Nuevo Alumno</h2>
        <p className="text-slate-500">Ingrese los datos para ingresar a un nuevo estudiante en el sistema.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {mensaje && (
          <div className={`p-4 rounded-lg font-medium text-sm ${mensaje.includes('error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {mensaje}
          </div>
        )}

        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">RUT</label>
            <input 
              type="text" 
              placeholder="Ej: 12345678-9" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" 
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
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" 
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
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" 
            value={datos.apellido} 
            onChange={e => setDatos({...datos, apellido: e.target.value})} 
            required 
          />
          <p className="text-xs text-slate-400 mt-1">El correo institucional se generara automaticamente.</p>
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Plan contratado (Clases)</label>
            <input 
              type="number" 
              min="1"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" 
              value={datos.total_clases} 
              onChange={e => setDatos({...datos, total_clases: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="pt-4 border-t mt-6 flex justify-end">
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

export default RegistrarAlumno;