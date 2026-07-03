"use strict";

import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";

import Usuario from "../entitys/usuario.entity.js";
import { ProfesorEntity } from "../entitys/profesor.entity.js";
import Alumno from "../entitys/alumno.entity.js";

import { normalizarTextoCorreo } from "../helpers/correoInstitucional.helper.js";

const PASSWORD_PROFESORES = "Profesor1234";
const PASSWORD_ALUMNOS = "Alumno1234";

function obtenerEstadoActivo(registro) {
  return registro.estado !== false;
}

function generarBaseCorreoAlumno(alumno) {
  const nombre = normalizarTextoCorreo(alumno.nombre);
  const apellido = normalizarTextoCorreo(alumno.apellido);

  const base = `${nombre}.${apellido}`
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");

  if (base) return base;

  return `alumno${alumno.id_alumno}`;
}

async function existeUsuario(usuarioRepository, correo) {
  const usuario = await usuarioRepository.findOne({
    where: {
      correo,
    },
  });

  return Boolean(usuario);
}

async function generarCorreoAlumnoUnico(usuarioRepository, alumno) {
  const dominio = "alumnos.condugest.cl";
  const base = generarBaseCorreoAlumno(alumno);

  let correo = `${base}@${dominio}`;
  let contador = 2;

  while (await existeUsuario(usuarioRepository, correo)) {
    correo = `${base}${contador}@${dominio}`;
    contador++;
  }

  return correo;
}

async function crearUsuariosExistentes() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const profesorRepository = AppDataSource.getRepository(ProfesorEntity);
    const alumnoRepository = AppDataSource.getRepository(Alumno);

    const credencialesCreadas = [];

    const profesores = await profesorRepository.find();

    for (const profesor of profesores) {
      const correo = String(profesor.correo_institucional || "")
        .trim()
        .toLowerCase();

      if (!correo) {
        console.log(
          `Profesor ID ${profesor.id_profesor} no tiene correo institucional. Se omite.`
        );
        continue;
      }

      const usuarioExistente = await usuarioRepository.findOne({
        where: {
          correo,
        },
      });

      if (usuarioExistente) {
        console.log(`Usuario profesor ya existe: ${correo}`);
        continue;
      }

      const passwordHash = await bcrypt.hash(PASSWORD_PROFESORES, 10);

      const nuevoUsuario = usuarioRepository.create({
        correo,
        password_hash: passwordHash,
        rol: "profesor",
        id_profesor: profesor.id_profesor,
        id_alumno: null,
        estado: obtenerEstadoActivo(profesor),
        debe_cambiar_password: true,
      });

      await usuarioRepository.save(nuevoUsuario);

      credencialesCreadas.push({
        rol: "profesor",
        correo,
        password: PASSWORD_PROFESORES,
      });
    }

    const alumnos = await alumnoRepository.find();

    for (const alumno of alumnos) {
      const correo = await generarCorreoAlumnoUnico(usuarioRepository, alumno);

      const usuarioExistente = await usuarioRepository.findOne({
        where: {
          correo,
        },
      });

      if (usuarioExistente) {
        console.log(`Usuario alumno ya existe: ${correo}`);
        continue;
      }

      const passwordHash = await bcrypt.hash(PASSWORD_ALUMNOS, 10);

      const nuevoUsuario = usuarioRepository.create({
        correo,
        password_hash: passwordHash,
        rol: "alumno",
        id_profesor: null,
        id_alumno: alumno.id_alumno,
        estado: obtenerEstadoActivo(alumno),
        debe_cambiar_password: true,
      });

      await usuarioRepository.save(nuevoUsuario);

      credencialesCreadas.push({
        rol: "alumno",
        correo,
        password: PASSWORD_ALUMNOS,
      });
    }

    console.log("\nUsuarios creados exitosamente:\n");

    if (credencialesCreadas.length === 0) {
      console.log("No se crearon usuarios nuevos. Probablemente ya existían.");
    } else {
      console.table(credencialesCreadas);
    }
  } catch (error) {
    console.error("Error al crear usuarios existentes:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    process.exit(0);
  }
}

crearUsuariosExistentes();
