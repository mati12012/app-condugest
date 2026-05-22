import e from "express";
import { AppDataSource } from "../config/configDb.js";
import Alumno from "../entitys/alumno.entity.js";
import bcrypt from "bcrypt";


const alumnoRepository = AppDataSource.getRepository(Alumno);


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
    return await alumnoRepository.findOneBy({ id_alumno: id });
}

// Es como UPDATE alumnos SET ... WHERE id = ?
export async function updateAlumno(id, data) {
    // Verifica si existe antes de actualizar
    const alumnoExiste = await alumnoRepository.findOneBy({ id_alumno: id });
    if (!alumnoExiste) {
        return null;
    }
    //Y si existe, lo actualiza 
    await alumnoRepository.update({ id_alumno: id }, data);
    return await getAlumnoById(id);
}

// Es como DELETE FROM alumnos WHERE id = ?
export async function deleteAlumno(id) {
    //Verifica si existe antes de eliminar
    const alumnoExiste = await alumnoRepository.findOneBy({ id_alumno: id });
    if (!alumnoExiste) {
        return { mensaje: "Alumno no encontrado" };
    } else {
        //Si existe, lo elimina
        await alumnoRepository.delete({ id_alumno: id });
        return { mensaje: "Alumno eliminado correctamente" };
    }
}
