import { useEffect, useState } from "react";
import SidebarAlumno from "../../components/SidebarAlumno";
import { apiFetch } from "../../utils/apiFetch";
import VistaInicio from "./VistaInicio";
import MisResultadosAlumno from "./MisResultadosAlumno";
import VistaMisClases from "./VistaMisClases";
import VistaPerfil from "./VistaPerfil";
import VistaMateriales from "./VistaMateriales";
import VistaSolicitudExamen from "./VistaSolicitudExamen";

const titulosVista = {
  inicio: { titulo: "Inicio", descripcion: "Resumen de tu avance y próximas clases." },
  misClases: { titulo: "Mis clases", descripcion: "Historial completo y agenda de clases prácticas." },
  resultados: { titulo: "Mis resultados", descripcion: "Resultados de tus evaluaciones prácticas." },
  material: { titulo: "Material de estudio", descripcion: "Manuales y documentos para preparar tus exámenes." },
  examen: { titulo: "Mi examen", descripcion: "Solicita y revisa tu examen municipal." },
  perfil: { titulo: "Mi perfil", descripcion: "Datos de tu cuenta de alumno y estado del plan." },
};

async function obtenerDatosAlumnoPanel() {
  const [resMiPerfil, resMisClases] = await Promise.all([
    apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/mi-perfil`),
    apiFetch(`${import.meta.env.VITE_BASE_URL}/alumno-panel/mis-clases`),
  ]);

  const dataMiPerfil = await resMiPerfil.json();
  const dataMisClases = await resMisClases.json();

  if (!resMiPerfil.ok || !resMisClases.ok) {
    throw new Error("Error al cargar los datos del alumno");
  }

  return {
    perfil: dataMiPerfil.data,
    clasesPracticas: dataMisClases.data.clases_practicas || [],
    clasesTeoricas: dataMisClases.data.clases_teoricas || [],
  };
}

function PanelAlumno({ usuario, cerrarSesion }) {
  const [vistaAlumno, setVistaAlumno] = useState("inicio");
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [clasesPracticas, setClasesPracticas] = useState([]);
  const [clasesTeoricas, setClasesTeoricas] = useState([]);

  const cargarDatosPanel = async () => {
    try {
      setCargando(true);
      setError("");

      const datosPanel = await obtenerDatosAlumnoPanel();

      setPerfil(datosPanel.perfil);
      setClasesPracticas(datosPanel.clasesPracticas);
      setClasesTeoricas(datosPanel.clasesTeoricas);
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    async function cargarDatosIniciales() {
      try {
        const datosPanel = await obtenerDatosAlumnoPanel();

        if (!cancelado) {
          setPerfil(datosPanel.perfil);
          setClasesPracticas(datosPanel.clasesPracticas);
          setClasesTeoricas(datosPanel.clasesTeoricas);
        }
      } catch (errorCarga) {
        if (!cancelado) {
          setError(errorCarga.message);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarDatosIniciales();

    return () => {
      cancelado = true;
    };
  }, []);

  const vista = titulosVista[vistaAlumno] || titulosVista.inicio;

  const renderizarVista = () => {
    if (cargando) return <div className="p-8 text-slate-500">Cargando información...</div>;

    switch (vistaAlumno) {
      case "inicio":
        return <VistaInicio perfil={perfil} clases={clasesPracticas} usuario={usuario} />;
      case "misClases":
        return (
          <VistaMisClases
            clasesPracticas={clasesPracticas}
            clasesTeoricas={clasesTeoricas}
            recargarDatos={cargarDatosPanel}
          />
        );
      case "perfil":
        return <VistaPerfil perfil={perfil} usuario={usuario} />;
      case "resultados":
        return <MisResultadosAlumno />;
      case "material":
        return <VistaMateriales />;
      case "examen":
        return <VistaSolicitudExamen />;
      default:
        return <VistaInicio perfil={perfil} clases={clasesPracticas} usuario={usuario} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SidebarAlumno
        vistaActual={vistaAlumno}
        cambiarVista={setVistaAlumno}
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

export default PanelAlumno;
