# DESCRIPCIÓN DE LA SOLUCIÓN TÉCNICA
## Entregable 3 - Hackathon Proyecto URABÁ-PAÍS

---

### 1. Requerimientos Atendidos

| Módulo / Regla | Estado | Cómo se implementó en la solución |
| :--- | :--- | :--- |
| **Módulo 1: Beneficiarios y Familias** | ✅ Cumplido al 100% | Búsqueda previa obligatoria. Alta con datos sociodemográficos, municipio (Apartadó, Turbo, Necoclí) y relación con familiares en tabla embebida. |
| **Regla Anti-Duplicados** | ✅ Cumplido al 100% | Validación en tiempo real tanto en frontend como en el controlador backend. Bloquea duplicación por `Tipo + Número de documento` y permite abrir la ficha existente. |
| **Inmutabilidad del Código** | ✅ Cumplido al 100% | Generación automática del código único `URB-2026-XXXX`. Ni la edición ni el documento alteran esta llave primaria. |
| **Módulo 2: Programas y Participación** | ✅ Cumplido al 100% | Catálogo estructurado en las 3 líneas de trabajo del consorcio. Vinculación con fecha y los 4 estados oficiales: *inscrito, en proceso, finalizado, retirado*. |
| **Módulo 3: Atención y Seguimiento** | ✅ Cumplido al 100% | Estricta separación conceptual. *Atención*: registra bienes/servicios entregados y resultados. *Seguimiento*: registra avance, observaciones y acción pendiente con fecha de próximo contacto. |
| **Módulo 4: Ficha Consolidada 360°** | ✅ Cumplido al 100% | Visión unificada de la persona, sus familiares, programas vinculados, historial de ayudas y línea de tiempo de pendientes. Formato imprimible a PDF. |
| **Módulo 4: Reportes e Indicadores Dinámicos** | ✅ Cumplido al 100% | Cumple la **Regla de Conteo**: diferencia personas únicas de participaciones y atenciones. Cálculo en tiempo real, desglose territorial por municipio y exportación a CSV. |
| **Protección de Datos (Habeas Data)** | ✅ Cumplido al 100% | Checkbox y registro explícito de consentimiento para tratamiento de datos personales en el registro. Reportes agregados sin exhibir datos personales. |
| **Componentes Complementarios** | ✅ Implementados | Selector interactivo de roles de usuario, Asistente de IA con límites éticos explícitos (sección 10.1) y modo de accesibilidad de alto contraste. |

---

### 2. Arquitectura del Sistema (Modelo - Vista - Controlador)

La solución fue desarrollada bajo el patrón **MVC**, separando nítidamente la capa de datos y negocio de la capa de presentación:

```
[ FRONTEND - VISTA (React 18 + Tailwind) ]
                  |
             (HTTP / JSON)
                  v
[ BACKEND - CONTROLADOR (Express 4) ]
   ├── beneficiarioController.js
   ├── programaController.js
   ├── atencionController.js
   ├── seguimientoController.js
   └── reporteController.js
                  |
[ BACKEND - MODELO (Node.js + Storage) ]
   ├── BeneficiarioModel.js  (Validaciones, inmutabilidad, reglas anti-duplicados)
   ├── ProgramaModel.js      (Gestión de programas y vinculaciones)
   ├── AtencionModel.js      (Registro de entregas y asistencias)
   ├── SeguimientoModel.js   (Avances y pendientes de casos)
   └── db.js                 (Persistencia atómica y datos semilla Urabá)
```

---

### 3. Estructura y Modelo de Datos

#### Entidad: `Beneficiario`
* `id`: Identificador interno único (`BEN-XXXX`).
* `codigo_interno`: Código inmutable del sistema (`URB-2026-XXXX`).
* `nombres`: Nombres del titular.
* `apellidos`: Apellidos del titular.
* `tipo_documento`: `CC`, `TI`, `PPT`, `PEP`, `CE`, `SIN_DOCUMENTO`, `OTRO`.
* `numero_documento`: Documento de identidad (opcional para personas indocumentadas).
* `fecha_nacimiento` y `edad`: Información sociodemográfica.
* `genero`: `Femenino`, `Masculino`, `Otro / No binario`.
* `telefono`: Número de contacto.
* `municipio`: `Apartadó`, `Turbo`, `Necoclí`, `Otro Urabá`.
* `direccion_comunidad`: Barrio, vereda o sector.
* `condicion_poblacional`: `Víctima del conflicto armado`, `Migrante / Refugiada`, `Comunidad de acogida`, `Desplazado interno`, etc.
* `discapacidad`: Tipo de discapacidad o `Ninguna`.
* `autorizacion_datos`: Booleano (Consentimiento informado de Habeas Data).
* `fecha_registro`: Fecha y hora en formato ISO.
* `familiares`: Colección de integrantes (`nombres`, `parentesco`, `edad`, `documento`, `observaciones`).

#### Entidad: `Vinculacion` (Programa y Participación)
* `id`: Clave única (`VINC-XXX`).
* `beneficiario_id`: Llave foránea hacia el beneficiario.
* `codigo_interno`: Código inmutable de trazabilidad.
* `programa_id` y `programa_nombre`: Programa de la oferta institucional.
* `linea_trabajo`: Línea 1, 2 o 3 del consorcio.
* `fecha_vinculacion`: Fecha de ingreso.
* `estado`: `inscrito`, `en proceso`, `finalizado`, `retirado`.
* `observaciones`: Notas de vinculación.

