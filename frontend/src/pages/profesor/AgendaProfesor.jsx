import {
  AgendaHoy,
  TablaClases,
} from "./profesorPanel.components";
import { obtenerResumenClases } from "./profesorPanel.helpers";

function AgendaProfesor({ clases }) {
  const { clasesHoy, proximasClases } = obtenerResumenClases(clases);

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
      <AgendaHoy clasesHoy={clasesHoy} />

      <TablaClases
        clases={proximasClases}
        vacio="No tienes proximas clases en agenda."
      />
    </section>
  );
}

export default AgendaProfesor;
