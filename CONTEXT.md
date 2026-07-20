# Vivero Ica — Contexto del proyecto

Inventario de plantas para un vivero doméstico en Ica, Perú (clima árido, costero, hemisferio sur). Permite registrar plantas manualmente o identificarlas por foto con IA, lleva una bitácora de cuidados por planta y consulta el clima real del día para avisar si alguna planta corre riesgo.

Producción: https://vivero-ica.vercel.app — Repo: agrorecluberries/vivero-ica

## Stack

- React 18 + Vite 5, un solo archivo de componente (`src/App.jsx`) más `src/main.jsx` como entry point.
- Iconos: `lucide-react`.
- Sin base de datos: los datos se guardan en `localStorage` del navegador a través de un wrapper simple (`src/storage.js`, prefijo de claves `vivero:`). El inventario es local a cada navegador/dispositivo, no se sincroniza entre dispositivos.
- Backend: funciones serverless de Vercel en `/api`, usadas solo para login y como proxy hacia APIs externas, para no exponer las API keys en el cliente.
- Tipografías: Fraunces (títulos), Work Sans (cuerpo), Space Mono (etiquetas). Paleta cálida en tonos tierra (`#F1E9D2` fondo, `#211C14` texto, `#A85C32` terracota, `#2F5233` verde).

## Autenticación

Login simple de usuario/clave, no hay sistema de cuentas ni base de usuarios.

- `api/login.js`: recibe `username`/`password`, los compara contra `process.env.APP_USER` / `process.env.APP_PASS`. Si coinciden, genera un token = `sha256(usuario:clave)` y lo guarda en una cookie `vivero_auth` (HttpOnly, Secure, SameSite=Lax, 7 días).
- `api/_auth.js`: helpers compartidos `expectedToken()` e `isAuthorized(req)` que valida la cookie.
- `api/session.js`: devuelve `{ ok: true/false }` según si la cookie es válida, se usa al cargar la app.
- `api/logout.js`: limpia la cookie.
- Todas las rutas que llaman a APIs externas (`claude.js`) exigen `isAuthorized(req)`.

## Modelo de datos, todo vive en localStorage

- `ica-plant-inventory`: array de plantas, cada una con `id`, `nombre`, `variedad`, `tipo`, `sustrato`, `cuidados`, `climaPreferido`, `adaptacion`, `ubicacion`, `imagen`, `notas`, `fechaLlegada`, `situacionLlegada`, `eventos` y `aiIdentified`.
- `ica-plant-tipos`: array de categorías o áreas (Cactus y suculentas, Tropicales, Frutales, Aromáticas y hierbas, Ornamentales de interior, Otras, más las que la IA cree dinámicamente), cada una con `id`, `label`, `color`, `sustrato` y `estratos`.
- `ica-plant-climate`: último resultado cacheado de la consulta de clima, con `checkedAt`.
- Bitácora por planta, campo `eventos`: cada evento tiene `fecha`, `tipo` (llegada, plaga, poda, cambio de sustrato, fumigación o abono, otro) y `nota`.

## Flujo de identificación de planta por foto

1. El usuario sube una imagen y se comprime en el cliente, máximo 640px, calidad 0.72, JPEG base64, en `fileToCompressedDataUrl`.
2. Se envía a `POST /api/claude`, que reenvía a la API de Anthropic, modelo `claude-sonnet-4-6`, con la imagen y un prompt que pide un JSON con nombre común, nombre científico, categoría, sustrato recomendado para el clima de Ica, cuidados, clima natural de la especie y cómo adaptarla a Ica.
3. Si la categoría devuelta no existe, se crea un nuevo tipo con color automático.
4. El formulario de nueva planta se abre pre-llenado con la respuesta de la IA, marcado como `aiIdentified: true`, para que el usuario revise y guarde.

Nota: también existe `api/identify.js`, que usa la API de PlantNet (`PLANTNET_API_KEY`). Actualmente no está conectado desde la interfaz, el botón Subir foto llama únicamente a `/api/claude`.

## Flujo de clima del día

Botón Consultar clima de hoy llama a `POST /api/claude` con la lista de plantas del inventario y la herramienta `web_search_20250305` habilitada. El prompt pide buscar el pronóstico real de Ica, determinar la estación en el hemisferio sur, y evaluar si alguna planta corre riesgo, devolviendo un JSON con resumen del clima, estación, alerta general y una lista de plantas en riesgo con sugerencia. El resultado se cachea en `ica-plant-climate`.

## Endpoints de /api

- `login.js`, POST: verifica usuario/clave y setea cookie de sesión.
- `logout.js`, POST: borra la cookie de sesión.
- `session.js`, GET: indica si la cookie de sesión es válida.
- `claude.js`, POST: proxy autenticado hacia la API de Anthropic.
- `identify.js`, POST: proxy autenticado hacia PlantNet, no usado actualmente desde la UI.
- `_auth.js`: helpers de autenticación compartidos, no es un endpoint.

## Variables de entorno, configuradas en Vercel, nunca en el repo

- `APP_USER`, `APP_PASS`: credenciales del login simple.
- `ANTHROPIC_API_KEY`: usada por `api/claude.js`.
- `PLANTNET_API_KEY`: usada por `api/identify.js`, endpoint no conectado actualmente.

## Ideas y pendientes conocidos

- El inventario es local por navegador, no hay sincronización entre dispositivos ni backup real.
- `api/identify.js`, PlantNet, está implementado pero no integrado a la interfaz.
- No había README previo en el repo, este archivo es el punto de partida para retomar contexto en futuras sesiones.