#### Entidad: `Atencion`
* `id`: Clave única (`ATEN-XXX`).
* `beneficiario_id` y `codigo_interno`.
* `fecha`: Fecha de entrega o prestación del servicio.
* `tipo_atencion`: Kit alimentario, orientación legal, consulta psicosocial, etc.
* `linea_trabajo`: Línea asociada.
* `descripcion`: Detalle de lo entregado.
* `responsable`: Funcionario encargado.
* `entidad`: `COOPI`, `HIAS`, `FADV`, `HI`.
* `resultado`: Constancia del resultado obtenido.
* `remision`: Entidad o ruta externa a la que se remite (si aplica).

#### Entidad: `Seguimiento`
* `id`: Clave única (`SEG-XXX`).
* `beneficiario_id` y `codigo_interno`.
* `fecha`: Fecha de seguimiento.
* `avance_novedad`: Descripción de la evolución o cambio observado en el caso.
* `observaciones`: Contexto psicosocial o familiar.
* `accion_pendiente`: Tarea o compromiso institucional futuro.
* `proximo_contacto`: Fecha de la próxima llamada o visita.
* `estado_pendiente`: `pendiente` o `completado`.

---

### 4. Tipos de Usuario Propuestos y Matriz de Acceso a la Información (Roles y Restricciones)

En estricto cumplimiento de los principios de confidencialidad, **necesidad de saber**, la **Ley Estatutaria 1581 de 2012 (Habeas Data)** y las **Secciones 9, 10 y 11 de la Guía de Participantes**, el sistema define cuatro perfiles operativos:

| Tipo de Usuario (Rol) | Ámbito y Perfil Institucional | Información y Módulos Autorizados | Restricciones y Controles Obligatorios |
| :--- | :--- | :--- | :--- |
| **👑 Administrador** | Coordinador general del consorcio URABÁ-PAÍS (COOPI, HIAS, FADV, HI, AICS). | Acceso total a todos los módulos: Registro y edición de beneficiarios/familias, Vinculación a programas, Atenciones/ayudas, Seguimientos, Fichas 360°, Reportes dinámicos, Asistente IA y Guía de evaluación para jurados. | • **Inmutabilidad del Código:** Prohibido alterar el código único `URB-2026-XXXX`.<br>• **Consentimiento Mandatario:** Obligatorio registrar autorización Habeas Data.<br>• **Límites Éticos IA (Secc. 10.1):** No delegar diagnósticos médicos/legales ni asignación automática de ayudas.<br>• **Trazabilidad:** Toda edición queda registrada con sello temporal. |
| **🤝 Funcionario de Campo** | Trabajador social, psicólogo, orientador legal o técnico territorial en Apartadó, Turbo o Necoclí. | Búsqueda previa obligatoria, registro inicial de titulares y núcleo familiar, vinculación a programas misionales, registro de ayudas entregadas y actas, adición de seguimientos con fechas de próximo contacto, Ficha 360° y Asistente IA de apoyo. | • **Prohibición de Eliminación:** NO puede eliminar beneficiarios ni atenciones del histórico.<br>• **Restricción de Parámetros:** NO puede alterar cupos, líneas ni programas maestros.<br>• **Restricción de Reportes:** Sin acceso a métricas globales ni auditoría interna.<br>• **Bloqueo Anti-Duplicados:** El sistema impide duplicar por documento.<br>• **Confidencialidad Territorial:** Prohibido divulgar PII fuera de la ruta asistencial. |
| **🔍 Auditor / Cooperante (AICS)** | Delegado de la Agenzia Italiana per la Cooperazione allo Sviluppo (AICS) o evaluador externo de Monitoreo & Evaluación (M&E). | Tablero de Impacto y Rendición de Cuentas, consultas y reportes dinámicos agregados, indicadores desduplicados (1 persona = 1), estadísticas territoriales por municipio (Apartadó, Turbo, Necoclí) y exportación a CSV. | • **Estricta Anonimización (Habeas Data):** CERO acceso a nombres, cédulas/PPT, direcciones o teléfonos.<br>• **Restricción Operativa:** Solo lectura analítica agregada; no puede crear ni editar registros.<br>• **Bloqueo de Fichas 360°:** No accede a historias de vida individuales.<br>• **Regla de Conteo Estricta:** Reportes siempre desduplicados. |
| **🌐 Consulta Pública / Comunidad** | Población comunitaria de Urabá, personas migrantes, víctimas y ciudadanía general. | Portal Ciudadano con información institucional del consorcio, catálogo abierto de programas y líneas de trabajo, rutas de orientación humanitaria y canales oficiales de atención comunitaria en municipios. | • **Bloqueo Total de Datos Personales:** Cero acceso al motor transaccional, historiales familiares o fichas individuales.<br>• **Sin Capacidad Transaccional:** No registra ni edita información.<br>• **Protección Preventiva:** No exhibe listados que permitan individualizar o estigmatizar a personas vulnerables. |

---

### 5. Restricciones Generales del Proyecto (Sección 11 de la Guía)

1. **Restricción de Tiempo:** Solución concebida y desarrollada dentro del marco del reto de 12 horas.
2. **Restricción de Enfoque:** Prioridad estricta en el flujo de 5 pasos (Registro → Vinculación → Atención → Seguimiento → Reporte) antes de componentes complementarios.
3. **Restricción de Datos:** Uso exclusivo de datos ficticios o anonimizados; sin datos personales reales en repositorios o pantallas públicas.
4. **Restricción de Identidad:** Código interno inmutable (`URB-2026-XXXX`) que respeta la dignidad de personas indocumentadas.
5. **Restricción de Inteligencia Artificial:** Cumplimiento no negociable de la Sección 10.1 (sin diagnósticos, sin decisiones de asignación, sin divulgación de PII).
