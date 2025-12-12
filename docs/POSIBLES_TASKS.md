# Posibles Mejoras Futuras - AoE3 Tracker

Lista de sugerencias para futuras iteraciones del proyecto.

---

## UX / Funcionalidad

### 1. Eliminar/Editar partidas
- Agregar boton de eliminar partida (solo para admin o el usuario que la creo)
- Revertir automaticamente los cambios de ELO al eliminar
- Opcionalmente: permitir editar (cambiar ganador/perdedor)

### 2. Confirmacion antes de registrar
- Modal de "Estas seguro?" antes de guardar la partida
- Mostrar resumen: tipo, jugadores, equipos, ganador
- Botones "Confirmar" / "Cancelar"

### 3. Notificaciones Toast
- Reemplazar redirects por toasts de exito/error
- Auto-cierre despues de 3-5 segundos
- Posicion: esquina superior derecha

### 4. Estadisticas globales
- Nueva pagina `/stats` con:
  - Total de partidas jugadas
  - Civilizacion mas usada
  - Jugador con mas partidas
  - Promedio de partidas por semana
  - Distribucion por tipo de partida (1v1 vs equipos vs FFA)

### 5. Historial expandido en perfil
- Mostrar mas partidas en el perfil publico
- Boton "Ver todas" que lleve a historial filtrado por ese jugador

---

## Mejoras Visuales

### 6. Animaciones y transiciones
- Transicion suave al cambiar tabs de ranking
- Animacion al seleccionar jugadores en tarjetas
- Fade in/out en modales
- Hover effects mas elaborados

### 7. Dark/Light mode
- Toggle en navbar
- Guardar preferencia en localStorage
- Tema claro con colores AoE3 adaptados

---

## Funcionalidades Nuevas

### 8. Filtro por fecha en historial
- Dropdown o tabs: "Esta semana", "Este mes", "Todo"
- Query param `?periodo=semana|mes|todo`

### 9. Buscar jugador
- Input de busqueda en `/players`
- Filtrado en tiempo real (client-side)
- Highlight del texto buscado

### 10. Grafico de evolucion ELO
- Mini chart en el perfil (linea temporal)
- Mostrar subidas/bajadas de ELO
- Libreria sugerida: Chart.js o similar ligera

---

## Prioridad Sugerida

| Tarea | Impacto | Esfuerzo | Prioridad |
|-------|---------|----------|-----------|
| Eliminar partidas | Alto | Medio | Alta |
| Confirmacion registro | Medio | Bajo | Alta |
| Toast notifications | Medio | Bajo | Media |
| Buscar jugador | Medio | Bajo | Media |
| Filtro fecha historial | Medio | Bajo | Media |
| Stats globales | Alto | Medio | Media |
| Animaciones | Bajo | Medio | Baja |
| Grafico ELO | Alto | Alto | Baja |
| Dark/Light mode | Bajo | Alto | Baja |

---

## Bugs Pendientes

### Cajas con dimensiones inconsistentes
- **Ubicacion**: `/matches/new` y `/ruleta`
- **Problema**: Las cajas se adaptan al contenido en vez de tener dimensiones fijas
  - En 1v1 las cajas de Ganador/Perdedor son mas pequenas que en 2v2/3v3
  - En ruleta, nombres largos como "Relampago Marquinhos" expanden las tarjetas
- **Solucion intentada**: `min-height` con CSS y estilos inline, no funciono por conflictos con `.aoe-card` global
- **Solucion sugerida**: Revisar especificidad CSS o usar approach diferente (flexbox con altura fija en contenedor padre)

---

## Notas

- Las tareas de prioridad "Alta" son las que mas impacto tienen con menor esfuerzo
- El grafico de ELO requiere agregar una libreria externa y almacenar historico de ELO
- Dark mode requiere repensar todo el sistema de colores
