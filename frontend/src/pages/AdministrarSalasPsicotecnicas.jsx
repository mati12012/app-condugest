import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const estadoInicialFormulario = {
  nombre: "",
  sede: "",
  capacidad: "",
  estado: true,
};

function AdministrarSalasPsicotecnicas() {
  const [salas, setSalas] = useState([]);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSalaEditando, setIdSalaEditando] = useState(null);

  const [filtroSalas, setFiltroSalas] = useState("activas");

  async function requestApi(endpoint, options = {}) {
    const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const contentType = respuesta.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `La API no devolvió JSON. Revisa la URL: ${API_BASE_URL}${endpoint}`
      );
    }

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || "Ocurrió un error en la solicitud");
    }

    return data;
  }

  async function cargarSalas() {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await requestApi("/salas-psicotecnicas");
      setSalas(respuesta.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarSalas();
  }, []);

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario({
      ...formulario,
      [name]: name === "estado" ? value === "true" : value,
    });
  }

  function limpiarFormulario() {
    setFormulario(estadoInicialFormulario);
    setModoEdicion(false);
    setIdSalaEditando(null);
  }

  async function guardarSala(evento) {
    evento.preventDefault();

    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const body = {
        nombre: formulario.nombre,
        sede: formulario.sede,
        capacidad: Number(formulario.capacidad),
        estado: Boolean(formulario.estado),
      };

      let respuesta;

      if (modoEdicion) {
        respuesta = await requestApi(`/salas-psicotecnicas/${idSalaEditando}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        respuesta = await requestApi("/salas-psicotecnicas", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setMensaje(
        respuesta.message ||
          (modoEdicion
            ? "Sala actualizada exitosamente"
            : "Sala creada exitosamente")
      );

      limpiarFormulario();
      await cargarSalas();
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  function prepararEdicion(sala) {
    setModoEdicion(true);
    setIdSalaEditando(sala.id_sala);

    setFormulario({
      nombre: sala.nombre,
      sede: sala.sede,
      capacidad: sala.capacidad,
      estado: sala.estado,
    });

    setMensaje("");
    setError("");
  }

  async function cambiarEstadoSala(sala) {
  const nuevoEstado = !sala.estado;

  setError("");
  setMensaje("");

  if (!nuevoEstado) {
    try {
      const respuestaReservas = await requestApi("/reservas-salas");

      const reservasBloqueantes = (respuestaReservas.data || []).filter(
        (reserva) =>
          Number(reserva.id_sala) === Number(sala.id_sala) &&
          (reserva.estado === "reservada" || reserva.estado === "pendiente")
      );

      if (reservasBloqueantes.length > 0) {
        setError(
          `No se puede desactivar esta sala porque tiene ${reservasBloqueantes.length} reserva(s) activa(s) o pendiente(s). Cancela o finaliza esas reservas primero.`
        );
        return;
      }
    } catch (error) {
      setError(`No se pudo verificar reservas asociadas: ${error.message}`);
      return;
    }
  }

  const confirmar = window.confirm(
    nuevoEstado
      ? "¿Seguro que deseas activar esta sala?"
      : "¿Seguro que deseas desactivar esta sala? No podrá usarse para nuevas reservas."
  );

  if (!confirmar) return;

  setCargando(true);
  setError("");
  setMensaje("");

  try {
    const respuesta = await requestApi(`/salas-psicotecnicas/${sala.id_sala}`, {
      method: "PATCH",
      body: JSON.stringify({
        estado: nuevoEstado,
      }),
    });

    setMensaje(respuesta.message || "Estado de sala actualizado");
    await cargarSalas();
  } catch (error) {
    setError(error.message);
  } finally {
    setCargando(false);
  }
}

  const salasFiltradas = salas.filter((sala) => {
    if (filtroSalas === "activas") {
      return sala.estado === true;
    }

    if (filtroSalas === "inactivas") {
      return sala.estado === false;
    }

    return true;
  });

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={guardarSala}
          className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            {modoEdicion ? "Editar sala" : "Nueva sala psicotécnica"}
          </h2>

          <p className="text-sm text-slate-500 mb-4">
            {modoEdicion
              ? "Modifica los datos de la sala seleccionada."
              : "Registra una nueva sala disponible para Secretaría."}
          </p>

          {mensaje && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Nombre de la sala
              </label>
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Sala Psicotecnica 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Sede
              </label>
              <input
                type="text"
                name="sede"
                value={formulario.sede}
                onChange={manejarCambio}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Sede Concepcion"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Capacidad
              </label>
              <input
                type="number"
                name="capacidad"
                min="1"
                value={formulario.capacidad}
                onChange={manejarCambio}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={String(formulario.estado)}
                onChange={manejarCambio}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {cargando
                  ? "Procesando..."
                  : modoEdicion
                  ? "Guardar cambios"
                  : "Crear sala"}
              </button>

              {modoEdicion && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Salas registradas
              </h2>

              <p className="text-sm text-slate-500">
                {filtroSalas === "activas"
                  ? "Salas disponibles para nuevas reservas."
                  : filtroSalas === "inactivas"
                  ? "Salas desactivadas o fuera de uso."
                  : "Listado completo de salas psicotécnicas."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroSalas("activas")}
                className={`rounded-lg px-3 py-2 text-sm font-medium border ${
                  filtroSalas === "activas"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Activas
              </button>

              <button
                type="button"
                onClick={() => setFiltroSalas("inactivas")}
                className={`rounded-lg px-3 py-2 text-sm font-medium border ${
                  filtroSalas === "inactivas"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Inactivas
              </button>

              <button
                type="button"
                onClick={() => setFiltroSalas("todas")}
                className={`rounded-lg px-3 py-2 text-sm font-medium border ${
                  filtroSalas === "todas"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Todas
              </button>

              <button
                type="button"
                onClick={cargarSalas}
                disabled={cargando}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Actualizar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Nombre</th>
                  <th className="px-3 py-3">Sede</th>
                  <th className="px-3 py-3">Capacidad</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {salasFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      No hay salas para mostrar.
                    </td>
                  </tr>
                ) : (
                  salasFiltradas.map((sala) => (
                    <tr
                      key={sala.id_sala}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="px-3 py-3 text-slate-500">
                        {sala.id_sala}
                      </td>

                      <td className="px-3 py-3 font-medium text-slate-700">
                        {sala.nombre}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {sala.sede}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {sala.capacidad}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            sala.estado
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sala.estado ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => prepararEdicion(sala)}
                            className="rounded-lg border border-blue-300 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => cambiarEstadoSala(sala)}
                            className={`rounded-lg border px-3 py-1 text-xs ${
                              sala.estado
                                ? "border-red-300 text-red-600 hover:bg-red-50"
                                : "border-green-300 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {sala.estado ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Mostrando: {salasFiltradas.length} de {salas.length} salas
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdministrarSalasPsicotecnicas;