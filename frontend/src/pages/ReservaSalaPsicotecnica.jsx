import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
// Estado inicial para el formulario de reserva
const estadoInicialFormulario = {
    id_sala: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    cantidad_alumnos: "",
    estado: "reservada",
    observacion: "",
};

function ReservaSalaPsicotecnica() {

    const [salas, setSalas] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [formulario, setFormulario] = useState(estadoInicialFormulario);

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [filtroReservas, setFiltroReservas] = useState("activas");
    // Función genérica para hacer solicitudes a la API
    async function requestApi(endpoint, options = {}) {
        const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.message || "Ocurrió un error en la solicitud");
        }

        return data;
    }
    // Función para cargar las salas psicotécnicas desde la API
    async function cargarSalas() {
        try {
            const respuesta = await requestApi("/salas-psicotecnicas");
            setSalas(respuesta.data || []);
        } catch (error) {
            setError(error.message);
        }
    }
    // Función para cargar las reservas de salas desde la API
    async function cargarReservas() {
        try {
            const respuesta = await requestApi("/reservas-salas");
            setReservas(respuesta.data || []);
        } catch (error) {
            setError(error.message);
        }
    }
    // Función para cargar datos iniciales (salas y reservas)
    async function cargarDatosIniciales() {
        setCargando(true);
        setError("");
        setMensaje("");

        try {
            await Promise.all([
                cargarSalas(),
                cargarReservas(),
            ]);
        } finally {
            setCargando(false);
        }
    }
    // Cargamos las salas y reservas al montar el componente
    useEffect(() => {
        cargarDatosIniciales();
    }, []);
    // Función para manejar cambios en el formulario de reserva
    function manejarCambio(evento) {
        const { name, value } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value,
        });
    }
    // Función para obtener el nombre de la sala a partir de su ID
    function obtenerNombreSala(idSala) {
        const sala = salas.find((item) => Number(item.id_sala) === Number(idSala));
        return sala ? sala.nombre : `Sala ID ${idSala}`;
    }
    // Función para formatear la hora en formato HH:MM
    function formatearHora(hora) {
        if (!hora) return "";
        return hora.slice(0, 5);
    }
    // Función para crear una nueva reserva de sala
    async function crearReserva(evento) {
        evento.preventDefault();

        setCargando(true);
        setError("");
        setMensaje("");

        try {
            const body = {
                id_sala: Number(formulario.id_sala),
                fecha: formulario.fecha,
                hora_inicio: formulario.hora_inicio,
                hora_fin: formulario.hora_fin,
                cantidad_alumnos: Number(formulario.cantidad_alumnos),
                estado: formulario.estado,
                observacion: formulario.observacion,
            };

            const respuesta = await requestApi("/reservas-salas", {
                method: "POST",
                body: JSON.stringify(body),
            });

            setMensaje(respuesta.message || "Reserva creada exitosamente");
            setFormulario(estadoInicialFormulario);
            await cargarReservas();
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    }
    // Función para consultar disponibilidad de una sala en un horario específico
    async function consultarDisponibilidad() {
        setCargando(true);
        setError("");
        setMensaje("");

        try {
            if (
                !formulario.id_sala ||
                !formulario.fecha ||
                !formulario.hora_inicio ||
                !formulario.hora_fin
            ) {
                setError("Debe seleccionar sala, fecha, hora de inicio y hora de término");
                return;
            }

            const params = new URLSearchParams({
                id_sala: formulario.id_sala,
                fecha: formulario.fecha,
                hora_inicio: formulario.hora_inicio,
                hora_fin: formulario.hora_fin,
            });

            const respuesta = await requestApi(
                `/reservas-salas/disponibilidad?${params.toString()}`
            );

            setMensaje(respuesta.message);
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    }
    // Función para cancelar una reserva
    async function cancelarReserva(idReserva) {
        const confirmar = window.confirm("¿Seguro que deseas cancelar esta reserva?");

        if (!confirmar) return;

        setCargando(true);
        setError("");
        setMensaje("");

        try {
            const respuesta = await requestApi(`/reservas-salas/${idReserva}`, {
                method: "PATCH",
                body: JSON.stringify({
                    estado: "cancelada",
                }),
            });

            setMensaje(respuesta.message || "Reserva cancelada exitosamente");
            await cargarReservas();
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    }
    // Aplicamos el filtro a las reservas antes de renderizarlas
    const reservasFiltradas = reservas.filter((reserva) => {
        if (filtroReservas === "activas") {
            return reserva.estado === "reservada" || reserva.estado === "pendiente";
        }

        if (filtroReservas === "historial") {
            return reserva.estado === "cancelada" || reserva.estado === "finalizada";
        }

        return true;
    });

    return (
        <section className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Reservas de salas psicotécnicas
                </h1>
                <p className="text-slate-500 mt-1">
                    Gestión de disponibilidad y reserva de salas para Secretaría.
                </p>
            </div>

            {mensaje && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <form
                    onSubmit={crearReserva}
                    className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                        Nueva reserva
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Sala psicotécnica
                            </label>
                            <select
                                name="id_sala"
                                value={formulario.id_sala}
                                onChange={manejarCambio}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Seleccione una sala</option>
                                {salas.map((sala) => (
                                    <option key={sala.id_sala} value={sala.id_sala}>
                                        {sala.nombre} - {sala.sede} - Capacidad {sala.capacidad}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Fecha
                            </label>
                            <input
                                type="date"
                                name="fecha"
                                value={formulario.fecha}
                                onChange={manejarCambio}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    Hora inicio
                                </label>
                                <input
                                    type="time"
                                    name="hora_inicio"
                                    value={formulario.hora_inicio}
                                    onChange={manejarCambio}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    Hora término
                                </label>
                                <input
                                    type="time"
                                    name="hora_fin"
                                    value={formulario.hora_fin}
                                    onChange={manejarCambio}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Cantidad de alumnos
                            </label>
                            <input
                                type="number"
                                name="cantidad_alumnos"
                                min="1"
                                value={formulario.cantidad_alumnos}
                                onChange={manejarCambio}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Estado
                            </label>
                            <select
                                name="estado"
                                value={formulario.estado}
                                onChange={manejarCambio}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="reservada">Reservada</option>
                                <option value="pendiente">Pendiente</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Observación
                            </label>
                            <textarea
                                name="observacion"
                                value={formulario.observacion}
                                onChange={manejarCambio}
                                rows="3"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Evaluación psicotécnica licencia B"
                            />
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                type="button"
                                onClick={consultarDisponibilidad}
                                disabled={cargando}
                                className="w-full rounded-lg border border-blue-600 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 disabled:opacity-60"
                            >
                                Consultar disponibilidad
                            </button>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                            >
                                {cargando ? "Procesando..." : "Crear reserva"}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                Reservas registradas
                            </h2>

                            <p className="text-sm text-slate-500">
                                {filtroReservas === "activas"
                                    ? "Reservas activas y pendientes que requieren gestión."
                                    : filtroReservas === "historial"
                                        ? "Historial de reservas canceladas o finalizadas."
                                        : "Listado completo de reservas registradas."}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setFiltroReservas("activas")}
                                className={`rounded-lg px-3 py-2 text-sm font-medium border ${filtroReservas === "activas"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                Activas
                            </button>

                            <button
                                type="button"
                                onClick={() => setFiltroReservas("historial")}
                                className={`rounded-lg px-3 py-2 text-sm font-medium border ${filtroReservas === "historial"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                Historial
                            </button>

                            <button
                                type="button"
                                onClick={() => setFiltroReservas("todas")}
                                className={`rounded-lg px-3 py-2 text-sm font-medium border ${filtroReservas === "todas"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                Todas
                            </button>

                            <button
                                type="button"
                                onClick={cargarDatosIniciales}
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
                                    <th className="px-3 py-3">Sala</th>
                                    <th className="px-3 py-3">Fecha</th>
                                    <th className="px-3 py-3">Horario</th>
                                    <th className="px-3 py-3">Alumnos</th>
                                    <th className="px-3 py-3">Estado</th>
                                    <th className="px-3 py-3">Acción</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reservasFiltradas.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-3 py-6 text-center text-slate-500"
                                        >
                                            No hay reservas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    reservasFiltradas.map((reserva) => (
                                        <tr
                                            key={reserva.id_reserva}
                                            className="border-b hover:bg-slate-50"
                                        >
                                            <td className="px-3 py-3 font-medium text-slate-700">
                                                {obtenerNombreSala(reserva.id_sala)}
                                            </td>

                                            <td className="px-3 py-3 text-slate-600">
                                                {reserva.fecha}
                                            </td>

                                            <td className="px-3 py-3 text-slate-600">
                                                {formatearHora(reserva.hora_inicio)} -{" "}
                                                {formatearHora(reserva.hora_fin)}
                                            </td>

                                            <td className="px-3 py-3 text-slate-600">
                                                {reserva.cantidad_alumnos}
                                            </td>

                                            <td className="px-3 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${reserva.estado === "cancelada"
                                                            ? "bg-red-100 text-red-700"
                                                            : reserva.estado === "finalizada"
                                                                ? "bg-slate-100 text-slate-700"
                                                                : reserva.estado === "pendiente"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-green-100 text-green-700"
                                                        }`}
                                                >
                                                    {reserva.estado}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3">
                                                {reserva.estado === "reservada" || reserva.estado === "pendiente" ? (
  <button
    onClick={() => cancelarReserva(reserva.id_reserva)}
    className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
  >
    Cancelar
  </button>
) : (
  <span className="text-xs text-slate-400">
    Sin acción
  </span>
)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-xs text-slate-400">
                        Mostrando: {reservasFiltradas.length} de {reservas.length} reservas
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ReservaSalaPsicotecnica;