# WS Willasayki · Encuestas Ciudadanas

Plataforma de encuestas ciudadanas independientes, organizada por
Departamento → Provincia → Distrito, integrada al ecosistema editorial de
**WS Willasayki**. Incluye control antifraude, fichas verificadas de
candidatos y páginas de metodología/transparencia/privacidad/términos.

```
willasayki/
├── docker-compose.yml  → DB + backend + frontend en local, con un comando
├── frontend/   → Next.js 14 (App Router) + Tailwind — desplegar en VERCEL
└── backend/    → Node + Express + Prisma + PostgreSQL — desplegar en RENDER
```

## 1. Desarrollo local con Docker (recomendado para empezar)

Requiere solo Docker instalado — no necesitas Node ni PostgreSQL en tu
máquina.

```bash
npm run up
```

Eso levanta cuatro contenedores:

| Servicio | URL | Qué es |
|---|---|---|
| `frontend` | http://localhost:3000 | El sitio, con hot-reload |
| `backend` | http://localhost:4000 | La API, con hot-reload |
| `db` | localhost:5432 | PostgreSQL (usuario/clave/base: `willasayki`) |
| `adminer` | http://localhost:8080 | Visor web de la base de datos |

La primera vez que levantas el stack, en otra terminal carga los datos de
ejemplo:

```bash
npm run seed
```

Con eso ya tienes en http://localhost:3000 la encuesta demo de Miraflores
funcionando de punta a punta. Para administrar contenido entra a
http://localhost:3000/admin con el token `dev-admin-token` (definido en
`docker-compose.yml`, solo para desarrollo local).

**Otros atajos** (todos se corren desde la raíz del proyecto):

```bash
npm run down            # apaga los contenedores (conserva los datos)
npm run down:volumes    # apaga y BORRA la base de datos local
npm run logs            # sigue los logs de todos los servicios
npm run studio           # Prisma Studio en http://localhost:5555
npm run backend:shell    # abre una shell dentro del contenedor backend
```

Editar código en `backend/` o `frontend/` se refleja al instante — los
contenedores montan tu carpeta local como volumen. Si agregas una
dependencia nueva (`npm install algo`), reconstruye con `npm run up`
(vuelve a hacer `--build` automáticamente).

Este `docker-compose.yml` es para **desarrollo local**. En producción,
sigue las secciones 3 y 4 (Render + Vercel) — son plataformas gestionadas
que no necesitan Docker para correr este proyecto. Si prefieres desplegar
tú mismo con Docker en cualquier VPS, `backend/Dockerfile` (build
multi-stage) ya está listo para eso.

## 2. Fotos de candidatos y logos de partido

El panel `/admin` sube imágenes directamente desde el navegador a
[Cloudinary](https://cloudinary.com) (plan gratuito: 25 créditos/mes, de
sobra para esto). Así evitamos guardar archivos en el disco de Render, que
es efímero y se borra en cada redeploy.

**Configurarlo (una sola vez, 5 minutos):**

