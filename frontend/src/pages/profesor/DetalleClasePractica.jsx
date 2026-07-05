import { useState } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { EstadoClase } from "./profesorPanel.components";
import { formatearHora, obtenerNombreAlumno, obtenerVehiculo } from "./profesorPanel.helpers";
import { apiFetch } from "../../utils/apiFetch";

function DetalleClasePractica({ claseId, clases, volver, cargarMisClases }) {
  const [procesando, setProcesando] = useState(false);

  const clase = clases.find((c) => c.id_clase_practica === claseId);

  if (!clase) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Clase no encontrada.
        <br />
        <button onClick={volver} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold">
          Volver a mis clases
        </button>
      </div>
    );
  }

  const manejarAsistencia = async (estadoAsistencia) => {
    if (procesando) return;
    setProcesando(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-practica/${clase.id_clase_practica}/asistencia`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistencia: estadoAsistencia })
      });
      
      if (res.ok) {
        await cargarMisClases(); 
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || 'No se pudo guardar la asistencia'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al guardar asistencia.");
    } finally {
      setProcesando(false);
    }
  };

  const asistenciaActual = clase.asistencia || 'Pendiente';
  const yaRegistrada = asistenciaActual !== 'Pendiente';

  return (
    <section className="space-y-6 max-w-4xl">
      {/* Cabecera y Botón Volver */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={volver} className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-2 flex items-center gap-1">
            ← Volver a la lista
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Detalle de Clase Práctica</h2>
          <p className="text-slate-500 mt-1">Gestión de asistencia y registro del alumno.</p>
        </div>
        <EstadoClase estado={clase.estado} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Información de la Clase */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Datos de la Sesión</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Alumno</p>
              <p className="font-bold text-slate-800 text-lg">{obtenerNombreAlumno(clase) || "Sin alumno"}</p>
              <p className="text-sm text-slate-600">RUT: {clase.alumno_rut}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fecha y Hora</p>
              <p className="font-semibold text-slate-800">{formatearFechaVisual(clase.fecha)}</p>
              <p className="text-sm text-slate-600">{formatearHora(clase.hora_inicio)} a {formatearHora(clase.hora_fin)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Vehículo y Sede</p>
              <p className="font-semibold text-slate-800">{obtenerVehiculo(clase)}</p>
              <p className="text-sm text-slate-600">{clase.sede}</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Gestión de Asistencia */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Registro de Asistencia</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            {yaRegistrada ? (
              <div className="text-center space-y-4">
                <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg ${asistenciaActual === 'Presente' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  El alumno quedó {asistenciaActual}
                </div>
                <p className="text-sm text-slate-500">
                  La asistencia ya fue registrada. Si hubo un error, puedes deshacer el registro.
                </p>
                <button 
                  disabled={procesando} 
                  onClick={() => manejarAsistencia('Pendiente')} 
                  className="text-sm font-bold text-slate-400 hover:text-slate-700 underline mt-2"
                >
                  {procesando ? 'Procesando...' : 'Deshacer registro de asistencia'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center mb-6">
                  ¿El alumno se presentó a su clase práctica programada?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={procesando} 
                    onClick={() => manejarAsistencia('Presente')} 
                    className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Sí, Presente
                  </button>
                  <button 
                    disabled={procesando} 
                    onClick={() => manejarAsistencia('Ausente')} 
                    className="w-full py-3 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold hover:bg-red-100 transition-colors"
                  >
                    No, Ausente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenedor preparado para futuras evaluaciones */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-6 text-center">
         <p className="text-slate-500 font-medium">Módulo de Evaluaciones (Próximamente)</p>
         <p className="text-sm text-slate-400 mt-1">Una vez marcada la asistencia como "Presente", aquí podrás llenar la rúbrica de evaluación del alumno.</p>
      </div>
    </section>
  );
}

export default DetalleClasePractica;