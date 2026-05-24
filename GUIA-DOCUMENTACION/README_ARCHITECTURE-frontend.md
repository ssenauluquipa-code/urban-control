# UrbanControl - Arquitectura de Aplicación Frontend

## Visión General

Este documento describe la estructura de arquitectura implementada en el Frontend de UrbanControl con Angular 17. Esta arquitectura combina **Atomic Design** en la capa visual con principios de **Clean Architecture y SOLID** (en particular el **Principio de Inversión de Dependencias - DIP**) para el manejo de estado, reglas de negocio y acceso a datos, logrando un código predecible, altamente mantenible y escalable.

---

## 🚀 Generador Automático (create-architecture)

Para facilitar el crecimiento de la aplicación, existe un script que crea todo el esqueleto necesario para una nueva entidad, respetando nuestra arquitectura:

### Uso
```bash
./create-architecture.sh <feature-slug> <entity>
create-architecture.bat <feature-slug> <entity>
```

**Ejemplo:**
```bash
./create-architecture.sh gestion-inmobiliaria lote
```

**Estructura que genera automáticamente:**
```text
src/app/core/models/gestion-inmobiliaria/
  └── lote.model.ts                    ← Interfaces de Dominio / DTOs (I*, Create*, Update*)
src/app/core/interfaces/repository/gestion-inmobiliaria/
  └── lote.repository.interface.ts     ← 🔑 Contrato (Repository Interface - DIP)
src/app/core/repository/gestion-inmobiliaria/
  └── lote.repository.ts               ← 📡 Implementación concreta HTTP (Infraestructura)
src/app/core/services/gestion-inmobiliaria/
  └── lote.service.ts                  ← 🧠 Lógica de Negocio (Depende de la interfaz abstracta)
src/app/features/Gestión-Inmobiliaria/
  ├── inmobiliaria.routes.ts           ← Rutas locales de la feature
  ├── pages/                           ← Componentes contenedores o páginas (Smart Components)
  └── views/                           ← Componentes de presentación específicos (Dumb Components)
```

---

## 📂 Organización de Carpetas y Relación de Módulos

La aplicación se estructura en 3 grandes pilares principales dentro de `src/app/`:

Toda la aplicación sigue este esquema:

```text
src/app/
├── core/                                # 🧠 Núcleo de la Aplicación (Agnóstico a la UI)
│   ├── auth/                            # Servicios y repositorios de autenticación global
│   ├── guards/                          # Protección y validación de acceso a rutas
│   ├── interceptors/                    # Manejo de headers HTTP y respuestas globales (ej. inyección de JWT)
│   ├── interfaces/repository/           # 🔑 ABSTRACCIONES: Interfaces que definen los contratos para acceso a datos.
│   ├── models/                          # 📝 DTOs (Data Transfer Objects): Definición de datos para envío/recepción.
│   ├── repository/                      # 📡 INFRAESTRUCTURA: Clases o utilidades concretas con `@Injectable` (HttpClient).
│   └── services/                        # ⚙️ LÓGICA: Casos de uso de negocio globales.
│
├── features/                            # 🧩 Módulos Específicos de Negocio (Módulos Inteligentes / UI Domain)
│   ├── Gestión-Inmobiliaria/            # 🏠 Ejemplo de Feature ("Dominio")
│   │   ├── inmobiliaria.routes.ts       # Definición de las rutas del módulo (`loadChildren`).
│   │   ├── pages/                       # "Smart Components", pantallas vinculadas a las rutas que inyectan Servicios.
│   │   └── views/                       # Fragmentos o vistas no enrutables pero propias de la feature.
│   └── access/                          # Feature de seguridad / roles.
│
└── shared/                              # 🧱 Visuales y Utilidades Transversales (Atomic Design)
    ├── components/                      # UI Components reutilizables (Dumb components en su mayoría)
    │   ├── atoms/                       # Elementos mínimos e indivisibles (Input, Button, Chip). Ej: `select-data.component.ts`.
    │   ├── molecules/                   # Conjunto de 2+ átomos que hacen juntos algo simple (Buscador).
    │   ├── organisms/                   # Bloques funcionales independientes conformados de moléculas/átomos (Tabla completa, Header).
    │   └── templates/                   # Diseños de base donde las páginas inyectan contenido (Contenedores CSS de wireframe).
    ├── directives/                      # Reutilización de comportamientos del DOM (ej: `drag-modal.directive.ts`).
    ├── pipes/                           # Transformadores visuales de formato de la data.
    └── interfaces/                      # Definiciones Typescript (enum/type) para elementos UI.
```

