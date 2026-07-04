function PerfilProfesor({ usuario, cerrarSesion }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-2xl">
      <h2 className="text-xl font-bold text-slate-900">Datos del profesor</h2>

      <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">Correo</dt>
          <dd className="font-semibold text-slate-900 mt-1 break-all">
            {usuario?.correo || "Sin correo registrado"}
          </dd>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">Rol</dt>
          <dd className="font-semibold text-slate-900 mt-1">
            {usuario?.rol || "profesor"}
          </dd>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">ID profesor</dt>
          <dd className="font-semibold text-slate-900 mt-1">
            {usuario?.id_profesor || "No disponible"}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-6 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all"
      >
        Cerrar sesion
      </button>
    </section>
  );
}

export default PerfilProfesor;
