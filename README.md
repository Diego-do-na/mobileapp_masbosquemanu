# FrapApp — Sistema de Reportes FRAP para Paramédicos

Sistema completo para la captura, almacenamiento y administración de reportes de atención prehospitalaria (FRAP). Compuesto por tres partes:

| Componente | Tecnología | Descripción |
|---|---|---|
| **App móvil** | React Native (Expo) | Usada por paramédicos para llenar reportes en campo |
| **WebApp** | (repositorio separado) | Panel de administración para revisar y gestionar reportes |
| **Servidor** | Express.js + MySQL | Backend compartido que alimenta tanto la app móvil como la WebApp |

---

## Estructura del repositorio

```
MobileApp_Completo/
├── frontend_mobileapp/     # App móvil Expo
│   ├── app/                # Pantallas (Expo Router)
│   ├── frap_sections/      # 14 secciones del formulario FRAP
│   └── config.js           # URL base del servidor
│
└── backend_mobileapp/      # Servidor Express.js
    ├── server.js            # Entrada principal
    ├── config/              # Conexión MySQL
    ├── controllers/         # Lógica de negocio
    ├── routes/              # Definición de endpoints
    ├── schemas/             # Validación con Zod
    ├── middleware/          # Auth, validación, errores
    └── utils/               # Helpers y transacciones
```

---

## Cómo correr el proyecto

### Prerrequisitos
- Node.js 18+
- MySQL 8+
- Expo Go (en el celular) o simulador iOS/Android

### Backend

```bash
cd backend_mobileapp
npm install
```

Crea un archivo `.env` con:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=frap
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt
```

```bash
node server.js
# Servidor escucha en http://localhost:3000
# Health check: GET http://localhost:3000/api/health
```

### App móvil

```bash
cd frontend_mobileapp
npm install
```

Edita `config.js` con la IP local de tu máquina:
```js
export const API_URL = "http://192.168.x.x:3000";
```

```bash
npx expo start
# Presiona 'i' (iOS), 'a' (Android) o 'w' (Web)
```

---

## Base de datos MySQL — `frap`

### Diagrama de relaciones

```
paramedico
admin

paciente ──< paciente_alergia >── alergia
         ──< paciente_patologia >── patologia
         ──< paciente_medicamento >── medicamento
         ──< reporte

reporte ──> lugar
        ──> signos_vitales
        ──> nivel_conciencia
        ──< reporte_lesion >── lesion
        ──< reporte_pupilas >── pupilas
        ──< reporte_anatomica >── anatomica
        ──< reporte_insumo >── insumo
        ──< fotografias
