import React, { useState } from 'react';
import Sidebar from './components/Sidebar';

import AgendaClases from './pages/AgendaClases';

function App() {
  const [vistaActual, setVistaActual] = useState('dashboard'); // donde dice 'dashboard' es para cambiar la vista por defecto, si quieres que inicie en agenda, pon 'agenda' y así sucesivamente con las otras vistas que quieras agregar.

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar cambiarVista={setVistaActual} vistaActual={vistaActual} />

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <span className="font-medium text-slate-600">Portal de Administración</span>
          <button className="text-sm text-slate-500 hover:text-red-500 underline">
            Cerrar Sesión
          </button>
        </header>

        <div className="flex-1 p-6">
          {vistaActual === 'agenda' && <AgendaClases />}
          {vistaActual === 'alumnos' && (
            <div className="p-8 text-xl bg-white rounded-2xl shadow-sm">
              Vista de alumnos en construcción...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;