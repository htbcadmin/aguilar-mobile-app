# Reglas de ingeniería — Aguilar de la Frontera App

> Fuente única de verdad para cualquier agente (Claude Code o Codex) o persona que contribuya a este repo. `CLAUDE.md` solo importa este archivo — no dupliques reglas en otro sitio.

## 0. Stack y versión (léelo antes de escribir código)

**Expo HA CAMBIADO.** Lee la documentación exacta versionada en https://docs.expo.dev/versions/v57.0.0/ antes de escribir código. No asumas comportamiento de versiones anteriores de Expo, React Native o React.

- Expo SDK 57 · React Native 0.86.3 · React 19.2.3 · TypeScript 6.0.3 (`strict: true`) · Expo Router 57 (file-based routing) · Reanimated 4.5.1 (New Architecture, ya activada por defecto en SDK 57).
- El plugin oficial `expo@claude-plugins-official` ya está habilitado en `.claude/settings.json`: da Expo Skills + MCP de documentación de Expo/EAS a cualquiera que abra Claude Code en este repo. En Codex, lo mismo viene del plugin oficial `expo@expo-plugins` (`codex plugin marketplace add expo/skills` + `codex plugin add expo@expo-plugins`). Úsalo para resolver dudas de API en vez de recordarlas de memoria.

## 1. No te inventes nada

La regla más importante — la que distingue a un ingeniero senior de verdad:

- **Verifica antes de escribir.** Antes de usar un componente, prop, hook o paquete, comprueba que existe de verdad: en `node_modules`, en `package.json`, o en la doc oficial versionada de arriba. Si no puedes verificarlo, dilo explícitamente en vez de adivinar.
- **No inventes paquetes ni APIs.** Si hace falta una librería nueva, compruébala en npm (nombre, versión, mantenimiento activo) antes de añadirla.
- **No afirmes que algo funciona si no lo has comprobado.** "Debería funcionar" no vale: ejecuta `npm run lint`, `npx tsc --noEmit` y prueba la pantalla (Expo Go o `npx expo start --web`) antes de dar la tarea por terminada.
- **Los datos mock se marcan como mock.** Estamos en fase sin backend (ver `README.md`): cualquier dato de ejemplo vive en `src/mocks/`, comentado como tal, nunca presentado como si viniera de una API real.
- Ante ambigüedad de producto (qué debe hacer una pantalla, qué copy usar), pregunta en vez de decidir por tu cuenta — el checklist de la issue de Linear manda.

## 2. Idioma: código en inglés, producto en español

Regla dura, sin excepciones silenciosas:

- **Todo lo que es código va en inglés**: nombres de archivo, variables, funciones, tipos/interfaces (`Business`, no `Comercio`), sus campos (`name`, no `nombre`), valores de enums/uniones de tipo (`'resolved'`, no `'resuelto'`), comentarios dentro del código, mensajes de commit y descripciones de PR.
- **Todo lo que ve el usuario final de la app va en español**: copy de UI, categorías/estados mostrados en pantalla, y el contenido real de los mocks que se renderiza tal cual (nombre de un negocio, una dirección, una descripción) — eso es contenido de producto, no código, y este es un pueblo español.
- **La documentación de proceso dirigida al equipo se queda en español** (`README.md`, este `AGENTS.md`, issues y comentarios de Linear): es el idioma de trabajo de vosotros dos, no es código.
- Si dudas si algo es "código" o "producto" (p. ej. un valor de estado que podría acabar mostrándose tal cual), trátalo como código (inglés) y añade el mapeo a español en la capa de UI cuando se construya esa pantalla.

## 3. Flujo de trabajo (Linear + Git)

