# Core HTTP Helper & Adapter

Sistema sencillo para manejar peticiones HTTP que se adapta automáticamente entre web y móvil.

## Estructura

```
src/app/core/
├── helpers/
│   └── platform.helper.ts      # Detección de plataforma
├── adapters/
│   └── http.adapter.ts         # Adaptador HTTP principal
├── services/
│   └── api.service.ts          # Servicios de API de ejemplo
├── interfaces/
│   └── http.interface.ts       # Interfaces TypeScript
└── index.ts                    # Exportaciones principales
```

## Características

### 🔄 **Adaptador HTTP Automático**

- **Web**: Usa `HttpClient` de Angular
- **Móvil**: Usa `fetch` nativo
- **Detección automática** de plataforma
- **API consistente** en ambas plataformas

### 🛡️ **Type Safety**

- Interfaces TypeScript completas
- Validación de tipos en tiempo de compilación
- Respuestas tipadas

## Uso Básico

### 1. Importar el servicio

```typescript
import { ApiService } from '../core';

constructor(private apiService: ApiService) {}
```

### 2. Hacer peticiones

```typescript
// Login
this.apiService.login({ email: "user@example.com", password: "123456" }).subscribe({
  next: (response) => console.log("Success:", response),
  error: (error) => console.error("Error:", error),
});

// GET con parámetros
this.apiService.getUsers(1, 10).subscribe((response) => console.log(response));

// POST con datos
this.apiService.updateUserProfile({ name: "John Doe" }).subscribe((response) => console.log(response));
```

### 3. Uso directo del adaptador HTTP

```typescript
import { HttpAdapter } from '../core';

constructor(private httpAdapter: HttpAdapter) {}

// Petición personalizada
this.httpAdapter.request({
  method: 'POST',
  url: '/custom-endpoint',
  data: { custom: 'data' },
  headers: { 'Authorization': 'Bearer token' }
}).subscribe(response => console.log(response));
```

## Detección de Plataforma

```typescript
import { PlatformHelper } from "../core";

// Verificar plataforma
if (PlatformHelper.isWeb()) {
  console.log("Running on web");
} else if (PlatformHelper.isMobile()) {
  console.log("Running on mobile");
}

// Obtener plataforma específica
console.log(PlatformHelper.getPlatform()); // 'web', 'ios', 'android'
```

## Configuración

Cambia la URL base en `src/app/core/adapters/http.adapter.ts`:

```typescript
private baseUrl = 'http://localhost:3000'; // Tu API de NestJS
```

## Integración con NestJS

Este adaptador está diseñado para trabajar con APIs de NestJS. Asegúrate de que tu API devuelva respuestas en el formato esperado:

```typescript
// Respuesta esperada de NestJS
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "user@example.com" },
    "token": "jwt-token-here"
  },
  "message": "Login successful"
}
```

## Próximos Pasos

1. **Configurar tu API de NestJS** con las URLs correctas
2. **Implementar autenticación** (JWT, tokens, etc.)
3. **Agregar interceptores** para headers automáticos
4. **Implementar cache** para peticiones GET
5. **Agregar retry logic** para peticiones fallidas
