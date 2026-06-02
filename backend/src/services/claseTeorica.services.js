import { AppDataSource } from "../config/configDb.js";
import ClaseTeorica from "../entitys/claseTeorica.entity.js";

const claseRepository = AppDataSource.getRepository(ClaseTeorica);

export async function createClaseTeorica(data) {
    // Al crear una clase, se asigna el profesor a traves de la relacion
    const nuevaClase = claseRepository.create({
        tema: data.tema,
        fecha: data.fecha,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        estado: data.estado,
        profesor: data.id_profesor 
    });
    return await claseRepository.save(nuevaClase);
}

export async function getAllClasesTeoricas() {
    return await claseRepository.find({ relations: ["profesor"], order: { fecha: "ASC" } });
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

export async function deleteClaseTeorica(id) {
    const claseExiste = await claseRepository.findOneBy({ id_clase_teorica: parseInt(id) });
    if (!claseExiste) return null;
    
    await claseRepository.delete({ id_clase_teorica: parseInt(id) });
    return claseExiste;
}