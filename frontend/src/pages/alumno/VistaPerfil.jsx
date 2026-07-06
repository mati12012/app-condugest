import { obtenerCorreoUsuario, obtenerNombreUsuario } from "../../utils/usuarioSesion";

function formatearPesos(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function obtenerEstiloEstadoPago(estadoPago) {
  if (estadoPago === "Pagado") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (estadoPago === "Parcial") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  return "border-red-100 bg-red-50 text-red-700";
}

function VistaPerfil({ perfil, usuario }) {
  const nombreUsuario = obtenerNombreUsuario(usuario, "Alumno");
  const correoUsuario = obtenerCorreoUsuario(usuario);
  const saldoPendiente = Number(perfil?.saldo_pendiente || 0);
  const estadoPago = perfil?.estado_pago || "Pendiente";
  const estadoMatricula = perfil?.estado_matricula || "Sin matrícula activa";

  return (
    <section className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Datos del Alumno</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
            <dt className="text-sm text-slate-500">Nombre</dt>
            <dd className="font-semibold text-slate-900 mt-1">{nombreUsuario}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
            <dt className="text-sm text-slate-500">Correo Electrónico</dt>
            <dd className="font-semibold text-slate-900 mt-1 break-all">{correoUsuario}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
            <dt className="text-sm text-slate-500">Licencia en curso</dt>
            <dd className="font-semibold text-slate-900 mt-1">{perfil?.licencia || "N/A"}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50 md:col-span-2">
            <dt className="text-sm text-slate-500">Sede</dt>
            <dd className="font-semibold text-slate-900 mt-1">{perfil?.sede || "N/A"}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50 md:col-span-2">
            <dt className="text-sm text-slate-500">Plan</dt>
            <dd className="font-semibold text-slate-900 mt-1">
              {perfil?.nombre_plan || "Sin matrícula activa"}
              {perfil?.tipo_plan ? ` · ${perfil.tipo_plan}` : ""}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Estado de Matrícula y Pago</h2>

        {estadoMatricula === "Sin matrícula activa" && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            El alumno no tiene una matrícula activa.
          </div>
        )}

        {saldoPendiente > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            La matrícula mantiene saldo pendiente.
          </div>
        )}

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
            <dt className="text-sm text-slate-500">Estado de matrícula</dt>
            <dd className="font-bold text-lg mt-1 text-slate-900">
              {estadoMatricula}
            </dd>
          </div>
          <div className={`rounded-xl border p-4 ${obtenerEstiloEstadoPago(estadoPago)}`}>
            <dt className="text-sm font-medium opacity-80">Estado de Pago</dt>
            <dd className="font-bold text-lg mt-1">
              {estadoPago}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
            <dt className="text-sm text-slate-500">Valor total</dt>
            <dd className="font-bold text-slate-900 text-lg mt-1">
              {formatearPesos(perfil?.valor_total)}
            </dd>
          </div>
          <div className="rounded-xl border border-emerald-100 p-4 bg-emerald-50">
            <dt className="text-sm text-emerald-700 font-medium">Total pagado</dt>
            <dd className="font-bold text-emerald-800 text-lg mt-1">
              {formatearPesos(perfil?.total_pagado)}
            </dd>
          </div>
          <div className="rounded-xl border border-red-100 p-4 bg-red-50">
            <dt className="text-sm text-red-700 font-medium">Saldo Pendiente</dt>
            <dd className="font-bold text-red-800 text-lg mt-1">
              {formatearPesos(saldoPendiente)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default VistaPerfil;
