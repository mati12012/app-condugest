import { AppDataSource } from "../config/configDb.js";
import ClaseTeorica from "../entitys/claseTeorica.entity.js";
import AsistenciaTeorica from "../entitys/asistencia_teorica.entity.js";

const claseRepository = AppDataSource.getRepository(ClaseTeorica);

function normalizarIdRelacion(valor) {
    if (valor === undefined) return undefined;
    if (valor === null || valor === "") return null;

    return Number(valor);
}

function aplicarDatosClase(clase, data) {
    const camposEscalares = [
        "tema",
        "fecha",
        "hora_inicio",
        "hora_fin",
        "estado",
        "sede",
        "modalidad",
        "link_reunion",
        "codigo_reunion",
        "url_grabacion",
    ];

    camposEscalares.forEach((campo) => {
        if (campo in data) {
            clase[campo] = data[campo];
        }
    });

    if ("id_profesor" in data) {
        const idProfesor = normalizarIdRelacion(data.id_profesor);
        clase.profesor = idProfesor ? { id_profesor: idProfesor } : null;
    }

    if ("id_sala_teorica" in data) {
        const idSalaTeorica = normalizarIdRelacion(data.id_sala_teorica);
        clase.salaTeorica = idSalaTeorica
            ? { id_sala_teorica: idSalaTeorica }
            : null;
    }

    return clase;
}

export async function createClaseTeorica(data) {
    const nuevaClase = aplicarDatosClase(claseRepository.create(), data);

    return await claseRepository.save(nuevaClase);
}

export async function getAllClasesTeoricas() {
    return await claseRepository.find({
        relations: ["profesor", "salaTeorica"],
        order: { fecha: "ASC", hora_inicio: "ASC" },
    });
}

export async function getClaseTeoricaById(id) {
    return await claseRepository.findOne({
        where: { id_clase_teorica: parseInt(id) },
        relations: ["profesor", "salaTeorica"],
    });
}

export async function updateClaseTeorica(id, data) {
    const claseExiste = await claseRepository.findOne({
        where: { id_clase_teorica: parseInt(id) },
        relations: ["profesor", "salaTeorica"],
    });

    if (!claseExiste) return null;

    const claseActualizada = aplicarDatosClase(claseExiste, data);

    await claseRepository.save(claseActualizada);

    return await getClaseTeoricaById(id);
}

export async function buscarChoqueProfesor({ id_profesor, fecha, hora_inicio, hora_fin, id_clase_excluida = null }) {
    let queryTeorica = `
        SELECT 'Teorica' as tipo FROM clases_teoricas
        WHERE id_profesor = $1 AND fecha = $2 AND estado <> 'Cancelada' 
        AND hora_inicio < $4 AND hora_fin > $3
    `;
    const paramsTeorica = [id_profesor, fecha, hora_inicio, hora_fin];
    if (id_clase_excluida) {
        queryTeorica += ` AND id_clase_teorica <> $5`;
        paramsTeorica.push(id_clase_excluida);
    }
    
    const choqueTeorica = await AppDataSource.query(queryTeorica, paramsTeorica);
    if (choqueTeorica.length > 0) return "El profesor ya tiene otra clase teorica en ese horario.";

    const choquePractica = await AppDataSource.query(`
        SELECT 'Practica' as tipo FROM clases_practicas
        WHERE id_profesor = $1 AND fecha = $2 AND estado <> 'Cancelada' 
        AND hora_inicio < $4 AND hora_fin > $3 LIMIT 1
    `, [id_profesor, fecha, hora_inicio, hora_fin]);

    if (choquePractica.length > 0) return "El profesor ya tiene una clase practica asignada en ese horario.";
    
    return null;
}

export async function buscarChoqueSalaTeorica({
    id_sala_teorica,
    fecha,
    hora_inicio,
    hora_fin,
    id_clase_excluida = null,
}) {
    if (!id_sala_teorica) return null;

    let querySala = `
        SELECT id_clase_teorica
        FROM clases_teoricas
        WHERE id_sala_teorica = $1
          AND fecha = $2
          AND estado <> 'Cancelada'
          AND hora_inicio < $4
          AND hora_fin > $3
    `;

    const paramsSala = [id_sala_teorica, fecha, hora_inicio, hora_fin];

    if (id_clase_excluida) {
        querySala += " AND id_clase_teorica <> $5";
        paramsSala.push(id_clase_excluida);
    }

    querySala += " LIMIT 1";

    const choqueSala = await AppDataSource.query(querySala, paramsSala);

    if (choqueSala.length > 0) {
        return "La sala teorica ya tiene otra clase asignada en ese horario.";
    }

    return null;
}

export async function obtenerInscritos(id_clase) {
    return await AppDataSource.query(`
        SELECT
          ast.id_asistencia,
          ast.estado_asistencia,
          ast.modo_participacion,
          ast.fecha_registro,
          a.id_alumno,
          a.rut,
          a.nombre,
          a.apellido,
          a.correo,
          a.sede
        FROM asistencias_teoricas ast
        INNER JOIN alumnos a ON ast.id_alumno = a.id_alumno
        WHERE ast.id_clase_teorica = $1
        ORDER BY a.apellido ASC
    `, [Number(id_clase)]);
}

export async function inscribirAlumno(id_clase, id_alumno, modo_participacion = "Presencial") {
    const repo = AppDataSource.getRepository(AsistenciaTeorica);
    const existe = await repo.findOneBy({ id_clase_teorica: Number(id_clase), id_alumno: Number(id_alumno) });
    if (existe) return null;

    const nueva = repo.create({
        id_clase_teorica: Number(id_clase),
        id_alumno: Number(id_alumno),
        modo_participacion,
    });
    return await repo.save(nueva);
}

export async function quitarAlumno(id_clase, id_alumno) {
    const repo = AppDataSource.getRepository(AsistenciaTeorica);
    await repo.delete({ id_clase_teorica: Number(id_clase), id_alumno: Number(id_alumno) });
    return true;
}
