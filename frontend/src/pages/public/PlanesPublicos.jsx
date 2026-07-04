import { useEffect, useState } from "react";

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
                key={`${plan.nombre}-${index}`}
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
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PlanesPublicos;
