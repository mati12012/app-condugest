"use strict";

import { EntitySchema } from "typeorm";

const Pago = new EntitySchema({
  name: "Pago",
  tableName: "pagos",
  columns: {
    id_pago: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_matricula: {
      type: "int",
      nullable: false,
    },
    monto: {
      type: "int",
      nullable: false,
    },
    metodo_pago: {
      type: "varchar",
      length: 30,
      nullable: false,
    },
    fecha_pago: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
    estado: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Registrado",
    },
    observacion: {
      type: "text",
      nullable: true,
    },
  },
  foreignKeys: [
    {
      name: "fk_pago_matricula",
      target: "Matricula",
      columnNames: ["id_matricula"],
      referencedColumnNames: ["id_matricula"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default Pago;
