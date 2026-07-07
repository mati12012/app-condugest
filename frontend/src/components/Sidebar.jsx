import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  Building2,
  CalendarDays,
  Car,
  ChevronDown,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  Home,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";
import { obtenerCorreoUsuario, obtenerNombreUsuario } from "../utils/usuarioSesion";

const seccionesMenu = [
  {
    id: "inicio",
    etiqueta: "Inicio",
    Icono: Home,
    opciones: [
      {
        id: "dashboard",
        etiqueta: "Panel principal",
        Icono: Home,
        vistasActivas: ["dashboard"],
      },
      {
        id: "agenda",
        etiqueta: "Agenda",
        Icono: CalendarDays,
        vistasActivas: ["agenda", "verClasePracticaAgenda"],
      },
    ],
  },
  {
    id: "gestionAcademica",
    etiqueta: "Gestion academica",
    Icono: BookOpenCheck,
    opciones: [
      {
        id: "clasesPracticas",
        etiqueta: "Clases practicas",
        Icono: ClipboardCheck,
        vistasActivas: ["clasesPracticas", "registrarClasePractica", "verClasePractica", "editarClasePractica"],
      },
      {
        id: "clasesTeoricas",
        etiqueta: "Clases teoricas",
        Icono: BookOpenCheck,
        vistasActivas: ["clasesTeoricas", "registrarClaseTeorica", "verClaseTeorica", "editarClaseTeorica"],
      },
      {
        id: "reprogramaciones",
        etiqueta: "Reprogramaciones",
        Icono: CalendarDays,
        vistasActivas: ["reprogramaciones"],
      },
      {
        id: "asistenciasPracticas",
        etiqueta: "Asistencias practicas",
        Icono: ClipboardCheck,
        vistasActivas: ["asistenciasPracticas"],
      },
      {
        id: "solicitudesExamen",
        etiqueta: "Examen municipal",
        Icono: ClipboardCheck,
        vistasActivas: ["solicitudesExamen"],
      },
    ],
  },
  {
    id: "alumnosMatriculas",
    etiqueta: "Alumnos y matriculas",
    Icono: Users,
    opciones: [
      {
        id: "alumnos",
        etiqueta: "Alumnos",
        Icono: Users,
        vistasActivas: ["alumnos", "registrar", "perfil"],
      },
      {
        id: "solicitudesMatricula",
        etiqueta: "Solicitudes",
        Icono: ClipboardCheck,
        vistasActivas: ["solicitudesMatricula"],
      },
      {
        id: "matriculas",
        etiqueta: "Matriculas",
        Icono: ClipboardCheck,
        vistasActivas: ["matriculas"],
      },
      {
        id: "pagos",
        etiqueta: "Pagos",
        Icono: CreditCard,
        vistasActivas: ["pagos"],
      },
      {
        id: "planes",
        etiqueta: "Planes",
        Icono: BookOpenCheck,
        vistasActivas: ["planes"],
      },
    ],
  },
  {
    id: "profesores",
    etiqueta: "Profesores",
    Icono: UserCircle,
    opciones: [
      {
        id: "profesores",
        etiqueta: "Profesores",
        Icono: UserCircle,
        vistasActivas: ["profesores", "perfilProfesor", "registrarProfesor", "editarProfesor"],
      },
      {
        id: "disponibilidadProfesores",
        etiqueta: "Disponibilidad",
        Icono: Clock,
        vistasActivas: ["disponibilidadProfesores"],
      },
    ],
  },
  {
    id: "recursos",
    etiqueta: "Recursos",
    Icono: FileText,
    opciones: [
      {
        id: "materiales",
        etiqueta: "Materiales",
        Icono: FileText,
        vistasActivas: ["materiales"],
      },
      {
        id: "vehiculos",
        etiqueta: "Vehiculos",
        Icono: Car,
        vistasActivas: ["vehiculos", "registrarVehiculo", "verVehiculo", "editarVehiculo"],
      },
      {
        id: "salasTeoricas",
        etiqueta: "Salas teoricas",
        Icono: Building2,
        vistasActivas: ["salasTeoricas"],
      },
      {
        id: "salasPsicotecnicas",
        etiqueta: "Salas psicotecnicas",
        Icono: Building2,
        vistasActivas: ["salasPsicotecnicas"],
      },
    ],
  },
];

function obtenerSeccionActiva(vistaActual) {
  return seccionesMenu.find((seccion) =>
    seccion.opciones.some((opcion) => opcion.vistasActivas.includes(vistaActual))
  );
}

function Sidebar({ cambiarVista, vistaActual, cerrarSesion, usuario }) {
  const nombreUsuario = obtenerNombreUsuario(usuario, "Secretaria ConduGest");
  const correoUsuario = obtenerCorreoUsuario(usuario, "");
  const seccionActiva = useMemo(() => obtenerSeccionActiva(vistaActual), [vistaActual]);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});

  function alternarSeccion(idSeccion) {
    setSeccionesAbiertas((actual) => {
      if (seccionActiva?.id === idSeccion) {
        return {
          ...actual,
          [idSeccion]: true,
        };
      }

      return {
        ...actual,
        [idSeccion]: !actual[idSeccion],
      };
    });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-blue-400">ConduGest</h2>
        <p className="text-sm text-slate-400">Portal secretaria</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
        {seccionesMenu.map(({ id, etiqueta, Icono, opciones }) => {
          const tieneVistaActiva = opciones.some((opcion) => opcion.vistasActivas.includes(vistaActual));
          const estaAbierta = Boolean(seccionesAbiertas[id] || tieneVistaActiva);

          return (
            <section
              key={id}
              className={`rounded-lg border transition-colors ${
                estaAbierta
                  ? "border-slate-700 bg-slate-800/60"
                  : "border-transparent"
              }`}
            >
              <button
                type="button"
                onClick={() => alternarSeccion(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  tieneVistaActiva
                    ? "text-blue-300 font-semibold"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white"
                }`}
                aria-expanded={estaAbierta}
              >
                <Icono size={18} strokeWidth={2.2} />
                <span className="flex-1 text-sm">{etiqueta}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.4}
                  className={`transition-transform ${estaAbierta ? "rotate-180" : ""}`}
                />
              </button>

              {estaAbierta && (
                <div className="px-2 pb-2 space-y-1">
                  {opciones.map(({ id: idOpcion, etiqueta: etiquetaOpcion, Icono: IconoOpcion, vistasActivas }) => {
                    const estaActivo = vistasActivas.includes(vistaActual);

                    return (
                      <button
                        key={idOpcion}
                        type="button"
                        onClick={() => cambiarVista(idOpcion)}
                        className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded transition-colors ${
                          estaActivo
                            ? "bg-blue-500/15 text-blue-300 font-medium"
                            : "text-slate-300 hover:bg-slate-700/70 hover:text-white"
                        }`}
                      >
                        <IconoOpcion size={16} strokeWidth={2.2} />
                        <span className="text-sm">{etiquetaOpcion}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="px-2">
          <strong className="block text-sm text-slate-200 truncate">
            {nombreUsuario}
          </strong>
          {correoUsuario && correoUsuario !== nombreUsuario && (
            <p className="text-xs text-slate-400 truncate mt-1">
              {correoUsuario}
            </p>
          )}
          <p className="text-sm text-green-400 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            En linea
          </p>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 text-left px-4 py-2.5 rounded text-slate-200 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} strokeWidth={2.2} />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
