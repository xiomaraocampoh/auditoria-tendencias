# AUDITORÍA TÉCNICA INTEGRAL: CARTERAPRO RISK LAB
**Informe Técnico Unificado de Calidad, Seguridad y Deuda Técnica**

**Autores:** Xiomara Ocampo Hurtado, Carlos Augusto Aranzazu, María Luisa Londoño  
**Asignatura:** Tendencias en Ingeniería de Software  
**Docente:** Carlos Andrés Jaramillo  
**Institución:** Universidad Alexander von Humboldt  
**Fecha:** Junio de 2026  

---

## 1. Introducción y Alcance
Este informe consolida los hallazgos de la auditoría independiente realizada sobre la plataforma **CarteraPro Risk Lab**. El análisis abarca la evaluación de la arquitectura de la aplicación (Frontend en React, Backend en Express, Base de datos en SQLite), la calidad interna de su código fuente y las vulnerabilidades expuestas que comprometen la confidencialidad, integridad y disponibilidad de la información empresarial y de clientes.

## 2. Metodología y Herramientas
Se empleó un marco analítico integral compuesto por:
- **SAST (Static Application Security Testing):** Con SonarQube para identificar fallos lógicos y mantenibilidad.
- **DAST (Dynamic Application Security Testing):** Simulaciones de ataques automatizados en entorno de ejecución con OWASP ZAP.
- **SCA (Software Composition Analysis):** Inspección de paquetes comprometidos a través de `npm audit`.
- **Pruebas Manuales Dirigidas:** Explotación controlada de debilidades de lógica de control de acceso.

## 3. Cuadro de Métricas Consolidadas

| Dimensión Analizada | Métrica Clave | Volumen / Estado |
| :--- | :--- | :--- |
| **Volumetría** | Líneas de Código Analizadas (LOC) | 2,169 |
| **Calidad de Código** | Code Smells Detectados | 534 (50 Bloqueantes, 484 Críticos) |
| **Pruebas** | Cobertura de Código (Test Coverage) | 0.0% |
| **Seguridad Dinámica**| Alertas Críticas (OWASP ZAP) | 11 alertas activas |
| **Dependencias** | Vulnerabilidades por Terceros (CVEs)| 8 librerías críticas |

## 4. Hallazgos Críticos de Seguridad (OWASP Top 10)

### SEC-001: Inyección SQL Estricta en Módulos de Autenticación
- **Severidad:** Crítica (Impacto Alto / Probabilidad Alta)
- **Ubicación:** `backend/src/controllers/authController.js`
- **Descripción:** El parámetro `email` provisto en el cuerpo del login se concatena directamente en el string de consulta SQL.
- **Impacto:** Permite la elusión absoluta del login inyectando payloads como `' OR '1'='1`.

### SEC-002: Ejecución Remota de Comandos (RCE) mediante Paneles Administrativos
- **Severidad:** Crítica (Impacto Crítico / Probabilidad Alta)
- **Ubicación:** `backend/src/controllers/adminController.js`
- **Descripción:** Rutas administrativas vulnerables ejecutan instrucciones del sistema operativo mediante variables no validadas enviadas por la API.
- **Impacto:** Pérdida total de control sobre el servidor físico o contenedor que aloja la aplicación.

## 5. Matriz de Riesgos y Consecuencias de Negocio

| ID | Riesgo Técnico | Impacto | Probabilidad | Consecuencia Económica / Reputacional |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | Robo de Base de Datos vía SQLi | Crítico | Alta | Multas regulatorias por filtración de datos financieros de clientes. |
| **R-02** | Secuestro del Servidor vía RCE | Crítico | Alta | Interrupción de operaciones comerciales y parálisis del Risk Lab. |
| **R-03** | Deuda Técnica Insostenible | Medio | Muy Alta | Aumento drástico de costos y demoras en futuras actualizaciones del software. |

## 6. Anexo de Evidencias Técnicas (Sección Obligatoria)
*Para dar cumplimiento estricto a las pautas de evaluación, a continuación se detallan los marcadores de posición de las capturas que debes tomar una vez levantes el proyecto localmente:*

### 6.1 Captura de Pantalla: Dashboard de SonarQube
`[Evidencia_Visual_01_SonarQube_QualityGate.png]`  
*Debe ilustrar las infracciones de los 534 code smells mapeados y la ausencia de suite de pruebas unitarias.*

### 6.2 Captura de Pantalla: Reporte OWASP ZAP
`[Evidencia_Visual_02_ZAP_Alerts.png]`  
*Debe mostrar los endpoints de la API arrojando alertas de seguridad dinámicas.*

## 7. Plan de Intervención Priorizado
1. **Horizonte 1 (Inmediato - 1 a 2 semanas):** Implementar sentencias preparadas (consultas parametrizadas), remover credenciales hardcoded y aislar endpoints ejecutores de comandos.
2. **Horizonte 2 (Corto Plazo - 1 mes):** Incorporar middlewares de autenticación basados en JSON Web Tokens (JWT) adecuadamente firmados y configurar políticas de cabeceras seguras (CSP).
3. **Horizonte 3 (Mediano Plazo - 3 meses):** Diseñar la arquitectura de pruebas e implementar Jest/Supertest para revertir el 0% de cobertura detectado.