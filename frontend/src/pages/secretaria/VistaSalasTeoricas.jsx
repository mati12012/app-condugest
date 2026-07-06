import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";

const formularioInicial = {
  nombre: "",
  sede: "Sede Concepcion",
  capacidad: "",
  estado: "Activa",
  observacion: "",
};

const sedes = ["Sede Concepcion", "Sede San Pedro", "Sede Penco"];

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  if (typeof data?.errorDetails === "string") {
    return data.errorDetails;
  }

  return data?.message || fallback;
}

function obtenerClaseEstado(estado) {
  if (estado === "Activa") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

function VistaSalasTeoricas() {
  const [salas, setSalas] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [salaEditando, setSalaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarSalas = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/salas-teoricas`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudieron cargar las salas teoricas."));
      }

      setSalas(data.data || []);
    } catch (errorCarga) {
      setError(errorCarga.message || "No se pudieron cargar las salas teoricas.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(cargarSalas);
  }, [cargarSalas]);

  const salasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return salas.filter((sala) => {
      const coincideBusqueda = !texto
        || (sala.nombre || "").toLowerCase().includes(texto)
        || (sala.sede || "").toLowerCase().includes(texto);
      const coincideEstado = filtroEstado === "Todas" || sala.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtroEstado, salas]);

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setSalaEditando(null);
    setMensaje("");
    setError("");
  }

  function editarSala(sala) {
    setSalaEditando(sala);
    setFormulario({
      nombre: sala.nombre || "",
      sede: sala.sede || "Sede Concepcion",
      capacidad: sala.capacidad || "",
      estado: sala.estado || "Activa",
      observacion: sala.observacion || "",
    });
    setMensaje("");
    setError("");
  }

  async function guardarSala(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      if (!formulario.nombre.trim()) {
        throw new Error("El nombre de la sala es obligatorio.");
      }

      if (!formulario.sede.trim()) {
        throw new Error("La sede es obligatoria.");
      }

      if (!Number(formulario.capacidad) || Number(formulario.capacidad) <= 0) {
        throw new Error("La capacidad debe ser mayor a 0.");
      }

      const payload = {
        ...formulario,
        capacidad: Number(formulario.capacidad),
        observacion: formulario.observacion.trim() || null,
      };

      const url = salaEditando
        ? `${import.meta.env.VITE_BASE_URL}/salas-teoricas/${salaEditando.id_sala_teorica}`
        : `${import.meta.env.VITE_BASE_URL}/salas-teoricas`;
      const method = salaEditando ? "PATCH" : "POST";
      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo guardar la sala teorica."));
      }

      setMensaje(salaEditando ? "Sala teorica actualizada." : "Sala teorica creada.");
      setFormulario(formularioInicial);
      setSalaEditando(null);
      await cargarSalas();
    } catch (errorGuardado) {
      setError(errorGuardado.message || "No se pudo guardar la sala teorica.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoSala(sala) {
    const nuevoEstado = sala.estado === "Activa" ? "Inactiva" : "Activa";

    try {
      setError("");
      setMensaje("");

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/salas-teoricas/${sala.id_sala_teorica}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo cambiar el estado de la sala."));
      }

      setMensaje(`Sala ${nuevoEstado.toLowerCase()} correctamente.`);
      await cargarSalas();
    } catch (errorEstado) {
      setError(errorEstado.message || "No se pudo cambiar el estado de la sala.");
    }
  }

  const totalActivas = salas.filter((sala) => sala.estado === "Activa").length;
  const totalInactivas = salas.filter((sala) => sala.estado === "Inactiva").length;

  if (cargando) {
    return <div className="p-8 text-center text-slate-500">Cargando salas teoricas...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Salas teoricas</h1>
          <p className="text-slate-500">Administra salas disponibles para clases presenciales e hibridas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total salas</p>
          <p className="text-3xl font-bold text-slate-800">{salas.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Activas</p>
          <p className="text-3xl font-bold text-emerald-600">{totalActivas}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Inactivas</p>
          <p className="text-3xl font-bold text-slate-500">{totalInactivas}</p>
        </div>
      </div>

      {mensaje && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-semibold">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={guardarSala} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {salaEditando ? "Editar sala" : "Nueva sala teorica"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              No ingreses codigos internos; el sistema los gestiona automaticamente.
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Nombre</span>
            <input
              type="text"
              value={formulario.nombre}
              onChange={(evento) => actualizarCampo("nombre", evento.target.value)}
              placeholder="Sala teorica A"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Sede</span>
            <select
              value={formulario.sede}
              onChange={(evento) => actualizarCampo("sede", evento.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sedes.map((sede) => (
                <option key={sede} value={sede}>{sede}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Capacidad</span>
            <input
              type="number"
              min="1"
              value={formulario.capacidad}
              onChange={(evento) => actualizarCampo("capacidad", evento.target.value)}
              placeholder="25"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-400">Debe ser mayor a 0.</span>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Estado</span>
            <select
              value={formulario.estado}
              onChange={(evento) => actualizarCampo("estado", evento.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Observacion</span>
            <textarea
              value={formulario.observacion}
              onChange={(evento) => actualizarCampo("observacion", evento.target.value)}
              rows={3}
              placeholder="Equipamiento, proyector o notas internas"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardando ? "Guardando..." : salaEditando ? "Guardar cambios" : "Crear sala"}
            </button>
            {salaEditando && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                Cancelar edicion
              </button>
            )}
          </div>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <input
              type="text"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre o sede..."
              className="w-full md:max-w-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filtroEstado}
              onChange={(evento) => setFiltroEstado(evento.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todas">Todas</option>
              <option value="Activa">Activas</option>
              <option value="Inactiva">Inactivas</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 font-bold">Sala</th>
                  <th className="p-4 font-bold">Sede</th>
                  <th className="p-4 font-bold">Capacidad</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salasFiltradas.map((sala) => (
                  <tr key={sala.id_sala_teorica} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{sala.nombre}</p>
                      {sala.observacion && (
                        <p className="text-xs text-slate-500 mt-1">{sala.observacion}</p>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">{sala.sede}</td>
                    <td className="p-4 font-semibold text-slate-700">{sala.capacidad} personas</td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseEstado(sala.estado)}`}>
                        {sala.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <button
                          type="button"
                          onClick={() => editarSala(sala)}
                          className="text-amber-600 hover:underline font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarEstadoSala(sala)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {sala.estado === "Activa" ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {salasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No hay salas teoricas para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VistaSalasTeoricas;
