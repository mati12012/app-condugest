import React, { useState } from 'react';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import RegistrarAlumno from './pages/RegistrarAlumno';
import VistaAlumnos from './pages/VistaAlumnos';

function App() {
  // por ahora esta asi para que pase directo
  const [usuario, setUsuario] = useState(null);
  
  // para saber que pagina mostrar al lado derecho
  const [vistaActual, setVistaActual] = useState('alumnos');

  if (!usuario) return <Login onLogin={setUsuario} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* barra lateral izquierda */}
      <Sidebar cambiarVista={setVistaActual} />

      {/* contenido principal derecho */}
      <main className="flex-1 flex flex-col">
        
        {/* barra superior pequeña */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <span className="font-medium text-slate-600">Portal de Administracion</span>
          <button onClick={() => setUsuario(null)} className="text-sm text-slate-500 hover:text-red-500 underline">
            Cerrar Sesion
          </button>
        </header>

        {/* aqui cambia la pantalla segun la vista actual */}
        <div className="flex-1 p-6">
          {vistaActual === 'dashboard' && <div className="p-8 text-xl">Bienvenido al dashboard principal...</div>}
          {vistaActual === 'alumnos' && <VistaAlumnos cambiarVista={setVistaActual} />}
          {vistaActual === 'registrar' && <RegistrarAlumno />}
        </div>
        
      </main>
    </div>
  );
}

export default App;