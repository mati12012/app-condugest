import React, { useState } from 'react';
import { apiFetch } from "../../utils/apiFetch";

const PerfilAlumno = ({ alumnoSeleccionado, cambiarVista }) => {
  // Estados para manejar los datos y la interfaz
  const [alumno, setAlumno] = useState(alumnoSeleccionado);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(alumnoSeleccionado);
  
  // Estados para Carga y Errores
  const [cargando, setCargando] = useState(false);
  const [erroresCampos, setErroresCampos] = useState([]);

  // Para evitar que la pantalla colapse por si acaso
  if (!alumno) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-700 mb-4">Error: No se encontró la información del alumno</h2>
        <button onClick={() => cambiarVista('alumnos')} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Volver</button>
      </div>
    );
  }

  // Para eliminar al alumno seleccionado
  const handleDelete = async () => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${alumno.nombre} ${alumno.apellido}?`);
    if (!confirmar) return;

    setCargando(true);
    try {
      // Usamos el ID del alumno 
      const id = alumno.id_alumno;
      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumnos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Alumno eliminado correctamente.");
        cambiarVista('alumnos'); 
      } else {
        const respuestaServidor = await response.json();
        alert(`Error al eliminar: ${respuestaServidor.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al intentar eliminar.");
    } finally {
      setCargando(false);
    }
  };

  // Para actualizar los datos del alumno
  const handleUpdate = async (e) => {
    e.preventDefault();
    setErroresCampos([]);
    setCargando(true);

    try {
      const id = alumno.id_alumno;
      const { id_alumno, id: bodyId, ...datosLimpios } = editForm;

      // Enviamos todos los datos 
      const datosFinales = {
        ...datosLimpios,
        total_clases: Number(editForm.total_clases),
        clases_completadas: Number(editForm.clases_completadas)
      };

      const response = await apiFetch(`${import.meta.env.VITE_BASE_URL}/alumnos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      const respuestaServidor = await response.json();

      if (response.ok) {
        // Actualizamos los datos en pantalla y cerramos el modo edicion
        setAlumno(respuestaServidor.data); 
        setIsEditing(false);
      } else {
        if (respuestaServidor.errorDetails) {
          const erroresArray = Array.isArray(respuestaServidor.errorDetails) 
            ? respuestaServidor.errorDetails 
            : [respuestaServidor.errorDetails];
          setErroresCampos(erroresArray);
        } else {
          setErroresCampos([respuestaServidor.message || 'Error al actualizar el alumno.']);
        }
      }
    } catch (error) {
      console.error(error);
      setErroresCampos(['Error de conexión al servidor.']);
    } finally {
      setCargando(false);
    }
  };

  const tieneError = (campo) => erroresCampos.some(err => err.toLowerCase().includes(campo));

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      {/* CABECERA Y BOTONES DE ACCION */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{isEditing ? 'Editar Perfil' : 'Perfil del Alumno'}</h2>
          <p className="text-slate-500 mt-1">
            {isEditing ? 'Modifique los datos correspondientes y guarde los cambios.' : 'Visualización y gestión del estudiante.'}
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing && (
            <>
              <button 
                onClick={() => cambiarVista('alumnos')}
                className="px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Volver
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Editar Perfil
              </button>
              <button 
                onClick={handleDelete}
                disabled={cargando}
                className="px-4 py-2 rounded-lg font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {/* ALERTA DE ERRORES */}
      {isEditing && erroresCampos.length > 0 && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm font-medium mb-6">
          <p className="font-bold mb-1">Por favor corrige los siguientes datos:</p>
          <ul className="list-disc pl-5 space-y-1">
            {erroresCampos.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* FORMULARIO Y VISTA DE DATOS */}
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          
          {/* RUT */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">RUT</label>
            {isEditing ? (
              <input 
                type="text" 
                value={editForm.rut}
                onChange={(e) => setEditForm({...editForm, rut: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${tieneError('rut') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{alumno.rut}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
            {isEditing ? (
              <select 
                // Le mostramos "Suspendido" si esta suspendido, sino le mostramos "Automatico"
                value={editForm.estado === 'Suspendido' ? 'Suspendido' : 'Automatico'}
                onChange={(e) => {
                  // Si elige "Automatico", le mandamos cualquier cosa (ej: "Activo") al backend para que el backend haga el calculo matematico real
                  // Si elige "Suspendido", le mandamos "Suspendido" para que el backend aplique la excepcion
                  setEditForm({...editForm, estado: e.target.value === 'Automatico' ? 'Activo' : 'Suspendido'});
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium"
              >
                <option value="Automatico">Progreso Normal (Cálculo Automático)</option>
                <option value="Suspendido">Suspendido (Pausa Manual)</option>
              </select>
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 font-medium">
                <span className={
                  alumno.estado === 'Activo' ? 'text-blue-600' : 
                  alumno.estado === 'Finalizado' ? 'text-green-600' : 
                  alumno.estado === 'Suspendido' ? 'text-red-600' : 'text-slate-600'
                }>
                  {alumno.estado}
                </span>
              </p>
            )}
          </div>

          {/* Nombres */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
            {isEditing ? (
              <input 
                type="text" 
                value={editForm.nombre}
                onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${tieneError('nombre') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{alumno.nombre}</p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
            {isEditing ? (
              <input 
                type="text" 
                value={editForm.apellido}
                onChange={(e) => setEditForm({...editForm, apellido: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${tieneError('apellido') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{alumno.apellido}</p>
            )}
          </div>

          {/* Sede y Licencia */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Sede</label>
            {isEditing ? (
              <select 
                value={editForm.sede}
                onChange={(e) => setEditForm({...editForm, sede: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
              >
                <option value="Sede Concepcion">Sede Concepcion</option>
                <option value="Sede San Pedro">Sede San Pedro</option>
                <option value="Sede Penco">Sede Penco</option>
              </select>
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{alumno.sede}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Licencia</label>
            {isEditing ? (
              <select 
                value={editForm.licencia}
                onChange={(e) => setEditForm({...editForm, licencia: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
              >
                <option value="Clase B">Clase B (Auto)</option>
                <option value="Clase C">Clase C (Moto)</option>
                <option value="Clase A2">Clase A2 (Profesional)</option>
              </select>
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{alumno.licencia}</p>
            )}
          </div>

          {/* Progreso de Clases */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Clases Completadas</label>
            {isEditing ? (
              <input 
                type="number" 
                min="0"
                value={editForm.clases_completadas}
                onChange={(e) => setEditForm({...editForm, clases_completadas: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${tieneError('clase') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{alumno.clases_completadas}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Total de Clases del Plan</label>
            {isEditing ? (
              <input 
                type="number" 
                min="1"
                value={editForm.total_clases}
                onChange={(e) => setEditForm({...editForm, total_clases: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${tieneError('clase') ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
            ) : (
              <p className="text-lg text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{alumno.total_clases}</p>
            )}
          </div>
        </div>

        {/* BOTONES MODO EDICION */}
        {isEditing && (
          <div className="pt-6 border-t mt-8 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setEditForm(alumno); 
                setErroresCampos([]);
              }}
              className="px-5 py-2.5 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={cargando}
              className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors
                ${cargando ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PerfilAlumno;