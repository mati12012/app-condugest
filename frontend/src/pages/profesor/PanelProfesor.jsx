import { useEffect, useState } from "react"; 
import SidebarProfesor from "../../components/SidebarProfesor"; 
import { apiFetch } from "../../utils/apiFetch"; 
import AgendaProfesor from "./AgendaProfesor"; 
import EvaluacionesProfesor from "./EvaluacionesProfesor"; 
import InicioProfesor from "./InicioProfesor"; 
import MisClasesProfesor from "./MisClasesProfesor"; 
import PerfilProfesor from "./PerfilProfesor"; 
import DetalleClasePractica from "./DetalleClasePractica"; 
import MisClasesTeoricas from "./MisClasesTeoricas";
import DetalleClaseTeoricaProf from "./DetalleClaseTeoricaProf";

const titulosVista = {   
  inicio: { titulo: "Inicio", descripcion: "Resumen de clases asignadas y actividad del día." },   
  misClases: { titulo: "Mis clases", descripcion: "Listado de clases prácticas asignadas." },   
  agenda: { titulo: "Agenda", descripcion: "Vista rápida de la jornada del profesor." },   
  evaluaciones: { titulo: "Evaluaciones", descripcion: "Espacio preparado para registrar evaluaciones." },   
  perfil: { titulo: "Mi perfil", descripcion: "Datos de la cuenta del profesor." },
  detalleClase: { titulo: "Gestión de Clase", descripcion: "Control de asistencia y seguimiento del alumno." },
  misClasesTeoricas: { titulo: "Clases teóricas", descripcion: "Listado de cursos teóricos asignados." },
  detalleTeorica: { titulo: "Libro de Clases", descripcion: "Pase de lista del curso." }
};

function PanelProfesor({ usuario, cerrarSesion }) {   
  const [vistaProfesor, setVistaProfesor] = useState("inicio");   
  const [claseSeleccionada, setClaseSeleccionada] = useState(null); 
  const [clases, setClases] = useState([]);   
  const [cargando, setCargando] = useState(true);   
  const [error, setError] = useState("");   

  async function obtenerMisClases() {     
    const respuesta = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/mis-clases`);     
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
        if (componenteActivo) setClases(clasesProfesor);       
      } catch (error) {         
        if (componenteActivo) setError(error.message || "Error al cargar las clases del profesor");       
      } finally {         
        if (componenteActivo) setCargando(false);       
      }     
    }     
    cargarClasesIniciales();     
    return () => { componenteActivo = false; };   
  }, []);   

  const verDetalleClase = (id) => {
    setClaseSeleccionada(id);
    setVistaProfesor("detalleClase");
  };

  const vista = titulosVista[vistaProfesor] || titulosVista.inicio;   

  const renderizarVista = () => {     
    if (cargando) {       
      return (         
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-slate-500">           
          Cargando tus clases asignadas...         
        </div>       
      );     
    }     
    
    if (vistaProfesor === "detalleClase") {
      return (
        <DetalleClasePractica 
          claseId={claseSeleccionada}
          clases={clases}
          volver={() => setVistaProfesor("misClases")}
          cargarMisClases={cargarMisClases}
        />
      );
    }

    if (vistaProfesor === "misClases") {       
      return <MisClasesProfesor clases={clases} cargarMisClases={cargarMisClases} verDetalleClase={verDetalleClase} />;     
    }     
    if (vistaProfesor === "agenda") return <AgendaProfesor clases={clases} />;     
    if (vistaProfesor === "evaluaciones") return <EvaluacionesProfesor clases={clases} />;     
    if (vistaProfesor === "perfil") return <PerfilProfesor usuario={usuario} cerrarSesion={cerrarSesion} />;     

    if (vistaProfesor === "misClasesTeoricas") {
  return <MisClasesTeoricas verDetalleClase={(id) => { setClaseSeleccionada(id); setVistaProfesor("detalleTeorica"); }} />;
    }
    if (vistaProfesor === "detalleTeorica") {
      return <DetalleClaseTeoricaProf claseId={claseSeleccionada} volver={() => setVistaProfesor("misClasesTeoricas")} />;
    }
    
    return <InicioProfesor usuario={usuario} clases={clases} cargarMisClases={cargarMisClases} irAMisClases={() => setVistaProfesor("misClases")} />;   
  };   

  return (     
    <div className="flex min-h-screen bg-slate-100">       
      <SidebarProfesor vistaActual={vistaProfesor} cambiarVista={setVistaProfesor} cerrarSesion={cerrarSesion} usuario={usuario} />       
      <main className="flex-1 flex flex-col min-w-0">         
        <header className="bg-white border-b border-slate-200 px-6 py-4">           
          <h1 className="text-2xl font-bold text-slate-900">{vista.titulo}</h1>           
          <p className="text-sm text-slate-500 mt-1">{vista.descripcion}</p>         
        </header>         
        <div className="flex-1 p-6 space-y-6">           
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>}           
          {renderizarVista()}         
        </div>       
      </main>     
    </div>   
  ); 
}

export default PanelProfesor;
