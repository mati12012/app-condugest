import { useEffect, useState } from "react";

const formularioInicial = {
  nombre: "",
  apellido: "",
  rut: "",
  correo: "",
  telefono: "",
  mensaje: "",
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

function PlanesPublicos({ onIniciarSesion }) {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarPlanes() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(
          `${import.meta.env.VITE_BASE_URL}/public/planes`
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(data.message || "No se pudieron cargar los planes");
        }

        const planesActivos = Array.isArray(data.data) ? data.data : [];

        if (componenteActivo) {
          setPlanes(planesActivos);
        }
      } catch (error) {
        if (componenteActivo) {
          setError(error.message || "Error al cargar los planes disponibles");
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarPlanes();

    return () => {
      componenteActivo = false;
    };
  }, []);

  function abrirFormularioSolicitud(plan) {
    setPlanSeleccionado(plan);
    setFormulario(formularioInicial);
    setErrorSolicitud("");
    setMensajeExito("");
  }

  function cerrarFormularioSolicitud() {
    if (enviandoSolicitud) return;

    setPlanSeleccionado(null);
    setFormulario(formularioInicial);
    setErrorSolicitud("");
  }

  function manejarCambioFormulario(evento) {
    const { name, value } = evento.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  }

  function obtenerMensajeError(data) {
    if (Array.isArray(data?.errorDetails)) {
      return data.errorDetails.join(" ");
    }

    return data?.message || "No se pudo enviar la solicitud. Intenta nuevamente.";
  }

  async function enviarSolicitudMatricula(evento) {
    evento.preventDefault();

    if (!planSeleccionado?.id_plan) {
      setErrorSolicitud("No se pudo identificar el plan seleccionado.");
      return;
    }

    try {
      setEnviandoSolicitud(true);
      setErrorSolicitud("");
      setMensajeExito("");

      const respuesta = await fetch(
        `${import.meta.env.VITE_BASE_URL}/public/solicitudes-matricula`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: formulario.nombre,
            apellido: formulario.apellido,
            rut: formulario.rut,
            correo: formulario.correo,
            telefono: formulario.telefono,
            mensaje: formulario.mensaje,
            id_plan: planSeleccionado.id_plan,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(obtenerMensajeError(data));
      }

      setMensajeExito("Solicitud enviada correctamente. Secretaría se contactará contigo.");
      setFormulario(formularioInicial);
      setPlanSeleccionado(null);
    } catch (error) {
      setErrorSolicitud(error.message || "Error al enviar la solicitud.");
    } finally {
      setEnviandoSolicitud(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-800">
              ConduGest
            </h1>
            <p className="text-sm text-slate-500">
              Escuela de conduccion
            </p>
          </div>

          <button
            type="button"
            onClick={onIniciarSesion}
            className="px-4 py-2 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 active:scale-95 transition-all"
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <section className="mb-8">
          <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
            Oferta academica
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4">
            Planes disponibles
          </h2>

          <p className="text-slate-500 mt-3 max-w-2xl">
            Revisa las alternativas activas antes de iniciar tu proceso como alumno.
          </p>
        </section>

        {cargando && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-slate-500">
            Cargando planes...
          </div>
        )}

        {!cargando && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
            {error}
          </div>
        )}

        {!cargando && !error && planes.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-slate-600">
            Por ahora no hay planes activos publicados. Vuelve a revisar pronto o contacta a la escuela para mas informacion.
          </div>
        )}

        {!cargando && !error && planes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {planes.map((plan, index) => (
              <article
                key={plan.id_plan || `${plan.nombre}-${index}`}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">
                    {plan.nombre}
                  </h3>

                  <span className="shrink-0 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {plan.tipo}
                  </span>
                </div>

                <p className="text-slate-500 mt-3 leading-relaxed flex-1">
                  {plan.descripcion || "Plan de formacion disponible en ConduGest."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Practicas</p>
                    <p className="font-bold text-slate-900 mt-1">
                      {plan.cantidad_clases_practicas}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Teoricas</p>
                    <p className="font-bold text-slate-900 mt-1">
                      {plan.cantidad_clases_teoricas}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <p className="text-sm text-slate-500">Valor</p>
                  <p className="text-3xl font-extrabold text-blue-800 mt-1">
                    {formatearPesos(plan.valor)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => abrirFormularioSolicitud(plan)}
                  className="mt-5 w-full px-4 py-2.5 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 active:scale-95 transition-all"
                >
                  Solicitar matrícula
                </button>
              </article>
            ))}
          </div>
        )}

        {mensajeExito && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-5">
            {mensajeExito}
          </div>
        )}
      </main>

      {planSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 px-4 py-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Solicitud de matricula
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {planSeleccionado.nombre}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {planSeleccionado.tipo} - {formatearPesos(planSeleccionado.valor)}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarFormularioSolicitud}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={enviarSolicitudMatricula} className="p-6 space-y-5">
              {errorSolicitud && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {errorSolicitud}
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formulario.apellido}
                    onChange={manejarCambioFormulario}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    name="rut"
                    value={formulario.rut}
                    onChange={manejarCambioFormulario}
                    required
                    placeholder="12345678-9"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={manejarCambioFormulario}
                    required
                    placeholder="+56912345678"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={manejarCambioFormulario}
                    required
                    placeholder="tu.correo@ejemplo.cl"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    name="mensaje"
                    value={formulario.mensaje}
                    onChange={manejarCambioFormulario}
                    rows="4"
                    placeholder="Cuéntanos si tienes horarios preferidos o alguna duda."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarFormularioSolicitud}
                  disabled={enviandoSolicitud}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={enviandoSolicitud}
                  className="px-5 py-2.5 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {enviandoSolicitud ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanesPublicos;
