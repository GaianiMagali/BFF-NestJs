# 🚀 BFF NestJS - Arquitectura Hexagonal

Backend For Frontend (BFF) desarrollado con NestJS siguiendo patrones de **Arquitectura Hexagonal** para validación de tokens JWT y obtención de información de usuario.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)

## ✨ Características

- 🏗️ **Arquitectura Hexagonal** - Separación limpia de responsabilidades
- 🔐 **Validación JWT** - Decodificación sin verificación de firma
- 🔄 **Token Renovation** - Obtención de tokens renovados de API externa
- 🌐 **Integración APIs** - Comunicación con servicios externos
- 📚 **Swagger Documentation** - API completamente documentada
- 🛡️ **Guards & Filters** - Manejo robusto de errores y seguridad
- 🔧 **Variables de Entorno** - Configuración flexible por ambiente
- 🔄 **Hot Reload** - Desarrollo con recarga automática

## 🏗️ Arquitectura

### Arquitectura Hexagonal (Ports & Adapters)

```
┌─────────────────────┐
│    Presentation     │  ← Controllers, DTOs
├─────────────────────┤
│    Application      │  ← Use Cases, DTOs
├─────────────────────┤
│      Domain         │  ← Entities, Repositories
├─────────────────────┤
│   Infrastructure    │  ← Adapters, Guards, Filters
└─────────────────────┘
```

## 🔄 Flujo Detallado de Datos

### Arquitectura de Capas

```mermaid
graph TB
    subgraph "🌐 Cliente"
        Client[Frontend/Postman]
    end
    
    subgraph "🎨 PRESENTATION Layer"
        Controller[AuthController]
        Guard[TokenValidationGuard]
    end
    
    subgraph "📋 APPLICATION Layer"  
        UseCase[ValidateTokenUseCase]
        DTOs[DTOs Response]
    end
    
    subgraph "📊 DOMAIN Layer"
        Entity[Token Entity]
        Exceptions[Domain Exceptions]
    end
    
    subgraph "🔧 INFRASTRUCTURE Layer"
        JWTAdapter[JWT Adapter]
        ValidationAdapter[Token Validation Adapter]
        UserAdapter[User API Adapter]
        Filter[Exception Filter]
    end
    
    subgraph "🌍 External Services"
        ValidationAPI[Token Validation API]
        UserAPI[User Info API]
    end

    Client --> Controller
    Controller --> Guard
    Guard --> UseCase
    UseCase --> Entity
    UseCase --> JWTAdapter
    UseCase --> ValidationAdapter
    UseCase --> UserAdapter
    ValidationAdapter --> ValidationAPI
    UserAdapter --> UserAPI
    Exceptions --> Filter
    DTOs --> Controller
```

### Flujo Paso a Paso con Componentes

```mermaid
sequenceDiagram
    participant C as 🌐 Cliente
    participant G as 🛡️ Guard
    participant UC as 📋 UseCase
    participant JWT as 🔐 JWT Adapter
    participant VA as ✅ Validation Adapter
    participant UA as 👤 User Adapter
    participant E as 📊 Token Entity
    participant Ctrl as 🎯 Controller
    participant F as 🚨 Exception Filter
    participant ExtAPI1 as 🌍 Validation API
    participant ExtAPI2 as 🌍 User API

    Note over C: 1. Request con Token
    C->>G: GET /api<br/>Authorization: Bearer <token>
    
    Note over G: 2. Extracción y Validación
    G->>UC: validateToken(token)
    
    Note over UC: 3. Decodificación JWT
    UC->>JWT: validateToken(token)
    JWT->>E: new Token(payload)
    E->>UC: Token entity
    
    alt Token expirado
        UC->>F: throw TokenExpiredException
        F->>C: 401 + error details
    else Token válido
        Note over UC: 4. Validación Externa
        UC->>VA: validateAndRenewToken(token)
        VA->>ExtAPI1: POST /validate
        ExtAPI1->>VA: renewed_token
        VA->>UC: renewed_token
        
        Note over UC: 5. Obtener Info Usuario
        UC->>UA: getUserInfo(renewed_token)
        UA->>ExtAPI2: GET /users/1
        ExtAPI2->>UA: user_data
        UA->>UC: user_data
        
        Note over UC: 6. Respuesta Exitosa
        UC->>G: { isValid: true, token, userInfo }
        G->>Ctrl: request.user = token<br/>request.userInfo = userInfo
        Ctrl->>C: 200 + ValidateTokenResponseDto
    end
```

