import { useEffect, useMemo, useState } from "react";
import SidebarProfesor from "../../components/SidebarProfesor";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";

const titulosVista = {
  inicio: {
    titulo: "Inicio",
    descripcion: "Resumen de clases asignadas y actividad del dia.",
  },
  misClases: {
    titulo: "Mis clases",
    descripcion: "Listado de clases practicas asignadas.",
  },
  agenda: {
    titulo: "Agenda",
    descripcion: "Vista rapida de la jornada del profesor.",
  },
  evaluaciones: {
    titulo: "Evaluaciones",
    descripcion: "Espacio preparado para registrar evaluaciones.",
  },
  perfil: {
    titulo: "Mi perfil",
    descripcion: "Datos de la cuenta del profesor.",
  },
};

function obtenerFechaHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function formatearFechaInput(fecha) {
  if (!fecha) return "";

  const fechaTexto = String(fecha);

  if (fechaTexto.includes("T")) {
    return fechaTexto.split("T")[0];
  }

  return fechaTexto;
}

function formatearHora(hora) {
  if (!hora) return "";
  return String(hora).slice(0, 5);
}

function normalizarEstado(estado) {
  return String(estado || "").toLowerCase();
}

function obtenerClaseEstado(estado) {
  const estadoNormalizado = normalizarEstado(estado);

  if (estadoNormalizado === "programada") {
    return "bg-blue-100 text-blue-700";
  }

  if (estadoNormalizado === "realizada") {
    return "bg-green-100 text-green-700";
  }

  if (estadoNormalizado === "cancelada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function mostrarEstado(estado) {
  const estadoNormalizado = normalizarEstado(estado);

  if (estadoNormalizado === "programada") return "Programada";
  if (estadoNormalizado === "realizada") return "Realizada";
  if (estadoNormalizado === "cancelada") return "Cancelada";

  return estado || "Sin estado";
}

function TarjetaResumen({ valor, etiqueta, color = "text-slate-900" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className={`text-4xl font-bold ${color}`}>{valor}</p>
      <p className="text-slate-500 mt-2">{etiqueta}</p>
    </div>
  );
}

function EstadoClase({ estado }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${obtenerClaseEstado(estado)}`}>
      {mostrarEstado(estado)}
    </span>
  );
}

function TablaClases({ clases, vacio = "No hay clases para mostrar." }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3">Alumno</th>
              <th className="px-4 py-3">Vehiculo</th>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {clases.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                  {vacio}
                </td>
              </tr>
            ) : (
              clases.map((clase, index) => (
                <tr
                  key={clase.id_clase_practica || `${clase.fecha}-${clase.hora_inicio}-${index}`}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {formatearFechaVisual(clase.fecha)}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {clase.alumno_nombre} {clase.alumno_apellido}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {clase.vehiculo_patente} - {clase.vehiculo_marca} {clase.vehiculo_modelo}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {clase.sede || "Sin sede"}
                  </td>

                  <td className="px-4 py-3">
                    <EstadoClase estado={clase.estado} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgendaHoy({ clasesHoy, breve = false, titulo = "Agenda de hoy" }) {
  const clasesMostradas = breve ? clasesHoy.slice(0, 4) : clasesHoy;
  const clasesOcultas = clasesHoy.length - clasesMostradas.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-5">{titulo}</h2>

      <div className="space-y-4">
        {clasesHoy.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-500">
            Hoy no tienes clases programadas. Puedes usar este espacio para revisar tus proximas actividades.
          </div>
        ) : (
          <>
            {clasesMostradas.map((clase, index) => (
              <div
                key={clase.id_clase_practica || `${clase.fecha}-${clase.hora_inicio}-${index}`}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                    </p>

                    <p className="text-slate-600 mt-1">
                      {clase.alumno_nombre} {clase.alumno_apellido}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {clase.vehiculo_patente} - {clase.sede || "Sin sede"}
                    </p>
                  </div>

                  <span className="h-fit">
                    <EstadoClase estado={clase.estado} />
                  </span>
                </div>
              </div>
            ))}

            {clasesOcultas > 0 && (
              <p className="text-sm text-slate-500">
                Tienes {clasesOcultas} clase{clasesOcultas === 1 ? "" : "s"} mas para hoy.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function VistaInicioProfesor({
  usuario,
  fechaHoy,
  clases,
  clasesHoy,
  proximasClases,
  clasesRealizadas,
  clasesCanceladas,
  verMisClases,
}) {
  const noTieneClases = clases.length === 0;

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="max-w-3xl">
            <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
              Panel profesor
            </span>

            <h2 className="text-3xl font-bold text-slate-900 mt-4">
              Hola, {usuario?.correo || "profesor"}
            </h2>

            <p className="text-slate-500 mt-3 text-base leading-relaxed">
              Esta es tu vista de inicio. Aqui tienes a mano tu agenda del dia, tus proximas clases y el avance general de tus actividades.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 min-w-full xl:min-w-72">
            <p className="text-sm text-slate-500">Jornada de hoy</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatearFechaVisual(fechaHoy)}
            </p>
            <p className="text-sm text-slate-600 mt-3">
              {clasesHoy.length === 0
                ? "Sin clases programadas para hoy."
                : `${clasesHoy.length} clase${clasesHoy.length === 1 ? "" : "s"} programada${clasesHoy.length === 1 ? "" : "s"} para hoy.`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <TarjetaResumen valor={clases.length} etiqueta="Clases asignadas" />
        <TarjetaResumen valor={clasesHoy.length} etiqueta="Clases de hoy" color="text-blue-700" />
        <TarjetaResumen valor={proximasClases.length} etiqueta="Proximas clases" color="text-indigo-700" />
        <TarjetaResumen valor={clasesRealizadas.length} etiqueta="Realizadas" color="text-green-700" />
        <TarjetaResumen valor={clasesCanceladas.length} etiqueta="Canceladas" color="text-red-700" />
      </div>

      {noTieneClases && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-5">
          Aun no tienes clases asignadas. Cuando secretaria programe clases para ti, apareceran en este inicio.
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Proximas clases
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Un vistazo rapido a las clases pendientes.
              </p>
            </div>

            <button
              type="button"
              onClick={verMisClases}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
            >
              Ver todas
            </button>
          </div>

          <TablaClases
            clases={proximasClases.slice(0, 5)}
            vacio="No tienes proximas clases por ahora. Disfruta el respiro."
          />
        </div>

        <AgendaHoy
          clasesHoy={clasesHoy}
          breve
          titulo="Agenda breve de hoy"
        />
      </section>
    </section>
  );
}

function PanelProfesor({ usuario, cerrarSesion }) {
  const [vistaProfesor, setVistaProfesor] = useState("inicio");
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function obtenerMisClases() {
    const respuesta = await apiFetch(
      `${import.meta.env.VITE_BASE_URL}/profesor/mis-clases`
    );

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || "No se pudieron obtener tus clases");
    }

    return data.data?.clases_practicas || [];
  }

  async function cargarMisClases() {
    try {
      setCargando(true);
      setError("");

      const clasesProfesor = await obtenerMisClases();
      setClases(clasesProfesor);
    } catch (error) {
      setError(error.message || "Error al cargar las clases del profesor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let componenteActivo = true;

    async function cargarClasesIniciales() {
      try {
        const clasesProfesor = await obtenerMisClases();

        if (componenteActivo) {
          setClases(clasesProfesor);
        }
      } catch (error) {
        if (componenteActivo) {
          setError(error.message || "Error al cargar las clases del profesor");
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarClasesIniciales();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const fechaHoy = obtenerFechaHoy();

  const clasesOrdenadas = useMemo(() => {
    return [...clases].sort((a, b) => {
      const fechaA = formatearFechaInput(a.fecha);
      const fechaB = formatearFechaInput(b.fecha);

      if (fechaA !== fechaB) {
        return fechaA.localeCompare(fechaB);
      }

      return String(a.hora_inicio).localeCompare(String(b.hora_inicio));
    });
  }, [clases]);

  const clasesHoy = clasesOrdenadas.filter(
    (clase) => formatearFechaInput(clase.fecha) === fechaHoy
  );

  const proximasClases = clasesOrdenadas.filter((clase) => {
    const fechaClase = formatearFechaInput(clase.fecha);
    const estado = normalizarEstado(clase.estado);

    return fechaClase >= fechaHoy && estado !== "realizada" && estado !== "cancelada";
  });

  const clasesRealizadas = clasesOrdenadas.filter(
    (clase) => normalizarEstado(clase.estado) === "realizada"
  );

  const clasesCanceladas = clasesOrdenadas.filter(
    (clase) => normalizarEstado(clase.estado) === "cancelada"
  );

  const vista = titulosVista[vistaProfesor] || titulosVista.inicio;

  const renderizarVista = () => {
    if (cargando) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-slate-500">
          Cargando tus clases asignadas...
        </div>
      );
    }

    if (vistaProfesor === "misClases") {
      return (
        <section className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={cargarMisClases}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
            >
              Actualizar
            </button>
          </div>

          <TablaClases
            clases={clasesOrdenadas}
            vacio="No tienes clases practicas asignadas."
          />
        </section>
      );
    }

    if (vistaProfesor === "agenda") {
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

    if (vistaProfesor === "evaluaciones") {
      return (
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Evaluaciones</h2>
          <p className="text-slate-500 mt-2">
            Esta seccion quedo preparada para mostrar evaluaciones, registrar resultados y revisar observaciones.
          </p>
        </section>
      );
    }

    if (vistaProfesor === "perfil") {
      return (
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900">Datos del profesor</h2>

          <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-sm text-slate-500">Correo</dt>
              <dd className="font-semibold text-slate-900 mt-1 break-all">
                {usuario?.correo || "Sin correo registrado"}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-sm text-slate-500">Rol</dt>
              <dd className="font-semibold text-slate-900 mt-1">
                {usuario?.rol || "profesor"}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <dt className="text-sm text-slate-500">ID profesor</dt>
              <dd className="font-semibold text-slate-900 mt-1">
                {usuario?.id_profesor || "No disponible"}
              </dd>
            </div>
          </dl>
        </section>
      );
    }

    return (
      <VistaInicioProfesor
        usuario={usuario}
        fechaHoy={fechaHoy}
        clases={clases}
        clasesHoy={clasesHoy}
        proximasClases={proximasClases}
        clasesRealizadas={clasesRealizadas}
        clasesCanceladas={clasesCanceladas}
        verMisClases={() => setVistaProfesor("misClases")}
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SidebarProfesor
        vistaActual={vistaProfesor}
        cambiarVista={setVistaProfesor}
        cerrarSesion={cerrarSesion}
        usuario={usuario}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">{vista.titulo}</h1>
          <p className="text-sm text-slate-500 mt-1">{vista.descripcion}</p>
        </header>

        <div className="flex-1 p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}

          {renderizarVista()}
        </div>
      </main>
    </div>
  );
}

export default PanelProfesor;
