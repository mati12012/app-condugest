import { 
    createClaseTeorica, 
    getAllClasesTeoricas, 
    getClaseTeoricaById, 
    updateClaseTeorica, 
    buscarChoqueProfesor,
    buscarChoqueSalaTeorica,
    obtenerInscritos, 
    inscribirAlumno, 
    quitarAlumno,
} from "../services/claseTeorica.services.js";

import { getProfesorById } from "../services/profesor.services.js";
import { getSalaTeoricaById } from "../services/salaTeorica.services.js";
import { profesorTieneDisponibilidadParaClase } from "../services/disponibilidadProfesor.services.js";

import { 
    validateClaseTeoricaData, 
    validarReglasHorario,
} from "../validations/claseTeorica.validation.js";

import { normalizarTexto } from "../validations/common.validation.js";

import { 
    handleErrorClient, 
    handleErrorServer, 
    handleSuccess 
} from "../handlers/responseHandlers.js";

function normalizarModalidad(valor) {
    if (valor === "Hibrida") return "Híbrida";
    return valor;
}

function limpiarTextoOpcional(valor) {
    const texto = normalizarTexto(valor);
    return texto || null;
}

function limpiarClaseTeoricaData(data) {
    const datosLimpios = { ...data };

    ["tema", "sede", "estado"].forEach((campo) => {
        if (campo in datosLimpios) {
            datosLimpios[campo] = normalizarTexto(datosLimpios[campo]);
        }
    });

    if ("modalidad" in datosLimpios) {
        datosLimpios.modalidad = normalizarModalidad(normalizarTexto(datosLimpios.modalidad));
    }

    ["link_reunion", "codigo_reunion", "url_grabacion"].forEach((campo) => {
        if (campo in datosLimpios) {
            datosLimpios[campo] = limpiarTextoOpcional(datosLimpios[campo]);
        }
    });

    ["id_profesor", "id_sala_teorica"].forEach((campo) => {
        if (campo in datosLimpios) {
            datosLimpios[campo] = datosLimpios[campo] === "" || datosLimpios[campo] === null
                ? null
                : Number(datosLimpios[campo]);
        }
    });

    if (datosLimpios.modalidad === "Online") {
        datosLimpios.sede = "Online";
        datosLimpios.id_sala_teorica = null;
    }

    return datosLimpios;
}

function modalidadUsaSala(modalidad) {
    return modalidad === "Presencial" || modalidad === "Híbrida";
}

function obtenerIdSalaDesdeClase(clase) {
    return clase?.salaTeorica?.id_sala_teorica || null;
}

function construirClaseFinal(claseExistente, claseData) {
    const idProfesor = "id_profesor" in claseData
        ? claseData.id_profesor
        : claseExistente.profesor?.id_profesor || null;
    const modalidad = normalizarModalidad(
        claseData.modalidad || claseExistente.modalidad || (claseExistente.sede === "Online" ? "Online" : "Presencial")
    );
    const idSala = "id_sala_teorica" in claseData
        ? claseData.id_sala_teorica
        : obtenerIdSalaDesdeClase(claseExistente);

    return {
        tema: claseData.tema ?? claseExistente.tema,
        fecha: claseData.fecha ?? claseExistente.fecha,
        hora_inicio: claseData.hora_inicio ?? String(claseExistente.hora_inicio).slice(0, 5),
        hora_fin: claseData.hora_fin ?? String(claseExistente.hora_fin).slice(0, 5),
        sede: claseData.sede ?? claseExistente.sede,
        estado: claseData.estado ?? claseExistente.estado,
        modalidad,
        id_profesor: idProfesor,
        id_sala_teorica: modalidad === "Online" ? null : idSala,
        link_reunion: claseData.link_reunion ?? claseExistente.link_reunion ?? null,
        codigo_reunion: claseData.codigo_reunion ?? claseExistente.codigo_reunion ?? null,
        url_grabacion: claseData.url_grabacion ?? claseExistente.url_grabacion ?? null,
    };
}

function esActualizacionCompletaORecursos(claseData) {
    return [
        "tema",
        "fecha",
        "hora_inicio",
        "hora_fin",
        "sede",
        "id_profesor",
        "modalidad",
        "id_sala_teorica",
        "link_reunion",
        "codigo_reunion",
        "url_grabacion",
    ].some((campo) => campo in claseData);
}