### Flujo de Datos por Capa

```mermaid
flowchart LR
    subgraph Input["📥 INPUT"]
        A[Authorization: Bearer eyJ...]
    end
    
    subgraph Presentation["🎨 PRESENTATION"]
        B[Guard extrae token]
        C[Controller formatea respuesta]
    end
    
    subgraph Application["📋 APPLICATION"]
        D[UseCase orquesta validación]
        E[DTOs estructuran datos]
    end
    
    subgraph Domain["📊 DOMAIN"]
        F[Token Entity valida payload]
        G[Exceptions manejan errores]
    end
    
    subgraph Infrastructure["🔧 INFRASTRUCTURE"]
        H[JWT Adapter decodifica]
        I[HTTP Adapters llaman APIs]
        J[Exception Filter formatea errores]
    end
    
    subgraph External["🌍 EXTERNAL"]
        K[Validation API renueva token]
        L[User API retorna datos]
    end
    
    subgraph Output["📤 OUTPUT"]
        M[JSON Response estructurado]
    end

    A --> B
    B --> D
    D --> F
    D --> H
    D --> I
    H --> D
    I --> K
    I --> L
    K --> I
    L --> I
    I --> D
    F --> D
    D --> B
    B --> C
    C --> E
    E --> M
    
    G --> J
    J --> M
```

## 📊 Datos que Viajan entre Componentes

### 🔄 Transformación de Datos

| Componente | Input | Output | Propósito |
|------------|-------|--------|-----------|
| **Client** | `Authorization: Bearer eyJhbGci...` | - | Envía token en header |
| **Guard** | `"Bearer eyJhbGci..."` | `{ isValid: true, token: Token, userInfo: {...} }` | Extrae y valida token |
| **JWT Adapter** | `"eyJhbGci..."` | `Token { sub: "123", exp: 1703980800 }` | Decodifica sin verificar firma |
| **Token Entity** | `{ sub: "123", username: "john", exp: 1703980800 }` | `Token entity methods` | Encapsula lógica del token |
| **Validation Adapter** | `"eyJhbGci..."` | `"renewed_eyJhbGci..."` | Renueva token vía API externa |
| **User Adapter** | `"renewed_eyJhbGci..."` | `{ id: 1, name: "John", email: "..." }` | Obtiene info del usuario |
| **UseCase** | `"eyJhbGci..."` | `{ isValid: true, token, userInfo, message }` | Orquesta todo el proceso |
| **Controller** | `request.user, request.userInfo` | `ValidateTokenResponseDto` | Formatea respuesta final |

### 📤 Respuesta Final

```json
{
  "valid": true,
  "message": "Token validated, renewed, and user info retrieved",
  "tokenInfo": {
    "sub": "12345",
    "username": "john_doe", 
    "exp": 1703980800,
    "iat": 1703977200,
    "payload": { "sub": "12345", "username": "john_doe", "exp": 1703980800 }
  },
  "externalUserInfo": {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret", 
    "email": "Sincere@april.biz",
    "phone": "1-770-736-8031 x56442",
    "website": "hildegard.org",
    "company": { "name": "Romaguera-Crona" },
    "address": { "street": "Kulas Light", "city": "Gwenborough" }
  }
}
```

### 🚨 Respuesta de Error

```json
{
  "error": true,
  "statusCode": 401,
  "errorCode": "TOKEN_EXPIRED",
  "message": "Token has expired",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 🔍 Adaptadores en Detalle

#### JWT Adapter
```typescript
// Input:  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// Output: Token { payload: { sub: "123", exp: 1703980800 } }
```

#### Token Validation Adapter  
```typescript
// Input:  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// HTTP:   POST https://httpbin.org/post
// Output: "renewed_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### User API Adapter
```typescript
// Input:  "renewed_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// HTTP:   GET https://jsonplaceholder.typicode.com/users/1
// Output: { id: 1, name: "Leanne Graham", email: "..." }
```

## 🛠️ Requisitos

