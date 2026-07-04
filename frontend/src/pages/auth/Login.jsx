import React, { useState } from 'react';

const Login = ({ onLogin, onVerPlanes }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          password,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesión');
      }

      const usuario = data.data.usuario;
      const token = data.data.token;

      onLogin(usuario, token);
    } catch (error) {
      setError(error.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl flex w-full max-w-4xl overflow-hidden">

        {/* sección visual de la marca */}
        <div className="w-1/2 bg-blue-800 p-12 text-white flex-col justify-center hidden md:flex">
          <h1 className="text-4xl font-extrabold mb-4">
            ConduGest
          </h1>

          <p className="text-blue-200 text-lg">
            Sistema de gestión para escuelas de conducción.
            Ingresa con tu correo institucional.
          </p>

          <div className="mt-8 space-y-3 text-sm text-blue-100">
            <p>
              Secretaría: <span className="font-semibold">@admin.condugest.cl</span>
            </p>

            <p>
              Profesores: <span className="font-semibold">@condugest.cl</span>
            </p>

            <p>
              Alumnos: <span className="font-semibold">@alumnos.condugest.cl</span>
            </p>
          </div>
        </div>

        {/* formulario de ingreso */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              Iniciar sesión
            </h2>

            <p className="text-slate-500 mt-1">
              Ingresa tus datos para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-sm rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="secretaria@admin.condugest.cl"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>

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
              {cargando ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            onClick={onVerPlanes}
            className="w-full mt-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
          >
            Ver planes disponibles
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
