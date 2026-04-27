function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <h2>ConduGest</h2>
          <p>Sistema de gestión</p>
        </div>

        <nav className="menu">
          <div className="menu-item">Dashboard</div>
          <div className="menu-item">Alumnos</div>
          <div className="menu-item">Clases teóricas</div>
          <div className="menu-item active">Clases prácticas</div>
          <div className="menu-item">Profesores</div>
          <div className="menu-item">Vehículos</div>
          <div className="menu-item">Salas psicotécnicas</div>
          <div className="menu-item">Reprogramaciones</div>
          <div className="menu-item">Reportes</div>
          <div className="menu-item">Configuración</div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <strong>Secretaría Central</strong>
        <p>En línea</p>
      </div>
    </aside>
  );
}

export default Sidebar;