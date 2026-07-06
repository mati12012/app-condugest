import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { validarHorarioAtencion } from "../../utils/validacionesFormulario";

const formularioInicial = {
  tema: "",
  fecha: "",
  hora_inicio: "",
  hora_fin: "",
  sede: "",
  modalidad: "Presencial",
  id_sala_teorica: "",
  link_reunion: "",
  codigo_reunion: "",
  url_grabacion: "",
  id_profesor: "",
  estado: "Programada",
};

const modalidades = ["Presencial", "Online", "Híbrida"];

function modalidadRequiereSala(modalidad) {
  return modalidad === "Presencial" || modalidad === "Híbrida";
}

function modalidadRequiereLink(modalidad) {
  return modalidad === "Online" || modalidad === "Híbrida";
}

function obtenerMensajeError(data, fallback) {
  if (Array.isArray(data?.errorDetails)) {
    return data.errorDetails;
  }

  if (data?.errorDetails) {
    return [data.errorDetails];
  }

  return [data?.message || fallback];
}

const RegistrarClaseTeorica = ({ cambiarVista }) => {
  const [datos, setDatos] = useState(formularioInicial);
  const [profesores, setProfesores] = useState([]);
  const [salas, setSalas] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);
  const [erroresCampos, setErroresCampos] = useState([]);

  const obtenerDatosIniciales = useCallback(async () => {
    try {
      const [resProfesores, resSalas] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_BASE_URL}/profesores`),
        apiFetch(`${import.meta.env.VITE_BASE_URL}/salas-teoricas`),
      ]);
      const dataProfesores = await resProfesores.json();
      const dataSalas = await resSalas.json();

      if (resProfesores.ok) {
        setProfesores(dataProfesores.data || []);
      }

      if (resSalas.ok) {
        setSalas(dataSalas.data || []);
      }
    } catch (error) {
      console.error("No se pudieron cargar los datos iniciales", error);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(obtenerDatosIniciales);
  }, [obtenerDatosIniciales]);

  const salasActivas = useMemo(
    () => salas.filter((sala) => sala.estado === "Activa"),
    [salas]
  );

  const salaSeleccionada = useMemo(
    () => salas.find((sala) => Number(sala.id_sala_teorica) === Number(datos.id_sala_teorica)),
    [datos.id_sala_teorica, salas]
  );

  const profesoresDisponibles = useMemo(() => {
    return profesores
      .filter((profesor) => profesor.estado === true)
      .filter((profesor) => datos.modalidad === "Online" || !datos.sede || profesor.sede === datos.sede);
  }, [datos.modalidad, datos.sede, profesores]);

  function actualizarCampo(campo, valor) {
    setDatos((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function cambiarModalidad(modalidad) {
    setDatos((actual) => ({
      ...actual,
      modalidad,
      id_sala_teorica: modalidad === "Online" ? "" : actual.id_sala_teorica,
      sede: modalidad === "Online" ? "Online" : (salaSeleccionada?.sede || ""),
      id_profesor: "",
    }));
  }

  function cambiarSala(idSala) {
    const sala = salas.find((item) => Number(item.id_sala_teorica) === Number(idSala));

    setDatos((actual) => ({
      ...actual,
      id_sala_teorica: idSala,
      sede: sala?.sede || "",
      id_profesor: "",
    }));
  }

  function validarFormulario() {
    const errores = [];

    if (!datos.id_profesor) {
      errores.push("Debe seleccionar un profesor para la clase.");
    }

    if (modalidadRequiereSala(datos.modalidad) && !datos.id_sala_teorica) {
      errores.push("Para clases presenciales o hibridas, selecciona una sala teorica.");
    }

    if (modalidadRequiereLink(datos.modalidad) && !datos.link_reunion.trim()) {
      errores.push("Para clases online o hibridas, ingresa el link de Meet/Zoom.");
    }

    const errorHorario = validarHorarioAtencion(datos.hora_inicio, datos.hora_fin);
    if (errorHorario) {
      errores.push(errorHorario);
    }

    return errores;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeExito("");
    setErroresCampos([]);
    setCargando(true);

    const erroresLocales = validarFormulario();

    if (erroresLocales.length > 0) {
      setErroresCampos(erroresLocales);
      setCargando(false);
      return;
    }

    const datosFinales = {
      ...datos,
      sede: datos.modalidad === "Online" ? "Online" : salaSeleccionada?.sede || datos.sede,
      id_profesor: Number(datos.id_profesor),
      id_sala_teorica: modalidadRequiereSala(datos.modalidad) ? Number(datos.id_sala_teorica) : null,
      link_reunion: datos.link_reunion.trim() || null,
      codigo_reunion: datos.codigo_reunion.trim() || null,
      url_grabacion: datos.url_grabacion.trim() || null,
    };

    try {
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/clases-teoricas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosFinales),
      });

      const respuestaServidor = await response.json();

      if (response.ok) {
        setMensajeExito("Clase teorica programada exitosamente.");
        setErroresCampos([]);
        setDatos(formularioInicial);
      } else {
        setErroresCampos(obtenerMensajeError(respuestaServidor, "Error al guardar la clase."));
      }
    } catch (error) {
      console.error(error);
      setErroresCampos(["No se pudo conectar con el servidor."]);
    } finally {
      setCargando(false);
    }
  };

  const tieneError = (campo) => erroresCampos.some((err) => err.toLowerCase().includes(campo));

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b pb-4 flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Programar Clase Teorica</h2>
          <p className="text-slate-500 mt-1">Ingrese los detalles para agendar una nueva clase.</p>
        </div>
        <button
          type="button"
          onClick={() => cambiarVista("clasesTeoricas")}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mensajeExito && (
          <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg font-medium text-sm">
            {mensajeExito}
          </div>
        )}

        {erroresCampos.length > 0 && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium">
            <p className="font-bold mb-1">Por favor corrige los siguientes datos:</p>
            <ul className="list-disc pl-5 space-y-1">
              {erroresCampos.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tema de la clase</label>
          <input
            type="text"
            placeholder="Ej: Leyes del transito y senaleticas"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
              tieneError("tema") ? "border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30" : "border-slate-300 focus:ring-2 focus:ring-blue-600"
            }`}
            value={datos.tema}
            onChange={(e) => actualizarCampo("tema", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Modalidad</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
              value={datos.modalidad}
              onChange={(e) => cambiarModalidad(e.target.value)}
              required
            >
              {modalidades.map((modalidad) => (
                <option key={modalidad} value={modalidad}>{modalidad}</option>
              ))}
            </select>
          </div>

          {modalidadRequiereSala(datos.modalidad) && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sala teorica</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                value={datos.id_sala_teorica}
                onChange={(e) => cambiarSala(e.target.value)}
                required
              >
                <option value="">Seleccione una sala...</option>
                {salasActivas.map((sala) => (
                  <option key={sala.id_sala_teorica} value={sala.id_sala_teorica}>
                    {sala.nombre} - {sala.sede} ({sala.capacidad} personas)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Profesor Asignado</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
              value={datos.id_profesor}
              onChange={(e) => actualizarCampo("id_profesor", e.target.value)}
              required
            >
              <option value="">Seleccione un profesor...</option>
              {profesoresDisponibles.map((prof) => (
                <option key={prof.id_profesor} value={prof.id_profesor}>
                  {prof.nombre} {prof.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha</label>
            <input
              type="date"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
                tieneError("fecha") ? "border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30" : "border-slate-300 focus:ring-2 focus:ring-blue-600"
              }`}
              value={datos.fecha}
              onChange={(e) => actualizarCampo("fecha", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Inicio</label>
            <input
              type="time"
              min="09:00"
              max="20:00"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
                tieneError("inicio") ? "border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30" : "border-slate-300 focus:ring-2 focus:ring-blue-600"
              }`}
              value={datos.hora_inicio}
              onChange={(e) => actualizarCampo("hora_inicio", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hora Fin</label>
            <input
              type="time"
              min="09:00"
              max="20:00"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-shadow ${
                tieneError("fin") ? "border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30" : "border-slate-300 focus:ring-2 focus:ring-blue-600"
              }`}
              value={datos.hora_fin}
              onChange={(e) => actualizarCampo("hora_fin", e.target.value)}
              required
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 -mt-3">
          Horario de atencion permitido: 09:00 a 20:00. La hora de fin debe ser posterior al inicio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modalidadRequiereLink(datos.modalidad) && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Link de reunion</label>
              <input
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={datos.link_reunion}
                onChange={(e) => actualizarCampo("link_reunion", e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Codigo de reunion</label>
            <input
              type="text"
              placeholder="Ej: 123 456 789"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={datos.codigo_reunion}
              onChange={(e) => actualizarCampo("codigo_reunion", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">URL de grabacion</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={datos.url_grabacion}
              onChange={(e) => actualizarCampo("url_grabacion", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1 text-xs text-slate-400 -mt-3">
          <p>Para clases online o hibridas, ingresa el link de Meet/Zoom.</p>
          <p>Para clases presenciales o hibridas, selecciona una sala teorica.</p>
        </div>

        <div className="pt-4 border-t mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => cambiarVista("clasesTeoricas")}
            className="px-5 py-2.5 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors
              ${cargando ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {cargando ? "Guardando..." : "Programar Clase"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarClaseTeorica;
