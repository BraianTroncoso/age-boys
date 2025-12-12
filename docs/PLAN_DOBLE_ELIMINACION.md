# Plan: Agregar Modo Doble Eliminación a Torneos

## Resumen
Extender el sistema de torneos existente para soportar **Doble Eliminación** (Double Elimination) además del modo actual de Eliminación Directa. En doble eliminación, los perdedores tienen una segunda oportunidad en el "Losers Bracket".

---

## 1. Cambios en Base de Datos

### Modificar tabla `tournaments` en `src/db/index.ts`

```sql
-- Agregar campo bracketType
ALTER TABLE tournaments ADD COLUMN bracketType TEXT DEFAULT 'single';
-- Valores: 'single' (eliminación directa) | 'double' (doble eliminación)

-- Agregar campo bracketReset (solo aplica para doble eliminación)
ALTER TABLE tournaments ADD COLUMN bracketReset INTEGER DEFAULT 1;
-- 1 = Sí hay final reset, 0 = No hay final reset (gana directo el de Losers)
```

### Modificar tabla `tournament_matches`

```sql
-- Agregar campo bracket para distinguir winners/losers
ALTER TABLE tournament_matches ADD COLUMN bracket TEXT DEFAULT 'winners';
-- Valores: 'winners' | 'losers' | 'grand_final'
```

### Interfaces actualizadas

```typescript
interface Tournament {
  // ... campos existentes ...
  bracketType: 'single' | 'double';  // NUEVO
  bracketReset: boolean;              // NUEVO - Solo para doble eliminación
}

interface TournamentMatch {
  // ... campos existentes ...
  bracket: 'winners' | 'losers' | 'grand_final' | 'final_reset';  // NUEVO
}
```

---

## 2. Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/db/index.ts` | Agregar `bracketType` a Tournament, `bracket` a TournamentMatch |
| `src/lib/tournaments.ts` | Nueva función `generateDoubleEliminationBracket()`, modificar `getNextMatchSlot()` |
| `src/pages/api/tournaments.ts` | Recibir `bracketType` al crear torneo |
| `src/pages/api/tournaments/[id]/match.ts` | Lógica de avance para doble eliminación |
| `src/pages/torneos/nuevo.astro` | Selector de tipo de torneo |
| `src/pages/torneos/[id].astro` | Visualización de Winners + Losers brackets |
| `src/styles/global.css` | Estilos para losers bracket |

---

## 3. Cómo Funciona Doble Eliminación (4 jugadores)

```
WINNERS BRACKET:
   WR2 (Semis)              WR1 (Winners Final)
┌─────────────┐
│ J1  vs  J2  │───┐
└─────────────┘   │    ┌─────────────┐
                  ├────│  ?  vs  ?   │─── Campeón Winners
┌─────────────┐   │    └─────────────┘
│ J3  vs  J4  │───┘          │
└─────────────┘              │ (perdedor baja)
      │                      ↓
      │ (perdedores)
      ↓
LOSERS BRACKET:
   LR1 (Losers R1)          LR2 (Losers Final)
┌─────────────┐
│ L1  vs  L2  │───────────┐
└─────────────┘           │    ┌─────────────┐
                          ├────│  ?  vs  ?   │─── Campeón Losers
                          │    └─────────────┘
            (perdedor WF)─┘

GRAN FINAL:
┌───────────────────┐
│ Campeón Winners   │
│       vs          │───→ 🏆 CAMPEÓN
│ Campeón Losers    │
└───────────────────┘
```

---

## 4. Lógica de Avance en Doble Eliminación

### En Winners Bracket:
- **Ganador**: Avanza en winners
- **Perdedor**: Cae al losers bracket (a la ronda correspondiente)

### En Losers Bracket:
- **Ganador**: Avanza en losers
- **Perdedor**: ELIMINADO definitivamente

### Gran Final (configurable):
- Campeón de Winners vs Campeón de Losers
- **Si gana el de Winners**: Es campeón (el de Losers perdió 2 veces)
- **Si gana el de Losers**:
  - Con `bracketReset=true`: Se juega **Final Reset** (ida y vuelta)
  - Con `bracketReset=false`: Es campeón directo (sin segunda final)

---

## 5. Generación del Bracket Doble Eliminación

