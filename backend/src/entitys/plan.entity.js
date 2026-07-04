"use strict";

import { EntitySchema } from "typeorm";

const Plan = new EntitySchema({
  name: "Plan",
  tableName: "planes",
  columns: {
    id_plan: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    cantidad_clases_practicas: {
      type: "int",
      nullable: false,
      default: 0,
    },
    cantidad_clases_teoricas: {
      type: "int",
      nullable: false,
      default: 0,
    },
    valor: {
      type: "int",
      nullable: false,
      default: 0,
    },
    tipo: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "Plan",
    },
    estado: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Activo",
    },
  },
});

export default Plan;
