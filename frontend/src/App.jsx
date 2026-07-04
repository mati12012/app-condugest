import React, { useState } from 'react';
import Login from './pages/auth/Login';
import Sidebar from './components/Sidebar';
import RegistrarAlumno from './pages/secretaria/RegistrarAlumno';
import VistaAlumnos from './pages/secretaria/VistaAlumnos';
import PerfilAlumno from './pages/secretaria/PerfilAlumno';
import ReservaSalaPsicotecnica from './pages/secretaria/ReservaSalaPsicotecnica';
import ModuloSalasPsicotecnicas from './pages/secretaria/ModuloSalasPsicotecnicas';
import VistaProfesores from './pages/secretaria/VistaProfesores';
import PerfilProfesor from './pages/secretaria/PerfilProfesor';
import RegistrarProfesor from './pages/secretaria/RegistrarProfesor';
import EditarProfesor from './pages/secretaria/EditarProfesor';
import RegistrarVehiculo from './pages/secretaria/RegistrarVehiculo';
import VistaVehiculos from './pages/secretaria/VistaVehiculos';
import VerVehiculo from './pages/secretaria/VerVehiculo';
import EditarVehiculo from './pages/secretaria/EditarVehiculo';
import RegistrarClasePractica from './pages/secretaria/RegistrarClasePractica';
import VistaClasesPracticas from './pages/secretaria/VistaClasesPracticas';
import VerClasePractica from './pages/secretaria/VerClasePractica';
import EditarClasePractica from './pages/secretaria/EditarClasePractica';
import VistaClasesTeoricas from './pages/secretaria/VistaClasesTeoricas';
import RegistrarClaseTeorica from './pages/secretaria/RegistrarClaseTeorica';
import VerClaseTeorica from './pages/secretaria/VerClaseTeorica';
import EditarClaseTeorica from './pages/secretaria/EditarClaseTeorica';
import VistaAgenda from './pages/secretaria/VistaAgenda';
import PanelPrincipal from './pages/secretaria/PanelPrincipal';
import PanelProfesor from './pages/profesor/PanelProfesor';
import PanelAlumno from './pages/alumno/PanelAlumno';

const obtenerVistaPorRol = (rol) => {
  if (rol === "secretaria") return "dashboard";
  if (rol === "profesor") return "panelProfesor";
  if (rol === "alumno") return "panelAlumno";

  return "login";
};

