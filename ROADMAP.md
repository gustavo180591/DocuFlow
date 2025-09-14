# SIDEPP Digital - Roadmap

Este documento describe el plan de desarrollo y las características planificadas para el sistema de gestión documental de SIDEPP.

## 🚀 Próximas Características

### Fase 1: Gestión Básica de Socios (En Progreso)
- [x] Configuración inicial del proyecto con SvelteKit
- [x] Estructura de base de datos para socios
- [x] Formulario de creación/edición de socios
- [x] Listado de socios con paginación
- [x] Búsqueda y filtrado de socios
- [x] Perfil detallado de socio
- [x] Integración con base de datos PostgreSQL
- [x] Configuración de Prisma ORM

### Fase 2: Procesamiento de Documentos (En Progreso)
- [x] Configuración de modelos Prisma para documentos y contribuciones
- [x] Endpoint para carga de archivos PDF
- [ ] Sistema de extracción de texto (PDF embebido + OCR con Tesseract)
  - [ ] Clasificador de documentos (listados vs comprobantes)
  - [ ] Parser para listados de aportes
  - [ ] Parser para comprobantes bancarios
- [ ] Sistema de conciliación automática
  - [ ] Matching por CUIT, período y monto
  - [ ] Manejo de discrepancias
- [ ] Panel de gestión de documentos
  - [ ] Vista de documentos procesados
  - [ ] Filtros por tipo y estado
  - [ ] Historial de extracciones

### Fase 3: Gestión de Aportes y Contribuciones
- [ ] Panel de control de aportes
  - [ ] Resumen por período
  - [ ] Comparativa con períodos anteriores
  - [ ] Alertas de pagos pendientes
- [ ] Gestión de instituciones
  - [ ] Registro de instituciones
  - [ ] Configuración de parámetros por institución
  - [ ] Historial de presentaciones
- [ ] Reportes y exportaciones
  - [ ] Generación de reportes personalizados
  - [ ] Exportación a formatos estándar (PDF, Excel, CSV)
  - [ ] Reportes para auditoría

### Fase 4: Autenticación y Seguridad
- [ ] Sistema de autenticación de usuarios
  - [ ] Login/Logout
  - [ ] Recuperación de contraseña
- [ ] Control de acceso basado en roles (RBAC)
  - [ ] Roles: Administrador, Editor, Lector
  - [ ] Permisos granulares
- [ ] Registro de actividades
  - [ ] Bitácora de acciones
  - [ ] Historial de cambios
- [ ] Seguridad avanzada
  - [ ] Políticas de contraseñas
  - [ ] Autenticación de dos factores
  - [ ] Bloqueo por intentos fallidos

## 🛠️ Mejoras Técnicas

### Infraestructura
- [x] Configuración de Docker para desarrollo
- [ ] Configuración de CI/CD
- [ ] Pruebas automatizadas
  - [ ] Pruebas unitarias
  - [ ] Pruebas de integración
  - [ ] Pruebas E2E
- [ ] Monitoreo y alertas
- [ ] Documentación de la API
  - [ ] Especificación OpenAPI/Swagger
  - [ ] Guías de integración

### Rendimiento
- [ ] Optimización de consultas
- [ ] Caché de datos
- [ ] Carga diferida (lazy loading)
- [ ] Optimización de imágenes y activos

## 🌐 Internacionalización
- [ ] Soporte para múltiples idiomas
- [ ] Localización de fechas y monedas
- [ ] Documentación traducida

## 📅 Cronograma Tentativo

| Fase | Estimación | Estado |
|------|------------|--------|
| Fase 1: Gestión de Socios | Septiembre 2023 | ✅ Completado |
| Fase 2: Procesamiento de Documentos | Octubre - Noviembre 2023 | 🟡 En Progreso |
| Fase 3: Gestión de Aportes | Diciembre 2023 - Enero 2024 | 🟢 Pendiente |
| Fase 4: Autenticación y Seguridad | Febrero 2024 | 🟢 Pendiente |
| Fase 5: Reportes y Análisis | Marzo 2024 | 🟢 Pendiente |

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor, lee nuestra [guía de contribución](CONTRIBUTING.md) para más detalles.

## 📝 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

## 📌 Próximos Pasos Inmediatos

1. **Procesamiento de PDFs**
   - [ ] Implementar extracción de texto con pdf2json
   - [ ] Configurar Tesseract OCR para procesamiento de imágenes
   - [ ] Desarrollar parser para formato de listados de aportes

2. **Conciliación Automática**
   - [ ] Implementar lógica de matching CUIT + período + monto
   - [ ] Crear sistema de notificaciones para discrepancias
   - [ ] Desarrollar interfaz para conciliación manual

3. **Optimizaciones**
   - [ ] Implementar cola de trabajos con Bull o similar
   - [ ] Añadir caché para consultas frecuentes
   - [ ] Optimizar rendimiento de consultas a la base de datos

## 🚀 Despliegue

### Requisitos del Sistema
- Node.js 18+
- PostgreSQL 14+
- Tesseract OCR (para procesamiento de imágenes)
- Docker (opcional, recomendado para desarrollo)

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/docuflow.git
cd docuflow

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

### Docker
```bash
# Construir y ejecutar con Docker
docker-compose up -d --build
```

*Última actualización: Septiembre 2023*
