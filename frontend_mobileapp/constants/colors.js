// Paleta de colores centralizada para FrapApp.
// Importar desde aquí — nunca definir colores inline en los archivos.

// ---------------------------------------------------------------------------
// PALETA SEMÁNTICA (usar estas para lógica de UI)
// ---------------------------------------------------------------------------
export const COLORS = {
    // ── Marca ──────────────────────────────────────────────────────────────
    PRIMARY:          '#3b824f',       // Verde principal de la marca
    PRIMARY_DARK:     '#165057',       // Verde azulado oscuro / teal
    SECONDARY:        '#76b146',       // Verde botón / link (rgb 118,177,70)

    // ── Estados ────────────────────────────────────────────────────────────
    DANGER:           '#e74c3c',       // Rojo error / eliminar
    WARNING:          '#f39c12',       // Naranja advertencia / pendiente
    SUCCESS:          '#27ae60',       // Verde éxito / enviado
    INFO:             '#3498db',       // Azul información / enviando

    // ── Texto ──────────────────────────────────────────────────────────────
    TEXT:             '#2f3c42',       // Texto primario (más oscuro)
    TEXT_DARK:        '#37474f',       // Texto oscuro
    TEXT_MEDIUM:      '#495057',       // Texto medio
    TEXT_LABEL:       '#535f64',       // Etiquetas de formularios
    TEXT_MUTED:       '#666',          // Texto apagado
    TEXT_LIGHT:       '#888',          // Texto claro / fechas
    TEXT_PLACEHOLDER: '#999',          // Texto placeholder
    TEXT_BLACK:       '#050f08',       // Casi negro (título header)
    TEXT_WHITE:       '#fbfeff',       // Blanco texto en botones
    TEXT_NAVY:        '#2c3e50',       // Azul marino oscuro

    // ── Fondos ─────────────────────────────────────────────────────────────
    BACKGROUND:       '#ffffff',       // Fondo blanco principal
    SURFACE:          '#f8f9fa',       // Superficie: tarjetas, inputs
    SURFACE_ALT:      '#eef1f3',       // Superficie alternativa (selector opciones)
    SURFACE_BLUE:     '#f0f8ff',       // Superficie azul claro (firmas, info)
    SURFACE_INFO:     '#e8f4fd',       // Superficie información
    HEADER_BG:        '#b2c29591',     // Fondo encabezado home
    APP_TINT:         '#40b67127',     // Fondo pantalla FRAP

    // ── Bordes ─────────────────────────────────────────────────────────────
    BORDER:           '#e0e0e0',       // Borde principal
    BORDER_LIGHT:     '#e9ecef',       // Borde claro
    BORDER_SOFT:      '#dee2e6',       // Borde suave
    BORDER_BLUE:      '#d0e7ff',       // Borde azul (firma / info)

    // ── Sombras ────────────────────────────────────────────────────────────
    SHADOW:           'rgb(61, 60, 60)',
    SHADOW_LIGHT:     'rgb(100, 99, 99)',
    SHADOW_WARM:      'rgb(167, 161, 161)',

    // ── Botones específicos ────────────────────────────────────────────────
    SAVE_BUTTON:      '#4063a5c0',     // Botón guardar (azul con opacidad)
    SIGNUP_BUTTON:    '#295486d8',     // Botón registro (azul con opacidad)
    SIGNUP_ACCENT:    '#295486',       // Acento azul en registro
    CAMERA_BUTTON:    '#98999b98',     // Botón cámara (gris con opacidad)
    DISABLED:         'rgb(150, 150, 150)', // Estado deshabilitado
    DANGER_LIGHT:     '#ff6b6b',       // Rojo suave (offline badge, limpiar)

    // ── Fondos de contenedores ─────────────────────────────────────────────
    CONTAINER_BG:     '#6d6d6d1c',     // Fondo contenedor signup (gris claro)
    INPUT_BG:         '#f8f8f89c',     // Fondo input signup (blanco con opacidad)

    // ── Switch / Toggle ───────────────────────────────────────────────────
    SWITCH_TRACK_OFF: '#767577',
    SWITCH_TRACK_ON:  '#81afffa4',
    SWITCH_THUMB_ON:  '#326bac',
    SWITCH_THUMB_OFF: '#f4f3f4',
    SWITCH_IOS_BG:    '#3e3e3e',

    // ── Selección / overlays ──────────────────────────────────────────────
    SELECTED:         '#78797ada',     // Ítem seleccionado (color activo)
    OVERLAY_DARK:     'rgba(0,0,0,0.7)',
    OVERLAY_RED:      'rgba(255,0,0,0.7)',

    // ── Íconos ────────────────────────────────────────────────────────────
    ICON_GREY:        'rgb(126, 118, 118)',
    ICON_DARK:        'rgb(95, 89, 89)',
    ICON_MUTED:       '#ccc',

    // ── Insumos / módulo de suministros ───────────────────────────────────
    ADD_BUTTON:       '#4caf4fcb',     // Verde añadir con opacidad
    ADD_BUTTON_ALT:   '#4caf8ead',     // Verde añadir alternativo
    SECONDARY_ITEM:   '#dadddc91',     // Fondo ítem secundario
    BUTTON_GREY:      '#a8aaa888',     // Botón gris neutro
};
