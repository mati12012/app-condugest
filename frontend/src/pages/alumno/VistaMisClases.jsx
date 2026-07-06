import { useState } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { apiFetch } from "../../utils/apiFetch";

function obtenerClaseEstado(estado) {
  if (estado === "Realizada") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (estado === "Cancelada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

function TablaClases({
  datos,
  esHistorial,
  esTeorica,
  procesando,
  manejarCancelacion,
}) {
  const columnas = esHistorial ? 5 : 4;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <th className="px-4 py-3">Fecha y Hora</th>
            <th className="px-4 py-3">Profesor</th>
            <th className="px-4 py-3">{esTeorica ? "Tema / Módulo" : "Vehículo"}</th>
            <th className="px-4 py-3">Estado</th>
            {esHistorial && <th className="px-4 py-3">Observación</th>}
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan={columnas} className="px-4 py-8 text-center text-slate-500">
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            datos.map((clase) => (
              <tr key={clase.id_clase_practica || clase.id_clase_teorica} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  {formatearFechaVisual(clase.fecha)} ({String(clase.hora_inicio).slice(0, 5)})
                </td>
                <td className="px-4 py-3">{clase.profesor_nombre} {clase.profesor_apellido}</td>
                <td className="px-4 py-3">
                  {esTeorica
                    ? clase.tema || "Teoría General"
                    : `${clase.vehiculo_marca || ""} ${clase.vehiculo_modelo || ""}`.trim() || "Sin vehículo"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${obtenerClaseEstado(clase.estado)}`}>
                      {clase.estado}
                    </span>
                    {!esHistorial && !esTeorica && clase.estado === "Programada" && (
                      <button
                        onClick={() => manejarCancelacion(clase.id_clase_practica)}
                        disabled={procesando}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 font-semibold transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
                {esHistorial && (
                  <td className="px-4 py-3 text-slate-600">
                    {clase.observacion || (clase.estado === "Cancelada" ? "Clase cancelada." : "Sin observaciones.")}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function VistaMisClases({ clasesPracticas, clasesTeoricas, recargarDatos }) {
  const [procesando, setProcesando] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState("practicas");

  const proximasPracticas = clasesPracticas.filter(
    (clase) => clase.estado === "Programada"
  );
  const historialPracticas = clasesPracticas.filter((clase) =>
    ["Realizada", "Cancelada"].includes(clase.estado)
  );

  const proximasTeoricas = clasesTeoricas.filter(
    (clase) => clase.estado === "Programada"
  );
  const historialTeoricas = clasesTeoricas.filter((clase) =>
    ["Realizada", "Cancelada"].includes(clase.estado)
  );

  const manejarCancelacion = async (idClase) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta clase? Esta acción no se puede deshacer.")) return;

    try {
      setProcesando(true);
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/cancelar-clase/${idClase}`, {
        method: "PUT"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al cancelar");
      }

      alert("Clase cancelada con éxito");
      recargarDatos();
    } catch (error) {
      alert(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const mostrandoPracticas = pestanaActiva === "practicas";

  return (
    <section className="space-y-6">
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setPestanaActiva("practicas")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            mostrandoPracticas
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Clases Prácticas
        </button>
        <button
          onClick={() => setPestanaActiva("teoricas")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            pestanaActiva === "teoricas"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Clases Teóricas
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Próximas clases</h2>
        <TablaClases
          datos={mostrandoPracticas ? proximasPracticas : proximasTeoricas}
          esHistorial={false}
          esTeorica={!mostrandoPracticas}
          procesando={procesando}
          manejarCancelacion={manejarCancelacion}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Historial de clases</h2>
        <TablaClases
          datos={mostrandoPracticas ? historialPracticas : historialTeoricas}
          esHistorial
          esTeorica={!mostrandoPracticas}
          procesando={procesando}
          manejarCancelacion={manejarCancelacion}
        />
      </div>
    </section>
  );
}

export default VistaMisClases;
