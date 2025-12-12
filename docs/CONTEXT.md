# AoE3 Tracker - Documentacion del Proyecto

Aplicacion web para trackear partidas de Age of Empires 3 entre amigos con sistema ELO, estadisticas picantes y humor argentino.

## Tech Stack

- **Astro 5.1.1** - Framework SSR con output: 'server'
- **@astrojs/vercel 8.0.1** - Adapter para Vercel serverless (Node 20)
- **React 18** - Componentes interactivos
- **Tailwind CSS 3.4** - Estilos con tema personalizado AoE3
- **Turso (LibSQL)** - Base de datos SQLite en la nube
- **bcryptjs** - Hashing de passwords
- **Canvas API** - Generacion de memes

## Deployment

- **Host:** Vercel (serverless functions)
- **Database:** Turso (SQLite cloud)
- **Variables de entorno:**
  - `TURSO_DATABASE_URL` - URL de la base de datos
  - `TURSO_AUTH_TOKEN` - Token de autenticacion

## Estructura de Archivos

```
src/
├── components/
│   └── Nav.astro              # Navegacion principal
├── db/
│   └── index.ts               # Conexion a Turso + operaciones DB
├── layouts/
│   └── Layout.astro           # Layout principal
├── lib/
│   ├── achievements.ts        # Sistema de logros
│   ├── auth.ts               # Autenticacion (cookies, sessions)
│   ├── civilizations.ts      # Lista de civilizaciones AoE3 + banderas + colores
│   ├── elo.ts                # Sistema ELO y rangos
│   └── stats.ts              # Estadisticas (rachas, nemesis, etc)
├── pages/
│   ├── index.astro           # Home - Rankings con filtros (1v1/Teams/FFA) + Boludo de la semana
│   ├── login.astro           # Login
│   ├── register.astro        # Registro
│   ├── profile.astro         # Perfil privado (editar civ) con background de bandera
│   ├── ruleta.astro          # Ruleta para sorteos
│   ├── reglas.astro          # Reglas de la casa
│   ├── head-to-head.astro    # Enfrentamientos 1v1
│   ├── players/
│   │   ├── index.astro       # Lista de jugadores
│   │   └── [id].astro        # Perfil publico con background de bandera
│   ├── matches/
│   │   ├── index.astro       # Historial con paginacion + informador
│   │   └── new.astro         # Registrar partida (UI mejorada)
│   └── api/
│       ├── login.ts          # API login
│       ├── register.ts       # API registro
│       ├── logout.ts         # API logout
│       ├── profile.ts        # API editar perfil
│       └── matches.ts        # API crear partida
```

## Features Implementadas

### Sistema de Usuarios
- Registro con username y password (bcrypt hash)
- Login con cookies de sesion
- Fusion usuario/jugador (un user = un player)
- Sistema de admin (isAdmin flag)
- **Admin oculto** - No aparece en rankings, ruleta, ni selectores de partidas
- Perfil privado para editar civilizacion favorita
- Perfil publico con todas las estadisticas

### Sistema ELO
- **3 ratings separados:** 1v1 (eloRating), Equipos (eloTeams), FFA (eloFfa)
- **K-Factor:** 32 (cambios significativos)
- **Rating inicial:** 1000
- **Cambio dinamico:** Depende de la diferencia de ELO (ganar a alguien mejor da mas puntos)
- **Rangos:** Colono (0), Recluta (800), Soldado (1000), Veterano (1200), Experto (1400), Maestro (1600), Leyenda (1800)

### Rankings con Filtros (Home)
- **Tabs de filtro:** 1v1, Teams, FFA
- Query param `?ranking=1v1|teams|ffa`
- Ordenamiento dinamico segun tipo de ELO seleccionado
- Muestra rango y tier correcto para cada tipo

### Tipos de Partida
- **1v1:** Afecta eloRating
- **2v2, 3v3:** Afecta eloTeams (promedio del equipo)
- **FFA:** Afecta eloFfa (un ganador, multiples perdedores)

### Registro de Partidas (matches/new.astro)

**UI Mejorada con tarjetas estilo ruleta:**

**1v1:**
- Selectores para ganador y perdedor
- Validacion de jugadores duplicados en tiempo real

