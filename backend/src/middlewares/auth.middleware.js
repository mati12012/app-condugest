import jwt from "jsonwebtoken";
import { handleErrorClient } from "../handlers/responseHandlers.js";

const JWT_SECRET = process.env.JWT_SECRET || "condugest_dev_secret";

function obtenerToken(authHeader) {
  if (!authHeader) return null;

  const [tipo, token] = authHeader.split(" ");

  if (tipo?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function verificarToken(req, res, next) {
  const token = obtenerToken(req.headers.authorization);

  if (!token) {
    return handleErrorClient(
      res,
      401,
      "Acceso denegado. Debes enviar un token Bearer."
    );
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.usuario = payload;
    req.user = payload;

    return next();
  } catch (error) {
    return handleErrorClient(
      res,
      401,
      "Token invalido o expirado.",
      error.message
    );
  }
}

export function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.usuario || req.user;

    if (!usuario) {
      return handleErrorClient(
        res,
        401,
        "Acceso denegado. Debes iniciar sesion."
      );
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para acceder a este recurso."
      );
    }

    return next();
  };
}

export const authMiddleware = verificarToken;