function App() {
  // por ahora esta asi para que pase directo
  /*const [usuario, setUsuario] = useState({
    rol: 'secretaria',
    correo: 'test@correo.com'
  });*/



  // para saber que pagina mostrar al lado derecho
  const usuarioInicial = (() => {
    const usuarioGuardado = localStorage.getItem("usuarioCondugest");

    if (!usuarioGuardado) return null;

    try {
      return JSON.parse(usuarioGuardado);
    } catch {
      localStorage.removeItem("usuarioCondugest");
      return null;
    }
  })();

  const tokenInicial = localStorage.getItem("tokenCondugest");

  const [usuario, setUsuario] = useState(usuarioInicial);
  const [token, setToken] = useState(tokenInicial);

  const [vistaActual, setVistaActual] = useState(
    usuarioInicial ? obtenerVistaPorRol(usuarioInicial.rol) : "login"
  );

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [idSeleccionado, setIdSeleccionado] = useState(null);



  const manejarCambioVista = (nuevaVista, id = null) => {
    setVistaActual(nuevaVista);
    setAlumnoSeleccionado(id);
    setIdSeleccionado(id);
  };


  const manejarLogin = (usuarioLogin, tokenLogin) => {
    localStorage.setItem("usuarioCondugest", JSON.stringify(usuarioLogin));
    localStorage.setItem("tokenCondugest", tokenLogin);

    setUsuario(usuarioLogin);
    setToken(tokenLogin);

    setVistaActual(obtenerVistaPorRol(usuarioLogin.rol));
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioCondugest");
    localStorage.removeItem("tokenCondugest");

    setUsuario(null);
    setToken(null);

    setVistaActual("login");
  };

  if (!usuario || !token || vistaActual === "login") {
    return <Login onLogin={manejarLogin} />;
  }

  if (usuario.rol === "alumno") {
  return (
    <PanelAlumno
      usuario={usuario}
      cerrarSesion={cerrarSesion}
    />
  );
}

if (usuario.rol === "profesor") {
  return (
    <PanelProfesor
      usuario={usuario}
      cerrarSesion={cerrarSesion}
    />
  );
}

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* barra lateral izquierda */}
      <Sidebar
        cambiarVista={manejarCambioVista}
        vistaActual={vistaActual}
        cerrarSesion={cerrarSesion}
        usuario={usuario}
      />

      {/* contenido principal derecho */}
      <main className="flex-1 flex flex-col">
        {/* barra superior pequeña */}
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <span className="font-medium text-slate-600">Portal de Administración</span>
          <span className="text-sm text-slate-500">{usuario?.correo}</span>
        </header>

        {/* aqui cambia la pantalla segun la vista actual */}
        <div className="flex-1 p-6">
          {vistaActual === 'dashboard' && <PanelPrincipal cambiarVista={manejarCambioVista} />}
          {vistaActual === 'alumnos' && <VistaAlumnos cambiarVista={manejarCambioVista} />}
          {vistaActual === 'registrar' && <RegistrarAlumno cambiarVista={setVistaActual} />}
          {vistaActual === 'perfil' && <PerfilAlumno alumnoSeleccionado={alumnoSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === "salasPsicotecnicas" && <ModuloSalasPsicotecnicas />}
          {vistaActual === "profesores" && <VistaProfesores cambiarVista={manejarCambioVista} />}
          {vistaActual === 'perfilProfesor' && (<PerfilProfesor profesorId={idSeleccionado} cambiarVista={manejarCambioVista} />)}
          {vistaActual === "registrarProfesor" && <RegistrarProfesor cambiarVista={manejarCambioVista} />}
          {vistaActual === "editarProfesor" && <EditarProfesor profesorId={idSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === "registrarVehiculo" && <RegistrarVehiculo cambiarVista={manejarCambioVista} />}
          {vistaActual === "vehiculos" && <VistaVehiculos cambiarVista={manejarCambioVista} />}
          {vistaActual === "verVehiculo" && <VerVehiculo vehiculoId={idSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === "editarVehiculo" && <EditarVehiculo vehiculoId={idSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === "registrarClasePractica" && <RegistrarClasePractica cambiarVista={manejarCambioVista} />}
          {vistaActual === "clasesPracticas" && <VistaClasesPracticas cambiarVista={manejarCambioVista} />}
          {vistaActual === "verClasePractica" && <VerClasePractica claseId={idSeleccionado} cambiarVista={manejarCambioVista} volverA='clasesPracticas' />}
          {vistaActual === "editarClasePractica" && <EditarClasePractica claseId={idSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === 'clasesTeoricas' && <VistaClasesTeoricas cambiarVista={manejarCambioVista} />}
          {vistaActual === 'registrarClaseTeorica' && <RegistrarClaseTeorica cambiarVista={manejarCambioVista} />}
          {vistaActual === 'verClaseTeorica' && <VerClaseTeorica idClase={alumnoSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === 'editarClaseTeorica' && <EditarClaseTeorica idClase={alumnoSeleccionado} cambiarVista={manejarCambioVista} />}
          {vistaActual === 'agenda' && <VistaAgenda cambiarVista={manejarCambioVista} />}
          {vistaActual === 'verClasePracticaAgenda' && (<VerClasePractica claseId={idSeleccionado} cambiarVista={manejarCambioVista} volverA="agenda" />)}
        </div>
      </main>
    </div>
  );
}

export default App;
