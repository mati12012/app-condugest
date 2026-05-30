import { AppDataSource } from "../config/configDb.js";
import SalaPsicotecnica from "../entitys/salaPsicotecnica.entity.js";

function getSalaRepository() {
  return AppDataSource.getRepository(SalaPsicotecnica);
}

export async function createSala(data) {
  const salaRepository = getSalaRepository();

  const nuevaSala = salaRepository.create(data);
  return await salaRepository.save(nuevaSala);
}

export async function getAllSalas() {
  const salaRepository = getSalaRepository();

  return await salaRepository.find({
    order: {
      id_sala: "ASC",
    },
  });
}

export async function getSalaById(id) {
  const salaRepository = getSalaRepository();

  return await salaRepository.findOneBy({
    id_sala: Number(id),
  });
}

export async function updateSala(id, data) {
  const salaRepository = getSalaRepository();

  const salaExistente = await getSalaById(id);

  if (!salaExistente) {
    return null;
  }

  await salaRepository.update(
    { id_sala: Number(id) },
    data
  );

  return await getSalaById(id);
}

export async function deleteSala(id) {
  const salaRepository = getSalaRepository();

  const salaExistente = await getSalaById(id);

  if (!salaExistente) {
    return null;
  }

  await salaRepository.delete({
    id_sala: Number(id),
  });

  return salaExistente;
}