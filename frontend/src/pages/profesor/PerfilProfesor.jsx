function PerfilProfesor({ usuario, cerrarSesion }) {
  const datosFaltantes = [
    !usuario?.correo && "correo",
    !usuario?.rol && "rol",
    !usuario?.id_profesor && "ID de profesor",
  ].filter(Boolean);

  const tieneDatosFaltantes = datosFaltantes.length > 0;

  return (
    <section className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <span className="inline-flex px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
              Sesion activa
            </span>

            <h2 className="text-2xl font-bold text-slate-900 mt-4">
              Datos personales del profesor
            </h2>

            <p className="text-slate-500 mt-2">
              Informacion basica asociada a tu cuenta de acceso en ConduGest.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all"
          >
            Cerrar sesion
          </button>
        </div>
      </div>

      {tieneDatosFaltantes && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-5">
          Algunos datos del perfil no estan disponibles todavia: {datosFaltantes.join(", ")}.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">Correo</p>
          <p className="font-bold text-slate-900 mt-2 break-all">
            {usuario?.correo || "Sin correo registrado"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">Rol</p>
          <p className="font-bold text-slate-900 mt-2">
            {usuario?.rol || "No disponible"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">ID profesor</p>
          <p className="font-bold text-slate-900 mt-2">
            {usuario?.id_profesor || "No disponible"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-500">Estado de sesion</p>
          <p className="font-bold text-green-700 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Activa
          </p>
        </div>
      </div>
    </section>
  );
}

export default PerfilProfesor;
