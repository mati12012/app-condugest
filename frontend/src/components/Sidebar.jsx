import {
  BookOpenCheck,
  Building2,
  CalendarDays,
  Car,
  ClipboardCheck,
  CreditCard,
  FileText,
  Home,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";

const opcionesMenu = [
  {
    id: "dashboard",
    etiqueta: "Inicio",
    Icono: Home,
    vistasActivas: ["dashboard"],
  },
  {
    id: "agenda",
    etiqueta: "Agenda",
    Icono: CalendarDays,
    vistasActivas: ["agenda", "verClasePracticaAgenda"],
  },
  {
    id: "alumnos",
    etiqueta: "Alumnos",
    Icono: Users,
    vistasActivas: ["alumnos", "registrar", "perfil"],
  },
  {
    id: "planes",
    etiqueta: "Planes",
    Icono: BookOpenCheck,
    vistasActivas: ["planes"],
  },
  {
    id: "materiales",
    etiqueta: "Materiales",
    Icono: FileText,
    vistasActivas: ["materiales"],
  },
  {
    id: "solicitudesMatricula",
    etiqueta: "Solicitudes",
    Icono: ClipboardCheck,
    vistasActivas: ["solicitudesMatricula"],
  },
  {
    id: "matriculas",
    etiqueta: "Matrículas",
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
    id: "reprogramaciones",
    etiqueta: "Reprogramaciones",
    Icono: CalendarDays,
    vistasActivas: ["reprogramaciones"],
  },
  {
    id: "solicitudesExamen",
    etiqueta: "Examen municipal",
    Icono: ClipboardCheck,
    vistasActivas: ["solicitudesExamen"],
  },
  {
    id: "clasesTeoricas",
    etiqueta: "Clases teóricas",
    Icono: BookOpenCheck,
    vistasActivas: ["clasesTeoricas", "registrarClaseTeorica", "verClaseTeorica", "editarClaseTeorica"],
  },
  {
    id: "clasesPracticas",
    etiqueta: "Clases prácticas",
    Icono: ClipboardCheck,
    vistasActivas: ["clasesPracticas", "registrarClasePractica", "verClasePractica", "editarClasePractica"],
  },
  {
    id: "profesores",
    etiqueta: "Profesores",
    Icono: UserCircle,
    vistasActivas: ["profesores", "perfilProfesor", "registrarProfesor", "editarProfesor"],
  },
  {
    id: "vehiculos",
    etiqueta: "Vehículos",
    Icono: Car,
    vistasActivas: ["vehiculos", "registrarVehiculo", "verVehiculo", "editarVehiculo"],
  },
  {
    id: "salasPsicotecnicas",
    etiqueta: "Salas psicotécnicas",
    Icono: Building2,
    vistasActivas: ["salasPsicotecnicas"],
  },
];

function Sidebar({ cambiarVista, vistaActual, cerrarSesion, usuario }) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-blue-400">ConduGest</h2>
        <p className="text-sm text-slate-400">Portal secretaría</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {opcionesMenu.map(({ id, etiqueta, Icono, vistasActivas }) => {
          const estaActivo = vistasActivas.includes(vistaActual);

          return (
            <button
              key={id}
              type="button"
              onClick={() => cambiarVista(id)}
              className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded transition-colors ${
                estaActivo
                  ? "bg-slate-800 text-blue-300 font-medium"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icono size={18} strokeWidth={2.2} />
              <span>{etiqueta}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="px-2">
          <strong className="block text-sm text-slate-200 truncate">
            {usuario?.correo || "Secretaría Central"}
          </strong>
          <p className="text-sm text-green-400 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            En línea
          </p>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 text-left px-4 py-2.5 rounded text-slate-200 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} strokeWidth={2.2} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
