# Reglas y Convenciones del Proyecto ConfirMaterial

## Gestor de Paquetes
- **Utilizar SIEMPRE `pnpm`** para todas las tareas de instalación, ejecución y compilación (ej. `pnpm run dev`, `pnpm run build`, `pnpm add <paquete>`).
- No utilizar `npm` ni `yarn` para evitar inconsistencias o duplicidad en lockfiles (`pnpm-lock.yaml`).

## Estilo y Diseño (Astro, Tailwind & DaisyUI)
- Mantener coherencia en el tema visual (`data-theme="confirtheme"` y los componentes y variables de diseño de DaisyUI/Tailwind del proyecto).
- En las páginas administrativas (`/admin/*`), utilizar siempre el layout estándar con `<BaseHead>`, `<Header isAdminMode={true} />` y `<Footer />`.
- Evitar barras de navegación ad-hoc o componentes aislados que rompan la experiencia de usuario o el diseño premium.

## Lógica de Rachas y Progreso
- Respetar siempre el estado de racha congelada (`isFrozen: true` / `❄️`) cuando no se publiquen lecciones nuevas en la semana o cuando esté activo el "Modo Vacaciones".
- Los perfiles con rol `admin` o `teacher` no participan en el sistema de rachas ni deben mostrar el indicador de racha de estudiante.
