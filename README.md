# TiendaNext — API

API REST del ecommerce TiendaNext, hecha con **Express 5**, **MySQL** y **Stripe**.
Proyecto integrador de Programación Web II (U6) — Pablo Rupérez.

🔌 **API:** https://tienda-api-pgdu.onrender.com/api/productos
🌐 **Web (repo):** https://github.com/PeibolJorris/tienda-next — desplegada en https://tienda-next.vercel.app

> Plan gratuito de Render: si lleva un rato sin usarse, la primera petición tarda ~50 s.

## Arquitectura en capas

```
routes → controllers → services → repositories → MySQL
```

- **routes:** definen las URLs y qué middlewares pasan.
- **controllers:** leen la petición y escriben la respuesta.
- **services:** lógica de negocio.
- **repositories:** consultas SQL (con `?` para evitar inyección SQL).
- **middlewares:** `verificarToken` (JWT) y `soloAdmin` (rol).

## Endpoints principales

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/productos` (`?buscar=`, `?categoria=`, `?destacado=`) | Público |
| GET | `/api/productos/:id` | Público |
| POST/PUT/DELETE | `/api/productos/:id` | Admin |
| GET | `/api/categorias` | Público |
| POST | `/api/auth/registro` · `/api/auth/login` · `/api/auth/refrescar` · `/api/auth/google` | Público |
| GET/POST | `/api/carrito` · PUT/DELETE `/api/carrito/:productoId` | Usuario |
| GET | `/api/pedidos` · `/api/pedidos/:id` · `/api/pedidos/sesion/:sessionId` | Usuario |
| GET | `/api/admin/pedidos` | Admin |
| POST | `/api/stripe/crear-sesion` | Usuario |
| POST | `/api/stripe/webhook` | Stripe (firma verificada) |

## Ejecutar en local

```bash
npm install
npm run dev        # http://localhost:4000
```

Variables en `.env`:

```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=...
DB_NAME=tienda
JWT_SECRET=...
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGIN=http://localhost:3000
```

Base de datos: ejecutar `db/esquema.sql` en MySQL.

## Despliegue

- **API:** Render (Web Service, Node, `npm install` + `node src/index.js`).
- **Base de datos:** MySQL en Aiven (plan Free). En producción se usan además `DB_PORT` y `DB_SSL=true`.
- **Stripe:** webhook de `checkout.session.completed` apuntando a `/api/stripe/webhook`.

Scripts de ayuda (leen `.env.produccion`, que no se sube a GitHub):

- `node db/importar.js` → carga `esquema.sql` en la base de datos de producción.
- `node db/hacer-admin.js email@ejemplo.com` → da rol `admin` a un usuario.

## Dificultades y lo que aprendí

Lo que más me costó de la API fue entender **cómo viaja una petición** por las capas. Al principio no tenía claro por qué había que separar *routes*, *controllers*, *services* y *repositories*, ni qué iba en cada archivo: me parecía que todo podía estar junto en la ruta. También me lié bastante con los **métodos HTTP** (cuándo usar `GET`, `POST`, `PUT` o `DELETE`) y con dónde llegan los datos en cada caso: `req.params` para el `:id` de la URL, `req.query` para los filtros (`?categoria=ropa`) y `req.body` para lo que se envía en un `POST` o `PUT`.

Lo que me ayudó fue seguir una petición entera paso a paso, por ejemplo crear un producto:

1. `POST /api/productos` entra por **productos.routes.js**.
2. Pasa por los middlewares `verificarToken` (¿hay sesión?) y `soloAdmin` (¿es admin?).
3. El **controller** lee `req.body` y llama al servicio.
4. El **service** aplica la lógica y llama al repositorio.
5. El **repository** hace el `INSERT` en MySQL.
6. La respuesta vuelve hacia arriba y el controller la envía con `res.status(201).json(...)`.

Entendido así, cada capa tiene una sola responsabilidad y es mucho más fácil encontrar dónde está un error.
