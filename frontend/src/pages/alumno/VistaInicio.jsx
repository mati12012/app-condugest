import { useMemo } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { obtenerNombreUsuario } from "../../utils/usuarioSesion";

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
  const nombreUsuario = obtenerNombreUsuario(usuario, "alumno");
  const totalClasesPracticas = Number(perfil?.total_clases_practicas || 0);
  const clasesRealizadas = Number(perfil?.clases_practicas_realizadas || 0);
  const clasesRestantes = Number(perfil?.clases_practicas_restantes || 0);

  const porcentajeAvance = useMemo(() => {
    if (!totalClasesPracticas) return 0;
    return Math.min(
      Math.round((clasesRealizadas / totalClasesPracticas) * 100),
      100
    );
  }, [clasesRealizadas, totalClasesPracticas]);

  const proximasClases = clases
    .filter((clase) => clase.estado === "Programada")
    .slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Portal del alumno</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">Bienvenido, {nombreUsuario}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <TarjetaResumen
          valor={perfil?.nombre_plan || "Sin matrícula activa"}
          etiqueta={perfil?.tipo_plan || "Plan contratado"}
          color="text-blue-700"
        />
        <TarjetaResumen
          valor={clasesRealizadas}
          etiqueta="Clases realizadas"
          color="text-green-700"
        />
        <TarjetaResumen
          valor={totalClasesPracticas}
          etiqueta="Clases prácticas contratadas"
        />
        <TarjetaResumen
          valor={clasesRestantes}
          etiqueta="Clases restantes"
          color={clasesRestantes === 0 ? "text-amber-700" : "text-slate-900"}
        />
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
