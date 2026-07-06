import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { formatearFechaVisual } from "../../utils/formatearFecha";

const TIPOS_MATERIAL = ["PDF", "Video", "Link", "Documento", "Otro"];
const ESTADOS_MATERIAL = ["Activo", "Inactivo"];
const API_ORIGIN = import.meta.env.VITE_BASE_URL.replace("/api", "");
const MAX_ARCHIVO_BYTES = 10 * 1024 * 1024;
const EXTENSIONES_ARCHIVO = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".ppt", ".pptx"];

const formularioInicial = {
  titulo: "",
  descripcion: "",
  tipo: "PDF",
  url_material: "",
  id_clase_teorica: "",
  estado: "Activo",
};

function obtenerMensajeError(data, mensajeFallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails.join(" ");
  }

  return data?.message || mensajeFallback;
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

function obtenerClaseTipo(tipo) {
  const clasesPorTipo = {
    PDF: "bg-red-50 text-red-700",
    Video: "bg-purple-50 text-purple-700",
    Link: "bg-blue-50 text-blue-700",
    Documento: "bg-amber-50 text-amber-700",
    Otro: "bg-slate-100 text-slate-700",
  };

  return clasesPorTipo[tipo] || clasesPorTipo.Otro;
}

function obtenerUrlAbrirMaterial(urlMaterial) {
  if (!urlMaterial) return "";

  if (urlMaterial.startsWith("http")) {
    return urlMaterial;
  }

  if (urlMaterial.startsWith("/uploads")) {
    return `${API_ORIGIN}${urlMaterial}`;
  }

  return urlMaterial;
}

function obtenerNombreArchivo(urlMaterial) {
  if (!urlMaterial) return "";

  return urlMaterial.split("/").pop() || urlMaterial;
}

function validarArchivoMaterial(archivo, tipo) {
  if (!archivo) return "";

  if (tipo === "Video") {
    return "Para videos, se recomienda usar un enlace externo en lugar de subir un archivo.";
  }

  if (archivo.size > MAX_ARCHIVO_BYTES) {
    return "El archivo no puede superar los 10 MB.";
  }

  const nombre = archivo.name.toLowerCase();
  const extensionValida = EXTENSIONES_ARCHIVO.some((extension) =>
    nombre.endsWith(extension)
  );

  if (!extensionValida) {
    return "Formato no valido. Solo se permiten PDF, JPG, PNG, DOC, DOCX, PPT o PPTX.";
  }

  return "";
}

function formatearClase(clase) {
  if (!clase) return "Sin clase asociada";

  const fecha = formatearFechaVisual(clase.fecha);
  const inicio = String(clase.hora_inicio || "").slice(0, 5);
  const fin = String(clase.hora_fin || "").slice(0, 5);
  const horario = inicio ? `${inicio}${fin ? ` - ${fin}` : ""}` : "";

  return `${clase.tema || "Clase teorica"} - ${fecha}${horario ? ` (${horario})` : ""}`;
}

async function obtenerMaterialesSecretaria() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/materiales-estudio`);
  const respuestaServidor = await response.json();

  if (!response.ok) {
    throw new Error(
      obtenerMensajeError(respuestaServidor, "No se pudieron obtener los materiales")
    );
  }

  return respuestaServidor.data || [];
}

async function obtenerClasesTeoricasSecretaria() {
  const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas`);
  const respuestaServidor = await response.json();

  if (!response.ok) {
    throw new Error(
      obtenerMensajeError(respuestaServidor, "No se pudieron obtener las clases teoricas")
    );
  }

  return respuestaServidor.data || [];
}

