# MATRIZ DE EVIDENCIA DE PRUEBAS FUNCIONALES
## Entregable 4 - Hackathon Proyecto URABÁ-PAÍS

Esta matriz documenta la ejecución de las pruebas sobre los 3 casos mínimos obligatorios descritos en la **Sección 5 y 8 de la Guía de Participantes**, certificando el funcionamiento integral del prototipo de principio a fin.

---

### Resumen de Ejecución de Pruebas

| Caso de Prueba | Funcionalidad Evaluada | Resultado | Estado |
| :---: | :--- | :--- | :---: |
| **CP-01** | Búsqueda previa y Registro de Persona Nueva con Núcleo Familiar | Ficha creada con código inmutable `URB-2026-0004` y familiar asociado | **APROBADO** |
| **CP-02** | Control Obligatorio Anti-Duplicados por Documento de Identidad | Detección inmediata de duplicado, bloqueo de guardado y enlace a ficha | **APROBADO** |
| **CP-03** | Vinculación a Programa con Estado de Participación | Beneficiario vinculado con fecha y estado `en proceso` | **APROBADO** |
| **CP-04** | Registro de Atención o Ayuda Entregada (Hecho concreto) | Atención grabada con firma responsable y entidad ejecutora (COOPI) | **APROBADO** |
| **CP-05** | Registro de Seguimiento (Avance observado y Acción Pendiente) | Tarea pendiente programada y visible en semáforo de alertas | **APROBADO** |
| **CP-06** | Ficha Consolidada 360° y Verificación de Regla de Conteo | 1 persona única contada por separado de sus múltiples eventos | **APROBADO** |

---

### Detalle de los Casos de Prueba Reglamentarios

#### Caso 1: Persona Nueva y Núcleo Familiar
* **Objetivo:** Demostrar el alta de un nuevo beneficiario, verificación de búsqueda previa y relación de al menos un familiar.
* **Procedimiento:**
  1. Ingresar al módulo "1. Beneficiarios & Familias".
  2. Buscar en la barra superior el nombre "Marta Lucía Correa".
  3. Al no existir registros previos, pulsar el botón *Registrar Nuevo Beneficiario*.
  4. Diligenciar datos: CC 1045987123, Municipio: Apartadó, Condición: Víctima del conflicto armado.
  5. En la sección 3 (Núcleo Familiar), agregar: `Juan David Correa` (Hijo/a, 12 años).
  6. Marcar obligatoriamente la casilla de **Autorización para Tratamiento de Datos (Habeas Data)**.
  7. Pulsar *Completar Registro*.
* **Resultado Esperado:** El sistema asigna un código inmutable con prefijo `URB-2026-XXXX`, almacena al titular junto con su familiar y lo muestra inmediatamente en el listado maestro.
* **Resultado Obtenido:** Sistema generó `URB-2026-0004` exitosamente. **Aprobado**.

---

#### Caso 2: Persona Existente (Prueba de Fuego Anti-Duplicados)
* **Objetivo:** Demostrar que el sistema impide o advierte la creación de un registro duplicado cuando coinciden el tipo y número de documento.
* **Procedimiento:**
  1. Pulsar el botón *Registrar Nuevo Beneficiario*.
  2. En tipo de documento seleccionar `CC` e ingresar el número `1038472910` (correspondiente a María Elena Gómez, ya existente).
* **Resultado Esperado:**
  * El sistema despliega un banner de alerta con fondo rojo: *"Ya existe un beneficiario registrado con el documento CC 1038472910"*.
  * El botón de guardado se deshabilita para impedir la duplicación en la base de datos.
  * Se proporciona el enlace interactivo: *Abrir Ficha Existente Ahora*.
* **Resultado Obtenido:** Validación reactiva instantánea en frontend y rechazo con código HTTP 409 en el backend. **Aprobado**.

---

#### Caso 3: Historial Completo y Regla de Conteo en Reportes
* **Objetivo:** Comprobar que una persona con múltiples participaciones y atenciones conserva su unicidad y que las métricas se recalculan dinámicamente sin datos fijos.
* **Procedimiento:**
  1. Tomar a la beneficiaria María Elena Gómez (`URB-2026-0001`).
  2. Vincularla a un segundo programa: *Integración Socioeconómica y Medios de Vida* (FADV).
  3. Registrarle una segunda atención: *Capacitación para el Empleo / Taller* (FADV).
  4. Ingresar un seguimiento con acción pendiente: *"Entregar kit de telas"*.
  5. Abrir la **Ficha Consolidada 360°**: verificar que en una sola pantalla conviven sus datos personales, su madre, su hijo, 2 programas, 2 atenciones y sus seguimientos.
  6. Navegar a **4. Consultas & Reportes**:
     * Comprobar que el indicador *Beneficiarios Únicos* no se incrementó (sigue contando a María Elena como 1 sola persona).
     * Comprobar que el indicador *Participaciones Totales* y *Atenciones Entregadas* sumaron los nuevos eventos en tiempo real.
* **Resultado Esperado:** Cumplimiento total de la regla de conteo e integración de información.
* **Resultado Obtenido:** Los indicadores reflejaron exactamente el recálculo dinámico. **Aprobado**.
