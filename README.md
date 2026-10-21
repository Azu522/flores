# API local de flores

API REST con Node.js, Express y PostgreSQL. Incluye 12 flores de ejemplo.

## Requisitos

- Node.js 20 o posterior.
- PostgreSQL en ejecución.
- La contraseña de un usuario PostgreSQL con permiso para crear una base de datos y tablas.

## Configuración en PowerShell

Desde esta carpeta:

La configuración local se guarda en `.env` (ignorado por Git). Después de editar
sus valores cuando sea necesario, ejecuta:

```powershell
npm run db:setup
npm start
```

Por defecto la API escucha en `http://localhost:3000` y PostgreSQL en `localhost:5432`.
Puedes cambiar la conexión con las variables `PGHOST`, `PGPORT`, `PGDATABASE`,
`PGUSER` y `PGPASSWORD`. La API y el script de configuración leen `.env` automáticamente.

## Rutas

- `GET /api/health`: estado de la conexión con PostgreSQL.
- `GET /`: resumen de la API y sus rutas.
- `GET /api/flores`: lista todas las flores.
- `GET /api/flores?nombre=rosa`: filtra por nombre.
- `GET /api/flores?color=rojo`: filtra por color.
- `GET /api/flores/:id`: consulta una flor.
- `POST /api/flores`: agrega una flor (JSON con `nombre`, `color`, `temporada` y `precio`; `stock` y `descripcion` son opcionales).
- `PUT /api/flores/:id`: reemplaza los campos de una flor.
- `DELETE /api/flores/:id`: elimina una flor.

Ejemplo de creación:

```json
{
  "nombre": "Alcatraz",
  "color": "Blanco",
  "temporada": "Primavera",
  "precio": 42,
  "stock": 14,
  "descripcion": "Flor ornamental"
}
```