---

## ⚙️ Análisis de la Arquitectura Interna del Core (SOLID - DIP)

Para evitar que nuestro negocio quede amarrado a `HttpClient` y facilitar muchísimo el Mock en Testing y el desacoplamiento, usamos el **Principio de Inversión de Dependencia**.

### 1. `core/models/` - Los Datos (DTOs)
Describen de forma estructurada los contratos de transporte de información.
```typescript
// core/models/gestion-inmobiliaria/lote.model.ts
export interface ILote { id: string; estado: string; ... }
export interface CreateLoteDto { ... }
export interface UpdateLoteDto extends Partial<CreateLoteDto> {}
```

### 2. `core/interfaces/repository/` - El Contrato 🔑
Define la existencia de operaciones sobre los datos **SIN revelar cómo y a dónde se conecta**.
```typescript
// core/interfaces/repository/gestion-inmobiliaria/lote.repository.interface.ts
export interface ILoteRepository {
  getAll(): Observable<ILote[]>;
  create(dto: CreateLoteDto): Observable<ILote>;
  ...
}
```

### 3. `core/repository/` - Capa de Infraestructura (HTTP Concreto)
Clase encargada exclusivamente de la comunicación hacia el exterior (Base de datos / APIs REST). Es la única que sabe de la existencia de `HttpClient`.
```typescript
// core/repository/gestion-inmobiliaria/lote.repository.ts
@Injectable({ providedIn: 'root' })
export class LoteRepository implements ILoteRepository {
  private readonly URL = '/api/gestion-inmobiliaria/lotes';
  constructor(private http: HttpClient) {}
  getAll(): Observable<ILote[]> { return this.http.get<ILote[]>(this.URL); }
}
```

### 4. `core/services/` - Casos de Uso (Business Logic)
Aquí reside la transformación de lógica y control. Es donde se pide de la Base de datos y se manipulan arreglos u observables. **Depende de abstracciones (interfaces), NO de clases http**.
```typescript
// core/services/gestion-inmobiliaria/lote.service.ts
@Injectable({ providedIn: 'root' })
export class LoteService {
  // ⚡ INYECCIÓN POR INTERFAZ (DIP): Al servicio no le importa Si LoteRepository es Http o es LocalStorage.
  constructor(@Inject('ILoteRepository') private repo: ILoteRepository) {}

  getLotesDisponibles(): Observable<ILote[]> {
    return this.repo.getAll().pipe(
      map(lotes => lotes.filter(l => l.estado === 'DISPONIBLE'))
    );
  }
}
```

---

## Flujo de Comunicación (Diagrama)

```text
 👤 Usuario Interacciona
      ↓
 📱 UI (Componentes `features/pages/register-lotes.component.ts`) 
      ↓ [Llama al método en el servicio respectivo]
 🧠 LoteService (Controlador de Reglas de Negocio en `core/services/`)
      ↓ [Invoca Interfaz]
 🛡️ ILoteRepository (El contrato puro, sin implementaciones directas)
      ↓
 📡 LoteRepository (La implementación específica Http / Firebase / LocalDb) → Backend (Node / Nest / Spring)
```

## Beneficios Concretos Logrados
1. **UI Agnóstica (Atomic Design):** Los componentes dentro de `shared/` (`atoms`, `molecules`, `directives`) se pueden copiar como "Librerías Tontas" a cualquier otro proyecto Angular y funcionan sin refactorización.
2. **Alta Testeabilidad (`core/`):** Todos los componentes de interface, los service, etc. pueden rellenarse con Repositorios Mock sin levantar llamadas al BackEnd durante testing automatizado.
3. **Escalabilidad Inmediata (`features/`):** ¿Hay un nuevo módulo para "RRHH"? Sólo haz `ng generate module features/rrhh` o usa el script `.sh` y no estarás afectando ningún archivo o código ajeno de Inmobiliaria.
4. **Mantenibilidad Precisa (`core/repository/`):** Si el servidor de backend actualiza el response global base, sólo hay que actualizar las lógicas de serialización dentro del repositorio y a nivel del service + componentes el cambio se vuelve transparente.
