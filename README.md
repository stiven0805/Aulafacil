# AulaFácil

Proyecto de reserva de aulas con frontend en React/Vite y backend en Django REST.

## Estructura del proyecto

- `backend/` - API Django REST, autenticación JWT, reservas y Twilio SMS.
- `frontend/` - App React/Vite con UI de reserva, historial, notificaciones y flujo de autenticación.

## Requisitos

- Python 3.11+
- Node 18+ o compatible
- PostgreSQL local (o un servidor PostgreSQL accesible)
- Opcional: cuenta de Twilio para SMS reales

## Configuración del backend

### 1. Activar el entorno virtual

Desde la raíz del repo:

```powershell
cd C:\Users\Sebastian\Aulafacil-master
\.venv\Scripts\Activate.ps1
```

Si no tienes `.venv`, puedes usar tu Python del sistema.

### 2. Instalar dependencias

```powershell
\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

### 3. Configurar `backend/.env`

Crea o actualiza `backend/.env` con:

```env
SECRET_KEY=super-secret-key
DB_NAME=aulafacil_db2
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_NOTIFICATION_RECIPIENT=+1234567890
```

> Nota: en esta instalación local el nombre correcto de la base de datos es `aulafacil_db2`.

### 4. Ejecutar migraciones

```powershell
cd backend
\.venv\Scripts\python.exe manage.py migrate
```

### 5. Iniciar el servidor Django

```powershell
\.venv\Scripts\python.exe manage.py runserver 8000
```

## Configuración del frontend

### 1. Instalar dependencias

```powershell
cd frontend
npm install
```

### 2. Iniciar el frontend

```powershell
cd frontend
npm run dev
```

### 3. Abrir la app

Visita `http://localhost:5173` en tu navegador.

## Flujo principal

- Registro de usuario: formulario en el frontend.
- Login: el frontend pide token JWT y lo guarda en `localStorage`.
- Crear reserva: se envía al endpoint `/api/reservations/`.
- Ver historial: `/api/reservations/me/` devuelve las reservas del usuario.
- Cancelar reserva: acción `POST /api/reservations/{id}/cancel/`.
- Disponibilidad de aulas: endpoint `GET /api/reservations/aulas_disponibles/?start=...&end=...`.

## Twilio / SMS

El backend intenta enviar un SMS con Twilio cuando se crea una reserva. Si no configuras las variables de entorno, la reserva se guarda igual y se registra una advertencia.

Variables para Twilio:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `TWILIO_NOTIFICATION_RECIPIENT`

## Verificación

### Backend

```powershell
cd backend
\.venv\Scripts\python.exe manage.py check
\.venv\Scripts\python.exe manage.py migrate
```

### Frontend

```powershell
cd frontend
npm run dev
```

Abre `http://localhost:5173` y verifica que la app carga sin errores.

## Notas adicionales

- El frontend está configurado para reenviar `'/api'` a `http://127.0.0.1:8000` en `frontend/vite.config.ts`.
- Si cambias el backend de puerto o dominio, actualiza el proxy en el frontend.
- Si el servidor PostgreSQL usa otra base de datos o credenciales, ajusta `backend/.env`.
- El backend actual ya pasó `manage.py check` sin problemas.
