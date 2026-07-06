import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearHora } from "./profesorPanel.helpers";

function obtenerEstadoProfesor(estado) {
  return estado ? "Activo" : "Inactivo";
}

function obtenerClaseEstadoProfesor(estado) {
  return estado
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-red-50 text-red-700 border-red-200";
}

function obtenerValor(valor, fallback = "No registrado") {
  if (valor === null || valor === undefined || valor === "") return fallback;
  return valor;
}

function CampoPerfil({ etiqueta, valor, destacado = false }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p
        className={`mt-2 font-bold break-words ${
          destacado ? "text-slate-900 text-lg" : "text-slate-800"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

function TarjetaResumenPerfil({ valor, etiqueta, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>{valor}</p>
      <p className="text-slate-500 mt-2">{etiqueta}</p>
    </div>
  );
}

function PerfilProfesor({ cerrarSesion }) {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarPerfil() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/profesor/mi-perfil`
      );
      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo cargar tu perfil");
      }

      setPerfil(data.data);
    } catch (errorPerfil) {
      setError(errorPerfil.message || "No se pudo cargar tu perfil");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let componenteActivo = true;

    async function cargarPerfilInicial() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await apiFetch(
          `${import.meta.env.VITE_BASE_URL}/profesor/mi-perfil`
        );
        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(data.message || "No se pudo cargar tu perfil");
        }

        if (componenteActivo) {
          setPerfil(data.data);
        }
      } catch (errorPerfil) {
        if (componenteActivo) {
          setError(errorPerfil.message || "No se pudo cargar tu perfil");
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarPerfilInicial();

    return () => {
      componenteActivo = false;
    };
  }, []);

  if (cargando) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-slate-500">
        Cargando tu perfil...
      </div>
    );
  }

  if (error) {
    return (
      <section className="space-y-5 max-w-5xl">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
          {error}
        </div>

        <button
          type="button"
          onClick={cargarPerfil}
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all"
        >
          Reintentar
        </button>
      </section>
    );
  }

  const disponibilidad = perfil?.disponibilidad_horaria_activa || [];
  const estadoTexto = obtenerEstadoProfesor(perfil?.estado);

  return (
    <section className="space-y-6 max-w-6xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <span
              className={`inline-flex px-3 py-1 rounded-full border text-sm font-semibold ${obtenerClaseEstadoProfesor(
                perfil?.estado
              )}`}
            >
              {estadoTexto}
            </span>

            <h2 className="text-3xl font-bold text-slate-900 mt-4">
              {obtenerValor(perfil?.nombre_completo, "Profesor")}
            </h2>

            <p className="text-slate-500 mt-2 break-all">
              {obtenerValor(perfil?.correo_institucional)}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all"
          >
            Cerrar sesion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <CampoPerfil
          etiqueta="Correo institucional"
          valor={obtenerValor(perfil?.correo_institucional)}
          destacado
        />
        <CampoPerfil etiqueta="Telefono" valor={obtenerValor(perfil?.telefono)} />
        <CampoPerfil etiqueta="Sede" valor={obtenerValor(perfil?.sede)} />
        <CampoPerfil
          etiqueta="Licencia autorizada"
          valor={obtenerValor(perfil?.licencia_autorizada)}
        />
        <CampoPerfil
          etiqueta="Especialidad"
          valor={obtenerValor(perfil?.especialidad)}
        />
        <CampoPerfil etiqueta="Estado" valor={estadoTexto} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TarjetaResumenPerfil
          valor={perfil?.cantidad_clases_practicas_asignadas ?? 0}
          etiqueta="Clases practicas asignadas"
          color="text-blue-700"
        />
        <TarjetaResumenPerfil
          valor={perfil?.cantidad_clases_teoricas_asignadas ?? 0}
          etiqueta="Clases teoricas asignadas"
          color="text-indigo-700"
        />
        <TarjetaResumenPerfil
          valor={perfil?.cantidad_evaluaciones_registradas ?? 0}
          etiqueta="Evaluaciones registradas"
          color="text-green-700"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Disponibilidad horaria activa
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {disponibilidad.length} bloque
              {disponibilidad.length === 1 ? "" : "s"} registrado
              {disponibilidad.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={cargarPerfil}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
          >
            Actualizar
          </button>
        </div>

        {disponibilidad.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-500">
            Sin disponibilidad activa registrada.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {disponibilidad.map((bloque, index) => (
              <li
                key={`${bloque.dia_semana}-${bloque.hora_inicio}-${bloque.sede}-${index}`}
                className="py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">
                      {obtenerValor(bloque.dia_semana, "Dia no registrado")}
                    </p>
                    <p className="text-slate-500 mt-1">
                      {obtenerValor(bloque.sede, "Sede no registrada")}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="font-bold text-slate-800">
                      {formatearHora(bloque.hora_inicio)} -{" "}
                      {formatearHora(bloque.hora_fin)}
                    </p>
                    <p className="text-sm text-green-700 font-semibold mt-1">
                      {obtenerValor(bloque.estado, "Activa")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default PerfilProfesor;
