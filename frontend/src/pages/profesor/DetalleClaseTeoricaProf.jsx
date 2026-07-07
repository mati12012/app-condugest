import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual, formatearHoraVisual } from "../../utils/formatearFecha";

function normalizarModalidad(modalidad) {
  return String(modalidad || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function esHibrida(clase) {
  return normalizarModalidad(clase?.modalidad) === "hibrida";
}

function esPresencial(clase) {
  return normalizarModalidad(clase?.modalidad) === "presencial";
}

function esOnline(clase) {
  return normalizarModalidad(clase?.modalidad) === "online";
}

function usaCapacidadPresencial(clase) {
  return esPresencial(clase) || esHibrida(clase);
}

async function obtenerInscritosClaseTeorica(claseId) {
  const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/alumnos-inscritos`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "No se pudo cargar la lista del curso");
  }

  return data.data || { clase: null, alumnos: [], capacidad: null };
}

async function obtenerDisponiblesClaseTeorica(claseId) {
  const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/alumnos-disponibles`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "No se pudieron cargar alumnos disponibles");
  }

  return data.data || { alumnos: [] };
}

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  if (typeof data?.errorDetails === "string") {
    return data.errorDetails;
  }

  return data?.message || fallback;
}

function obtenerTextoSala(clase) {
  if (!clase) return "Sin informacion";

  if (clase.sala_nombre) {
    return `${clase.sala_nombre} - ${clase.sala_sede || clase.sede}`;
  }

  if (esOnline(clase)) return "Clase online";

  return "Sala no asignada";
}

function obtenerModoForzado(clase) {
  if (esOnline(clase)) return "Online";
  if (esPresencial(clase)) return "Presencial";
  return "";
}

