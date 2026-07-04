import {
  TablaClases,
  TarjetaResumen,
} from "./profesorPanel.components";
import { obtenerResumenClases } from "./profesorPanel.helpers";

function EvaluacionesProfesor({ clases }) {
  const { clasesRealizadas, clasesCanceladas } = obtenerResumenClases(clases);

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Evaluaciones</h2>
        <p className="text-slate-500 mt-2">
          Esta seccion quedo preparada para mostrar evaluaciones, registrar resultados y revisar observaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TarjetaResumen
          valor={clasesRealizadas.length}
          etiqueta="Clases realizadas"
          color="text-green-700"
        />
        <TarjetaResumen
          valor={clasesCanceladas.length}
          etiqueta="Clases canceladas"
          color="text-red-700"
        />
      </div>

      <TablaClases
        clases={clasesRealizadas.slice(0, 5)}
        vacio="Aun no tienes clases realizadas para evaluar."
      />
    </section>
  );
}

export default EvaluacionesProfesor;
