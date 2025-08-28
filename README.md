# DocuFlow

Sistema de gestión de documentos y socios con procesamiento automático de OCR y extracción de datos.

## 🚀 Características

- **Gestión de Socios**: Registro completo de miembros con estados y documentación
- **Gestión de Documentos**: Subida, procesamiento y almacenamiento de documentos
- **Procesamiento Automático**: OCR, parsing y validación automática
- **Base de Datos Real**: PostgreSQL con Prisma ORM
- **Interfaz Moderna**: Svelte 5 + Tailwind CSS v4
- **API REST**: Endpoints para integración con otros sistemas

## 🛠️ Tecnologías

- **Frontend**: Svelte 5 + TypeScript
- **Backend**: SvelteKit + Prisma ORM
- **Base de Datos**: PostgreSQL
- **Estilos**: Tailwind CSS v4
- **Procesamiento**: Tesseract.js (OCR), PDF.js

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 16+
- Docker (opcional)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd docuflow
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/docuflow"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/docuflow_shadow"
```

### 4. Configurar la base de datos
```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:push
```

### 5. Poblar la base de datos con datos de ejemplo
```bash
npm run db:seed
```

### 6. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

## 🐳 Usando Docker

### 1. Levantar los servicios
```bash
docker compose up -d
```

### 2. Esperar a que la base de datos esté lista
```bash
docker compose logs db
```

### 3. Configurar la base de datos
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Acceder a la aplicación
- **Frontend**: http://localhost:5173
- **Base de datos**: localhost:5446

## 📊 Estructura de la Base de Datos

### Modelos Principales

#### Member (Socio)
- Información personal (DNI, nombre, email, teléfono)
- Estado del socio (Activo, Pendiente, Inactivo, Suspendido)
- Fechas de ingreso y nacimiento
- Relación con documentos

#### Document (Documento)
- Metadatos del archivo (nombre, tipo, tamaño, MIME type)
- Estado de procesamiento
- Relación con socios
- Jobs de procesamiento

#### Job (Trabajo)
- Tipos: OCR, PARSING, VALIDATION, EXPORT
- Estados: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
- Metadatos de ejecución

#### Extraction (Extracción)
- Campos extraídos del documento
- Nivel de confianza
- Fuente de extracción

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Servidor de desarrollo
npm run build                 # Construir para producción
npm run preview               # Vista previa de producción

# Base de datos
npm run db:generate           # Generar cliente Prisma
npm run db:push               # Sincronizar esquema con BD
npm run db:seed               # Poblar con datos de ejemplo
npm run db:studio             # Abrir Prisma Studio

# Calidad de código
npm run check                 # Verificar tipos TypeScript
npm run format                # Formatear código
npm run lint                  # Verificar estilo
```

## 🌱 Datos de Ejemplo

El sistema incluye datos de ejemplo para probar todas las funcionalidades:

### Socios
- **Juan Pérez** (Activo) - DNI: 12345678
- **María González** (Activo) - DNI: 23456789
- **Carlos López** (Pendiente) - DNI: 34567890
- **Ana Martínez** (Activo) - DNI: 45678901
- **Roberto Silva** (Inactivo) - DNI: 56789012

### Documentos
- Recibos de sueldo (PDF)
- DNIs escaneados (JPG)
- Contratos laborales (PDF)
- Con diferentes estados de procesamiento

## 🔍 Funcionalidades

### Gestión de Socios
- ✅ Lista completa de socios
- ✅ Búsqueda por DNI, nombre o email
- ✅ Filtrado por estado
- ✅ Selección múltiple
- ✅ Vista detallada de cada socio

### Gestión de Documentos
- ✅ Lista completa de documentos
- ✅ Búsqueda por nombre o socio
- ✅ Filtrado por estado de procesamiento
- ✅ Información de jobs y extracciones
- ✅ Enlaces a socios relacionados

### Procesamiento
- ✅ Estados de jobs en tiempo real
- ✅ Información de extracciones
- ✅ Niveles de confianza
- ✅ Historial de procesamiento

## 🚧 Próximas Funcionalidades

- [ ] Subida de documentos
- [ ] Procesamiento en tiempo real
- [ ] Dashboard con estadísticas
- [ ] Sistema de notificaciones
- [ ] Exportación de datos
- [ ] API para integraciones externas

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**DocuFlow** - Sistema moderno de gestión documental 🚀
