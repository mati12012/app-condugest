import {
  Home,
  BookOpenCheck,
  Award,
  FileText,
  UserCircle,
  LogOut,
} from "lucide-react";

const opcionesMenu = [
  {
    id: "inicio",
    etiqueta: "Inicio",
    Icono: Home,
  },
  {
    id: "misClases",
    etiqueta: "Mis clases",
    Icono: BookOpenCheck,
  },
  {
    id: "resultados",
    etiqueta: "Mis resultados",
    Icono: Award,
  },
  {
    id: "material",
    etiqueta: "Material de estudio",
    Icono: FileText,
  },
  {
    id: "perfil",
    etiqueta: "Mi perfil",
    Icono: UserCircle,
  },
];

function SidebarAlumno({ vistaActual, cambiarVista, cerrarSesion, usuario }) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-blue-400">ConduGest</h2>
        <p className="text-sm text-slate-400">Portal Alumno</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {opcionesMenu.map(({ id, etiqueta, Icono }) => {
          const estaActivo = vistaActual === id;

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
            {usuario?.correo || "Alumno"}
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

export default SidebarAlumno;