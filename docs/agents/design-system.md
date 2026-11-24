# Sistema visual de ConfirMaterial

## Fuente de verdad

- `tailwind.config.mjs` define los colores de DaisyUI para `confirtheme` y `confirtheme-dark`.
- `src/styles/global.css` expone aliases CSS semánticos desde las variables de DaisyUI, de modo que ambos temas usan la misma interfaz de tokens.
- `colors.md` conserva la paleta de referencia y el mapa de valores hexadecimales por tema.
- El tema claro `confirtheme` sigue siendo el único activado por las páginas. `confirtheme-dark` queda definido para uso futuro; no existe un selector de tema como parte de este cambio.
- El acento claro usa Bronze Spice 700 (`#974002`) en lugar de Bronze Spice 600 (`#ca5502`): el tono 600 queda por debajo de 4.5:1 con blanco; el tono 700 conserva el carácter naranja y alcanza AA.
- Nunito Variable es la tipografía global: mantiene formas amables y redondeadas con buena legibilidad para una app de aprendizaje. Se sirve localmente desde `public/fonts/` con licencia OFL.
- Los botones usan un radio común de `0.75rem` (`--rounded-btn`): es menos cuadrado que el default anterior y evita que las acciones primarias se vean como píldoras. Los botones circulares/cuadrados y los segmentos unidos conservan su forma funcional.

## Uso de tokens

| Necesidad | Preferir |
| --- | --- |
| Fondo y texto | `bg-base-100`, `text-base-content`, `--background`, `--foreground` |
| Acción, selección y foco | `btn-primary`, `--color-primary` |
| Acento | `--color-accent` |
| Separadores | `--border` |
| Bordes de controles | `--border-strong` o el estado de foco primario |
| Tipografía | Nunito Variable local; `font-sans` apunta a Nunito |
| Radio de botones | `--rounded-btn` (`0.75rem`) para botones regulares |
| Estado de éxito, advertencia o error | `alert-success`, `alert-warning`, `alert-error` y los tokens semánticos correspondientes |

Evita colores hexadecimales o utilidades de paleta elegidas ad hoc para estilos de producto. Los colores de estado no reemplazan el texto o icono que comunica el estado.

## Movimiento e interacción

- `src/scripts/public-motion.ts` coordina las entradas con GSAP/ScrollTrigger y las microinteracciones de botones, enlaces, tarjetas de lección y menú móvil.
- `src/components/BaseHead.astro` solo carga ese módulo fuera de `/admin`; no animes componentes compartidos dentro del panel administrativo.
- Usa `data-motion-hero` para la entrada principal y `data-motion-reveal` para una sección que deba aparecer al entrar en viewport. Las tarjetas, el contenido prose, paneles de pestañas, alertas y footer tienen selección automática.
- Mantén cada movimiento corto, interruptible y basado en opacidad o transform. Respeta `prefers-reduced-motion`; no ocultes contenido si JavaScript no se ejecuta.

## Contraste y legibilidad

- Texto normal debe alcanzar contraste WCAG AA de al menos 4.5:1; texto grande, al menos 3:1.
- Límites de controles, foco e información gráfica necesaria deben alcanzar al menos 3:1 contra los colores adyacentes. El token `--border` es para separadores sutiles; usa `--border-strong` en controles.
- Revisa combinaciones para los dos temas cuando se cambie la paleta. No confíes solo en el color para diferenciar estados.
- Comprueba estados normal, hover, active, disabled y focus-visible en botones, campos y enlaces.
