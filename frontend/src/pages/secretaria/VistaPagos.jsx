import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const ESTADOS_PAGO = ["Registrado", "Anulado"];
const METODOS_PAGO = ["Efectivo", "Transferencia", "Débito", "Crédito", "Otro"];

const formularioInicial = {
  id_matricula: "",
  monto: "",
  metodo_pago: "Efectivo",
  observacion: "",
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fecha));
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obtenerMensajeError(data, mensajeFallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  return data?.message || mensajeFallback;
}

function obtenerNombreAlumno(matricula) {
  return `${matricula?.alumno_nombre || ""} ${matricula?.alumno_apellido || ""}`.trim();
}

function obtenerClaseEstadoPago(estado) {
  if (estado === "Registrado") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (estado === "Anulado") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function obtenerClaseEstadoResumen(estado) {
  if (estado === "Pagado") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (estado === "Parcial") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (estado === "Pendiente") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function VistaPagos() {
  const [pagos, setPagos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [resumenSeleccionado, setResumenSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [anulandoId, setAnulandoId] = useState(null);

  const obtenerPagosActualizados = useCallback(async () => {
    const response = await apiFetch(`${API_BASE_URL}/pagos`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(obtenerMensajeError(data, "No se pudieron obtener los pagos"));
    }

    const pagosActualizados = data.data || [];
    setPagos(pagosActualizados);

    return pagosActualizados;
  }, []);

  const obtenerMatriculasActualizadas = useCallback(async () => {
    const response = await apiFetch(`${API_BASE_URL}/matriculas`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(obtenerMensajeError(data, "No se pudieron obtener las matriculas"));
    }

    const matriculasActualizadas = data.data || [];
    setMatriculas(matriculasActualizadas);

    return matriculasActualizadas;
  }, []);

  const obtenerResumenMatricula = useCallback(async (idMatricula) => {
    if (!idMatricula) {
      setResumenSeleccionado(null);
      return null;
    }

    try {
      setCargandoResumen(true);
      setErrorFormulario("");

      const response = await apiFetch(
        `${API_BASE_URL}/pagos/resumen/matricula/${idMatricula}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(data, "No se pudo obtener el resumen financiero")
        );
      }

      setResumenSeleccionado(data.data || null);

      return data.data || null;
    } catch (error) {
      setResumenSeleccionado(null);
      setErrorFormulario(error.message || "No se pudo cargar el resumen financiero");
      return null;
    } finally {
      setCargandoResumen(false);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      await Promise.all([
        obtenerPagosActualizados(),
        obtenerMatriculasActualizadas(),
      ]);
    } catch (error) {
      setError(error.message || "Error de conexion con el servidor");
    } finally {
      setCargando(false);
    }
  }, [obtenerMatriculasActualizadas, obtenerPagosActualizados]);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatosIniciales() {
      try {
        const [responsePagos, responseMatriculas] = await Promise.all([
          apiFetch(`${API_BASE_URL}/pagos`),
          apiFetch(`${API_BASE_URL}/matriculas`),
        ]);

        const [dataPagos, dataMatriculas] = await Promise.all([
          responsePagos.json(),
          responseMatriculas.json(),
        ]);

        if (!responsePagos.ok) {
          throw new Error(
            obtenerMensajeError(dataPagos, "No se pudieron obtener los pagos")
          );
        }

        if (!responseMatriculas.ok) {
          throw new Error(
            obtenerMensajeError(dataMatriculas, "No se pudieron obtener las matriculas")
          );
        }

        if (!cancelado) {
          setPagos(dataPagos.data || []);
          setMatriculas(dataMatriculas.data || []);
        }
      } catch (error) {
        if (!cancelado) {
          setError(error.message || "Error de conexion con el servidor");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarDatosIniciales();

    return () => {
      cancelado = true;
    };
  }, []);

  const matriculasPorId = useMemo(() => {
    const mapa = new Map();

    matriculas.forEach((matricula) => {
      mapa.set(Number(matricula.id_matricula), matricula);
    });

    return mapa;
  }, [matriculas]);

  const matriculaSeleccionada = useMemo(() => {
    if (!formulario.id_matricula) return null;

    return matriculasPorId.get(Number(formulario.id_matricula)) || null;
  }, [formulario.id_matricula, matriculasPorId]);

  const pagosConDetalle = useMemo(() => {
    return pagos.map((pago) => {
      const matricula = matriculasPorId.get(Number(pago.id_matricula));
      const alumnoNombre = obtenerNombreAlumno(matricula) || "Alumno no disponible";

      return {
        ...pago,
        alumno_nombre_completo: alumnoNombre,
        alumno_rut: matricula?.alumno_rut || "",
        plan_nombre: matricula?.plan_nombre || "Plan no disponible",
        plan_tipo: matricula?.plan_tipo || "",
        valor_total: matricula?.valor_total ?? pago.matricula_valor_total,
        matricula_estado: matricula?.estado || pago.matricula_estado || "",
      };
    });
  }, [matriculasPorId, pagos]);

  const pagosFiltrados = useMemo(() => {
    const textoBusqueda = normalizarTexto(busqueda.trim());

    return pagosConDetalle.filter((pago) => {
      const textoPago = normalizarTexto([
        pago.alumno_nombre_completo,
        pago.alumno_rut,
        pago.plan_nombre,
        pago.plan_tipo,
        pago.metodo_pago,
      ].join(" "));

      const coincideBusqueda = !textoBusqueda || textoPago.includes(textoBusqueda);
      const coincideEstado =
        filtroEstado === "Todos" || pago.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtroEstado, pagosConDetalle]);

  const totalPagos = pagos.length;
  const pagosRegistrados = pagos.filter((pago) => pago.estado === "Registrado");
  const pagosAnulados = pagos.filter((pago) => pago.estado === "Anulado");
  const totalRegistrado = pagosRegistrados.reduce(
    (total, pago) => total + Number(pago.monto || 0),
    0
  );

  const matriculaAnulada = matriculaSeleccionada?.estado === "Anulada";

  function abrirFormularioCrear() {
    setFormulario(formularioInicial);
    setResumenSeleccionado(null);
    setFormularioVisible(true);
    setErrorFormulario("");
    setMensaje("");
  }

  function cerrarFormulario() {
    if (guardando) return;

    setFormularioVisible(false);
    setFormulario(formularioInicial);
    setResumenSeleccionado(null);
    setErrorFormulario("");
  }

  async function actualizarVista() {
    await cargarDatos();

    if (formulario.id_matricula) {
      await obtenerResumenMatricula(formulario.id_matricula);
    }
  }

  function manejarCambioFormulario(evento) {
    const { name, value } = evento.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));

    if (name === "id_matricula") {
      setResumenSeleccionado(null);
      obtenerResumenMatricula(value);
    }
  }

  async function guardarPago(evento) {
    evento.preventDefault();

    if (matriculaAnulada) {
      setErrorFormulario("No se pueden registrar pagos en matriculas anuladas.");
      return;
    }

    try {
      setGuardando(true);
      setErrorFormulario("");
      setMensaje("");

      const payload = {
        id_matricula: Number(formulario.id_matricula),
        monto: Number(formulario.monto),
        metodo_pago: formulario.metodo_pago,
        observacion: formulario.observacion.trim() || null,
      };

      const response = await apiFetch(`${API_BASE_URL}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo registrar el pago"));
      }

      await Promise.all([
        obtenerPagosActualizados(),
        obtenerResumenMatricula(formulario.id_matricula),
      ]);

      setFormulario((formularioActual) => ({
        ...formularioActual,
        monto: "",
        observacion: "",
      }));
      setMensaje("Pago registrado exitosamente.");
    } catch (error) {
      setErrorFormulario(error.message || "No se pudo registrar el pago");
    } finally {
      setGuardando(false);
    }
  }

  async function anularPago(pago) {
    if (pago.estado === "Anulado") return;

    const confirmado = window.confirm("¿Deseas anular este pago? Esta accion no lo eliminara del historial.");

    if (!confirmado) return;

    try {
      setAnulandoId(pago.id_pago);
      setError("");
      setMensaje("");

      const response = await apiFetch(`${API_BASE_URL}/pagos/${pago.id_pago}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Anulado" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, "No se pudo anular el pago"));
      }

      await obtenerPagosActualizados();

      if (String(formulario.id_matricula) === String(pago.id_matricula)) {
        await obtenerResumenMatricula(pago.id_matricula);
      }

      setMensaje("Pago anulado exitosamente.");
    } catch (error) {
      setError(error.message || "No se pudo anular el pago");
    } finally {
      setAnulandoId(null);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Pagos
          </h1>
          <p className="text-slate-500">
            Registra abonos de matriculas y revisa el saldo financiero de cada alumno.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={actualizarVista}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
          >
            Actualizar
          </button>

          <button
            type="button"
            onClick={abrirFormularioCrear}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            + Nuevo Pago
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total pagos</p>
          <p className="text-3xl font-bold text-slate-800">{totalPagos}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Registrados</p>
          <p className="text-3xl font-bold text-green-600">{pagosRegistrados.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total registrado</p>
          <p className="text-3xl font-bold text-blue-600">{formatearPesos(totalRegistrado)}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Anulados</p>
          <p className="text-3xl font-bold text-red-600">{pagosAnulados.length}</p>
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
          onSubmit={guardarPago}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Nuevo pago
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Selecciona una matricula para ver su resumen y registrar un abono.
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Matricula
            </label>
            <select
              name="id_matricula"
              value={formulario.id_matricula}
              onChange={manejarCambioFormulario}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">Seleccione una matricula</option>
              {matriculas.map((matricula) => (
                <option key={matricula.id_matricula} value={matricula.id_matricula}>
                  #{matricula.id_matricula} - {obtenerNombreAlumno(matricula) || "Alumno sin nombre"} - {matricula.plan_nombre || "Plan no disponible"} - {formatearPesos(matricula.valor_total)}
                </option>
              ))}
            </select>
          </div>

          {formulario.id_matricula && (
            <div className="border-y border-slate-200 bg-slate-50 px-6 py-5 -mx-6">
              {cargandoResumen ? (
                <div className="text-center text-slate-500">
                  Cargando resumen financiero...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Alumno</p>
                      <p className="font-bold text-slate-800">
                        {obtenerNombreAlumno(matriculaSeleccionada) || "No disponible"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {matriculaSeleccionada?.alumno_rut || "Sin RUT"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Plan contratado</p>
                      <p className="font-bold text-slate-800">
                        {matriculaSeleccionada?.plan_nombre || "No disponible"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {matriculaSeleccionada?.plan_tipo || "Sin tipo"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Estado de pago</p>
                      <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstadoResumen(resumenSeleccionado?.estado_pago)}`}>
                        {resumenSeleccionado?.estado_pago || "Sin resumen"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Valor total</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {formatearPesos(resumenSeleccionado?.valor_total ?? matriculaSeleccionada?.valor_total)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Total pagado</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatearPesos(resumenSeleccionado?.total_pagado)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Saldo pendiente</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatearPesos(resumenSeleccionado?.saldo_pendiente)}
                      </p>
                    </div>
                  </div>

                  {matriculaAnulada && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm font-medium">
                      Esta matricula esta anulada. No se pueden registrar nuevos pagos.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto
              </label>
              <input
                type="number"
                name="monto"
                min="1"
                value={formulario.monto}
                onChange={manejarCambioFormulario}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Ej: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Metodo de pago
              </label>
              <select
                name="metodo_pago"
                value={formulario.metodo_pago}
                onChange={manejarCambioFormulario}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {METODOS_PAGO.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {metodo}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Observacion
              </label>
              <textarea
                name="observacion"
                value={formulario.observacion}
                onChange={manejarCambioFormulario}
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Detalle opcional del pago"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardando || matriculaAnulada}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {guardando ? "Guardando..." : "Registrar pago"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <input
            type="text"
            placeholder="Buscar por alumno, plan o metodo de pago..."
            className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {["Todos", ...ESTADOS_PAGO].map((estado) => {
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
            Cargando pagos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">Alumno</th>
                  <th className="p-4 font-bold">Plan</th>
                  <th className="p-4 font-bold">Monto</th>
                  <th className="p-4 font-bold">Metodo</th>
                  <th className="p-4 font-bold">Fecha</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id_pago} className="hover:bg-slate-50 align-top">
                    <td className="p-4 min-w-56">
                      <p className="font-bold text-slate-800">
                        {pago.alumno_nombre_completo}
                      </p>
                      <p className="text-sm text-slate-500 font-mono">
                        {pago.alumno_rut || "Sin RUT"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Matricula #{pago.id_matricula}
                      </p>
                    </td>

                    <td className="p-4 min-w-56">
                      <p className="font-semibold text-slate-800">
                        {pago.plan_nombre}
                      </p>
                      <p className="text-sm text-slate-500">
                        {pago.plan_tipo || "Sin tipo"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Valor: {formatearPesos(pago.valor_total)}
                      </p>
                    </td>

                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      {formatearPesos(pago.monto)}
                    </td>

                    <td className="p-4 min-w-44">
                      <p className="font-semibold text-slate-700">
                        {pago.metodo_pago}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {pago.observacion || "Sin observacion"}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatearFecha(pago.fecha_pago)}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstadoPago(pago.estado)}`}>
                        {pago.estado}
                      </span>
                    </td>

                    <td className="p-4">
                      {pago.estado === "Registrado" ? (
                        <button
                          type="button"
                          onClick={() => anularPago(pago)}
                          disabled={anulandoId === pago.id_pago}
                          className="text-red-600 hover:underline text-sm font-medium disabled:text-red-300 disabled:cursor-not-allowed"
                        >
                          {anulandoId === pago.id_pago ? "Anulando..." : "Anular"}
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!error && pagosFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                {pagos.length === 0
                  ? "Aun no hay pagos registrados."
                  : "No se encontraron pagos con los filtros aplicados."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VistaPagos;
