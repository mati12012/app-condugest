import { AppDataSource } from "../config/configDb.js";

import {
  generarCorreoBaseProfesor,
  obtenerDominioProfesor,
} from "../helpers/correoInstitucional.helper.js";

function profesorRepository() {
  return AppDataSource.getRepository("Profesor");
}

export async function getAllProfesores() {
  return await profesorRepository().find({
    order: {
      id_profesor: "ASC",
    },
  });
}

export async function getProfesorById(id) {
  return await profesorRepository().findOne({
    where: {
      id_profesor: Number(id),
    },
  });
}

export async function getProfesorByRut(rut) {
  return await profesorRepository().findOne({
    where: {
      rut,
    },
  });
}

export async function getProfesorByCorreoPersonal(correoPersonal) {
  if (!correoPersonal) return null;

  return await profesorRepository().findOne({
    where: {
      correo_personal: correoPersonal,
    },
  });
}

export async function existeCorreoInstitucional(correoInstitucional) {
  const profesor = await profesorRepository().findOne({
    where: {
      correo_institucional: correoInstitucional,
    },
  });

  return Boolean(profesor);
}

export async function generarCorreoInstitucionalUnico(nombre, apellido) {
  const dominio = obtenerDominioProfesor();
  const base = generarCorreoBaseProfesor(nombre, apellido);

  let correo = `${base}@${dominio}`;
  let contador = 2;

  while (await existeCorreoInstitucional(correo)) {
    correo = `${base}${contador}@${dominio}`;
    contador++;
  }

  return correo;
}

export async function createProfesor(profesorData) {
  const nuevoProfesor = profesorRepository().create(profesorData);
  return await profesorRepository().save(nuevoProfesor);
}

export async function updateProfesor(id, profesorData) {
  const profesor = await getProfesorById(id);

  if (!profesor) {
    return null;
  }

  const profesorActualizado = profesorRepository().merge(
    profesor,
    profesorData
  );

  return await profesorRepository().save(profesorActualizado);
}

export async function deleteProfesor(id) {
  const profesor = await getProfesorById(id);

  if (!profesor) {
    return null;
  }

  await profesorRepository().remove(profesor);

  return profesor;
}