function VistaMaterialesEstudio() {
  const [materiales, setMateriales] = useState([]);
  const [clasesTeoricas, setClasesTeoricas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoActual, setArchivoActual] = useState("");
  const [errorArchivo, setErrorArchivo] = useState("");
  const [archivoInputKey, setArchivoInputKey] = useState(0);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [materialesData, clasesData] = await Promise.all([
        obtenerMaterialesSecretaria(),
        obtenerClasesTeoricasSecretaria(),
      ]);

      setMateriales(materialesData);
      setClasesTeoricas(clasesData);
    } catch (errorCarga) {
      setError(errorCarga.message || "Error de conexion con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function cargarDatosIniciales() {
      try {
        setCargando(true);
        setError("");

        const [materialesData, clasesData] = await Promise.all([
          obtenerMaterialesSecretaria(),
          obtenerClasesTeoricasSecretaria(),
        ]);

        if (activo) {
          setMateriales(materialesData);
          setClasesTeoricas(clasesData);
        }
      } catch (errorCarga) {
        if (activo) {
          setError(errorCarga.message || "Error de conexion con el servidor");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatosIniciales();

    return () => {
      activo = false;
    };
  }, []);

  const materialesFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return materiales.filter((material) => {
      const titulo = material.titulo?.toLowerCase() || "";
      const coincideBusqueda = !textoBusqueda || titulo.includes(textoBusqueda);
      const coincideTipo = filtroTipo === "Todos" || material.tipo === filtroTipo;

      return coincideBusqueda && coincideTipo;
    });
  }, [busqueda, filtroTipo, materiales]);

  const totalMateriales = materiales.length;
  const totalActivos = materiales.filter((material) => material.estado === "Activo").length;
  const totalInactivos = materiales.filter((material) => material.estado === "Inactivo").length;

  function abrirFormularioCrear() {
    setFormulario(formularioInicial);
    setMaterialEditando(null);
    setArchivoSeleccionado(null);
    setArchivoActual("");
    setErrorArchivo("");
    setArchivoInputKey((key) => key + 1);
    setFormularioVisible(true);
    setErrorFormulario("");
    setMensaje("");
  }

  function abrirFormularioEditar(material) {
    const esArchivoSubido = material.url_material?.startsWith("/uploads");

    setFormulario({
      titulo: material.titulo || "",
      descripcion: material.descripcion || "",
      tipo: material.tipo || "PDF",
      url_material: esArchivoSubido ? "" : material.url_material || "",
      id_clase_teorica: material.id_clase_teorica || "",
      estado: material.estado || "Activo",
    });
    setMaterialEditando(material);
    setArchivoSeleccionado(null);
    setArchivoActual(esArchivoSubido ? material.url_material : "");
    setErrorArchivo("");
    setArchivoInputKey((key) => key + 1);
    setFormularioVisible(true);
    setErrorFormulario("");
    setMensaje("");
  }

  function cerrarFormulario() {
    setFormularioVisible(false);
    setMaterialEditando(null);
    setFormulario(formularioInicial);
    setArchivoSeleccionado(null);
    setArchivoActual("");
    setErrorArchivo("");
    setArchivoInputKey((key) => key + 1);
    setErrorFormulario("");
  }

  function manejarCambioFormulario(evento) {
    const { name, value } = evento.target;

    if (name === "tipo" && value === "Video" && archivoSeleccionado) {
      setArchivoSeleccionado(null);
      setArchivoInputKey((key) => key + 1);
      setErrorArchivo("Para videos, se recomienda usar un enlace externo en lugar de subir un archivo.");
    }

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  }

  function manejarCambioArchivo(evento) {
    const archivo = evento.target.files?.[0] || null;

    if (!archivo) {
      setArchivoSeleccionado(null);
      setErrorArchivo("");
      return;
    }

    const errorValidacion = validarArchivoMaterial(archivo, formulario.tipo);

    if (errorValidacion) {
      setArchivoSeleccionado(null);
      setErrorArchivo(errorValidacion);
      setArchivoInputKey((key) => key + 1);
      return;
    }

    setArchivoSeleccionado(archivo);
    setErrorArchivo("");
  }

  function crearFormDataMaterial() {
    const formData = new FormData();

    formData.append("titulo", formulario.titulo.trim());
    formData.append("descripcion", formulario.descripcion.trim());
    formData.append("tipo", formulario.tipo);
    formData.append("id_clase_teorica", formulario.id_clase_teorica || "");
    formData.append("estado", formulario.estado);

    if (formulario.url_material.trim()) {
      formData.append("url_material", formulario.url_material.trim());
    }

    if (archivoSeleccionado) {
      formData.append("archivo", archivoSeleccionado);
    }

    return formData;
  }

  async function guardarMaterial(evento) {
    evento.preventDefault();

    try {
      setGuardando(true);
      setErrorFormulario("");
      setMensaje("");

      const errorValidacionArchivo = validarArchivoMaterial(
        archivoSeleccionado,
        formulario.tipo
      );

      if (errorValidacionArchivo) {
        setErrorArchivo(errorValidacionArchivo);
        return;
      }

      if (
        formulario.tipo === "Video" &&
        archivoActual &&
        !archivoSeleccionado &&
        !formulario.url_material.trim()
      ) {
        setErrorFormulario("Para materiales de tipo Video, se recomienda usar un enlace externo.");
        return;
      }

      if (!archivoSeleccionado && !formulario.url_material.trim() && !materialEditando) {
        setErrorFormulario("Debes ingresar un enlace o subir un archivo para el material.");
        return;
      }

      const formData = crearFormDataMaterial();
      const esEdicion = Boolean(materialEditando);
      const url = esEdicion
        ? `${import.meta.env.VITE_BASE_URL}/materiales-estudio/${materialEditando.id_material}`
        : `${import.meta.env.VITE_BASE_URL}/materiales-estudio`;

      const response = await apiFetch(url, {
        method: esEdicion ? "PATCH" : "POST",
        body: formData,
      });

      const respuestaServidor = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(respuestaServidor, "No se pudo guardar el material")
        );
      }

      await cargarDatos();
      cerrarFormulario();
      setMensaje(
        esEdicion
          ? "Material actualizado exitosamente."
          : "Material creado exitosamente."
      );
    } catch (errorGuardar) {
      setErrorFormulario(errorGuardar.message || "No se pudo guardar el material");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoMaterial(material) {
    const nuevoEstado = material.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      setMensaje("");
      setError("");

      const response = await apiFetch(
        `${import.meta.env.VITE_BASE_URL}/materiales-estudio/${material.id_material}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const respuestaServidor = await response.json();

      if (!response.ok) {
        throw new Error(
          obtenerMensajeError(respuestaServidor, "No se pudo cambiar el estado del material")
        );
      }

      const materialActualizado = respuestaServidor.data || {
        ...material,
        estado: nuevoEstado,
      };

      setMateriales((materialesActuales) =>
        materialesActuales.map((item) =>
          item.id_material === material.id_material ? materialActualizado : item
        )
      );
      setMensaje(
        `Material ${nuevoEstado === "Activo" ? "activado" : "inactivado"} exitosamente.`
      );
    } catch (errorEstado) {
      setError(errorEstado.message || "No se pudo cambiar el estado del material");
    }
  }

  function abrirMaterial(material) {
    window.open(obtenerUrlAbrirMaterial(material.url_material), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Materiales de Estudio
          </h1>
          <p className="text-slate-500">
            Administra recursos visibles para alumnos y su asociacion opcional a clases teoricas.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirFormularioCrear}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          + Nuevo Material
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total materiales</p>
          <p className="text-3xl font-bold text-slate-800">{totalMateriales}</p>
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
          onSubmit={guardarMaterial}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {materialEditando ? "Editar material" : "Nuevo material"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Puedes subir un archivo o pegar un enlace externo. Para videos, se recomienda usar un enlace.
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
                Titulo
              </label>
              <input
                type="text"
                name="titulo"
                value={formulario.titulo}
                onChange={manejarCambioFormulario}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Ej: Manual del conductor"
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
                {TIPOS_MATERIAL.map((tipo) => (
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
                placeholder="Describe brevemente el contenido del material"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL del material
              </label>
              <input
                type="url"
                name="url_material"
                value={formulario.url_material}
                onChange={manejarCambioFormulario}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="https://..."
              />
              {archivoActual && !archivoSeleccionado && (
                <p className="text-xs text-slate-500 mt-2">
                  Archivo actual: {obtenerNombreArchivo(archivoActual)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Archivo
              </label>
              <input
                key={archivoInputKey}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                onChange={manejarCambioArchivo}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                PDF, JPG, PNG, DOC, DOCX, PPT o PPTX. Maximo 10 MB.
              </p>
              {archivoSeleccionado && (
                <p className="text-xs font-semibold text-blue-700 mt-2">
                  Archivo seleccionado: {archivoSeleccionado.name}
                </p>
              )}
              {errorArchivo && (
                <p className="text-xs font-semibold text-red-600 mt-2">
                  {errorArchivo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clase teorica asociada
              </label>
              <select
                name="id_clase_teorica"
                value={formulario.id_clase_teorica}
                onChange={manejarCambioFormulario}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Sin asociar</option>
                {clasesTeoricas.map((clase) => (
                  <option
                    key={clase.id_clase_teorica}
                    value={clase.id_clase_teorica}
                  >
                    {formatearClase(clase)}
                  </option>
                ))}
              </select>
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
                {ESTADOS_MATERIAL.map((estado) => (
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
              {guardando
                ? "Guardando..."
                : materialEditando
                  ? "Guardar cambios"
                  : "Crear material"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <input
            type="text"
            placeholder="Buscar por titulo..."
            className="w-full max-w-xl px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {["Todos", ...TIPOS_MATERIAL].map((tipo) => {
              const activo = filtroTipo === tipo;

              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    activo
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {tipo}
                </button>
              );
            })}
          </div>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500">
            Cargando materiales...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">Material</th>
                  <th className="p-4 font-bold">Tipo</th>
                  <th className="p-4 font-bold">Clase asociada</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {materialesFiltrados.map((material) => (
                  <tr key={material.id_material} className="hover:bg-slate-50 align-top">
                    <td className="p-4 min-w-80">
                      <p className="font-bold text-slate-800">{material.titulo}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {material.descripcion || "Sin descripcion registrada"}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 break-all">
                        {material.url_material}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${obtenerClaseTipo(material.tipo)}`}>
                        {material.tipo}
                      </span>
                    </td>

                    <td className="p-4 min-w-72 text-sm text-slate-700">
                      {material.clase_teorica ? (
                        <div>
                          <p className="font-semibold text-slate-800">
                            {material.clase_teorica.tema}
                          </p>
                          <p className="text-slate-500 mt-1">
                            {formatearFechaVisual(material.clase_teorica.fecha)}
                            {" "}
                            {String(material.clase_teorica.hora_inicio || "").slice(0, 5)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sin clase asociada</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${obtenerClaseEstado(material.estado)}`}>
                        {material.estado}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <button
                          type="button"
                          onClick={() => abrirMaterial(material)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Abrir material
                        </button>

                        <button
                          type="button"
                          onClick={() => abrirFormularioEditar(material)}
                          className="text-amber-600 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => cambiarEstadoMaterial(material)}
                          className={`hover:underline text-sm font-medium ${
                            material.estado === "Activo"
                              ? "text-slate-600"
                              : "text-green-600"
                          }`}
                        >
                          {material.estado === "Activo" ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!error && materialesFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                {materiales.length === 0
                  ? "Aun no hay materiales registrados. Crea el primer material para comenzar."
                  : "No se encontraron materiales con los filtros aplicados."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VistaMaterialesEstudio;
