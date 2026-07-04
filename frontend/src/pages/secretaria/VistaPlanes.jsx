import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";

const TIPOS_PLAN = ["Plan", "Clase adicional", "Extensión"];
const ESTADOS_PLAN = ["Activo", "Inactivo"];

const formularioInicial = {
  nombre: "",
  descripcion: "",
  cantidad_clases_practicas: 0,
  cantidad_clases_teoricas: 0,
  valor: 0,
  tipo: "Plan",
  estado: "Activo",
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

function obtenerClaseEstado(estado) {
  if (estado === "Activo") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (estado === "Inactivo") {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function obtenerMensajeError(data, mensajeFallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  return data?.message || mensajeFallback;
}

function VistaPlanes() {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [planEditando, setPlanEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  async function obtenerPlanes() {
    try {
      setCargando(true);
      setError("");

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/planes`);
      const respuestaServidor = await response.json();

      if (!response.ok) {
        throw new Error(
          respuestaServidor.message || "No se pudieron obtener los planes"
        );
      }

      setPlanes(respuestaServidor.data || []);
    } catch (error) {
      setError(error.message || "Error de conexion con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    obtenerPlanes();
  }, []);

  const planesFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return planes.filter((plan) => {
      const nombre = plan.nombre?.toLowerCase() || "";
      const tipo = plan.tipo?.toLowerCase() || "";

      const coincideBusqueda =
        !textoBusqueda ||
        nombre.includes(textoBusqueda) ||
        tipo.includes(textoBusqueda);

      const coincideEstado =
        filtroEstado === "Todos" || plan.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtroEstado, planes]);

  const totalPlanes = planes.length;
  const totalActivos = planes.filter((plan) => plan.estado === "Activo").length;
  const totalInactivos = planes.filter((plan) => plan.estado === "Inactivo").length;

  function abrirFormularioCrear() {
    setFormulario(formularioInicial);
    setPlanEditando(null);
    setFormularioVisible(true);
    setErrorFormulario("");
    setMensaje("");
  }

  function abrirFormularioEditar(plan) {
    setFormulario({
      nombre: plan.nombre || "",
      descripcion: plan.descripcion || "",
      cantidad_clases_practicas: plan.cantidad_clases_practicas ?? 0,
      cantidad_clases_teoricas: plan.cantidad_clases_teoricas ?? 0,
      valor: plan.valor ?? 0,
      tipo: plan.tipo || "Plan",
      estado: plan.estado || "Activo",
    });
    setPlanEditando(plan);
    setFormularioVisible(true);
    setErrorFormulario("");
    setMensaje("");
  }

  function cerrarFormulario() {
    setFormularioVisible(false);
    setPlanEditando(null);
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

  function crearPayloadPlan() {
    return {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      cantidad_clases_practicas: Number(formulario.cantidad_clases_practicas),
      cantidad_clases_teoricas: Number(formulario.cantidad_clases_teoricas),
      valor: Number(formulario.valor),
      tipo: formulario.tipo,
      estado: formulario.estado,
    };
  }

  async function guardarPlan(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setErrorFormulario("");
      setMensaje("");

      const payload = crearPayloadPlan();
      const esEdicion = Boolean(planEditando);
      const url = esEdicion
        ? `${import.meta.env.VITE_BASE_URL}/planes/${planEditando.id_plan}`
        : `${import.meta.env.VITE_BASE_URL}/planes`;

      const response = await apiFetch(url, {
        method: esEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const respuestaServidor = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(respuestaServidor, "No se pudo guardar el plan")
        );
      }

      await obtenerPlanes();
      cerrarFormulario();
      setMensaje(esEdicion ? "Plan actualizado exitosamente." : "Plan creado exitosamente.");
    } catch (error) {
      setErrorFormulario(error.message || "No se pudo guardar el plan");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoPlan(plan) {
    const nuevoEstado = plan.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      setMensaje("");
      setError("");

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/planes/${plan.id_plan}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const respuestaServidor = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(respuestaServidor, "No se pudo cambiar el estado del plan")
        );
      }

      const planActualizado = respuestaServidor.data || {
        ...plan,
        estado: nuevoEstado,
      };

      setPlanes((planesActuales) =>
        planesActuales.map((item) =>
          item.id_plan === plan.id_plan ? planActualizado : item
        )
      );
      setMensaje(`Plan ${nuevoEstado === "Activo" ? "activado" : "inactivado"} exitosamente.`);
    } catch (error) {
      setError(error.message || "No se pudo cambiar el estado del plan");
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Gestion de Planes
          </h1>
          <p className="text-slate-500">
            Administra planes, clases adicionales y extensiones visibles para alumnos.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirFormularioCrear}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          + Nuevo Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total planes</p>
          <p className="text-3xl font-bold text-slate-800">{totalPlanes}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Activos</p>
          <p className="text-3xl font-bold text-green-600">{totalActivos}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Inactivos</p>
          <p className="text-3xl font-bold text-slate-600">{totalInactivos}</p>
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
          onSubmit={guardarPlan}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {planEditando ? "Editar plan" : "Nuevo plan"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Completa los datos que se mostraran en la gestion interna y, si esta activo, en la vista publica.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambioFormulario}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Ej: Plan licencia clase B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo
              </label>
              <select
                name="tipo"
                value={formulario.tipo}
                onChange={manejarCambioFormulario}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {TIPOS_PLAN.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripcion
              </label>
              <textarea
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCambioFormulario}
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Describe el objetivo del plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clases practicas
              </label>
              <input
                type="number"
                name="cantidad_clases_practicas"
                min="0"
                value={formulario.cantidad_clases_practicas}
                onChange={manejarCambioFormulario}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clases teoricas
              </label>
              <input
                type="number"
                name="cantidad_clases_teoricas"
                min="0"
                value={formulario.cantidad_clases_teoricas}
                onChange={manejarCambioFormulario}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor
              </label>
              <input
                type="number"
                name="valor"
                min="0"
                value={formulario.valor}
                onChange={manejarCambioFormulario}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formulario.estado}
                onChange={manejarCambioFormulario}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {ESTADOS_PLAN.map((estado) => (
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
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {guardando ? "Guardando..." : planEditando ? "Guardar cambios" : "Crear plan"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {["Todos", ...ESTADOS_PLAN].map((estado) => {
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

        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando planes...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">Plan</th>
                  <th className="p-4 font-bold">Clases</th>
                  <th className="p-4 font-bold">Valor</th>
                  <th className="p-4 font-bold">Tipo</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {planesFiltrados.map((plan) => (
                  <tr key={plan.id_plan} className="hover:bg-slate-50 align-top">
                    <td className="p-4 min-w-72">
                      <p className="font-bold text-slate-800">{plan.nombre}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {plan.descripcion || "Sin descripcion registrada"}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-slate-700 min-w-44">
                      <p>
                        Practicas:{" "}
                        <span className="font-bold">
                          {plan.cantidad_clases_practicas}
                        </span>
                      </p>
                      <p className="mt-1">
                        Teoricas:{" "}
                        <span className="font-bold">
                          {plan.cantidad_clases_teoricas}
                        </span>
                      </p>
                    </td>

                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      {formatearPesos(plan.valor)}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        {plan.tipo}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstado(plan.estado)}`}>
                        {plan.estado}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <button
                          type="button"
                          onClick={() => abrirFormularioEditar(plan)}
                          className="text-amber-600 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => cambiarEstadoPlan(plan)}
                          className={`hover:underline text-sm font-medium ${
                            plan.estado === "Activo"
                              ? "text-slate-600"
                              : "text-green-600"
                          }`}
                        >
                          {plan.estado === "Activo" ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!error && planesFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                {planes.length === 0
                  ? "Aun no hay planes registrados. Crea el primer plan para comenzar."
                  : "No se encontraron planes con los filtros aplicados."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VistaPlanes;
