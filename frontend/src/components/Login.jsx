import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    // acceso rapido para la secretaria
    if (correo.includes('secre')) {
      setTimeout(() => {
        onLogin({ rol: 'secretaria', correo });
      }, 500);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/alumnos/correo/${correo}`);
      
      if (response.ok) {
        const alumnoInfo = await response.json();
        onLogin({ rol: 'alumno', ...alumnoInfo });
      } else {
        setError('Datos incorrectos o correo no existe');
      }
    } catch (err) {
      console.error(err);
      setError('Fallo la conexion con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl flex w-full max-w-4xl overflow-hidden">
        
        {/* seccion visual */}
        <div className="w-1/2 bg-blue-800 p-12 text-white flex flex-col justify-center hidden md:flex">
          <h1 className="text-4xl font-extrabold mb-4">ConduGest</h1>
          <p className="text-blue-200 text-lg">
            Sistema de gestion para escuelas de conduccion. 
            Revisa tu progreso y agenda tus clases.
          </p>
        </div>

        {/* formulario de ingreso */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Iniciar Sesion</h2>
            <p className="text-slate-500 mt-1">Ingresa tus datos para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electronico</label>
              <input 
                type="email" 
                placeholder="ejemplo@alumno.cl" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contrasena</label>
              <input 
                type="password" 
                placeholder="********" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full py-2.5 rounded-lg font-bold text-white transition-colors mt-4
                ${cargando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
            >
              {cargando ? 'Cargando...' : 'Entrar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;