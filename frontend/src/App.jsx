import React, { useState } from 'react';
import Login from './components/Login';
import RegistrarAlumno from './components/RegistrarAlumno';

function App() {
  const [usuario, setUsuario] = useState(null);

  if (!usuario) return <Login onLogin={setUsuario} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-800 text-white p-4 flex justify-between">
        <span className="font-bold">ConduGest - Portal {usuario.rol}</span>
        <button onClick={() => setUsuario(null)} className="underline">Cerrar Sesión</button>
      </nav>
      
      {usuario.rol === 'secretaria' && <RegistrarAlumno />}
      {usuario.rol === 'alumno' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold">Bienvenido al Portal Alumno</h1>
          <p className="mt-4">Iniciaste sesion con: {usuario.correo}</p>
          <p className="text-gray-500 text-sm mt-2">(Modulo de progreso aun en construccion...)</p>
        </div>
      )}
    </div>
  );
}
export default App;