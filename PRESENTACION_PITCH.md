# GUION DE PRESENTACIÓN FINAL (PITCH)
## Entregable 5 - Hackathon Proyecto URABÁ-PAÍS
**Tiempo estimado de sustentación:** 3 a 5 minutos

---

### Diapositiva 1 / Introducción (30 segundos)
* **Título:** Sistema Integral de Gestión y Seguimiento de Beneficiarios URABÁ-PAÍS.
* **El Mensaje:**  
  *"Detrás de cada cifra o registro en Urabá existe un ser humano con dignidad, familia y sueños. En Apartadó, Turbo y Necoclí, miles de familias vulnerables acceden a múltiples apoyos de organizaciones aliadas. Hoy les presentamos una solución tecnológica concebida para que la información humanitaria no vuelva a estar fragmentada."*

---

### Diapositiva 2 / El Problema y la Pregunta Orientadora (45 segundos)
* **La problemática:**  
  * Una misma persona recibe atención de distintos profesionales (COOPI, HIAS, FADV, HI).
  * Si la información está dispersa en hojas de cálculo y formularios separados, responder preguntas como *¿Quién fue atendido?, ¿Qué recibió?, ¿Cuáles fueron sus avances? y ¿Qué quedó pendiente?* se convierte en un laberinto manual y propenso a duplicidades.
* **El reto:**  
  * Crear un sistema web que centralice la información sin duplicar a las personas y transforme los registros de campo en indicadores dinámicos confiables para la toma de decisiones.

---

### Diapositiva 3 / Nuestra Solución: Arquitectura MVC y Reglas de Oro (60 segundos)
* **Arquitectura:**  
  * Desarrollado con **Node.js, Express y React**, estructurado con el patrón **Modelo-Vista-Controlador**.
* **Las 4 Reglas de Oro Implementadas:**
  1. **Beneficiario Único:** Cada persona recibe un código inmutable generado por el sistema (`URB-2026-XXXX`). Nunca se duplica aunque curse 5 programas.
  2. **Bloqueo Inteligente de Duplicados:** Búsqueda previa obligatoria. Si un documento ya existe, el sistema protege la base de datos y abre de inmediato la ficha existente. Permite registrar con dignidad a quienes no tienen documento.
  3. **Diferenciación Rigurosa:** Lo que se entrega es una **Atención**; cómo evoluciona la persona y qué compromisos quedan es un **Seguimiento**.
  4. **Regla de Conteo:** Las personas únicas se cuentan por separado de los eventos de ayuda en indicadores en tiempo real.

---

### Diapositiva 4 / Demostración en Vivo: El Flujo de 5 Pasos (90 segundos)
* **Recorrido en vivo:**
  1. *Registro:* Mostramos la búsqueda previa y cómo el formulario vincula al núcleo familiar y garantiza el consentimiento de Habeas Data.
  2. *Vinculación:* Asignamos al beneficiario a un programa institucional en una de las 3 líneas de trabajo con su estado actual (*inscrito, en proceso, finalizado, retirado*).
  3. *Atención vs. Seguimiento:* Registramos la entrega física de una ayuda humanitaria y creamos un seguimiento con fecha de próxima llamada y semáforo de pendientes.
  4. *Ficha 360°:* Mostramos cómo en una sola pantalla convive toda la historia de vida del beneficiario, lista para exportar o imprimir en PDF.
  5. *Reportes Dinámicos:* Mostramos el panel de métricas actualizándose automáticamente sin valores quemados.

---

### Diapositiva 5 / Valor que Aporta y Componentes Complementarios (45 segundos)
* **Enfoque Territorial e Inclusivo:**  
  * Adaptado al contexto de Apartadó, Turbo y Necoclí, con enfoque diferencial para víctimas, refugiados, migrantes y personas con discapacidad.
* **Innovación Responsable:**  
  * Asistente de IA con estricto apego ético (no diagnóstica, no decide asignaciones y no expone datos sensibles).
  * Matriz de privacidad por roles (Administrador, Funcionario de Campo y Consulta Anonimizada).
* **Conclusión:**  
  *"Nuestra plataforma no es solo software: es una herramienta de coordinación humanitaria para que el consorcio URABÁ-PAÍS maximice su impacto y asegure que ninguna familia quede atrás."*
