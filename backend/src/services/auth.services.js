"use strict";

import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entitys/usuario.entity.js";
import { getAlumnoById } from "./alumno.services.js";
import { getProfesorById } from "./profesor.services.js";

function usuarioRepository() {
  return AppDataSource.getRepository(Usuario);
}

export async function getUsuarioByCorreo(correo) {
  return await usuarioRepository().findOne({
    where: {
      correo,
    },
  });
}

export async function crearUsuarioAuth({
  correo,
  password,
  rol,
  id_profesor = null,
  id_alumno = null,
  estado = true,
  debe_cambiar_password = true,
  manager = AppDataSource.manager,
}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const repo = manager.getRepository(Usuario);

  const nuevoUsuario = repo.create({
    correo,
    password_hash: passwordHash,
    rol,
    id_profesor,
    id_alumno,
    estado,
    debe_cambiar_password,
  });

  return await repo.save(nuevoUsuario);
}

export async function updateEstadoUsuarioProfesor(idProfesor, estado) {
  return await usuarioRepository().update(
    {
      id_profesor: Number(idProfesor),
      rol: "profesor",
    },
    {
      estado: Boolean(estado),
    }
  );
}

export async function compararPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash);
}

function construirNombreCompleto(nombre, apellido) {
  return [nombre, apellido].filter(Boolean).join(" ").trim();
}

export async function construirUsuarioSesion(usuario) {
  const usuarioSesion = {
    id_usuario: usuario.id_usuario,
    correo: usuario.correo,
    rol: usuario.rol,
    id_profesor: usuario.id_profesor,
    id_alumno: usuario.id_alumno,
    debe_cambiar_password: usuario.debe_cambiar_password,
  };

  if (usuario.rol === "profesor" && usuario.id_profesor) {
    const profesor = await getProfesorById(usuario.id_profesor);

    if (profesor) {
      usuarioSesion.nombre = profesor.nombre;
      usuarioSesion.apellido = profesor.apellido;
      usuarioSesion.nombre_completo = construirNombreCompleto(
        profesor.nombre,
        profesor.apellido
      );
    }
  }

  if (usuario.rol === "alumno" && usuario.id_alumno) {
    const alumno = await getAlumnoById(usuario.id_alumno);

    if (alumno) {
      usuarioSesion.nombre = alumno.nombre;
      usuarioSesion.apellido = alumno.apellido;
      usuarioSesion.nombre_completo = construirNombreCompleto(
        alumno.nombre,
        alumno.apellido
      );
    }
  }

  if (usuario.rol === "secretaria") {
    usuarioSesion.nombre = "Secretaría";
    usuarioSesion.apellido = "ConduGest";
    usuarioSesion.nombre_completo = "Secretaría ConduGest";
  }

  if (!usuarioSesion.nombre_completo) {
    usuarioSesion.nombre_completo = usuarioSesion.correo;
  }

  return usuarioSesion;
}
