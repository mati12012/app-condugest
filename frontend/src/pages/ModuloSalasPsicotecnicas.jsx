import React, { useState } from "react";
import ReservaSalaPsicotecnica from "./ReservaSalaPsicotecnica";
import AdministrarSalasPsicotecnicas from "./AdministrarSalasPsicotecnicas";

function ModuloSalasPsicotecnicas() {
  const [pestanaActiva, setPestanaActiva] = useState("reservas");

  return (
    <section className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Salas psicotécnicas
        </h1>
        <p className="text-slate-500 mt-1">
          Administración de salas y gestión de reservas para Secretaría.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setPestanaActiva("administrar")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            pestanaActiva === "administrar"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Administrar salas
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("reservas")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            pestanaActiva === "reservas"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Reservas de salas
        </button>
      </div>

      {pestanaActiva === "administrar" && <AdministrarSalasPsicotecnicas />}

      {pestanaActiva === "reservas" && <ReservaSalaPsicotecnica />}
    </section>
  );
}

export default ModuloSalasPsicotecnicas;