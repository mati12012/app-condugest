import React, { useState } from 'react';

const RegistrarAlumno = () => {
  const [datos, setDatos] = useState({ nombre: '', correo: '', licencia: 'Clase B', sede: 'Centro' });

  const guardarAlumno = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (response.ok) {
        alert('Alumno registrado exitosamente');
        setDatos({ nombre: '', correo: '', licencia: 'Clase B', sede: 'Centro' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Panel Secretaría - Registrar Alumno</h2>
      <form onSubmit={guardarAlumno} className="bg-white p-6 rounded-lg shadow max-w-md flex flex-col gap-4">
        <input type="text" placeholder="Nombre completo" className="border p-2 rounded" 
          value={datos.nombre} onChange={e => setDatos({...datos, nombre: e.target.value})} required />
        <input type="email" placeholder="Correo electrónico" className="border p-2 rounded"
          value={datos.correo} onChange={e => setDatos({...datos, correo: e.target.value})} required />
        <button type="submit" className="bg-green-600 text-white p-2 rounded font-bold">Guardar Alumno</button>
      </form>
    </div>
  );
};
export default RegistrarAlumno;