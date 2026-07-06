import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearHoraVisual } from "../../utils/formatearFecha";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const SEDES = [
  "Sede Concepcion",
  "Sede San Pedro",
  "Sede Penco",
  "Online",
];

const ESTADOS = ["Activa", "Inactiva"];

const FORMULARIO_INICIAL = {
  id_profesor: "",
  dia_semana: "Lunes",
  hora_inicio: "",
  hora_fin: "",
  sede: "Sede Concepcion",
  estado: "Activa",
};

function obtenerNombreProfesor(disponibilidad) {
  const profesor = disponibilidad.profesor;

  if (!profesor) return "Profesor no disponible";

  return `${profesor.nombre || ""} ${profesor.apellido || ""}`.trim();
}

function convertirHoraAMinutos(hora) {
  const [horas, minutos] = String(hora).split(":").map(Number);
  return horas * 60 + minutos;
}

function obtenerMensajeErrorServidor(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  if (typeof data?.errorDetails === "string") {
    return data.errorDetails;
  }

  return data?.message || fallback;
}

function VistaDisponibilidadProfesores() {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [disponibilidadEditando, setDisponibilidadEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroProfesor, setFiltroProfesor] = useState("Todos");
  const [filtroDia, setFiltroDia] = useState("Todos");
  const [filtroSede, setFiltroSede] = useState("Todas");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const [resDisponibilidades, resProfesores] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_BASE_URL}/disponibilidad-profesores`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/profesores`),
      ]);

      const dataDisponibilidades = await resDisponibilidades.json();
      const dataProfesores = await resProfesores.json();

      if (!resDisponibilidades.ok) {
        throw new Error(
          obtenerMensajeErrorServidor(
            dataDisponibilidades,
            "No se pudieron cargar las disponibilidades"
          )
        );
      }

      if (!resProfesores.ok) {
        throw new Error(
          obtenerMensajeErrorServidor(
            dataProfesores,
            "No se pudieron cargar los profesores"
          )
        );
      }

      setDisponibilidades(dataDisponibilidades.data || []);
      setProfesores(dataProfesores.data || []);
    } catch (errorCarga) {
      setError(errorCarga.message || "Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(cargarDatos);
  }, [cargarDatos]);

  const profesoresOrdenados = useMemo(() => {
    return [...profesores].sort((a, b) => {
      const nombreA = `${a.apellido || ""} ${a.nombre || ""}`;
      const nombreB = `${b.apellido || ""} ${b.nombre || ""}`;

      return nombreA.localeCompare(nombreB, "es");
    });
  }, [profesores]);

  const disponibilidadesFiltradas = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return disponibilidades.filter((disponibilidad) => {
      const nombreProfesor = obtenerNombreProfesor(disponibilidad).toLowerCase();
      const rutProfesor = disponibilidad.profesor?.rut?.toLowerCase() || "";

      const coincideBusqueda =
        !textoBusqueda ||
        nombreProfesor.includes(textoBusqueda) ||
        rutProfesor.includes(textoBusqueda);

      const coincideProfesor =
        filtroProfesor === "Todos" ||
        String(disponibilidad.id_profesor) === String(filtroProfesor);

      const coincideDia =
        filtroDia === "Todos" || disponibilidad.dia_semana === filtroDia;

      const coincideSede =
        filtroSede === "Todas" || disponibilidad.sede === filtroSede;

      return coincideBusqueda && coincideProfesor && coincideDia && coincideSede;
    });
  }, [busqueda, disponibilidades, filtroDia, filtroProfesor, filtroSede]);

  function validarFormulario() {
    if (!formulario.id_profesor) {
      return "Debe seleccionar un profesor.";
    }

    if (!formulario.dia_semana) {
      return "Debe seleccionar un día.";
    }

    if (!formulario.hora_inicio) {
      return "Debe ingresar la hora de inicio.";
    }

    if (!formulario.hora_fin) {
      return "Debe ingresar la hora de término.";
    }

    if (
      convertirHoraAMinutos(formulario.hora_fin) <=
      convertirHoraAMinutos(formulario.hora_inicio)
    ) {
      return "La hora de término debe ser mayor que la hora de inicio.";
    }

    if (!formulario.sede) {
      return "Debe seleccionar una sede.";
    }

    return null;
  }

  function limpiarFormulario() {
    setFormulario(FORMULARIO_INICIAL);
    setDisponibilidadEditando(null);
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function editarDisponibilidad(disponibilidad) {
    setDisponibilidadEditando(disponibilidad);
    setMensaje("");
    setError("");
    setFormulario({
      id_profesor: String(disponibilidad.id_profesor || ""),
      dia_semana: disponibilidad.dia_semana || "Lunes",
      hora_inicio: formatearHoraVisual(disponibilidad.hora_inicio),
      hora_fin: formatearHoraVisual(disponibilidad.hora_fin),
      sede: disponibilidad.sede || "Sede Concepcion",
      estado: disponibilidad.estado || "Activa",
    });
  }

  async function guardarDisponibilidad(evento) {
    evento.preventDefault();
    setMensaje("");
    setError("");

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setGuardando(true);

    const payload = {
      id_profesor: Number(formulario.id_profesor),
      dia_semana: formulario.dia_semana,
      hora_inicio: formulario.hora_inicio,
      hora_fin: formulario.hora_fin,
      sede: formulario.sede,
      estado: formulario.estado,
    };

    const url = disponibilidadEditando
      ? `${import.meta.env.VITE_BASE_URL}/disponibilidad-profesores/${disponibilidadEditando.id_disponibilidad}`
      : `${import.meta.env.VITE_BASE_URL}/disponibilidad-profesores`;

    try {
      const response = await apiFetch(url, {
        method: disponibilidadEditando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeErrorServidor(
            data,
            "No se pudo guardar la disponibilidad"
          )
        );
      }

      setMensaje(
        disponibilidadEditando
          ? "Disponibilidad actualizada correctamente."
          : "Disponibilidad creada correctamente."
      );
      limpiarFormulario();
      await cargarDatos();
    } catch (errorGuardar) {
      setError(
        errorGuardar.message || "No se pudo guardar la disponibilidad."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoDisponibilidad(disponibilidad) {
    const nuevoEstado =
      disponibilidad.estado === "Activa" ? "Inactiva" : "Activa";

    setActualizandoId(disponibilidad.id_disponibilidad);
    setMensaje("");
    setError("");

    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/disponibilidad-profesores/${disponibilidad.id_disponibilidad}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeErrorServidor(
            data,
            "No se pudo cambiar el estado de la disponibilidad"
          )
        );
      }

      setMensaje(`Disponibilidad marcada como ${nuevoEstado}.`);
      await cargarDatos();
    } catch (errorEstado) {
      setError(
        errorEstado.message || "No se pudo cambiar el estado de la disponibilidad."
      );
    } finally {
      setActualizandoId(null);
    }
  }

  function obtenerClaseEstado(estado) {
    if (estado === "Activa") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Disponibilidad de profesores
          </h1>
          <p className="text-slate-500 mt-1">
            Define los bloques horarios en que cada profesor puede tomar clases.
          </p>
        </div>
      </div>

      {(mensaje || error) && (
        <div
          className={`p-4 rounded-lg border text-sm font-medium ${
            error
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {error || mensaje}
        </div>
      )}

      <form
        onSubmit={guardarDisponibilidad}
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {disponibilidadEditando
                ? "Editar disponibilidad"
                : "Nueva disponibilidad"}
            </h2>
            <p className="text-sm text-slate-500">
              No se permitirán bloques activos solapados para el mismo profesor,
              día y sede.
            </p>
          </div>

          {disponibilidadEditando && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Profesor
            </label>
            <select
              name="id_profesor"
              value={formulario.id_profesor}
              onChange={manejarCambio}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            >
              <option value="">Seleccione un profesor</option>
              {profesoresOrdenados.map((profesor) => (
                <option key={profesor.id_profesor} value={profesor.id_profesor}>
                  {profesor.nombre} {profesor.apellido} - {profesor.rut}
                  {profesor.estado ? "" : " (inactivo)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Día
            </label>
            <select
              name="dia_semana"
              value={formulario.dia_semana}
              onChange={manejarCambio}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            >
              {DIAS_SEMANA.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sede
            </label>
            <select
              name="sede"
              value={formulario.sede}
              onChange={manejarCambio}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            >
              {SEDES.map((sede) => (
                <option key={sede} value={sede}>
                  {sede}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hora inicio
            </label>
            <input
              type="time"
              name="hora_inicio"
              value={formulario.hora_inicio}
              onChange={manejarCambio}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hora término
            </label>
            <input
              type="time"
              name="hora_fin"
              value={formulario.hora_fin}
              onChange={manejarCambio}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Estado
            </label>
            <select
              name="estado"
              value={formulario.estado}
              onChange={manejarCambio}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
              guardando
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {guardando
              ? "Guardando..."
              : disponibilidadEditando
                ? "Guardar cambios"
                : "Crear disponibilidad"}
          </button>
        </div>
      </form>

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Disponibilidades registradas
              </h2>
              <p className="text-sm text-slate-500">
                {disponibilidadesFiltradas.length} resultado(s)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por profesor o RUT"
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />

            <select
              value={filtroProfesor}
              onChange={(evento) => setFiltroProfesor(evento.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="Todos">Todos los profesores</option>
              {profesoresOrdenados.map((profesor) => (
                <option key={profesor.id_profesor} value={profesor.id_profesor}>
                  {profesor.nombre} {profesor.apellido}
                </option>
              ))}
            </select>

            <select
              value={filtroDia}
              onChange={(evento) => setFiltroDia(evento.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="Todos">Todos los días</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>

            <select
              value={filtroSede}
              onChange={(evento) => setFiltroSede(evento.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="Todas">Todas las sedes</option>
              {SEDES.map((sede) => (
                <option key={sede} value={sede}>
                  {sede}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando disponibilidades...
          </div>
        ) : disponibilidadesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay disponibilidades registradas con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Profesor</th>
                  <th className="text-left px-6 py-3 font-semibold">Día</th>
                  <th className="text-left px-6 py-3 font-semibold">Horario</th>
                  <th className="text-left px-6 py-3 font-semibold">Sede</th>
                  <th className="text-left px-6 py-3 font-semibold">Estado</th>
                  <th className="text-right px-6 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disponibilidadesFiltradas.map((disponibilidad) => (
                  <tr
                    key={disponibilidad.id_disponibilidad}
                    className="hover:bg-slate-50 align-middle"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {obtenerNombreProfesor(disponibilidad)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {disponibilidad.profesor?.rut || "RUT no disponible"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {disponibilidad.dia_semana}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatearHoraVisual(disponibilidad.hora_inicio)} -{" "}
                      {formatearHoraVisual(disponibilidad.hora_fin)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {disponibilidad.sede}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstado(disponibilidad.estado)}`}
                      >
                        {disponibilidad.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editarDisponibilidad(disponibilidad)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            cambiarEstadoDisponibilidad(disponibilidad)
                          }
                          disabled={
                            actualizandoId === disponibilidad.id_disponibilidad
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                            disponibilidad.estado === "Activa"
                              ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                              : "text-green-700 bg-green-50 hover:bg-green-100"
                          } disabled:opacity-60`}
                        >
                          {actualizandoId === disponibilidad.id_disponibilidad
                            ? "Actualizando..."
                            : disponibilidad.estado === "Activa"
                              ? "Inactivar"
                              : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default VistaDisponibilidadProfesores;