- **Node.js** >= 18.x
- **npm** >= 8.x
- **TypeScript** >= 5.x

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd bff-nestJS-arquitectura-hexagonal
```

### 2. Instalar Dependencias

```bash
npm install
```

#### Dependencias Principales

| Paquete | Propósito |
|---------|-----------|
| `@nestjs/core` | Framework base de NestJS |
| `@nestjs/common` | Decoradores y utilidades |
| `@nestjs/platform-express` | Adaptador para Express |
| `@nestjs/axios` | Cliente HTTP para APIs externas |
| `@nestjs/swagger` | Documentación automática de API |
| `jsonwebtoken` | Manejo y decodificación de JWT |
| `axios` | Cliente HTTP |
| `class-validator` | Validación de DTOs |
| `class-transformer` | Transformación de objetos |
| `dotenv` | Manejo de variables de entorno |
| `reflect-metadata` | Soporte para decoradores |
| `rxjs` | Programación reactiva |

#### Dependencias de Desarrollo

| Paquete | Propósito |
|---------|-----------|
| `typescript` | Compilador TypeScript |
| `ts-node` | Ejecución directa de TypeScript |
| `ts-node-dev` | Desarrollo con hot reload |
| `@types/*` | Definiciones de tipos |
| `tsconfig-paths` | Resolución de paths |

## ⚙️ Configuración

### 1. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Configuración del BFF
PORT=3000

# API Externa - JSONPlaceholder (para desarrollo/testing)
EXTERNAL_API_BASE_URL=https://jsonplaceholder.typicode.com

# API de validación de tokens (para obtener token renovado)
TOKEN_VALIDATION_API_URL=https://httpbin.org/post
```

### 2. Configuración TypeScript

El proyecto usa `tsconfig.json` con:
- **Target**: ES2020
- **Module**: CommonJS
- **Decorators**: Habilitados
- **Strict Mode**: Activado
- **Path Mapping**: Para imports limpios

### 3. Configuración NestJS

- **Puerto**: Configurable via `PORT` env var (default: 3000)
- **CORS**: Habilitado para requests del frontend
- **Global Prefix**: `/api` para todos los endpoints
- **Swagger**: Disponible en `/api/docs`

## 🚀 Ejecución

### Desarrollo (Recomendado)

```bash
npm run start:dev
```
- ✅ Hot reload automático
- ✅ Transpilación rápida
- ✅ Soporte para debugging

### Producción

```bash
# Compilar
npm run build

# Ejecutar compilado
npm run start:prod
```

### Una Vez (Sin Hot Reload)

```bash
npm start
```

### Verificar que está funcionando

```bash
curl http://localhost:3000/api
# Debería retornar error 401 (esperado sin token)
```

## 🌐 API Endpoints

### GET /api

**Descripción**: Valida token JWT y retorna información del usuario

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Respuesta Exitosa (200)**:
```json
{
  "valid": true,
  "message": "Token validated, renewed, and user info retrieved",
  "tokenInfo": {
    "sub": "12345",
    "username": "john_doe",
    "exp": 1703980800,
    "iat": 1703980800,
    "payload": { ... }
  },
  "externalUserInfo": {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    ...
  }
}
```

**Respuestas de Error (401)**:

| Error Code | Descripción |
|------------|-------------|
| `TOKEN_NOT_PROVIDED` | Sin header Authorization |
| `INVALID_TOKEN` | JWT malformado |
| `TOKEN_EXPIRED` | Token vencido |

### GET /api/docs

**Descripción**: Documentación interactiva Swagger UI

## 🧪 Testing

### Swagger UI (Recomendado)

1. Abrir http://localhost:3000/api/docs
2. Hacer clic en "Authorize" 🔒
3. Ingresar: `Bearer <tu-jwt-token>`
4. Probar el endpoint

### Postman

```
GET http://localhost:3000/api
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### cURL

```bash
curl -X GET "http://localhost:3000/api" \
  -H "Authorization: Bearer <tu-token>"
```

### Token de Prueba

Para testing, generar JWT en https://jwt.io con payload:
```json
{
  "sub": "1",
  "username": "testuser",
  "iat": 1703980800,
  "exp": 2903980800
}
```

## 📁 Estructura del Proyecto

```
src/
├── main.ts                           # 🚀 Punto de entrada
├── app.module.ts                     # 📦 Módulo principal
├── presentation/                     # 🎨 Capa de Presentación
│   └── controllers/
│       └── auth.controller.ts        # 🎯 Endpoints HTTP
├── application/                      # 📋 Capa de Aplicación
│   ├── dtos/                        # 📄 Data Transfer Objects
│   │   ├── index.ts                 # 📦 Barrel exports
│   │   ├── token-info.dto.ts        # 🎫 Info del JWT
│   │   ├── external-user-info.dto.ts # 👤 Info del usuario
│   │   ├── validate-token-response.dto.ts # ✅ Respuesta exitosa
│   │   └── error-response.dto.ts    # ❌ Respuesta de error
│   └── use-cases/
│       └── validate-token.use-case.ts # 🔄 Lógica de negocio
├── domain/                          # 🏛️ Capa de Dominio
│   ├── entities/
│   │   └── token.entity.ts          # 🎫 Entidad Token
│   ├── exceptions/
│   │   └── token.exception.ts       # ⚠️ Excepciones específicas
│   └── repositories/
│       └── token.repository.ts      # 🗂️ Interface del repositorio
└── infrastructure/                  # 🔧 Capa de Infraestructura
    ├── adapters/
    │   ├── jwt/
    │   │   └── jwt.adapter.ts       # 🔐 Decodificación JWT
    │   └── external-api/
    │       ├── token-validation.adapter.ts # ✅ Validación externa
    │       └── user-api.adapter.ts  # 👤 API de usuarios
    ├── guards/
    │   └── token-validation.guard.ts # 🛡️ Protección de endpoints
    └── filters/
        └── domain-exception.filter.ts # 🚨 Manejo de errores
```

## 💻 Tecnologías

### Backend Framework
- **NestJS** - Framework Node.js enterprise-ready
- **Express** - Servidor HTTP subyacente
- **TypeScript** - JavaScript con tipos estáticos

### Validación & Transformación
- **Class Validator** - Validación basada en decoradores
- **Class Transformer** - Transformación de objetos

### HTTP & APIs
- **Axios** - Cliente HTTP para APIs externas
- **RxJS** - Programación reactiva

### JWT & Seguridad
- **jsonwebtoken** - Manejo de JWT
- **Guards** - Protección de rutas
- **Exception Filters** - Manejo centralizado de errores

### Documentación
- **Swagger/OpenAPI** - Documentación interactiva de API
- **TypeDoc** - Documentación del código

### Desarrollo
- **ts-node-dev** - Hot reload en desarrollo
- **dotenv** - Variables de entorno
- **ESLint** - Linting de código
- **Prettier** - Formateo de código

## 🔧 Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run start:dev

# Producción (compilar + ejecutar)
npm run build && npm run start:prod

# Ejecutar una vez
npm start

# Compilar TypeScript
npm run build

# Linting
npm run lint

# Tests (por configurar)
npm test
```

## 🌍 Ambientes

### Desarrollo
- Puerto: 3000
- Hot reload: ✅
- Logging: Detallado
- CORS: Habilitado

### Producción
- Puerto: Variable `PORT`
- Compilación: Optimizada
- Logging: Estructurado
- Variables: Desde archivo `.env`

## 📝 Notas Importantes

1. **JWT Sin Validación de Firma**: El BFF solo decodifica el JWT y verifica expiración. La validación de firma se delega a la API externa.

2. **Token Renovado**: Después de validar, se obtiene un token renovado de la API externa que se usa para llamadas posteriores.

3. **Roles en Header**: Los roles vienen en el header del JWT, no en el payload, por eso no se procesan en la entidad Token.

4. **Arquitectura Hexagonal**: El dominio no depende de nada, la aplicación solo del dominio, y la infraestructura implementa las interfaces del dominio.

5. **Manejo de Errores**: Los errores de APIs externas se retornan tal cual, salvo que sean muy feos (por configurar).

## 🚀 Próximos Pasos

- [ ] Tests unitarios e integración
- [ ] Logging estructurado
- [ ] Métricas y monitoring
- [ ] Rate limiting
- [ ] Caching de responses
- [ ] CI/CD pipeline

## 📞 Soporte

Para problemas o preguntas, revisar:
1. Logs de la aplicación
2. Swagger docs en `/api/docs`
3. Variables de entorno en `.env`
4. Estructura de carpetas siguiendo arquitectura hexagonal

---

⚡ **BFF listo para validar tokens y servir al frontend!**