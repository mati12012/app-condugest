import { 
    createClaseTeorica, 
    getAllClasesTeoricas, 
    getClaseTeoricaById, 
    updateClaseTeorica, 
    buscarChoqueProfesor, 
    obtenerInscritos, 
    inscribirAlumno, 
    quitarAlumno,
} from "../services/claseTeorica.services.js";

import { getProfesorById } from "../services/profesor.services.js";

import { 
    validateClaseTeoricaData, 
    validarReglasHorario 
} from "../validations/claseTeorica.validation.js";

import { 
    handleErrorClient, 
    handleErrorServer, 
    handleSuccess 
} from "../handlers/responseHandlers.js";

export async function getClasesTeoricasController(req, res) {
    try {
        const clases = await getAllClasesTeoricas();
        return handleSuccess(res, 200, "Clases teóricas obtenidas", clases);
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
        const claseData = req.body;
        claseData.estado = claseData.estado || "Programada";
        
        const validationErrors = validateClaseTeoricaData(claseData);
        if (validationErrors.length > 0) return handleErrorClient(res, 400, "Datos inválidos", validationErrors);

        const chequeoHorario = validarReglasHorario(claseData.hora_inicio, claseData.hora_fin);
        if (!chequeoHorario.valido) {
            return handleErrorClient(res, 400, "Error de horario", [chequeoHorario.mensaje]);
        }

        const profesor = await getProfesorById(claseData.id_profesor);
        if (!profesor) return handleErrorClient(res, 404, "Profesor no encontrado");
        if (!profesor.estado) return handleErrorClient(res, 400, "Profesor inactivo", ["No se pueden asignar clases a un profesor inactivo."]);

        if (claseData.sede !== "Online" && profesor.sede !== claseData.sede) {
            return handleErrorClient(res, 400, "Incompatibilidad de sede", [
                `El profesor pertenece a ${profesor.sede} y no puede impartir clases presenciales en ${claseData.sede}.`
            ]);
        }

        const conflicto = await buscarChoqueProfesor(claseData);
        if (conflicto) return handleErrorClient(res, 409, "Choque de horario", [conflicto]);

        const nuevaClase = await createClaseTeorica(claseData);
        return handleSuccess(res, 201, "Clase programada", nuevaClase);
    } catch (error) {
        return handleErrorServer(res, 500, "Error de servidor", error.message);
    }
}

export async function updateClaseTeoricaController(req, res) {
    try {
        const { id } = req.params;
        const claseData = req.body;
        
        const claseExistente = await getClaseTeoricaById(id);
        if (!claseExistente) return handleErrorClient(res, 404, "Clase no encontrada");

        const claseFinal = { ...claseExistente, ...claseData };

        const chequeoHorario = validarReglasHorario(claseData.hora_inicio, claseData.hora_fin);
        if (!chequeoHorario.valido) {
            return handleErrorClient(res, 400, "Error de horario", [chequeoHorario.mensaje]);
        }

        if (claseFinal.estado !== "Cancelada") {
            const idProfesor = claseData.id_profesor || (claseExistente.profesor ? claseExistente.profesor.id_profesor : null);
            
            if (!idProfesor) {
                return handleErrorClient(res, 400, "Error de datos", ["La clase no tiene un profesor asignado."]);
            }

            const profesor = await getProfesorById(idProfesor);
            if (!profesor) return handleErrorClient(res, 404, "Profesor no encontrado", ["El profesor asignado ya no existe."]);
            if (!profesor.estado) return handleErrorClient(res, 400, "Profesor inactivo", ["El profesor se encuentra inactivo."]);

            if (claseFinal.sede !== 'Online' && profesor.sede !== claseFinal.sede) {
                return handleErrorClient(res, 400, "Incompatibilidad de sede", `El profesor pertenece a ${profesor.sede} y no puede impartir clases presenciales en ${claseFinal.sede}.`);
            }

            const conflicto = await buscarChoqueProfesor({
                id_profesor: profesor.id_profesor,
                fecha: claseFinal.fecha,
                hora_inicio: claseFinal.hora_inicio,
                hora_fin: claseFinal.hora_fin,
                id_clase_excluida: id
            });
            
            if (conflicto) return handleErrorClient(res, 409, "Choque de horario", [conflicto]);
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
