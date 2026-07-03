import React from "react";

function PanelProfesor({ usuario, cerrarSesion }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Panel Profesor
        </h1>

        <p className="text-slate-500 mt-3">
          Esta vista está reservada para profesores.
        </p>

        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-700">
          Sesión iniciada como: <strong>{usuario?.correo}</strong>
        </div>

        <p className="text-sm text-slate-400 mt-4">
          Próximamente aquí se mostrarán clases asignadas, agenda del profesor y datos personales.
        </p>

        <button
          type="button"
          onClick={cerrarSesion}
          className="mt-6 px-5 py-2.5 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-900 active:scale-95 transition-all"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default PanelProfesor;