import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";

const ESTADOS_MATRICULA = [
  "Activa",
  "Finalizada",
  "Suspendida",
  "Anulada",
];

const formularioInicial = {
  id_alumno: "",
  id_plan: "",
};

function formatearPesos(valor) {
  const valorNumerico = Number(valor);

  if (!Number.isFinite(valorNumerico)) {
    return "$0";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valorNumerico);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha));
}

function obtenerClaseEstado(estado) {
  if (estado === "Activa") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (estado === "Finalizada") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (estado === "Suspendida") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (estado === "Anulada") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function obtenerMensajeError(data, mensajeFallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  return data?.message || mensajeFallback;
}

function obtenerNombreAlumno(alumno) {
  return `${alumno.nombre || ""} ${alumno.apellido || ""}`.trim();
}

function VistaMatriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoFormulario, setCargandoFormulario] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);

  async function obtenerMatriculas() {
    try {
      setCargando(true);
      setError("");

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/matriculas`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudieron obtener las matriculas");
      }

      setMatriculas(data.data || []);
    } catch (error) {
      setError(error.message || "Error de conexion con el servidor");
    } finally {
      setCargando(false);
    }
  }

  async function obtenerDatosFormulario() {
    try {
      setCargandoFormulario(true);

      const [respuestaAlumnos, respuestaPlanes] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_BASE_URL}/alumnos`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/planes`),
      ]);

      const dataAlumnos = await respuestaAlumnos.json();
      const dataPlanes = await respuestaPlanes.json();

      if (!respuestaAlumnos.ok) {
        throw new Error(dataAlumnos.message || "No se pudieron cargar los alumnos");
      }

      if (!respuestaPlanes.ok) {
        throw new Error(dataPlanes.message || "No se pudieron cargar los planes");
      }

      setAlumnos(dataAlumnos.data || []);
      setPlanes(dataPlanes.data || []);
    } catch (error) {
      setError(error.message || "Error al cargar alumnos y planes");
    } finally {
      setCargandoFormulario(false);
    }
  }

  useEffect(() => {
    obtenerMatriculas();
    obtenerDatosFormulario();
  }, []);

  const planesActivos = useMemo(() => {
    return planes.filter((plan) => plan.estado === "Activo");
  }, [planes]);

  const matriculasFiltradas = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return matriculas.filter((matricula) => {
      const alumno = `${matricula.alumno_nombre || ""} ${matricula.alumno_apellido || ""}`.toLowerCase();
      const rut = matricula.alumno_rut?.toLowerCase() || "";
      const plan = matricula.plan_nombre?.toLowerCase() || "";

      const coincideBusqueda =
        !textoBusqueda ||
        alumno.includes(textoBusqueda) ||
        rut.includes(textoBusqueda) ||
        plan.includes(textoBusqueda);

      const coincideEstado =
        filtroEstado === "Todos" || matricula.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtroEstado, matriculas]);

  const totalMatriculas = matriculas.length;
  const totalActivas = matriculas.filter((matricula) => matricula.estado === "Activa").length;
  const totalFinalizadas = matriculas.filter((matricula) => matricula.estado === "Finalizada").length;
  const totalSuspendidas = matriculas.filter((matricula) => matricula.estado === "Suspendida").length;

  function abrirFormularioCrear() {
    setFormulario(formularioInicial);
    setFormularioVisible(true);
    setErrorFormulario("");
    setMensaje("");
  }

  function cerrarFormulario() {
    if (guardando) return;

    setFormularioVisible(false);
    setFormulario(formularioInicial);
    setErrorFormulario("");
  }

  function manejarCambioFormulario(evento) {
    const { name, value } = evento.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  }

  async function guardarMatricula(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setErrorFormulario("");
      setMensaje("");

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/matriculas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_alumno: Number(formulario.id_alumno),
          id_plan: Number(formulario.id_plan),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(data, "No se pudo crear la matricula")
        );
      }

      await obtenerMatriculas();
      cerrarFormulario();
      setMensaje("Matricula creada exitosamente.");
    } catch (error) {
      setErrorFormulario(error.message || "No se pudo crear la matricula");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoMatricula(matricula, nuevoEstado) {
    if (!matricula?.id_matricula || matricula.estado === nuevoEstado) return;

    try {
      setActualizandoId(matricula.id_matricula);
      setError("");
      setMensaje("");

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/matriculas/${matricula.id_matricula}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(data, "No se pudo actualizar el estado")
        );
      }

      const matriculaActualizada = data.data || {
        ...matricula,
        estado: nuevoEstado,
      };

      setMatriculas((matriculasActuales) =>
        matriculasActuales.map((item) =>
          item.id_matricula === matricula.id_matricula
            ? { ...item, ...matriculaActualizada }
            : item
        )
      );
      setMensaje("Estado de la matricula actualizado exitosamente.");
    } catch (error) {
      setError(error.message || "No se pudo actualizar el estado");
    } finally {
      setActualizandoId(null);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Matriculas
          </h1>
          <p className="text-slate-500">
            Administra los planes contratados por alumnos y su estado academico.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={obtenerMatriculas}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
          >
            Actualizar
          </button>

          <button
            type="button"
            onClick={abrirFormularioCrear}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            + Nueva Matricula
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total matriculas</p>
          <p className="text-3xl font-bold text-slate-800">{totalMatriculas}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Activas</p>
          <p className="text-3xl font-bold text-green-600">{totalActivas}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Finalizadas</p>
          <p className="text-3xl font-bold text-blue-600">{totalFinalizadas}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Suspendidas</p>
          <p className="text-3xl font-bold text-yellow-600">{totalSuspendidas}</p>
        </div>
      </div>

      {mensaje && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {formularioVisible && (
        <form
          onSubmit={guardarMatricula}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Nueva matricula
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Selecciona un alumno y un plan activo. Las clases y el valor se copiaran desde el plan.
              </p>
            </div>

            <button
              type="button"
              onClick={cerrarFormulario}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>

          {errorFormulario && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm">
              {errorFormulario}
            </div>
          )}

          {cargandoFormulario ? (
            <div className="p-6 text-center text-slate-500">
              Cargando alumnos y planes...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alumno
                  </label>
                  <select
                    name="id_alumno"
                    value={formulario.id_alumno}
                    onChange={manejarCambioFormulario}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">Seleccione un alumno</option>
                    {alumnos.map((alumno) => (
                      <option key={alumno.id_alumno} value={alumno.id_alumno}>
                        {obtenerNombreAlumno(alumno)} - {alumno.rut}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Plan
                  </label>
                  <select
                    name="id_plan"
                    value={formulario.id_plan}
                    onChange={manejarCambioFormulario}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">Seleccione un plan activo</option>
                    {planesActivos.map((plan) => (
                      <option key={plan.id_plan} value={plan.id_plan}>
                        {plan.nombre} - {formatearPesos(plan.valor)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {planesActivos.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                  No hay planes activos disponibles para matricular.
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={guardando || planesActivos.length === 0}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {guardando ? "Guardando..." : "Crear matricula"}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <input
              type="text"
              placeholder="Buscar por alumno, RUT o plan..."
              className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              {["Todos", ...ESTADOS_MATRICULA].map((estado) => {
                const activo = filtroEstado === estado;

                return (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => setFiltroEstado(estado)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      activo
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {estado}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando matriculas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">Alumno</th>
                  <th className="p-4 font-bold">Plan contratado</th>
                  <th className="p-4 font-bold">Clases</th>
                  <th className="p-4 font-bold">Valor total</th>
                  <th className="p-4 font-bold">Fecha</th>
                  <th className="p-4 font-bold">Estado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {matriculasFiltradas.map((matricula) => (
                  <tr
                    key={matricula.id_matricula}
                    className="hover:bg-slate-50 align-top"
                  >
                    <td className="p-4 min-w-56">
                      <p className="font-bold text-slate-800">
                        {matricula.alumno_nombre} {matricula.alumno_apellido}
                      </p>
                      <p className="text-sm text-slate-500 font-mono">
                        {matricula.alumno_rut}
                      </p>
                      <p className="text-sm text-slate-500 break-all">
                        {matricula.alumno_correo}
                      </p>
                    </td>

                    <td className="p-4 min-w-56">
                      <p className="font-semibold text-slate-800">
                        {matricula.plan_nombre || "Plan no disponible"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {matricula.plan_tipo || "Sin tipo"}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-slate-700 min-w-40">
                      <p>
                        Practicas:{" "}
                        <span className="font-bold">
                          {matricula.cantidad_clases_practicas}
                        </span>
                      </p>
                      <p className="mt-1">
                        Teoricas:{" "}
                        <span className="font-bold">
                          {matricula.cantidad_clases_teoricas}
                        </span>
                      </p>
                    </td>

                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      {formatearPesos(matricula.valor_total)}
                    </td>

                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatearFecha(matricula.fecha_matricula)}
                    </td>

                    <td className="p-4 min-w-44">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstado(matricula.estado)}`}>
                        {matricula.estado}
                      </span>

                      <select
                        className="mt-2 block w-full max-w-[170px] px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={matricula.estado}
                        disabled={actualizandoId === matricula.id_matricula}
                        onChange={(e) => cambiarEstadoMatricula(matricula, e.target.value)}
                      >
                        {ESTADOS_MATRICULA.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!error && matriculasFiltradas.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                {matriculas.length === 0
                  ? "Aun no hay matriculas registradas."
                  : "No se encontraron matriculas con los filtros aplicados."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VistaMatriculas;
