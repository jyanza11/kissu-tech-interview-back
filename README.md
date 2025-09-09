# Kissu Tech Interview - Backend

## 📋 Descripción

Backend de la aplicación Signal Watcher desarrollado con Express.js, TypeScript, Prisma ORM y PostgreSQL. Este API RESTful gestiona listas de observación, eventos y análisis de IA.

## 🚀 Tecnologías

- **Express.js** con TypeScript
- **Prisma ORM** con PostgreSQL
- **Redis** para cache
- **OpenAI** para análisis de IA
- **Winston** para logging
- **Jest** + **Supertest** para testing
- **Zod** para validación

## 📦 Instalación

```bash
# Instalar dependencias
npm install
# o
pnpm install
# o
yarn install
```

## 🔧 Configuración

1. Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```

2. Configura las variables de entorno en `.env`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/signal_watcher"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Server
PORT=3001
NODE_ENV=development
```

3. Configura la base de datos:
```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate:dev

# Poblar con datos iniciales
npm run seed
```

## 🏃‍♂️ Comandos de Desarrollo

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo con nodemon
npm run build        # Build de producción
npm run start        # Ejecutar build de producción

# Base de datos
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Aplicar migraciones (producción)
npm run prisma:migrate:dev # Crear y aplicar migración (desarrollo)
npm run prisma:push        # Sincronizar schema (desarrollo)
npm run prisma:studio      # Abrir Prisma Studio
npm run seed               # Poblar base de datos

# Testing
npm run test              # Ejecutar todos los tests
npm run test:watch        # Tests en modo watch
npm run test:coverage     # Tests con coverage
npm run test:unit         # Solo tests unitarios
npm run test:integration  # Solo tests de integración
```

## 📁 Estructura del Proyecto

```
kissu-tech-interview-back/
├── src/
│   ├── config/           # Configuración de servicios
│   │   ├── logger.ts     # Configuración Winston
│   │   ├── redis.ts      # Cliente Redis
│   │   └── metrics.ts    # Métricas
│   ├── controllers/      # Controladores de rutas
│   ├── middleware/       # Middleware personalizado
│   │   ├── cache.ts      # Middleware de cache
│   │   ├── error-handler.ts # Manejo de errores
│   │   ├── rate-limit.ts # Rate limiting
│   │   └── validate.ts   # Validación de requests
│   ├── routes/           # Definición de rutas
│   │   ├── events.routes.ts
│   │   ├── watchlists.routes.ts
│   │   └── metrics.routes.ts
│   ├── services/         # Lógica de negocio
│   │   ├── ai.service.ts # Servicio de IA
│   │   ├── events.service.ts
│   │   └── watchlists.service.ts
│   ├── types/            # Tipos TypeScript
│   │   └── schemas.ts    # Esquemas de validación
│   ├── lib/              # Utilidades
│   │   └── prisma.ts     # Cliente Prisma
│   ├── seed.ts           # Script de seeding
│   └── index.ts          # Punto de entrada
├── prisma/               # Configuración Prisma
│   ├── schema.prisma     # Schema de base de datos
│   └── migrations/       # Migraciones
├── tests/                # Tests
│   ├── unit/            # Tests unitarios
│   ├── integration/     # Tests de integración
│   └── helpers/         # Utilidades para tests
├── packages/             # Paquetes locales
│   ├── schemas/          # Esquemas de validación Zod
│   └── typescript-config/ # Configuración TypeScript
└── logs/                 # Archivos de log
```

## 🔌 API Endpoints

### Watchlists
- `GET /api/watchlists` - Listar listas de observación
- `POST /api/watchlists` - Crear nueva lista
- `GET /api/watchlists/:id` - Obtener lista específica
- `PUT /api/watchlists/:id` - Actualizar lista
- `DELETE /api/watchlists/:id` - Eliminar lista

### Terms
- `POST /api/watchlists/:id/terms` - Añadir término a lista
- `DELETE /api/watchlists/:id/terms/:termId` - Eliminar término

### Events
- `GET /api/events` - Listar eventos
- `POST /api/events/simulate` - Simular nuevo evento
- `GET /api/events/:id/analysis` - Obtener análisis de IA

### Health & Metrics
- `GET /health` - Health check
- `GET /metrics` - Métricas del sistema

## 🗄️ Base de Datos

### Schema Principal
- **watchlists** - Listas de observación
- **watchlist_terms** - Términos de cada lista
- **events** - Eventos simulados
- **ai_analysis** - Análisis de IA por evento

### Comandos Prisma
```bash
# Generar cliente
npm run prisma:generate

# Crear migración
npm run prisma:migrate:dev

# Aplicar migraciones
npm run prisma:migrate

# Sincronizar schema (desarrollo)
npm run prisma:push

# Abrir Prisma Studio
npm run prisma:studio
```

## 🤖 Integración de IA

El servicio de IA utiliza OpenAI para:
- **Resumir eventos** - Crear resúmenes concisos
- **Clasificar severidad** - LOW/MED/HIGH/CRITICAL
- **Sugerir acciones** - Recomendaciones basadas en el evento

### Configuración
```env
OPENAI_API_KEY="your-openai-api-key"
```

## 📊 Observabilidad

### Logging
- **Winston** para logs estructurados
- **Correlation IDs** para trazabilidad
- **Rotación diaria** de archivos de log

### Métricas
- Endpoint `/metrics` para monitoreo
- Métricas de performance y uso

## 🧪 Testing

```bash
# Todos los tests
npm run test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🚀 Deploy

### Docker
```bash
# Build de la imagen
docker build -t kissu-tech-interview-back .

# Ejecutar contenedor
docker run -p 3001:3001 kissu-tech-interview-back
```

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
OPENAI_API_KEY="..."
```

## 📚 Documentación API

Puedes usar el archivo `ENDPOINTS.rest` para probar los endpoints con REST Client en VS Code.

## 🔧 Variables de Entorno

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/signal_watcher"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

## 📚 Documentación Adicional

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Redis](https://redis.io/documentation)
- [OpenAI API](https://platform.openai.com/docs)
- [Winston](https://github.com/winstonjs/winston)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de una prueba técnica y es de uso interno.