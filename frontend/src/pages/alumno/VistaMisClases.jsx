import { useState } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { apiFetch } from "../../utils/apiFetch";

function VistaMisClases({ clasesPracticas, clasesTeoricas, recargarDatos }) {
  const [procesando, setProcesando] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState("practicas"); 

  const proximasPracticas = clasesPracticas.filter(c => c.estado !== 'Realizada');
  const historialPracticas = clasesPracticas.filter(c => c.estado === 'Realizada');

  const proximasTeoricas = clasesTeoricas.filter(c => c.estado !== 'Realizada');
  const historialTeoricas = clasesTeoricas.filter(c => c.estado === 'Realizada');

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

  const Tabla = ({ datos, mostrarObservacion, esTeorica }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <th className="px-4 py-3">Fecha y Hora</th>
            <th className="px-4 py-3">Profesor</th>
            {esTeorica ? (
              <th className="px-4 py-3">Tema / Módulo</th>
            ) : (
              !mostrarObservacion && <th className="px-4 py-3">Vehículo</th>
            )}
            <th className="px-4 py-3">{mostrarObservacion ? "Observación" : "Estado / Acción"}</th>
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            datos.map(c => (
              <tr key={c.id_clase_practica || c.id_clase_teorica} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  {formatearFechaVisual(c.fecha)} ({String(c.hora_inicio).slice(0, 5)})
                </td>
                <td className="px-4 py-3">{c.profesor_nombre} {c.profesor_apellido}</td>
                
                {esTeorica ? (
                  <td className="px-4 py-3 font-medium text-slate-700">{c.tema || "Teoría General"}</td>
                ) : (
                  !mostrarObservacion && <td className="px-4 py-3">{c.vehiculo_marca} {c.vehiculo_modelo}</td>
                )}
                
                {mostrarObservacion ? (
                  <td className="px-4 py-3">{c.observacion || "Sin observaciones."}</td>
                ) : (
                  <td className="px-4 py-3 flex items-center gap-3">
                    <span className={`font-bold ${c.estado === 'Cancelada' ? 'text-red-600' : 'text-blue-600'}`}>
                      {c.estado}
                    </span>
                    {!esTeorica && c.estado === "Programada" && (
                      <button 
                        onClick={() => manejarCancelacion(c.id_clase_practica)}
                        disabled={procesando}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 font-semibold transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Navegación de Pestañas */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setPestanaActiva("practicas")}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            pestanaActiva === "practicas" 
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

      {/* Contenido Dinámico según Pestaña */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Agenda Próximas Clases</h2>
        <Tabla 
          datos={pestanaActiva === "practicas" ? proximasPracticas : proximasTeoricas} 
          mostrarObservacion={false} 
          esTeorica={pestanaActiva === "teoricas"}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Historial y Observaciones</h2>
        <Tabla 
          datos={pestanaActiva === "practicas" ? historialPracticas : historialTeoricas} 
          mostrarObservacion={true} 
          esTeorica={pestanaActiva === "teoricas"}
        />
      </div>
    </section>
  );
}

export default VistaMisClases;