1. Crea una cuenta gratuita en [cloudinary.com](https://cloudinary.com).
2. En el Dashboard, copia tu **Cloud name** (arriba a la izquierda).
3. Ve a **Settings → Upload → Upload presets → Add upload preset**:
   - **Signing Mode**: `Unsigned`
   - **Folder**: `willasayki` (opcional, ya lo fija el código igual)
   - Guarda y copia el **nombre del preset**.
4. Agrega esos dos valores como variables de entorno:
   - **Local (Docker):** copia `.env.example` (raíz del proyecto) a `.env`
     y completa `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y
     `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. Reinicia con `npm run up`.
   - **Vercel:** agrégalas en Project Settings → Environment Variables
     (mismos nombres) y vuelve a desplegar.

Sin esta configuración, el panel `/admin` sigue funcionando con
normalidad — el botón "Subir imagen" simplemente mostrará un error
explicando qué falta.

## 3. Backend (Render)

1. Sube la carpeta `backend/` a un repositorio de GitHub.
2. En Render: **New → Blueprint**, apunta al repo — `render.yaml` crea
   automáticamente el servicio web y la base de datos PostgreSQL.
   - Si prefieres hacerlo manual: **New → PostgreSQL** (anota la
     `Internal Database URL`) y **New → Web Service** con:
     - Root directory: `backend`
     - Build command: `npm install && npm run build`
     - Start command: `npm start`
     - Variables de entorno: copia `.env.example` y completa `DATABASE_URL`,
       `HASH_SALT` (genera un valor aleatorio), `CORS_ORIGINS` (dominio de
       Vercel).
3. Primera sincronización de esquema y datos de ejemplo (desde tu máquina,
   apuntando a la `DATABASE_URL` externa de Render — la encuentras en el
   dashboard de la base de datos, pestaña "Connect", como "External
   Database URL"):
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run seed
   ```
   El build de Render (`npm run build`) ya ejecuta `prisma db push`
   automáticamente en cada despliegue, así que este paso manual solo hace
   falta la primera vez, para poder correr el `seed` de ejemplo antes de
   tener datos reales cargados desde `/admin`.

   *Nota sobre migraciones:* este proyecto usa `prisma db push` (sincroniza
   el esquema directamente) por simplicidad, en línea con "sin exceso de
   complejidad". Si el equipo crece y necesitas historial de migraciones
   versionado y reversible, cambia el build a `prisma migrate deploy` y
   genera la migración inicial con `npx prisma migrate dev --name init`
   (requiere una base de datos accesible en el momento de generarla).
4. Verifica: `https://<tu-servicio>.onrender.com/salud` → `{"ok": true}`.

## 4. Frontend (Vercel)

1. Sube la carpeta `frontend/` a un repositorio de GitHub (puede ser el
   mismo repo, configurando el *Root Directory* en Vercel).
2. En Vercel: **Add New → Project**, selecciona el repo, Root Directory =
   `frontend` (detecta Next.js automáticamente).
3. Variables de entorno (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_API_URL` → URL del backend en Render + `/api`
   - `NEXT_PUBLIC_SITE_URL` → dominio final del sitio (para Open Graph/Facebook)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
     (ver sección 2, si quieres fotos/logos)
4. Deploy. Conecta tu dominio propio (p. ej. `encuestas.willasayki.pe`) desde
   Project Settings → Domains.

## 5. Carga de geografía completa del Perú

El `seed.ts` incluido trae solo un ejemplo (Lima / Miraflores) para
desarrollo. Para producción, importa el listado oficial de ubigeos INEI
(departamento, provincia, distrito) a un CSV y crea un script
`backend/scripts/importar-ubigeo.ts` que recorra el CSV con
`prisma.departamento.upsert / provincia.upsert / distrito.upsert`, siguiendo
el mismo patrón usado en `prisma/seed.ts`.

## 6. Panel de administración

Disponible en `/admin` del frontend (protegido por `ADMIN_TOKEN`, el mismo
valor que configuraste en Render). Permite dar de alta departamentos,
provincias y distritos; partidos (con logo); candidatos (con foto); y crear
encuestas asignándoles candidatos, además de cambiar su estado (Borrador →
Abierta → Cerrada → Archivada).

Es intencionalmente mínimo: usa un token único de administrador en vez de
usuarios con roles, y para tareas menos frecuentes (agregar propuestas o
fuentes verificadas a un candidato, importar geografía masiva) recomienda
`npx prisma studio` o llamadas directas a `POST /api/admin/candidatos`. Es
el punto justo entre "nada" y un CMS completo — si el equipo editorial
crece, migrar a JWT + roles es el siguiente paso natural.

**Acceso:** entra a `https://tu-dominio/admin` e ingresa el valor de
`ADMIN_TOKEN` (cópialo desde las variables de entorno del servicio en
Render). El token se guarda solo en `sessionStorage` del navegador.

## 7. Imagen de vista previa para Facebook

Coloca una imagen de 1200×630px en
`frontend/public/og/willasayki-encuestas-og.jpg` (referenciada ya en
`app/layout.tsx`) para que los enlaces compartidos en Facebook muestren una
vista previa institucional propia.

## 8. Seguridad y anti-fraude — resumen técnico

- La IP nunca se guarda completa: se trunca y se hashea con `HASH_SALT` en
  el servidor (`backend/src/middleware/antifraude.ts`).
- Restricción única en base de datos por `(encuesta, ipHash, deviceFingerprint)`.
- `express-rate-limit` limita intentos por IP en ventanas de 10 minutos.
- Filtro de cabeceras de navegador para descartar tráfico de bots/scripts.
- Todo intento bloqueado queda registrado de forma agregada y anónima en
  `IntentoBloqueado`, visible en el panel de transparencia de cada encuesta.

## 9. Variables de entorno — resumen

| Variable | Dónde | Descripción | Valor en `docker-compose.yml` (local) |
|---|---|---|---|
| `DATABASE_URL` | Render / Docker (backend) | Cadena de conexión PostgreSQL | `postgresql://willasayki:willasayki@db:5432/willasayki` |
| `HASH_SALT` | Render / Docker (backend) | Salt para hash de IP/user-agent | `dev-salt-cambiar-en-produccion` |
| `ADMIN_TOKEN` | Render / Docker (backend) | Token del panel `/admin` | `dev-admin-token` |
| `CORS_ORIGINS` | Render / Docker (backend) | Dominios permitidos del frontend | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Vercel / Docker (frontend) | URL base de la API | `http://localhost:4000/api` |
| `NEXT_PUBLIC_SITE_URL` | Vercel / Docker (frontend) | Dominio público (Open Graph) | `http://localhost:3000` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Vercel / Docker (frontend) | Cuenta de Cloudinary para subir imágenes | vacío por defecto |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Vercel / Docker (frontend) | Preset "unsigned" de Cloudinary | vacío por defecto |

Los valores de Docker son solo para desarrollo local — están fijos en
`docker-compose.yml` a propósito, para que el stack levante sin configurar
nada. **Nunca reutilices `dev-salt-cambiar-en-produccion` ni
`dev-admin-token` en Render/Vercel**: genera valores propios y aleatorios
para producción.