1. **Antes de empezar cualquier tarea:** `git fetch` + `git pull` de `main` para partir de lo último. Sin excepción, aunque la tarea parezca pequeña.
2. **Toda tarea nace de una issue de Linear** (`HAS-XX`): usa su checklist como especificación y su `gitBranchName` sugerido para la rama (`usuario/has-xx-slug`).
3. **Commits — [Conventional Commits](https://www.conventionalcommits.org/):**
   - Asunto: `<tipo>(HAS-XX): <resumen en imperativo, minúsculas, sin punto final>` — p. ej. `feat(HAS-6): add Button and Card base components`. Tipos: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `style`.
   - Si el commit toca más de una cosa, añade cuerpo: línea en blanco y luego bullets, uno por cambio, explicando qué y por qué (no repitas el diff) — por ejemplo:

     ```
     docs: define collaborative engineering rules and RN reviewer agent

     - expand AGENTS.md with anti-hallucination rules, Linear+Git workflow,
       code conventions and React Native/Expo performance rules
     - add .claude/agents/rn-reviewer.md, a project-scoped review agent
     - disable Claude Code commit/PR attribution trailers in settings.json
     ```

   - Un commit = un cambio lógico coherente. No mezcles una feature con un refactor no relacionado o con formateo masivo.
4. **PR obligatorio para features**, contra `main`, con: qué issue resuelve, captura o grabación de pantalla si toca UI (esto es una app muy visual), y el checklist de la issue con lo ya cubierto marcado. Se fusiona con al menos una revisión humana entre vosotros dos.
   - Excepción explícita: cambios pequeños de configuración/documentación que uno de vosotros autorice expresamente pueden ir directos a `main`.
5. **Antes de abrir el PR:** `npm run lint`, `npm run format` y `npx tsc --noEmit` en verde. Si añades lógica no trivial, valora un test.
6. **Mueve la issue en Linear** (Backlog → In Progress → In Review → Done) a medida que avanzas, no solo al terminar.
7. **Atribución de IA:** los commits/PRs generados con el Claude Code CLI de este repo no llevan `Co-Authored-By: Claude` ni el pie "Generated with Claude Code" — está desactivado vía `attribution` en `.claude/settings.json`. (Una sesión alojada por el propio proveedor, p. ej. Claude Code on the web, puede añadir su propio pie de atribución por política de esa plataforma; eso queda fuera del control de este repo.) Codex no añade atribución.

## 4. Convenciones de código

- TypeScript estricto — nada de `any` sin un comentario que lo justifique.
- Un componente por archivo; nombres de archivo en `kebab-case` (patrón ya usado: `themed-text.tsx`, `use-color-scheme.ts`).
- Estilos con `StyleSheet.create`, siempre sobre los tokens de `src/constants/theme.ts` (`Colors`, `Spacing`, `Fonts`) — cero colores o espaciados "mágicos" sueltos en un componente.
- Imports absolutos con el alias `@/*` (ya en `tsconfig.json`), no rutas relativas largas (`../../..`).
- Sin _barrel files_ (`index.ts` que reexporta todo): importa cada módulo desde su archivo real — infla el bundle y complica el tree-shaking.
- Componente reutilizable nuevo → `src/components/`; tipo compartido → `src/types/`; dato de ejemplo → `src/mocks/`. No dupliques lo que ya define la issue HAS-6 (sistema de diseño).

## 5. Rendimiento (React Native / Expo)

Priorizado según la guía de Callstack para agentes de IA ("React Native Best Practices for AI Agents"):

| Prioridad | Regla                                                                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Crítico   | Listas largas → `FlatList`/`FlashList`, nunca `ScrollView` + `.map()`.                                                                                                                   |
| Crítico   | Sin _barrel imports_: importa directo del archivo fuente.                                                                                                                                |
| Alto      | No optimices (memo, `useCallback`, atomic state) sin haber medido antes un re-render o FPS real con el Profiler — la memoización "por si acaso" añade complejidad sin beneficio probado. |
| Alto      | Animaciones con Reanimated (`useAnimatedStyle`, worklets), no con `Animated` de RN puro ni animaciones dirigidas por JS.                                                                 |
| Medio     | `expo-image` en vez de `Image` para fotos y listas con imágenes.                                                                                                                         |
| Medio     | Cuidado con `TextInput` controlado en formularios grandes: evita re-renderizar toda la pantalla en cada pulsación.                                                                       |

## 6. UI / UX

- El sistema de diseño de HAS-6 (`src/constants/theme.ts` + componentes base) es la única fuente de estilos: cualquier pantalla nueva reutiliza `Card`, `Button`, `Avatar`, `Badge`, `EmptyState`, `LoadingSpinner`, `ListItem` en vez de reinventar su propio estilo.
- Accesibilidad no es opcional: `accessibilityLabel`/`accessibilityRole` en elementos interactivos, contraste suficiente (ya hay modo claro/oscuro en `theme.ts`, respétalo en cada pantalla nueva), área de toque ≥ 44×44pt.
- Referencia de patrones nativos: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) para iOS y [Material Design 3](https://m3.material.io/) para Android — cuando el comportamiento difiera entre plataformas, respeta la convención de cada una en vez de forzar un único look.
- Feedback inmediato en cada acción simulada de los módulos (botones "Unirme", "Confirmar reserva", "Inscribirme"...): estado de carga, confirmación visual, estado vacío (`EmptyState`) — nunca una pantalla que no responde a la interacción.

## 7. Agentes disponibles en este repo

- **`expo@claude-plugins-official`** (ya habilitado en `.claude/settings.json`): Expo Skills + MCP de documentación Expo/EAS.
- **`.claude/agents/rn-reviewer.md`**: agente de revisión especializado en este stack (rendimiento, design system, accesibilidad, tipado, cero APIs inventadas). Invócalo antes de abrir cada PR de una issue de Linear. En Codex es `rn_reviewer`, definido en `.codex/agents/rn-reviewer.toml`, que se genera a partir del `.md`: edita siempre el `.md`, nunca el `.toml`.

No añadas más agentes o skills salvo que resuelvan un problema concreto y recurrente — cuantos menos, más fácil de mantener el contexto.

## 8. Testing

- `npm run lint` y `npm run format` deben pasar antes de cualquier PR.
- `npx tsc --noEmit` sin errores.
- Lógica no trivial (cálculos, transformaciones de datos mock, formularios) → test con Jest + `@testing-library/react-native`. No hace falta cobertura al 100 %, sí el camino feliz y el borde más obvio.
- Verifica visualmente en Expo Go o `npx expo start --web` antes de dar una pantalla por terminada.

## 9. Referencias

- [Documentación versionada de Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Skills para agentes de IA](https://docs.expo.dev/skills/) · [Claude Code + Expo](https://docs.expo.dev/agents/claude/)
- [Callstack — React Native Best Practices for AI Agents](https://github.com/callstackincubator/agent-skills/blob/main/skills/react-native-best-practices/SKILL.md)
- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design 3](https://m3.material.io/)
- [Shopify Engineering — React Native](https://shopify.engineering/react-native-future-mobile-shopify) (contexto de arquitectura a gran escala)
