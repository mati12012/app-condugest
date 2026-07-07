import { useState } from "react";

function obtenerClaseEstadoRevision(estado) {
  if (estado === "Vigente") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (estado === "Por vencer") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (estado === "Vencida") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
}

function obtenerClaseConfianzaRevision(confianza) {
  if (confianza === "Alta") return "bg-emerald-100 text-emerald-700";
  if (confianza === "Media") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function formatearFechaRevision(fecha) {
  if (!fecha) return "No detectada";
  const texto = String(fecha).split("T")[0];
  const partes = texto.split("-");

  if (partes.length !== 3) return texto;

  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

function obtenerRevision(datos) {
  if (!datos) return null;

  return {
    patente_detectada_revision: datos.patente_detectada_revision,
    fecha_vencimiento_revision_tecnica:
      datos.fecha_vencimiento_revision_tecnica,
    estado_revision_tecnica:
      datos.estado_revision_tecnica || "Requiere revisión manual",
    confianza_revision_tecnica: datos.confianza_revision_tecnica || "Baja",
    observacion_revision_tecnica: datos.observacion_revision_tecnica,
  };
}

function RevisionTecnicaAsistente({
  revision,
  onConfirmarFecha,
  guardando = false,
  mostrarFormulario = true,
}) {
  const datos = obtenerRevision(revision);
  const [fechaManual, setFechaManual] = useState(
    datos?.fecha_vencimiento_revision_tecnica
      ? String(datos.fecha_vencimiento_revision_tecnica).split("T")[0]
      : ""
  );

  if (!datos) return null;

  const estado = datos.estado_revision_tecnica || "Requiere revisión manual";
  const confianza = datos.confianza_revision_tecnica || "Baja";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Asistente de revision tecnica
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Sugerencia automatica. Debe ser confirmada o corregida por secretaria.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseEstadoRevision(
            estado
          )}`}
        >
          {estado}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Patente detectada
          </p>
          <p className="mt-1 font-bold text-slate-800">
            {datos.patente_detectada_revision || "No detectada"}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Fecha detectada
          </p>
          <p className="mt-1 font-bold text-slate-800">
            {formatearFechaRevision(datos.fecha_vencimiento_revision_tecnica)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Confianza
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${obtenerClaseConfianzaRevision(
              confianza
            )}`}
          >
            {confianza}
          </span>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Estado sugerido
          </p>
          <p className="mt-1 font-bold text-slate-800">{estado}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-500 uppercase">
          Observacion del analisis
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {datos.observacion_revision_tecnica ||
            "Sin observaciones del analisis."}
        </p>
      </div>

      {mostrarFormulario && onConfirmarFecha && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <label className="block">
            <span className="text-sm font-semibold text-blue-900">
              Confirmar o corregir fecha de vencimiento
            </span>
            <input
              type="date"
              value={fechaManual}
              onChange={(evento) => setFechaManual(evento.target.value)}
              className="mt-2 w-full md:w-64 rounded-lg border border-blue-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <button
            type="button"
            disabled={!fechaManual || guardando}
            onClick={() => onConfirmarFecha(fechaManual)}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : "Confirmar fecha"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RevisionTecnicaAsistente;