function DetalleClaseTeoricaProf({ claseId, volver }) {
  const [clase, setClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [capacidad, setCapacidad] = useState(null);
  const [recursos, setRecursos] = useState({
    link_reunion: "",
    codigo_reunion: "",
    url_grabacion: "",
  });
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [idAlumnoSeleccionado, setIdAlumnoSeleccionado] = useState("");
  const [modoParticipacion, setModoParticipacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [guardandoRecursos, setGuardandoRecursos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const estadosAsistencia = [
    {
      estado: "Presente",
      activo: "bg-emerald-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700",
    },
    {
      estado: "Ausente",
      activo: "bg-red-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-700",
    },
    {
      estado: "Justificado",
      activo: "bg-amber-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700",
    },
    {
      estado: "Pendiente",
      activo: "bg-blue-600 text-white",
      inactivo: "bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-700",
    },
  ];

  const cargarDetalle = useCallback(async () => {
    const [detalle, disponibles] = await Promise.all([
      obtenerInscritosClaseTeorica(claseId),
      obtenerDisponiblesClaseTeorica(claseId),
    ]);

    setClase(detalle.clase);
    setAlumnos(detalle.alumnos || []);
    setCapacidad(detalle.capacidad || disponibles.capacidad || null);
    setAlumnosDisponibles(disponibles.alumnos || []);
    setRecursos({
      link_reunion: detalle.clase?.link_reunion || "",
      codigo_reunion: detalle.clase?.codigo_reunion || "",
      url_grabacion: detalle.clase?.url_grabacion || "",
    });
  }, [claseId]);

  useEffect(() => {
    let cancelado = false;

    async function cargarInicial() {
      try {
        setCargando(true);
        await cargarDetalle();
      } catch (errorCarga) {
        if (!cancelado) {
          setError(errorCarga.message || "No se pudo cargar la clase.");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarInicial();

    return () => {
      cancelado = true;
    };
  }, [cargarDetalle]);

  const clasePermiteGestion = clase && !["Cancelada", "Realizada"].includes(clase.estado);

  const alumnosDisponiblesFiltrados = useMemo(() => {
    const texto = busquedaAlumno.trim().toLowerCase();

    return alumnosDisponibles.filter((alumno) => {
      const nombreCompleto = `${alumno.nombre || ""} ${alumno.apellido || ""}`.toLowerCase();
      const rut = String(alumno.rut || "").toLowerCase();
      const sede = String(alumno.sede || "").toLowerCase();

      return !texto || nombreCompleto.includes(texto) || rut.includes(texto) || sede.includes(texto);
    });
  }, [alumnosDisponibles, busquedaAlumno]);

  const alumnoSeleccionado = useMemo(
    () => alumnosDisponibles.find((alumno) => Number(alumno.id_alumno) === Number(idAlumnoSeleccionado)),
    [alumnosDisponibles, idAlumnoSeleccionado]
  );

  const modosPermitidos = useMemo(() => {
    if (!clase) return [];
    if (esOnline(clase)) return ["Online"];
    if (esPresencial(clase)) return ["Presencial"];
    if (!esHibrida(clase)) return [];

    if (!alumnoSeleccionado) return ["Presencial", "Online"];
    if (!alumnoSeleccionado.puede_presencial) return ["Online"];

    return ["Presencial", "Online"];
  }, [alumnoSeleccionado, clase]);

  function actualizarRecurso(campo, valor) {
    setRecursos((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function seleccionarAlumno(valor) {
    const alumno = alumnosDisponibles.find((item) => Number(item.id_alumno) === Number(valor));

    setIdAlumnoSeleccionado(valor);
    setModoParticipacion(alumno?.modo_sugerido || obtenerModoForzado(clase));
  }

  const marcarAsistencia = async (idAsistencia, nuevoEstado) => {
    if (procesando) return;
    setProcesando(true);
    setMensaje("");
    setError("");

    try {
      const res = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/asistencia-teorica/${idAsistencia}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        setAlumnos((prev) => prev.map((a) => (
          a.id_asistencia === idAsistencia ? { ...a, estado_asistencia: nuevoEstado } : a
        )));
      } else {
        const data = await res.json();
        setError(obtenerMensajeError(data, "No se pudo guardar la asistencia."));
      }
    } catch (errorMarcado) {
      console.error(errorMarcado);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  async function guardarRecursos(evento) {
    evento.preventDefault();

    try {
      setGuardandoRecursos(true);
      setMensaje("");
      setError("");

      if ((esOnline(clase) || esHibrida(clase)) && !recursos.link_reunion.trim()) {
        throw new Error("Para clases online o hibridas, ingresa el link de Meet/Zoom.");
      }

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/recursos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link_reunion: recursos.link_reunion.trim() || null,
          codigo_reunion: recursos.codigo_reunion.trim() || null,
          url_grabacion: recursos.url_grabacion.trim() || null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudieron guardar los recursos."));
      }

      setClase((actual) => ({
        ...actual,
        link_reunion: data.data?.link_reunion || null,
        codigo_reunion: data.data?.codigo_reunion || null,
        url_grabacion: data.data?.url_grabacion || null,
      }));
      setMensaje("Recursos actualizados correctamente.");
    } catch (errorGuardado) {
      setError(errorGuardado.message || "No se pudieron guardar los recursos.");
    } finally {
      setGuardandoRecursos(false);
    }
  }

  async function agregarAlumno(evento) {
    evento.preventDefault();

    if (!idAlumnoSeleccionado) {
      setError("Debe seleccionar un alumno.");
      return;
    }

    try {
      setProcesando(true);
      setMensaje("");
      setError("");

      const modoFinal = esHibrida(clase)
        ? modoParticipacion
        : obtenerModoForzado(clase);

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/alumnos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_alumno: Number(idAlumnoSeleccionado),
          modo_participacion: modoFinal,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo inscribir al alumno."));
      }

      setMensaje(data.message || "Alumno inscrito correctamente.");
      setIdAlumnoSeleccionado("");
      setModoParticipacion("");
      setBusquedaAlumno("");
      await cargarDetalle();
    } catch (errorAgregar) {
      setError(errorAgregar.message || "No se pudo inscribir al alumno.");
    } finally {
      setProcesando(false);
    }
  }

  async function quitarAlumno(idAlumno, nombreAlumno) {
    if (!window.confirm(`Quitar a ${nombreAlumno} de esta clase teorica?`)) return;

    try {
      setProcesando(true);
      setMensaje("");
      setError("");

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/profesor/clase-teorica/${claseId}/alumnos/${idAlumno}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo quitar al alumno."));
      }

      setMensaje(data.message || "Alumno removido de la clase.");
      await cargarDetalle();
    } catch (errorQuitar) {
      setError(errorQuitar.message || "No se pudo quitar al alumno.");
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) return <div className="p-8 text-center text-slate-500">Cargando lista del curso...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <button onClick={volver} className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-3">Volver</button>
            <h2 className="text-xl font-bold text-slate-900">{clase?.tema || "Clase teorica"}</h2>
            {clase && (
              <p className="text-sm text-slate-500 mt-1">
                {formatearFechaVisual(clase.fecha)} - {formatearHoraVisual(clase.hora_inicio)} a {formatearHoraVisual(clase.hora_fin)}
              </p>
            )}
          </div>
          {clase && (
            <div className="text-right">
              <span className="inline-flex rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold">
                {clase.modalidad || clase.sede}
              </span>
              <p className="text-xs text-slate-500 mt-2">{obtenerTextoSala(clase)}</p>
            </div>
          )}
        </div>

        {mensaje && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-semibold">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={guardarRecursos} className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Recursos de la clase</h3>
            <p className="text-xs text-slate-500 mt-1">Puedes editar solo links, codigo de reunion y grabacion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Link de reunion</span>
              <input
                type="url"
                value={recursos.link_reunion}
                onChange={(evento) => actualizarRecurso("link_reunion", evento.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Codigo de reunion</span>
              <input
                type="text"
                value={recursos.codigo_reunion}
                onChange={(evento) => actualizarRecurso("codigo_reunion", evento.target.value)}
                placeholder="Ej: 123 456 789"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">URL de grabacion</span>
              <input
                type="url"
                value={recursos.url_grabacion}
                onChange={(evento) => actualizarRecurso("url_grabacion", evento.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              {clase?.link_reunion && (
                <a href={clase.link_reunion} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                  Entrar a clase
                </a>
              )}
              {clase?.url_grabacion && (
                <a href={clase.url_grabacion} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                  Ver grabacion
                </a>
              )}
            </div>
            <button
              type="submit"
              disabled={guardandoRecursos}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardandoRecursos ? "Guardando..." : "Guardar recursos"}
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Alumnos inscritos</h3>
              <p className="text-xs text-slate-500 mt-1">Gestiona la lista antes de pasar asistencia.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {usaCapacidadPresencial(clase) && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  Capacidad presencial: {capacidad?.capacidad_presencial_usada ?? 0}
                  {capacidad?.capacidad_sala ? `/${capacidad.capacidad_sala}` : " / sin sala"}
                </span>
              )}
              <button
                type="button"
                onClick={() => setMostrarAgregar((actual) => !actual)}
                disabled={!clasePermiteGestion}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {mostrarAgregar ? "Cerrar" : "Agregar alumno"}
              </button>
            </div>
          </div>

          {!clasePermiteGestion && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
              No se pueden modificar inscritos en clases canceladas o realizadas.
            </div>
          )}

          {mostrarAgregar && clasePermiteGestion && (
            <form onSubmit={agregarAlumno} className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto] gap-4 items-end">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Buscar alumno disponible</span>
                  <input
                    type="text"
                    value={busquedaAlumno}
                    onChange={(evento) => setBusquedaAlumno(evento.target.value)}
                    placeholder="Nombre, RUT o sede"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="block lg:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Alumno</span>
                  <select
                    value={idAlumnoSeleccionado}
                    onChange={(evento) => seleccionarAlumno(evento.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione un alumno...</option>
                    {alumnosDisponiblesFiltrados.map((alumno) => (
                      <option key={alumno.id_alumno} value={alumno.id_alumno}>
                        {alumno.nombre} {alumno.apellido} - {alumno.rut} - {alumno.sede}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_auto] gap-4 items-end">
                {esHibrida(clase) ? (
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Modo de participacion</span>
                    <select
                      value={modoParticipacion}
                      onChange={(evento) => setModoParticipacion(evento.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccione modo...</option>
                      {modosPermitidos.map((modo) => (
                        <option key={modo} value={modo}>{modo}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    Modo: <span className="font-bold text-slate-800">{obtenerModoForzado(clase) || "No definido"}</span>
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  {alumnoSeleccionado ? (
                    <p>
                      Sede del alumno: <span className="font-bold">{alumnoSeleccionado.sede}</span>.
                      {esHibrida(clase) && !alumnoSeleccionado.puede_presencial && " Solo puede participar online por ser de otra sede."}
                    </p>
                  ) : (
                    <p>Selecciona un alumno para ver sus opciones de participacion.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={procesando || !idAlumnoSeleccionado || (esHibrida(clase) && !modoParticipacion)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {procesando ? "Agregando..." : "Inscribir"}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">Sede</th>
                  <th className="px-4 py-3">Modo</th>
                  <th className="px-4 py-3">RUT</th>
                  <th className="px-4 py-3 text-center">Asistencia</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumnos.map((alumno) => (
                  <tr key={alumno.id_asistencia} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{alumno.nombre} {alumno.apellido}</td>
                    <td className="px-4 py-3 text-slate-600">{alumno.sede || "Sin sede"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        alumno.modo_participacion === "Online"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {alumno.modo_participacion || "Presencial"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{alumno.rut}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {estadosAsistencia.map((opcion) => (
                          <button
                            key={opcion.estado}
                            disabled={procesando}
                            onClick={() => marcarAsistencia(alumno.id_asistencia, opcion.estado)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                              alumno.estado_asistencia === opcion.estado
                                ? opcion.activo
                                : opcion.inactivo
                            }`}
                          >
                            {opcion.estado}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={procesando || !clasePermiteGestion}
                        onClick={() => quitarAlumno(alumno.id_alumno, `${alumno.nombre} ${alumno.apellido}`)}
                        className="text-xs font-bold text-red-600 hover:underline disabled:text-slate-300 disabled:no-underline"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {alumnos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      El curso aun no tiene alumnos inscritos.
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

export default DetalleClaseTeoricaProf;
