 # Requerimientos funcionales iniciales

## RF01 - Registrar alumno
El sistema debe permitir que la secretaria registre a un nuevo alumno en la plataforma cuando este se matricule en la escuela de conducción. Para ello, la secretaria deberá ingresar los datos personales del alumno, tipo de licencia, sede, curso asociado y estado inicial de matrícula. El sistema deberá validar que los datos obligatorios estén completos antes de guardar el registro. Como resultado, el alumno quedará creado en el sistema y podrá ser asociado a clases teóricas, clases prácticas y seguimiento de asistencia.

## RF02 - Agendar clases teóricas
El sistema debe permitir que la secretaria agende clases teóricas online para los alumnos cuando exista una programación disponible del curso. Para ello, deberá ingresar la fecha, hora, profesor asignado, modalidad online y enlace de acceso a la clase, como Zoom o Google Meet. Las clases teóricas no tendrán límite de capacidad de alumnos, pero deberán quedar asociadas al curso correspondiente. Como resultado, la clase quedará disponible en la agenda del sistema y podrá ser visualizada por los alumnos inscritos.

## RF03 - Agendar clases prácticas
El sistema debe permitir que la secretaria agende clases prácticas presenciales para los alumnos cuando exista disponibilidad de horario, profesor, sede y vehículo. Para ello, deberá seleccionar al alumno, fecha, hora, profesor, sede y tipo de vehículo requerido. El sistema deberá validar que la clase se programe dentro del horario permitido de 09:00 a 20:00 y que no existan conflictos de disponibilidad. Como resultado, la clase práctica quedará registrada en la agenda del alumno y del profesor.

## RF04 - Registrar asistencia
El sistema debe permitir que el profesor registre la asistencia de los alumnos en cada clase teórica o práctica al momento de finalizar la sesión. Para ello, el profesor deberá marcar a cada alumno como presente o ausente desde la lista de la clase correspondiente. El sistema deberá guardar la asistencia solo para clases previamente agendadas. Como resultado, la asistencia quedará registrada y será considerada en el cálculo del porcentaje mínimo requerido para aprobar el curso.

## RF05 - Calcular porcentaje de asistencia de los alumnos
El sistema debe calcular automáticamente el porcentaje de asistencia de cada alumno después de registrarse la asistencia de una clase teórica o práctica. Para ello, deberá comparar la cantidad de clases asistidas con la cantidad total de clases requeridas por el curso. El sistema deberá considerar como requisito mínimo un 80% de asistencia para aprobar el curso y permitir la solicitud de hora mediante la escuela. Como resultado, el alumno quedará marcado como cumple o no cumple el requisito de asistencia.

## RF06 - Solicitar vehículo para examen municipal
El sistema debe permitir que el alumno solicite un vehículo de la escuela para rendir el examen municipal una vez finalizado el curso. Para ello, el alumno deberá indicar la fecha del examen, tipo de vehículo requerido, manual o automático, y sede correspondiente. El sistema deberá exigir que la solicitud se realice con al menos una semana de anticipación y que el alumno cumpla con los requisitos mínimos del curso. Como resultado, la solicitud quedará registrada para ser revisada y confirmada por secretaría.

## RF07 - Reservar sala psicotecnia
El sistema debe permitir que la secretaria reserve una sala psicotécnica para alumnos que deban realizar el curso o evaluación correspondiente. Para ello, deberá seleccionar la fecha, hora, sala disponible y alumnos asociados a la reserva. El sistema deberá validar que la sala no se encuentre ocupada en el mismo horario. Como resultado, la sala psicotécnica quedará reservada y visible en la agenda operativa de la escuela.

## RF08 - Reprogramar clase práctica
El sistema debe permitir que el alumno solicite la reprogramación de una clase práctica cuando no pueda asistir en el horario asignado. Para ello, el alumno deberá seleccionar la clase a modificar, indicar el motivo y proponer una nueva fecha u horario disponible. La solicitud deberá quedar pendiente de revisión por secretaría y solo podrá aprobarse si existe disponibilidad de profesor, sede y vehículo. Como resultado, la clase será reprogramada o rechazada según la evaluación de secretaría.