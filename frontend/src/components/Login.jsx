import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState('');

  const manejarIngreso = (e) => {
    e.preventDefault();
    if (correo.includes('secre')) {
      onLogin({ rol: 'secretaria' });
    } else {
      // Si es alumno, le pasamos el correo para buscarlo en la base de datos
      onLogin({ rol: 'alumno', correo });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={manejarIngreso} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">ConduGest Login</h1>
        <input 
          type="email" 
          placeholder="Correo (ej: juan@alumno.cl)" 
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">
          Ingresar
        </button>
      </form>
    </div>
  );
};
export default Login;