```

### Tablas principales

#### `paramedico`
Usuarios que usan la app móvil para capturar reportes.

| Columna | Tipo | Descripción |
|---|---|---|
| `id_paramedico` | int PK | Autoincremental |
| `nombre` | varchar(100) | Nombre completo |
| `correoInst` | varchar(100) UNIQUE | Correo institucional |
| `correoEsc` | varchar(100) | Correo escolar (opcional) |
| `usuario` | varchar(100) UNIQUE | Username de acceso |
| `contraseña` | varchar(100) | Hash bcrypt |
| `firma_paramedico` | BLOB | Firma digital (imagen en base64 decodificada) |

#### `admin`
Usuarios con acceso al panel web de administración.

| Columna | Tipo | Descripción |
|---|---|---|
| `id_admin` | int PK | Autoincremental |
| `usuario` | varchar(50) UNIQUE | Username |
| `contraseña` | varchar(100) | Hash bcrypt |
| `correo` | varchar(50) UNIQUE | Correo de acceso |
| `nombre` | varchar(100) | Nombre (opcional) |
| `activo` | tinyint | Soft delete (1=activo, 0=eliminado) |
| `fecha_creacion` | datetime | Timestamp de registro |

#### `paciente`
Paciente atendido. Se crea al inicio del reporte.

| Columna | Tipo | Descripción |
|---|---|---|
| `id_Paciente` | int PK | Autoincremental |
| `nombre` | varchar(100) | Nombre del paciente |
| `edad` | int | 0–120 |
| `genero` | int | 0 = Femenino, 1 = Masculino, 2 = Otro |

Relaciones M:M: `alergia`, `patologia`, `medicamento` (tablas de catálogo, máx. 20 por categoría).

#### `reporte`
Registro principal del evento de atención. Un paciente puede tener múltiples reportes.

| Columna | Tipo | Descripción |
|---|---|---|
| `id_Reporte` | int PK | Autoincremental |
| `paciente_id` | int FK | → paciente |
| `fecha_hora` | datetime | Fecha y hora del evento |
| `observaciones` | text | Observaciones clínicas |
| `recomendaciones` | text | Recomendaciones |
| `traslado_aceptado` | tinyint | Paciente aceptó traslado (bool) |
| `numero_unidad` | varchar(100) | Número de ambulancia |
| `nombre_operador` | varchar(100) | Operador del vehículo |
| `firma_operador` | BLOB | Firma del operador |
| `firma_paciente` | BLOB | Firma del paciente (**requerida**) |
| `nombre_testigo` | varchar(100) | Nombre del testigo |
| `firma_testigo` | BLOB | Firma del testigo |
| `lugar_id` | int FK | → lugar |
| `signos_id` | int FK | → signos_vitales |
| `nivel_conciencia_id` | int FK | → nivel_conciencia |

#### `signos_vitales`
Creados por reporte (no se reutilizan).

| Columna | Tipo | Descripción |
|---|---|---|
| `Temp` | int | Temperatura corporal |
| `FC` | int | Frecuencia cardíaca (lpm) |
| `FR` | int | Frecuencia respiratoria (rpm) |
| `SpO2` | int | Saturación de oxígeno (%) |
| `T_A` | varchar(100) | Presión arterial (formato: "120/80") |
| `GLU` | int | Glucosa |

#### `nivel_conciencia`
Escala de Glasgow por reporte.

| Columna | Tipo | Descripción |
|---|---|---|
| `motora` | int | Respuesta motora (1–6) |
| `verbal` | int | Respuesta verbal (1–5) |
| `ocular` | int | Apertura ocular (1–4) |
| `total` | int | Suma Glasgow (3–15) |

#### `fotografias`
Máximo 10 fotos por reporte, cada una máx. 5 MB.

| Columna | Tipo | Descripción |
|---|---|---|
| `id_Fotografia` | int PK | Autoincremental |
| `reporte_id` | int FK | → reporte |
| `foto` | BLOB | Imagen codificada |

### Tablas de catálogo (M:M con reporte)

| Tabla | Descripción |
|---|---|
| `lesion` | Tipos de lesión (ej. fractura, contusión) |
| `pupilas` | Descripción pupilar (ej. isocóricas, midriáticas) |
| `anatomica` | Zonas anatómicas afectadas |
| `insumo` | Materiales utilizados (nombre + cantidad) |

---

## API — Endpoints del servidor

**Base URL:** `http://localhost:3000/api`

### Autenticación de paramédicos — `/api/authParamedicos`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/login` | — | Inicia sesión (usuario + contraseña) → retorna datos del usuario |
| GET | `/verificar` | Bearer token | Verifica si el token sigue vigente |
| POST | `/logout` | — | Cierra sesión (limpieza en cliente) |

### Admins — `/api/admins`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/registro` | — | Registra nuevo admin |
| POST | `/login` | — | Inicia sesión → retorna JWT (24h) con rol `admin` |
| GET | `/` | Admin | Lista todos los admins |
| GET | `/:id` | Admin | Obtiene un admin por ID |
| PUT | `/:id` | Admin | Actualiza datos del admin |
| DELETE | `/:id` | Admin | Soft delete (activo = 0). No se puede eliminar el último admin activo |

### Paramédicos — `/api/paramedicos`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | — | Registra paramédico (con firma opcional en base64) |
| GET | `/` | Admin | Lista todos los paramédicos |
| GET | `/:id` | Admin | Obtiene paramédico por ID |
| GET | `/:id/firma` | Paramédico | Obtiene firma del paramédico en base64 |
| PUT | `/:id` | Admin | Actualiza datos del paramédico |
| DELETE | `/:id` | Admin | Elimina paramédico (requiere que no tenga reportes) |

### Pacientes — `/api/pacientes`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | — | Crea paciente con alergias, patologías y medicamentos (transacción atómica) |
| GET | `/` | Paramédico | Lista pacientes (paginado, 20 por página) |
| GET | `/:id` | Paramédico | Obtiene paciente con sus catálogos |
| GET | `/buscar` | Paramédico | Búsqueda por nombre, edad, género |
| GET | `/:id/historial` | Paramédico | Historial de reportes del paciente |
| PUT | `/:id` | Paramédico | Actualiza paciente (reemplaza catálogos M:M) |

