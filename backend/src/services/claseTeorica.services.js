import { AppDataSource } from "../config/configDb.js";
import ClaseTeorica from "../entitys/claseTeorica.entity.js";
import AsistenciaTeorica from "../entitys/asistencia_teorica.entity.js";

const claseRepository = AppDataSource.getRepository(ClaseTeorica);

export async function createClaseTeorica(data) {
    // Al crear una clase, se asigna el profesor a traves de la relacion
    const nuevaClase = claseRepository.create({
        tema: data.tema,
        fecha: data.fecha,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        estado: data.estado,
        profesor: data.id_profesor,
        sede: data.sede
    });
    return await claseRepository.save(nuevaClase);
}

export async function getAllClasesTeoricas() {
    return await claseRepository.find({ relations: ["profesor"], order: { fecha: "ASC" } });
}

export async function getClaseTeoricaById(id) {
    return await claseRepository.findOne({ where: { id_clase_teorica: parseInt(id) }, relations: ["profesor"] });
}

export async function updateClaseTeorica(id, data) {
    const claseExiste = await claseRepository.findOneBy({ id_clase_teorica: parseInt(id) });
    if (!claseExiste) return null;

    const datosActualizar = {
        ...data,
        profesor: data.id_profesor 
    };
    delete datosActualizar.id_profesor;

    await claseRepository.update({ id_clase_teorica: parseInt(id) }, datosActualizar);
    return await claseRepository.findOne({ where: { id_clase_teorica: parseInt(id) }, relations: ["profesor"] });
}

export async function buscarChoqueProfesor({ id_profesor, fecha, hora_inicio, hora_fin, id_clase_excluida = null }) {
    // Busca en clases teóricas
    let queryTeorica = `
        SELECT 'Teórica' as tipo FROM clases_teoricas 
        WHERE id_profesor = $1 AND fecha = $2 AND estado <> 'Cancelada' 
        AND hora_inicio < $4 AND hora_fin > $3
    `;
    const paramsTeorica = [id_profesor, fecha, hora_inicio, hora_fin];
    if (id_clase_excluida) {
        queryTeorica += ` AND id_clase_teorica <> $5`;
        paramsTeorica.push(id_clase_excluida);
    }
    
    const choqueTeorica = await AppDataSource.query(queryTeorica, paramsTeorica);
    if (choqueTeorica.length > 0) return "El profesor ya tiene otra clase teórica en ese horario.";

    // Busca en clases prácticas
    const choquePractica = await AppDataSource.query(`
        SELECT 'Práctica' as tipo FROM clases_practicas 
        WHERE id_profesor = $1 AND fecha = $2 AND estado <> 'Cancelada' 
        AND hora_inicio < $4 AND hora_fin > $3 LIMIT 1
    `, [id_profesor, fecha, hora_inicio, hora_fin]);

    if (choquePractica.length > 0) return "El profesor ya tiene una clase práctica asignada en ese horario.";
    
    return null;
}

// Obtener alumnos inscritos en una clase
export async function obtenerInscritos(id_clase) {
    return await AppDataSource.query(`
        SELECT ast.id_asistencia, ast.estado_asistencia, a.id_alumno, a.rut, a.nombre, a.apellido, a.correo
        FROM asistencias_teoricas ast
        INNER JOIN alumnos a ON ast.id_alumno = a.id_alumno
        WHERE ast.id_clase_teorica = $1
        ORDER BY a.apellido ASC
    `, [Number(id_clase)]);
}

// Inscribir un alumno 
export async function inscribirAlumno(id_clase, id_alumno) {
    const repo = AppDataSource.getRepository(AsistenciaTeorica);
    const existe = await repo.findOneBy({ id_clase_teorica: Number(id_clase), id_alumno: Number(id_alumno) });
    if (existe) return null; // Ya está inscrito

    const nueva = repo.create({ id_clase_teorica: Number(id_clase), id_alumno: Number(id_alumno) });
    return await repo.save(nueva);
}

// Remover un alumno de la clase
export async function quitarAlumno(id_clase, id_alumno) {
    const repo = AppDataSource.getRepository(AsistenciaTeorica);
    await repo.delete({ id_clase_teorica: Number(id_clase), id_alumno: Number(id_alumno) });
    return true;
}