```typescript
function generateDoubleEliminationBracket(tournamentId: number, playerIds: number[]) {
  const shuffled = shuffle(playerIds);
  const matches = [];

  // WINNERS BRACKET (igual que single elimination)
  const winnersRounds = Math.log2(shuffled.length);

  // Primera ronda winners con jugadores
  for (let i = 0; i < shuffled.length / 2; i++) {
    matches.push({
      tournamentId,
      bracket: 'winners',
      round: winnersRounds,
      position: i,
      player1Id: shuffled[i * 2],
      player2Id: shuffled[i * 2 + 1],
    });
  }

  // Rondas vacías winners
  for (let r = winnersRounds - 1; r >= 1; r--) {
    // ... crear matches vacíos
  }

  // LOSERS BRACKET (más rondas que winners)
  // Para 4 jugadores: 2 rondas losers
  // Para 8 jugadores: 4 rondas losers
  const losersRounds = (winnersRounds - 1) * 2;

  for (let r = losersRounds; r >= 1; r--) {
    // ... crear matches vacíos del losers bracket
  }

  // GRAN FINAL
  matches.push({
    tournamentId,
    bracket: 'grand_final',
    round: 1,
    position: 0,
    player1Id: null,  // Campeón winners
    player2Id: null,  // Campeón losers
  });

  // FINAL RESET (solo se juega si gana el de Losers en Gran Final y bracketReset=true)
  matches.push({
    tournamentId,
    bracket: 'final_reset',
    round: 1,
    position: 0,
    player1Id: null,
    player2Id: null,
  });

  return matches;
}
```

---

## 6. Modificación a `getNextMatchSlot()`

```typescript
function getNextMatchSlot(
  match: TournamentMatch,
  isWinner: boolean,
  bracketType: 'single' | 'double'
) {
  if (bracketType === 'single') {
    // Lógica actual (solo para ganadores)
    return currentSingleEliminationLogic();
  }

  // DOBLE ELIMINACIÓN
  if (match.bracket === 'winners') {
    if (isWinner) {
      // Ganador avanza en winners
      return { bracket: 'winners', nextRound, nextPosition, slot };
    } else {
      // Perdedor cae a losers bracket
      return { bracket: 'losers', nextRound: calcLosersRound(), nextPosition, slot };
    }
  }

  if (match.bracket === 'losers') {
    if (isWinner) {
      // Ganador avanza en losers
      return { bracket: 'losers', nextRound, nextPosition, slot };
    } else {
      // Perdedor ELIMINADO
      return null;
    }
  }

  if (match.bracket === 'grand_final') {
    // Final, no hay siguiente (o final_reset si bracketReset=true y gana losers)
    return null;
  }
}
```

---

## 7. UI: Selector de Tipo de Torneo

En `src/pages/torneos/nuevo.astro`, agregar después de selección de tamaño:

```html
<div>
  <label>Tipo de Torneo</label>
  <div class="flex gap-3">
    <button data-type="single" class="type-btn aoe-btn">
      Eliminación Directa
    </button>
    <button data-type="double" class="type-btn aoe-btn">
      Doble Eliminación
    </button>
  </div>
</div>

<!-- Solo visible si es Doble Eliminación -->
<div id="bracketResetOption" class="hidden">
  <label class="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" id="bracketReset" checked />
    <span>Final Reset (si gana el de Losers, se juega otra final)</span>
  </label>
  <p class="text-sm text-aoe-cream-dark">
    Sin esta opción, el que gana la Gran Final es campeón directamente
  </p>
</div>
```

---

## 8. UI: Visualización de Brackets

En `src/pages/torneos/[id].astro`, mostrar dos secciones si es doble eliminación:

```html
{bracketType === 'double' && (
  <div class="double-elimination-view">
    <!-- Winners Bracket (arriba) -->
    <section class="winners-bracket">
      <h3>🏆 Winners Bracket</h3>
      <!-- matches donde bracket='winners' -->
    </section>

    <!-- Losers Bracket (abajo) -->
    <section class="losers-bracket">
      <h3>💀 Losers Bracket</h3>
      <!-- matches donde bracket='losers' -->
    </section>

    <!-- Gran Final -->
    <section class="grand-final">
      <h3>👑 Gran Final</h3>
      <!-- match donde bracket='grand_final' -->
    </section>
  </div>
)}
```

---

## 9. Orden de Implementación

1. **DB**: Agregar campos `bracketType` y `bracket` en `src/db/index.ts`
2. **Lib**: Crear `generateDoubleEliminationBracket()` en `src/lib/tournaments.ts`
3. **Lib**: Modificar `getNextMatchSlot()` para doble eliminación
4. **API Create**: Modificar `POST /api/tournaments` para recibir `bracketType`
5. **API Match**: Modificar lógica de avance en `/api/tournaments/[id]/match.ts`
6. **UI Crear**: Agregar selector de tipo en `src/pages/torneos/nuevo.astro`
7. **UI Ver**: Modificar visualización en `src/pages/torneos/[id].astro`
8. **CSS**: Agregar estilos para losers bracket

---

## 10. Archivos Críticos

- `src/db/index.ts` - Interfaces y tablas
- `src/lib/tournaments.ts` - Funciones de generación y avance
- `src/pages/api/tournaments/[id]/match.ts` - Lógica de registro de ganador
- `src/pages/torneos/nuevo.astro` - UI de creación
- `src/pages/torneos/[id].astro` - Visualización del bracket