async function validarDisponibilidadProfesorHorario(res, claseData) {
    const tieneDisponibilidad = await profesorTieneDisponibilidadParaClase({
        id_profesor: claseData.id_profesor,
        fecha: claseData.fecha,
        hora_inicio: claseData.hora_inicio,
        hora_fin: claseData.hora_fin,
        sede: claseData.sede,
    });

    if (!tieneDisponibilidad) {
        handleErrorClient(
            res,
            400,
            "El profesor no tiene disponibilidad en el horario seleccionado."
        );
        return false;
    }

    return true;
}

async function validarSalaTeoricaAsignada(res, claseData, exigirActiva = true) {
    if (!modalidadUsaSala(claseData.modalidad) || !claseData.id_sala_teorica) {
        return true;
    }

    const sala = await getSalaTeoricaById(claseData.id_sala_teorica);

    if (!sala) {
        handleErrorClient(res, 404, "Sala teorica no encontrada");
        return false;
    }

    if (exigirActiva && sala.estado !== "Activa") {
        handleErrorClient(
            res,
            400,
            "Sala teorica inactiva",
            ["No se pueden asignar clases a una sala teorica inactiva."]
        );
        return false;
    }

    claseData.sede = sala.sede;
    return true;
}

async function validarProfesorClase(res, claseData) {
    const profesor = await getProfesorById(claseData.id_profesor);

    if (!profesor) {
        handleErrorClient(res, 404, "Profesor no encontrado");
        return null;
    }

    if (!profesor.estado) {
        handleErrorClient(
            res,
            400,
            "Profesor inactivo",
            ["No se pueden asignar clases a un profesor inactivo."]
        );
        return null;
    }

    if (claseData.sede !== "Online" && profesor.sede !== claseData.sede) {
        handleErrorClient(
            res,
            400,
            "Incompatibilidad de sede",
            [`El profesor pertenece a ${profesor.sede} y no puede impartir clases presenciales en ${claseData.sede}.`]
        );
        return null;
    }

    return profesor;
}

async function validarChoquesAgenda(res, claseData, idClaseExcluida = null) {
    const conflictoProfesor = await buscarChoqueProfesor({
        id_profesor: claseData.id_profesor,
        fecha: claseData.fecha,
        hora_inicio: claseData.hora_inicio,
        hora_fin: claseData.hora_fin,
        id_clase_excluida: idClaseExcluida,
    });

    if (conflictoProfesor) {
        handleErrorClient(res, 409, "Choque de horario", [conflictoProfesor]);
        return false;
    }

    if (modalidadUsaSala(claseData.modalidad) && claseData.id_sala_teorica) {
        const conflictoSala = await buscarChoqueSalaTeorica({
            id_sala_teorica: claseData.id_sala_teorica,
            fecha: claseData.fecha,
            hora_inicio: claseData.hora_inicio,
            hora_fin: claseData.hora_fin,
            id_clase_excluida: idClaseExcluida,
        });

        if (conflictoSala) {
            handleErrorClient(res, 409, "Choque de sala teorica", [conflictoSala]);
            return false;
        }
    }

    return true;
}

export async function getClasesTeoricasController(req, res) {
    try {
        const clases = await getAllClasesTeoricas();
        return handleSuccess(res, 200, "Clases teoricas obtenidas", clases);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener", error.message);
    }
}

export async function getClaseTeoricaController(req, res) {
    try {
        const clase = await getClaseTeoricaById(req.params.id);
        if (!clase) return handleErrorClient(res, 404, "Clase no encontrada");
        return handleSuccess(res, 200, "Clase obtenida", clase);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener", error.message);
    }
}