**2v2/3v3 (Equipos):**
- Seccion "Aleatorizar Equipos" con tarjetas seleccionables (estilo ruleta)
- Contador de jugadores seleccionados
- Boton "Generar Equipos al Azar" (shuffle aleatorio)
- Boton "Aplicar" que fija los equipos como tarjetas (no editables)
- **Selector de equipo ganador:** Botones "Equipo 1 Gano" / "Equipo 2 Gano"
- Boton "Volver a aleatorizar" para resetear

**FFA (Free For All):**
- Seleccion de jugadores con tarjetas (minimo 3)
- Contador "X jugadores seleccionados (minimo 3)"
- Boton "Confirmar Jugadores"
- Layout 2 columnas: Ganador (radio buttons) | Perdedores (automatico)
- Boton "Cambiar jugadores" para resetear

**Validaciones:**
- No permite jugadores duplicados (resalta en rojo)
- Mensaje de error en tiempo real

### Historial de Partidas (matches/index.astro)
- Paginacion de 5 partidas por pagina
- Ordenado por fecha (mas reciente primero)
- **Informador visible:** Muestra "Registrado por [usuario]" en cada partida
- Navegacion: Anterior/Siguiente + numeros de pagina
- Muestra ganadores (verde) y perdedores (rojo) con cambio de ELO

### Perfiles con Background de Bandera

**Perfil privado (profile.astro):**
- Background con gradiente de colores de la civilizacion
- Barra de color en la parte superior (colores de bandera)
- Imagen de bandera en esquina superior derecha (difuminada)
- Avatar circular con imagen de bandera real (flagcdn.com)

**Perfil publico (players/[id].astro):**
- Mismo tratamiento visual con colores de civilizacion
- Imagen de bandera como foto de perfil
- Stats, rachas, nemesis, victima, logros

### El Numero 1 (Home)
- Seccion destacada del jugador #1 en el ranking
- Stats completas: ELO, Victorias, Derrotas, Win Rate
- Frases aleatorias "picantes" de felicitacion
- Corona y efectos visuales dorados

### El Boludo de la Semana (Home)
- Jugador con mas derrotas en los ultimos 7 dias
- Frases aleatorias burlonas
- Panel rojo/vergonzoso en el home
- No se muestra si es el mismo que el #1

### Sistema de Rachas (Perfil)
- **Racha de Victorias:** "ESTA ON FIRE", "IMPARABLE", "MAQUINA DE GANAR", etc.
- **Racha de Derrotas:** "EN BAJON TOTAL", "TOCO FONDO", "MODO BOLUDO ACTIVADO", etc.
- Se muestra en el perfil publico si hay 2+ seguidas
- Calcula racha actual y maximas historicas

### Nemesis y Victima (Perfil)
- **Nemesis:** Jugador contra el que mas perdio (solo 1v1)
- **Victima:** Jugador al que mas le gano
- Frases picantes: "te tiene de hijo", "es tu perra", "lo coges cuando queres", etc.
- Record de victorias/derrotas contra cada uno

### Sistema de Logros (Perfil)

**Logros de Gloria:**
- Primera Sangre - 1 victoria
- En Racha - 3 victorias seguidas
- Bestia Imparable - 5 victorias seguidas
- Dios del Age - 10 victorias seguidas
- Veterano - 10 victorias totales
- Leyenda - 50 victorias totales
- Papa de [X] - Le ganaste 5+ veces a alguien
- Consistente - Win rate 60%+

**Logros de Verguenza:**
- Turista - Perdiste tu primera partida
- Mala Racha - 3 derrotas seguidas
- Calentador de Banco - 5 derrotas seguidas
- Masoquista Profesional - 10 derrotas seguidas
- Perseverante - 10 derrotas totales
- Hijo de [X] - Alguien te gano 5+ veces
- Inconsistente - Win rate menor 40%

**Logros Neutrales:**
- Vicioso - 50 partidas jugadas
- Sin Vida Social - 100 partidas jugadas

