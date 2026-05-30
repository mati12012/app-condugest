import React, { useState } from 'react';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import RegistrarAlumno from './pages/RegistrarAlumno';
import VistaAlumnos from './pages/VistaAlumnos';
import DashboardSecretaria from './pages/DashboardSecretaria';
import AgendaClases from './pages/AgendaClases';
import PerfilAlumno from './pages/PerfilAlumno';
import ReservaSalaPsicotecnica from './pages/ReservaSalaPsicotecnica';
import ModuloSalasPsicotecnicas from './pages/ModuloSalasPsicotecnicas';
import VistaProfesores from './pages/VistaProfesores';
import PerfilProfesor from './pages/PerfilProfesor';
import RegistrarProfesor from './pages/RegistrarProfesor';

function App() {
  // por ahora esta asi para que pase directo
  const [usuario, setUsuario] = useState({
    rol: 'secretaria',
    correo: 'test@correo.com'
  });

  // para saber que pagina mostrar al lado derecho
  const [vistaActual, setVistaActual] = useState('dashboard');

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const[idSeleccionado, setIdSeleccionado] = useState(null);



  const manejarCambioVista = (nuevaVista, id = null) => {
    setVistaActual(nuevaVista);
    setAlumnoSeleccionado(id);
  };

  if (!usuario) return <Login onLogin={setUsuario} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* barra lateral izquierda */}
      <Sidebar cambiarVista={manejarCambioVista} vistaActual={vistaActual} />

      {/* contenido principal derecho */}
      <main className="flex-1 flex flex-col">
        {/* barra superior pequeña */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <span className="font-medium text-slate-600">Portal de Administración</span>
          <button
            onClick={() => setUsuario(null)}
            className="text-sm text-slate-500 hover:text-red-500 underline"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* aqui cambia la pantalla segun la vista actual */}
        <div className="flex-1 p-6">
          {vistaActual === 'dashboard' && <DashboardSecretaria />}
          {vistaActual === 'agenda' && <AgendaClases />}
          {vistaActual === 'alumnos' && <VistaAlumnos cambiarVista={manejarCambioVista} />}
          {vistaActual === 'registrar' && <RegistrarAlumno />}
          {vistaActual === 'perfil' && <PerfilAlumno alumnoId={alumnoSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === "salasPsicotecnicas" && <ModuloSalasPsicotecnicas />}
          {vistaActual === "profesores" && <VistaProfesores cambiarVista={manejarCambioVista} />}
          {vistaActual === "perfilProfesor" && <PerfilProfesor profesorId={idSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === "registrarProfesor" && <RegistrarProfesor cambiarVista={manejarCambioVista} />}
        </div>
      </main>
    </div>
  );
}

export default App;