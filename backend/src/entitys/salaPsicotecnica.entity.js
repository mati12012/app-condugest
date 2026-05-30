"use strict";

import { EntitySchema } from "typeorm";

const SalaPsicotecnica = new EntitySchema({
  name: "SalaPsicotecnica",
  tableName: "salas_psicotecnicas",
  columns: {
    id_sala: {
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
      type: "boolean",
      default: true,
    },
  },
});

export default SalaPsicotecnica;