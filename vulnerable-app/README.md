# Cartera Lab

Aplicacion web full stack creada para clases de analisis de codigo, pruebas de seguridad y revision de calidad en un entorno controlado de laboratorio.

Este proyecto **no debe usarse en produccion**. Fue creado solo para ejecutarse localmente o en una red de practica supervisada.

## Stack

- Backend: Node.js, Express y SQLite.
- Frontend: React con Vite.
- API REST en `http://localhost:4000`.
- Frontend en `http://localhost:5173`.
- En desarrollo, el frontend reenvia `/api` y `/uploads` al backend para facilitar las pruebas desde un solo origen.

## Estructura

```text
vulnerable-app/
  backend/
    src/
      controllers/
      db/
      middleware/
      routes/
      uploads/
      app.js
    .env
    .env.example
    package.json
  frontend/
    src/
      components/
      pages/
      services/
      App.jsx
    package.json
  README.md
  docker-compose.yml
```

## Instalacion local

Requisitos:

- Node.js 18 o superior.
- npm.

Instalar dependencias:

```bash
cd vulnerable-app
npm run install:all
```

Crear la base de datos SQLite con datos iniciales:

```bash
npm run db:init
```

Ejecutar backend:

```bash
npm run backend
```

En otra terminal, ejecutar frontend:

```bash
npm run frontend
```

Tambien se puede ejecutar con Docker Compose:

```bash
docker compose up
```

## Usuarios de prueba

| Usuario | Password | Rol |
| --- | --- | --- |
| `admin` | `admin123` | `admin` |
| `analista` | `password` | `user` |
| `cliente1` | `cliente123` | `client` |

## Funcionalidades

- Login de usuarios.
- Registro y consulta de clientes.
- Consulta directa por ID de cliente.
- Registro de facturas.
- Consulta de facturas vencidas.
- Formulario de busqueda de clientes y facturas.
- Carga de soportes de pago.
- Panel basico de administracion.
- Rutas de apoyo para diagnostico y practica de laboratorio.

## Flujo sugerido de uso

1. Levantar backend y frontend.
2. Iniciar sesion con alguno de los usuarios de prueba.
3. Recorrer las pantallas principales de la aplicacion.
4. Ejecutar herramientas de analisis estatico sobre backend y frontend.
5. Ejecutar pruebas dinamicas contra la aplicacion local.
6. Registrar hallazgos, evidencia, impacto y posibles mitigaciones.

## Herramientas sugeridas

- SonarQube para calidad, mantenibilidad, duplicacion, complejidad y bugs.
- OWASP ZAP para crawling, passive scan y active scan local.
- `npm audit` para revision de dependencias.
- Snyk para analisis de dependencias y recomendaciones.
- ESLint con reglas de seguridad.
- Semgrep con reglas para JavaScript, React y patrones OWASP.

## Escaneo con OWASP ZAP

Para que ZAP pueda recorrer tambien las vistas que requieren sesion, escanear el frontend en `http://localhost:5173` y no la API directa en `http://localhost:4000`.

1. Levantar backend y frontend:

```bash
npm run backend
npm run frontend
```

2. Para exploracion manual, abrir `http://localhost:5173` desde el navegador controlado por ZAP.
3. Iniciar sesion con un usuario de prueba.
4. Ejecutar Spider/AJAX Spider y luego Active Scan sobre `http://localhost:5173`.

El frontend usa rutas relativas (`/api/...`) y Vite las proxya hacia `http://localhost:4000`; asi ZAP observa las peticiones dentro del mismo sitio escaneado.

### Escaneo automatico de ZAP

Si se usa la opcion **Automated Scan / Ataque automatico** y ZAP no permite avanzar porque pide autenticacion, se puede usar esta URL de entrada:

```text
http://localhost:5173/?zap=auto
```

Tambien se puede usar:

```text
http://localhost:5173/?dast=auto
```

Estos parametros estan pensados solo para facilitar el recorrido automatizado en el laboratorio local.

## Actividades sugeridas para estudiantes

1. Hacer un mapa funcional de la aplicacion y sus rutas principales.
2. Revisar el backend y frontend con una herramienta SAST.
3. Ejecutar un analisis DAST sobre la aplicacion levantada localmente.
4. Comparar hallazgos automaticos con revision manual de codigo.
5. Clasificar los resultados por severidad, evidencia e impacto.
6. Relacionar los hallazgos con OWASP Top 10 cuando aplique.
7. Proponer mitigaciones y priorizarlas por riesgo.
8. Preparar un informe tecnico con pasos de reproduccion y recomendaciones.

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/clients`
- `GET /api/clients/search?q=demo`
- `GET /api/clients/1`
- `POST /api/clients`
- `GET /api/invoices/overdue`
- `GET /api/invoices/search?number=FAC`
- `POST /api/uploads`
- `GET /api/admin/panel`

## Nota para docentes

La intencion del laboratorio es que los estudiantes descubran los hallazgos mediante herramientas automaticas, exploracion de la aplicacion y revision manual. Evite entregar pistas directas antes de la actividad para conservar el valor pedagogico del ejercicio.
