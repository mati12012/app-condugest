"use strict";

import jwt from "jsonwebtoken";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

import { validateLogin } from "../validations/auth.validation.js";

import {
  getUsuarioByCorreo,
  compararPassword,
} from "../services/auth.services.js";

import {
  normalizarCorreo,
  obtenerRolPorDominio,
} from "../helpers/auth.helper.js";

export async function loginController(req, res) {
  try {
    const loginData = {
      correo: normalizarCorreo(req.body.correo),
      password: req.body.password,
    };

    const validationErrors = validateLogin(loginData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de inicio de sesión inválidos",
        validationErrors
      );
    }

    const usuario = await getUsuarioByCorreo(loginData.correo);

    if (!usuario) {
      return handleErrorClient(
        res,
        401,
        "Correo o contraseña incorrectos"
      );
    }

    if (!usuario.estado) {
      return handleErrorClient(
        res,
        403,
        "El usuario se encuentra desactivado"
      );
    }

    const passwordValida = await compararPassword(
      loginData.password,
      usuario.password_hash
    );

    if (!passwordValida) {
      return handleErrorClient(
        res,
        401,
        "Correo o contraseña incorrectos"
      );
    }

    const rolPorDominio = obtenerRolPorDominio(usuario.correo);

    if (!rolPorDominio) {
      return handleErrorClient(
        res,
        403,
        "El dominio del correo no está autorizado para ingresar al sistema"
      );
    }

    if (rolPorDominio !== usuario.rol) {
      return handleErrorClient(
        res,
        403,
        "El rol del usuario no coincide con el dominio del correo"
      );
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET || "condugest_dev_secret",
      {
        expiresIn: "8h",
      }
    );

    return handleSuccess(
      res,
      200,
      "Inicio de sesión exitoso",
      {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          correo: usuario.correo,
          rol: usuario.rol,
          id_profesor: usuario.id_profesor,
          id_alumno: usuario.id_alumno,
          debe_cambiar_password: usuario.debe_cambiar_password,
        },
      }
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al iniciar sesión",
      error.message
    );
  }
}