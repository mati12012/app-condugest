import { useMemo } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";

function TarjetaResumen({ valor, etiqueta, color = "text-slate-900", extraInfo }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className={`text-4xl font-bold ${color}`}>{valor}</p>
      <p className="text-slate-500 mt-2">{etiqueta}</p>
      {extraInfo && <div className="mt-4">{extraInfo}</div>}
    </div>
  );
}

function VistaInicio({ perfil, clases, usuario }) {
  const porcentajeAvance = useMemo(() => {
    if (!perfil || !perfil.total_clases) return 0;
    return Math.round((perfil.clases_completadas / perfil.total_clases) * 100);
  }, [perfil]);

  const proximasClases = clases.filter(c => c.estado !== 'Realizada').slice(0, 3); 

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Portal del alumno</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">Bienvenido, {usuario?.correo}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <TarjetaResumen valor={perfil?.plan || "Sin Plan"} etiqueta="Plan Contratado" color="text-blue-700" />
        <TarjetaResumen valor={perfil?.clases_completadas || 0} etiqueta="Clases realizadas" color="text-green-700" />
        <TarjetaResumen valor={perfil?.total_clases || 0} etiqueta="Total de clases" />
        <TarjetaResumen 
          valor={`${porcentajeAvance}%`} 
          etiqueta="Avance total" 
          extraInfo={
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${porcentajeAvance}%` }} />
            </div>
          }
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Tus próximas clases prácticas</h2>
        {proximasClases.length === 0 ? (
           <p className="text-slate-500">No tienes clases agendadas por el momento.</p>
        ) : (
          <ul className="space-y-3">
            {proximasClases.map(clase => (
              <li key={clase.id_clase_practica} className="border border-slate-100 rounded-lg p-4 bg-slate-50 flex justify-between">
                <div>
                  <p className="font-bold">{formatearFechaVisual(clase.fecha)} | {String(clase.hora_inicio).slice(0, 5)} hrs</p>
                  <p className="text-sm text-slate-600">Prof: {clase.profesor_nombre} {clase.profesor_apellido}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full h-fit">{clase.estado}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default VistaInicio;