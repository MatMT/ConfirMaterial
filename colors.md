# Paleta y tokens de color

Las escalas de color nombradas son la paleta de referencia. `tailwind.config.mjs` define los temas DaisyUI activos y es la fuente de verdad de los valores semánticos. Mantén este mapa sincronizado con esa configuración.

## Tokens semánticos

| Rol | Token | Claro (`confirtheme`) | Oscuro (`confirtheme-dark`) | Uso |
| --- | --- | --- | --- | --- |
| Fondo de página | `--background` | `#ffffff` | `#0a0b1a` | Superficie principal (`base-100`) |
| Texto principal | `--foreground` | `#0e0f25` | `#ecedf8` | Texto de lectura (`base-content`) |
| Acción primaria | `--color-primary` | `#454dba` | `#8f94d6` | CTA, selección y foco |
| Borde | `--border` | `#dadbf1` | `#1c1f4a` | Separadores y bordes sutiles (`base-300`) |
| Borde de control | `--border-strong` | `#454dba` | `#8f94d6` | Límites visibles de controles interactivos y foco |
| Acento | `--color-accent` | `#974002` | `#fd8835` | Acentos y énfasis secundarios |
| Éxito | `--color-success` | `#15803d` | `#4ade80` | Confirmación y progreso correcto |
| Advertencia | `--color-warning` | `#a16207` | `#fbbf24` | Estado que requiere atención |
| Error | `--color-error` | `#b91c1c` | `#f87171` | Validación y acciones fallidas |

Los tokens `--background`, `--foreground`, `--color-primary`, `--border`, `--border-strong`, `--color-accent`, `--color-success`, `--color-warning` y `--color-error` exponen los valores de DaisyUI (`base-100`, `base-content`, `primary`, `base-300` y estados) desde `src/styles/global.css`. `--border-strong` usa el primario del tema. Usa las clases semánticas de DaisyUI (`bg-base-100`, `text-base-content`, `btn-primary`, `alert-success`, etc.) o estos alias; no copies valores hexadecimales a componentes.

El borde sutil es para separadores. Los límites de campos, botones outline y otros controles deben usar `--border-strong` o un indicador de foco que alcance contraste suficiente.

## Escalas de referencia

### Bronze Spice

```css
--color-bronze-spice-50: #fff0e6;
--color-bronze-spice-100: #fee1cd;
--color-bronze-spice-200: #fec49a;
--color-bronze-spice-300: #fda668;
--color-bronze-spice-400: #fd8835;
--color-bronze-spice-500: #fc6b03;
--color-bronze-spice-600: #ca5502;
--color-bronze-spice-700: #974002;
--color-bronze-spice-800: #652b01;
--color-bronze-spice-900: #321501;
--color-bronze-spice-950: #230f00;
```

### Berry Blush

```css
--color-berry-blush-50: #f7edf3;
--color-berry-blush-100: #efdce7;
--color-berry-blush-200: #e0b8d0;
--color-berry-blush-300: #d095b8;
--color-berry-blush-400: #c171a1;
--color-berry-blush-500: #b14e89;
--color-berry-blush-600: #8e3e6e;
--color-berry-blush-700: #6a2f52;
--color-berry-blush-800: #471f37;
--color-berry-blush-900: #23101b;
--color-berry-blush-950: #190b13;
```

### Ocean Twilight

```css
--color-ocean-twilight-50: #ecedf8;
--color-ocean-twilight-100: #dadbf1;
--color-ocean-twilight-200: #b5b8e3;
--color-ocean-twilight-300: #8f94d6;
--color-ocean-twilight-400: #6a70c8;
--color-ocean-twilight-500: #454dba;
--color-ocean-twilight-600: #373d95;
--color-ocean-twilight-700: #292e70;
--color-ocean-twilight-800: #1c1f4a;
--color-ocean-twilight-900: #0e0f25;
--color-ocean-twilight-950: #0a0b1a;
```
