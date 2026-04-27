import React from 'react';

const Sidebar = ({ cambiarVista }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      
      {/* cabecera con el logo */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-blue-400">ConduGest</h2>
        <p className="text-sm text-slate-400">Sistema de gestion</p>
      </div>

      {/* menu de navegacion principal */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        <button 
          onClick={() => cambiarVista('dashboard')} 
          className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors"
        >
          Panel Principal
        </button>
        <button 
          onClick={() => cambiarVista('alumnos')} 
          className="text-left px-4 py-2 bg-slate-800 rounded text-blue-300 font-medium"
        >
          Alumnos
        </button>
        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">Clases teoricas</button>
        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">Clases practicas</button>
        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">Profesores</button>
        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">Vehiculos</button>
        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">Salas psicotecnicas</button>
        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">Reprogramacion</button>
        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">Configuracion</button>
      </nav>

      {/* pie de la sidebar con estado del usuario */}
      <div className="p-6 border-t border-slate-800">
        <strong className="block text-slate-200">Secretaria Central</strong>
        <p className="text-sm text-green-400 flex items-center gap-2 mt-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span> En linea
        </p>
      </div>
      
    </aside>
  );
};

export default Sidebar;