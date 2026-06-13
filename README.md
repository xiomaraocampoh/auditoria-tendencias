# Auditoria de Seguridad — CarteraPro Risk Lab

**Curso:** Tendencias en Ingeniería de Software
**Fecha:** Junio 2026
**Clasificación:** Laboratorio educativo — Uso interno

---

## Descripcion

Este repositorio contiene la auditoría técnica de seguridad realizada sobre **CarteraPro Risk Lab**, una aplicación web full-stack intencionalmente vulnerable diseñada como laboratorio para la práctica de técnicas SAST y DAST.

La aplicación simula un sistema de gestión de clientes y cartera financiera. Fue construida con vulnerabilidades deliberadas para evaluar herramientas y metodologías de análisis de seguridad.

---

## Estructura del repositorio

```
auditoria/
├── vulnerable-app/              # Aplicacion objetivo de la auditoria
│   ├── backend/                 # API REST (Node.js + Express + SQLite)
│   ├── frontend/                # SPA (React + Vite)
│   ├── docker-compose.yml       # Levantar entorno completo
│   └── sonar-project.properties # Configuracion SonarQube
│
├── evidencias_zap/              # Reportes generados por OWASP ZAP
│   ├── zap_report_frontend.html
│   ├── zap_report_api.html
│   └── npm_audit_backend.txt
│
├── informe_ejecutivo.md         # Resumen para alta direccion
├── informe_tecnico_completo.md  # Informe tecnico detallado (unico documento)
├── informe_tecnico_parte1.md    # Parte 1: SAST y calidad de codigo
├── informe_tecnico_parte2.md    # Parte 2: DAST y dependencias
└── evidencias_herramientas.md   # Capturas y evidencias de herramientas usadas
```

---

## Levantar la aplicacion vulnerable

### Opcion 1 — Docker (recomendado)

```bash
cd vulnerable-app
docker compose up
```

| Servicio  | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:5173  |
| Backend   | http://localhost:4000  |

### Opcion 2 — Manual

```bash
cd vulnerable-app

# Instalar dependencias
npm run install:all

# Inicializar base de datos
npm run db:init

# Levantar backend (puerto 4000)
npm run backend

# En otra terminal — levantar frontend (puerto 5173)
npm run frontend
```

---

## Herramientas utilizadas

| Herramienta     | Tipo  | Proposito                                      |
|-----------------|-------|------------------------------------------------|
| SonarQube       | SAST  | Analisis estatico de codigo fuente             |
| ESLint Security | SAST  | Deteccion de patrones inseguros en JS          |
| OWASP ZAP       | DAST  | Escaneo dinamico de vulnerabilidades web       |
| npm audit       | SCA   | Analisis de dependencias con CVEs conocidos    |

---

## Resumen de hallazgos

| Severidad | Cantidad |
|-----------|----------|
| Critico   | 8        |
| Alto      | 2        |
| **Total** | **10**   |

Vulnerabilidades principales identificadas: inyeccion SQL, JWT sin validacion real, command injection, contrasenas en texto plano, secretos hardcodeados, carga de archivos sin restricciones y dependencias con CVEs criticos.

**Estado general del sistema: CRITICO**

Ver [`informe_ejecutivo.md`](./informe_ejecutivo.md) para el resumen ejecutivo o [`informe_tecnico_completo.md`](./informe_tecnico_completo.md) para el analisis tecnico detallado.

---

## Advertencia

> Esta aplicacion contiene vulnerabilidades intencionales. **No debe ser expuesta a redes publicas ni usada en produccion.** Su unico proposito es educativo, dentro de un entorno controlado y aislado.
