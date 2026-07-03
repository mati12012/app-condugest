import { AppDataSource } from "../config/configDb.js";
import Alumno from "../entitys/alumno.entity.js";
import {
    obtenerDominioAlumno,
    generarCorreoBaseAlumno
} from "../helpers/correoInstitucional.helper.js";


const alumnoRepository = AppDataSource.getRepository(Alumno);
export async function existeCorreoAlumno(correo) {
    const alumno = await alumnoRepository.findOne({
        where: {
            correo,
        },
    });

    return Boolean(alumno);
}

export async function generarCorreoAlumnoUnico(nombre, apellido) {
    const dominio = obtenerDominioAlumno();
    const base = generarCorreoBaseAlumno(nombre, apellido);

    let correo = `${base}@${dominio}`;
    let contador = 2;

    while (await existeCorreoAlumno(correo)) {
        correo = `${base}${contador}@${dominio}`;
        contador++;
    }

    return correo;
}

// Es como INSERT INTO alumnos
export async function createAlumno(data) {
    const nuevoAlumno = alumnoRepository.create(data);
    return await alumnoRepository.save(nuevoAlumno);
}

// Es como SELECT * FROM alumnos
export async function getAllAlumnos() {
    return await alumnoRepository.find();
}

// Es como SELECT * FROM alumnos WHERE id = ?
export async function getAlumnoById(id) {
    return await alumnoRepository.findOneBy({ id_alumno: parseInt(id) });
}

// Es como UPDATE alumnos SET ... WHERE id = ?
export async function updateAlumno(id, data) {
    // Verifica si existe antes de actualizar
    const alumnoExiste = await alumnoRepository.findOneBy({ id_alumno: parseInt(id) });
    if (!alumnoExiste) {
        return null;
    }
    //Validar que las clases completadas no superen el total de clases del plan
    const nuevasClases = data.clases_completadas !== undefined ? parseInt(data.clases_completadas) : alumnoExiste.clases_completadas;
    const totalClasesPlan = data.total_clases !== undefined ? parseInt(data.total_clases) : alumnoExiste.total_clases;

    // Bloquear si supera el limite
    if (nuevasClases > totalClasesPlan) {
        return { errorNegocio: `No puedes registrar ${nuevasClases} clases si el plan es de solo ${totalClasesPlan} clases.` };
    }

    // Auto transicion de estados
    // Primero verifica si la secretaria lo esta suspendiendo manualmente
    if (data.estado === "Suspendido") {
        data.estado = "Suspendido";
    } else {
        // Si no esta suspendido, dejamos que el sistema calcule el progreso real
        if (nuevasClases === totalClasesPlan && totalClasesPlan > 0) {
            data.estado = "Finalizado";
        } else if (nuevasClases > 0 && nuevasClases < totalClasesPlan) {
            data.estado = "Activo"; 
        } else if (nuevasClases === 0) {
            data.estado = "Matriculado";
        }
    }

    //Y si existe, y pasa las reglas, lo actualiza 
    await alumnoRepository.update({ id_alumno: parseInt(id) }, data);
    return await getAlumnoById(id);
}

// Es como DELETE FROM alumnos WHERE id = ?
export async function deleteAlumno(id) {
    //Verifica si existe antes de eliminar
    const alumnoExiste = await alumnoRepository.findOneBy({ id_alumno: parseInt(id) });
    if (!alumnoExiste) {
        return null; 
    }
    //Si existe, lo elimina
    await alumnoRepository.delete({ id_alumno: parseInt(id) });
    return alumnoExiste;
}