### Reportes — `/api/reportes`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | — | Crea reporte completo (transacción atómica: lugar, signos, Glasgow, lesiones, insumos, fotos) |
| GET | `/` | Paramédico | Lista reportes (paginado) |
| GET | `/:id` | Paramédico | Reporte completo con todo relacionado |
| GET | `/paciente/:pacienteId` | Paramédico | Reportes de un paciente específico |
| GET | `/fecha` | Paramédico | Reportes filtrados por rango de fecha |
| PUT | `/:id` | Paramédico | Actualiza campos del reporte |
| DELETE | `/:id` | Paramédico | Elimina reporte y sus relaciones |
| POST | `/:id/fotografias` | Paramédico | Agrega fotos al reporte (máx. 10, 5 MB c/u) |
| GET | `/:id/fotografias` | Paramédico | Obtiene fotos del reporte en base64 |
| GET | `/:id/pdf` | Paramédico | **(Pendiente)** Descarga reporte en PDF |

---

## Sistema de autenticación y roles

```
Roles: "admin" | "paramedico"
```

- **Paramédicos:** Se autentican con `usuario + contraseña`. El servidor devuelve los datos del usuario (el JWT está pendiente de activar en el código).
- **Admins:** Se autentican con `usuario + contraseña`. Reciben un JWT de 24h con rol `admin`.
- **Middleware:**
  - `verificarToken` — Extrae y verifica el Bearer token del header `Authorization`
  - `verificarAdmin` — Permite solo rol `admin`
  - `verificarParamedico` — Permite solo rol `paramedico`

**Contraseñas:** mínimo 8 caracteres, 1 mayúscula, 1 número. Hash con bcrypt (10 rondas).

---

## Flujo completo de un reporte FRAP

```
[App Móvil]                          [Servidor]                    [MySQL]
     │                                    │                             │
     │── Login (usuario/contraseña) ──>   │                             │
     │<── datos del paramédico ──────     │                             │
     │                                    │                             │
     │── POST /api/pacientes ──────────>  │── INSERT paciente ─────>   │
     │   (nombre, edad, género,           │── INSERT alergias/          │
     │    alergias, patologías,           │   patologías/medicamentos   │
     │    medicamentos)                   │   (transacción)        <──  │
     │<── { id: pacienteId } ─────────    │                             │
     │                                    │                             │
     │── POST /api/reportes ───────────>  │── INSERT lugar ────────>   │
     │   (pacienteId, signos vitales,     │── INSERT signos_vitales >   │
     │    Glasgow, lesiones, pupilas,     │── INSERT nivel_conciencia > │
     │    zonas anatómicas, insumos,      │── INSERT reporte ──────>   │
     │    fotos, firmas, traslado)        │── INSERT junctions ────>   │
     │<── { id: reporteId } ──────────    │   (transacción atómica) <─  │
     │                                    │                             │

[WebApp Admin]                       [Servidor]                    [MySQL]
     │                                    │                             │
     │── POST /api/admins/login ───────>  │                             │
     │<── JWT token (24h) ─────────────   │                             │
     │                                    │                             │
     │── GET /api/reportes ────────────>  │── SELECT reportes ─────>   │
     │   (Authorization: Bearer <token>)  │<── datos + paginación ──    │
     │<── lista de reportes ───────────   │                             │
     │                                    │                             │
     │── GET /api/paramedicos ─────────>  │── SELECT paramedicos ──>   │
     │── GET /api/pacientes ───────────>  │── SELECT pacientes ────>   │
```

---

## Configuración del servidor

| Parámetro | Valor |
|---|---|
| Puerto | `process.env.PORT` o `3000` |
| Límite de body JSON | 10 MB |
| Rate limiting | 100 peticiones / 15 minutos por IP |
| Pool de conexiones MySQL | 20 conexiones |
| Reintentos de conexión BD | 3 intentos con backoff exponencial |
| Orígenes CORS permitidos | localhost:3000, :8081, :5173, tudominio.com |

---

## Notas de implementación

- Las imágenes (firmas, fotos) se envían en **base64** y se almacenan como **BLOB** en MySQL.
- `lugar`, `signos_vitales` y `nivel_conciencia` se crean nuevos por cada reporte (no se reutilizan).
- El **soft delete** aplica solo a admins (campo `activo`). Los paramédicos se eliminan de forma permanente pero solo si no tienen reportes asociados.
- La generación de **PDF** (`GET /reportes/:id/pdf`) está declarada pero no implementada.
- Algunos endpoints de creación (paciente, reporte) no requieren autenticación actualmente — esto puede cambiar en producción.
