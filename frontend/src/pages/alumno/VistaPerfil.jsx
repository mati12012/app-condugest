function VistaPerfil({ perfil, usuario }) {
  return (
    <section className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Datos del Alumno</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
            <dt className="text-sm text-slate-500">Correo Electrónico</dt>
            <dd className="font-semibold text-slate-900 mt-1 break-all">{usuario?.correo}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
            <dt className="text-sm text-slate-500">Licencia en curso</dt>
            <dd className="font-semibold text-slate-900 mt-1">{perfil?.licencia || "N/A"}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50 md:col-span-2">
            <dt className="text-sm text-slate-500">Sede</dt>
            <dd className="font-semibold text-slate-900 mt-1">{perfil?.sede || "N/A"}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Estado Financiero</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-100 p-4 bg-blue-50">
            <dt className="text-sm text-blue-700 font-medium">Estado de Pago</dt>
            <dd className={`font-bold text-lg mt-1 ${perfil?.estado_pago === 'Pagado' ? 'text-green-600' : 'text-slate-900'}`}>
              {perfil?.estado_pago || "N/A"}
            </dd>
          </div>
          <div className="rounded-xl border border-red-100 p-4 bg-red-50">
            <dt className="text-sm text-red-700 font-medium">Saldo Pendiente</dt>
            <dd className="font-bold text-slate-900 text-lg mt-1">
              ${perfil?.saldo_pendiente?.toLocaleString('es-CL') || 0}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default VistaPerfil;