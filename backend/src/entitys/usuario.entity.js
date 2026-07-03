"use strict";

import { EntitySchema } from "typeorm";

const Usuario = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",

  columns: {
    id_usuario: {
      type: "int",
      primary: true,
      generated: true,
    },

    correo: {
      type: "varchar",
      length: 150,
      unique: true,
      nullable: false,
    },

    password_hash: {
      type: "varchar",
      length: 255,
      nullable: false,
    },

    rol: {
      type: "varchar",
      length: 30,
      nullable: false,
    },

    id_profesor: {
      type: "int",
      nullable: true,
    },

    id_alumno: {
      type: "int",
      nullable: true,
    },

    estado: {
      type: "boolean",
      default: true,
    },

    debe_cambiar_password: {
      type: "boolean",
      default: true,
    },

    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
});

export default Usuario;