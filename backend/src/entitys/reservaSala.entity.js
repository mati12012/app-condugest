"use strict";

import { EntitySchema } from "typeorm";

const ReservaSala = new EntitySchema({
  name: "ReservaSala",
  tableName: "reservas_salas",
  columns: {
    id_reserva: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_sala: {
      type: "int",
      nullable: false,
    },
    fecha: {
      type: "date",
      nullable: false,
    },
    hora_inicio: {
      type: "time",
      nullable: false,
    },
    hora_fin: {
      type: "time",
      nullable: false,
    },
    cantidad_alumnos: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 30,
      default: "reservada",
    },
    observacion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
});

export default ReservaSala;