### Generador de Memes "A Casa Pete"
- Al registrar partida, aparece modal con meme
- Canvas 800x500 con bordes dorados estilo AoE3
- Nombre del perdedor en rojo grande
- Frase aleatoria insultante en dorado (argentinismos)
- Nombre del ganador en verde
- Boton para descargar imagen PNG

### Ruleta de Sorteo
- Rueda visual estilo madera/medieval
- Seleccion de jugadores con tarjetas (admin excluido)
- Animacion de giro con detencion suave
- Efectos visuales al ganar (confetti, glow)

### Pagina de Reglas
- Reglas de la casa editables
- Formato estilizado medieval
- Incluye: duracion, mapas, tratados, etc.

## Endpoints API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/register | Registrar nuevo usuario |
| POST | /api/login | Iniciar sesion |
| POST | /api/logout | Cerrar sesion |
| POST | /api/profile | Actualizar civilizacion favorita |
| POST | /api/matches | Registrar nueva partida (guarda createdBy) |

## Funciones Principales

### lib/elo.ts
- `calculate1v1Elo()` - Calcula cambio ELO para 1v1
- `calculateTeamElo()` - Calcula cambio ELO para equipos (promedio)
- `calculateFfaElo()` - Calcula cambio ELO para FFA
- `getRatingTier()` - Obtiene rango segun ELO
- `getTierColor()` - Color CSS del rango

### lib/stats.ts
- `getWeeklyLoser()` - Boludo de la semana
- `getPlayerStreak()` - Racha actual del jugador
- `getNemesisAndVictim()` - Nemesis y victima
- `getPlayerFullStats()` - Estadisticas completas

### lib/achievements.ts
- `getPlayerAchievements()` - Logros del jugador
- `countAchievementsByType()` - Contador por tipo

### lib/civilizations.ts
- `civilizations[]` - Lista de 22 civilizaciones con flag, flagCode y colors
- `getCivilizationName()` - Nombre de la civ
- `getCivilizationFlag()` - Bandera emoji
- `getCivilizationFlagUrl()` - URL de imagen de bandera (flagcdn.com)
- `getCivilizationColors()` - Colores principales de la bandera

## Civilizaciones Disponibles

Espanoles, Britanicos, Franceses, Portugueses, Holandeses, Rusos, Alemanes, Otomanos, Aztecas, Haudenosaunee, Lakota, Japoneses, Chinos, Indios, Incas, Suecos, Estados Unidos, Mexicanos, Etiopes, Hausa, Malteses, Italianos

Cada civilizacion tiene:
- `id` - Identificador unico
- `name` - Nombre en espanol
- `flag` - Emoji de bandera
- `flagCode` - Codigo ISO para flagcdn.com
- `colors` - Array de 2 colores principales de la bandera

## Sistema de Rangos ELO

| Rango | ELO Minimo | Color |
|-------|-----------|-------|
| Colono | 0 | Gris piedra |
| Recluta | 800 | Naranja |
| Soldado | 1000 | Gris claro |
| Veterano | 1200 | Verde |
| Experto | 1400 | Azul |
| Maestro | 1600 | Morado |
| Leyenda | 1800 | Dorado |

## Frases Argentinas (Meme Generator)

El meme generator usa frases como:
- "A CASA PETE"
- "SOS UN DESASTRE HERMANO"
- "TE COGIERON DE PARADO"
- "TE ROMPIERON EL ORTO"
- "LA CONCHA DE TU MADRE"
- "DEJA DE JUGAR AL AGE"
- Y mas...

## Base de Datos (Turso/SQLite)

### Tabla users
- id, username, password, favoriteCiv, eloRating, eloTeams, eloFfa, isAdmin, createdAt

### Tabla matches
- id, matchType, createdBy (FK a users), playedAt, createdAt

### Tabla match_participants
- id, matchId (FK), playerId (FK), team, civilization, isWinner, eloChange

## Notas de Desarrollo

- La app usa Turso (SQLite cloud) como base de datos
- El middleware de auth esta en src/middleware.ts
- Los estilos globales estan en src/styles/global.css
- El tema de colores AoE3 esta configurado en tailwind.config.mjs
- Las imagenes de banderas se cargan desde flagcdn.com (CDN externo)
- El admin (username: 'admin') esta oculto de todos los listados publicos