export async function createClaseTeoricaController(req, res) {
    try {
        const claseData = limpiarClaseTeoricaData(req.body);
        claseData.estado = claseData.estado || "Programada";

        const validationErrors = validateClaseTeoricaData(claseData);
        if (validationErrors.length > 0) {
            return handleErrorClient(res, 400, "Datos invalidos", validationErrors);
        }

        const chequeoHorario = validarReglasHorario(claseData.hora_inicio, claseData.hora_fin);
        if (!chequeoHorario.valido) {
            return handleErrorClient(res, 400, "Error de horario", [chequeoHorario.mensaje]);
        }

        const salaValida = await validarSalaTeoricaAsignada(res, claseData);
        if (!salaValida) return;

        const profesor = await validarProfesorClase(res, claseData);
        if (!profesor) return;

        if (claseData.estado !== "Cancelada") {
            const profesorDisponible = await validarDisponibilidadProfesorHorario(res, claseData);
            if (!profesorDisponible) return;
        }

        const agendaDisponible = await validarChoquesAgenda(res, claseData);
        if (!agendaDisponible) return;

        const nuevaClase = await createClaseTeorica(claseData);
        return handleSuccess(res, 201, "Clase programada", nuevaClase);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
}

export async function updateClaseTeoricaController(req, res) {
    try {
        const { id } = req.params;
        const claseData = limpiarClaseTeoricaData(req.body);
        const claseExistente = await getClaseTeoricaById(id);

        if (!claseExistente) {
            return handleErrorClient(res, 404, "Clase no encontrada");
        }

        const claseFinal = construirClaseFinal(claseExistente, claseData);
        const validarDatosCompletos = esActualizacionCompletaORecursos(claseData);

        if (claseFinal.modalidad === "Online") {
            claseFinal.sede = "Online";
            claseFinal.id_sala_teorica = null;
            if (validarDatosCompletos) {
                claseData.sede = "Online";
                claseData.id_sala_teorica = null;
            }
        }

        if (validarDatosCompletos) {
            const validationErrors = validateClaseTeoricaData(claseFinal);
            if (validationErrors.length > 0) {
                return handleErrorClient(res, 400, "Datos invalidos", validationErrors);
            }
        }

        const chequeoHorario = validarReglasHorario(claseFinal.hora_inicio, claseFinal.hora_fin);
        if (!chequeoHorario.valido) {
            return handleErrorClient(res, 400, "Error de horario", [chequeoHorario.mensaje]);
        }

        if (claseFinal.estado !== "Cancelada") {
            if (!claseFinal.id_profesor) {
                return handleErrorClient(
                    res,
                    400,
                    "Error de datos",
                    ["La clase no tiene un profesor asignado."]
                );
            }

            const salaValida = await validarSalaTeoricaAsignada(
                res,
                claseFinal,
                validarDatosCompletos
            );
            if (!salaValida) return;

            if (validarDatosCompletos && modalidadUsaSala(claseFinal.modalidad)) {
                claseData.sede = claseFinal.sede;
            }

            const profesor = await validarProfesorClase(res, claseFinal);
            if (!profesor) return;

            const profesorDisponible = await validarDisponibilidadProfesorHorario(res, claseFinal);
            if (!profesorDisponible) return;

            const agendaDisponible = await validarChoquesAgenda(res, claseFinal, id);
            if (!agendaDisponible) return;
        }

        const claseActualizada = await updateClaseTeorica(id, claseData);
        return handleSuccess(res, 200, "Clase actualizada exitosamente", claseActualizada);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al actualizar la clase", error.message);
    }
}

export async function getInscritosController(req, res) {
    try {
        const inscritos = await obtenerInscritos(req.params.id);
        return handleSuccess(res, 200, "Lista de inscritos", inscritos);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener inscritos", error.message);
    }
}

export async function inscribirAlumnoController(req, res) {
    try {
        const { id } = req.params;
        const { id_alumno } = req.body;
        if (!id_alumno) return handleErrorClient(res, 400, "Debe enviar el alumno a inscribir");
        
        const inscripcion = await inscribirAlumno(id, id_alumno);
        if (!inscripcion) return handleErrorClient(res, 409, "El alumno ya se encuentra inscrito en esta clase");
        
        return handleSuccess(res, 201, "Alumno inscrito exitosamente", inscripcion);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al inscribir alumno", error.message);
    }
}

export async function quitarAlumnoController(req, res) {
    try {
        const { id, id_alumno } = req.params;
        await quitarAlumno(id, id_alumno);
        return handleSuccess(res, 200, "Alumno removido de la clase");
    } catch (error) {
        return handleErrorServer(res, 500, "Error al remover alumno", error.message);
    }
}
