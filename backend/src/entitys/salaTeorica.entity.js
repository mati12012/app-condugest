"use strict";

import { EntitySchema } from "typeorm";

const SalaTeorica = new EntitySchema({
  name: "SalaTeorica",
  tableName: "salas_teoricas",
  columns: {
    id_sala_teorica: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    sede: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    capacidad: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Activa",
    },
    observacion: {
      type: "text",
      nullable: true,
    },
  },
});

export default SalaTeorica;
