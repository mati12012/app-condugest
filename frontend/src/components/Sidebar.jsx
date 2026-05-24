import React from 'react';

const Sidebar = ({ cambiarVista, vistaActual }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* cabecera con el logo */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-blue-400">ConduGest</h2>
        <p className="text-sm text-slate-400">Sistema de gestión</p>
      </div>

      {/* menu de navegacion principal */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        <button
          onClick={() => cambiarVista('dashboard')}
          className={`text-left px-4 py-2 rounded transition-colors ${vistaActual === 'dashboard'
              ? 'bg-slate-800 text-blue-300 font-medium'
              : 'hover:bg-slate-800'
            }`}
        >
          Panel Principal
        </button>

        <button
          onClick={() => cambiarVista('agenda')}
          className={`text-left px-4 py-2 rounded transition-colors ${vistaActual === 'agenda'
              ? 'bg-slate-800 text-blue-300 font-medium'
              : 'hover:bg-slate-800'
            }`}
        >
          Agenda
        </button>

        <button
          onClick={() => cambiarVista('alumnos')}
          className={`text-left px-4 py-2 rounded transition-colors ${vistaActual === 'alumnos'
              ? 'bg-slate-800 text-blue-300 font-medium'
              : 'hover:bg-slate-800'
            }`}
        >
          Alumnos
        </button>

        <button
          onClick={() => cambiarVista("reservasSalas")}
          className={`text-left px-4 py-2 rounded transition-colors ${vistaActual === 'reservasSalas'
              ? 'bg-slate-800 text-blue-300 font-medium'
              : 'hover:bg-slate-800'
            }`}
        >
          Reservas de salas
        </button>

        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">
          Clases teóricas
        </button>

        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">
          Clases prácticas
        </button>

        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">
          Profesores
        </button>

        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">
          Vehículos
        </button>

        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">
          Salas psicotécnicas
        </button>

        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">
          Reprogramaciones
        </button>

        <button className="text-left px-4 py-2 hover:bg-slate-800 rounded transition-colors">
          Configuración
        </button>
      </nav>

      {/* pie de la sidebar con estado del usuario */}
      <div className="p-6 border-t border-slate-800">
        <strong className="block text-slate-200">Secretaría Central</strong>
        <p className="text-sm text-green-400 flex items-center gap-2 mt-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span> En línea
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;