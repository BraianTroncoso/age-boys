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






## Estructura de Archivosss


```
src/
├── components/
│   └── Nav.astro              # Navegacion principal
├── db/
│   ├── index.ts               # Clase DB principal
│   └── data/
│       ├── users.json         # Jugadores/usuarios
│       ├── matches.json       # Partidas
│       └── participants.json  # Participaciones
├── layouts/
│   └── Layout.astro           # Layout principal
├── lib/
│   ├── achievements.ts        # Sistema de logros
│   ├── auth.ts               # Autenticacion (cookies, sessions)
│   ├── civilizations.ts      # Lista de civilizaciones AoE3
│   ├── elo.ts                # Sistema ELO y rangos
│   └── stats.ts              # Estadisticas (rachas, nemesis, etc)
├── pages/
│   ├── index.astro           # Home - Rankings + Boludo de la semana
│   ├── login.astro           # Login
│   ├── register.astro        # Registro
│   ├── profile.astro         # Perfil privado (editar civ)
│   ├── ruleta.astro          # Ruleta para sorteos
│   ├── reglas.astro          # Reglas de la casa
│   ├── head-to-head.astro    # Enfrentamientos 1v1
│   ├── players/
│   │   ├── index.astro       # Lista de jugadores
│   │   └── [id].astro        # Perfil publico del jugador
│   ├── matches/
│   │   ├── index.astro       # Historial con paginacion
│   │   └── new.astro         # Registrar partida + meme
│   └── api/
│       ├── login.ts          # API login
│       ├── register.ts       # API registro
│       ├── logout.ts         # API logout
│       ├── profile.ts        # API editar perfil
│       └── matches/
│           └── create.ts     # API crear partida
```

## Features Implementadas

### Sistema de Usuarios
- Registro con username y password (bcrypt hash)
- Login con cookies de sesion
- Fusion usuario/jugador (un user = un player)
- Sistema de admin (isAdmin flag)
- **Admin oculto de rankings** - El admin puede jugar pero no aparece en rankings ni como boludo de la semana
- Perfil privado para editar civilizacion favorita
- Perfil publico con todas las estadisticas

### Sistema ELO
- **3 ratings separados:** 1v1 (eloRating), Equipos (eloTeams), FFA (eloFfa)
- **K-Factor:** 32 (cambios significativos)
- **Rating inicial:** 1000
- **Rangos:** Aldeano (0), Miliciano (800), Infante (1000), Arcabucero (1100), Mosquetero (1200), Granadero (1350), Mariscal (1500), Emperador (1700)

### Tipos de Partida
- **1v1:** Afecta eloRating
- **2v2, 3v3, 4v4:** Afecta eloTeams (promedio del equipo)
- **FFA:** Afecta eloFfa (un ganador, multiples perdedores)

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
- Seleccionar jugadores participantes
- Animacion de giro con detencion suave
- Efectos visuales al ganar (confetti, glow)

### Pagina de Reglas
- Reglas de la casa editables
- Formato estilizado medieval
- Incluye: duracion, mapas, tratados, etc.

### Historial de Partidas
- Paginacion de 5 partidas por pagina
- Ordenado por fecha (mas reciente primero)
- Navegacion: Anterior/Siguiente + numeros de pagina
- Muestra ganadores (verde) y perdedores (rojo)
- Cambio de ELO por participante

## Endpoints API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/register | Registrar nuevo usuario |
| POST | /api/login | Iniciar sesion |
| POST | /api/logout | Cerrar sesion |
| POST | /api/profile | Actualizar civilizacion favorita |
| POST | /api/matches/create | Registrar nueva partida |

## Funciones Principales

### lib/elo.ts
- `calculateEloChange()` - Calcula cambio ELO entre jugadores
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
- `civilizations[]` - Lista de 22 civilizaciones AoE3
- `getCivilizationName()` - Nombre de la civ
- `getCivilizationFlag()` - Bandera emoji

## Civilizaciones Disponibles

Espanoles, Britanicos, Franceses, Portugueses, Holandeses, Rusos, Alemanes, Otomanos, Aztecas, Haudenosaunee, Lakota, Japoneses, Chinos, Indios, Incas, Suecos, Estados Unidos, Mexicanos, Etiopes, Malteses, Italianos

## Sistema de Rangos ELO

| Rango | ELO Minimo | Color |
|-------|-----------|-------|
| Aldeano | 0 | Gris |
| Miliciano | 800 | Verde oscuro |
| Infante | 1000 | Verde |
| Arcabucero | 1100 | Azul |
| Mosquetero | 1200 | Morado |
| Granadero | 1350 | Naranja |
| Mariscal | 1500 | Rojo |
| Emperador | 1700 | Dorado |

## Frases Argentinas (Meme Generator)

El meme generator usa frases como:
- "A CASA PETE"
- "SOS UN DESASTRE HERMANO"
- "TE COGIERON DE PARADO"
- "TE ROMPIERON EL ORTO"
- "LA CONCHA DE TU MADRE"
- "DEJÁ DE JUGAR AL AGE"
- Y mas...

## Notas de Desarrollo

- La app usa JSON como base de datos (no SQL)
- El middleware de auth esta en src/middleware.ts
- Los estilos globales estan en src/styles/global.css
- El tema de colores AoE3 esta configurado en tailwind.config.mjs
