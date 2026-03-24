// Paleta de colores centralizada para FrapApp.
// Paleta: verde bosque con acentos café.
// Importar desde aquí — nunca definir colores inline en los archivos.

// ---------------------------------------------------------------------------
// PALETA SEMÁNTICA (usar estas para lógica de UI)
// ---------------------------------------------------------------------------
export const COLORS = {
    // ── Marca ──────────────────────────────────────────────────────────────
    PRIMARY:          '#3B6D11',       // Verde medio — botones primarios, acentos
    PRIMARY_DARK:     '#173404',       // Verde oscuro — fondo splash, textos principales
    SECONDARY:        '#639922',       // Verde muted — links, placeholders

    // ── Estados ────────────────────────────────────────────────────────────
    DANGER:           '#A32D2D',       // Rojo error / eliminar
    WARNING:          '#854F0B',       // Café oscuro — advertencia / pendiente
    SUCCESS:          '#3B6D11',       // Verde éxito
    INFO:             '#185FA5',       // Azul información / enviando

    // ── Texto ──────────────────────────────────────────────────────────────
    TEXT:             '#2C2C2A',       // Texto cuerpo (negro suave)
    TEXT_DARK:        '#173404',       // Títulos de sección (verde oscuro)
    TEXT_MEDIUM:      '#2C2C2A',       // Texto medio
    TEXT_LABEL:       '#888780',       // Etiquetas de formularios
    TEXT_MUTED:       '#888780',       // Texto secundario / apagado
    TEXT_LIGHT:       '#888780',       // Texto claro / fechas
    TEXT_PLACEHOLDER: '#639922',       // Placeholder en fondos oscuros
    TEXT_BLACK:       '#2C2C2A',       // Negro suave
    TEXT_WHITE:       '#FFFFFF',       // Blanco texto en botones
    TEXT_NAVY:        '#173404',       // Verde oscuro (títulos fuertes)

    // ── Fondos ─────────────────────────────────────────────────────────────
    BACKGROUND:       '#FFFFFF',       // Fondo blanco principal
    SURFACE:          '#F1EFE8',       // Gris cálido — secciones formulario
    SURFACE_ALT:      '#EAF3DE',       // Verde suave — fondos de cards / badges
    SURFACE_BLUE:     '#EAF3DE',       // Verde suave (reemplaza azul)
    SURFACE_INFO:     '#EAF3DE',       // Verde suave información
    HEADER_BG:        '#EAF3DE',       // Fondo encabezado home
    APP_TINT:         '#F1EFE8',       // Fondo pantalla FRAP

    // ── Bordes ─────────────────────────────────────────────────────────────
    BORDER:           '#D3D1C7',       // Borde principal (gris cálido)
    BORDER_LIGHT:     '#D3D1C7',       // Borde claro
    BORDER_SOFT:      '#D3D1C7',       // Borde suave
    BORDER_BLUE:      '#D3D1C7',       // Borde (reemplaza azul)

    // ── Sombras ────────────────────────────────────────────────────────────
    SHADOW:           '#173404',
    SHADOW_LIGHT:     '#3B6D11',
    SHADOW_WARM:      '#173404',

    // ── Botones específicos ────────────────────────────────────────────────
    SAVE_BUTTON:      '#3B6D11',       // Botón guardar
    SIGNUP_BUTTON:    '#3B6D11',       // Botón registro
    SIGNUP_ACCENT:    '#3B6D11',       // Acento verde registro
    CAMERA_BUTTON:    '#EAF3DE',       // Botón cámara (verde suave)
    DISABLED:         '#D3D1C7',       // Estado deshabilitado
    DANGER_LIGHT:     '#A32D2D',       // Rojo (eliminar / limpiar)

    // ── Fondos de contenedores ─────────────────────────────────────────────
    CONTAINER_BG:     'rgba(255,255,255,0.08)', // Fondo semi-transparente (login/signup)
    INPUT_BG:         'rgba(255,255,255,0.08)', // Input sobre fondo oscuro

    // ── Switch / Toggle ───────────────────────────────────────────────────
    SWITCH_TRACK_OFF: '#D3D1C7',
    SWITCH_TRACK_ON:  '#3B6D11',
    SWITCH_THUMB_ON:  '#FFFFFF',
    SWITCH_THUMB_OFF: '#F1EFE8',
    SWITCH_IOS_BG:    '#173404',

    // ── Selección / overlays ──────────────────────────────────────────────
    SELECTED:         '#3B6D11',       // Ítem seleccionado
    OVERLAY_DARK:     'rgba(0,0,0,0.7)',
    OVERLAY_RED:      'rgba(163,45,45,0.7)',

    // ── Íconos ────────────────────────────────────────────────────────────
    ICON_GREY:        '#888780',
    ICON_DARK:        '#2C2C2A',
    ICON_MUTED:       '#D3D1C7',

    // ── Insumos / módulo de suministros ───────────────────────────────────
    ADD_BUTTON:       '#3B6D11',
    ADD_BUTTON_ALT:   '#EAF3DE',
    SECONDARY_ITEM:   '#F1EFE8',
    BUTTON_GREY:      '#D3D1C7',

    // ── Paleta bosque-café extendida ──────────────────────────────────────
    FOREST_DARK:      '#173404',       // Verde oscuro (fondo splash / títulos fuertes)
    FOREST_MID:       '#3B6D11',       // Verde medio (botones, acentos)
    FOREST_SOFT:      '#EAF3DE',       // Verde suave (cards, badges)
    FOREST_LIGHT:     '#C0DD97',       // Verde claro (textos sobre fondo verde)
    FOREST_MUTED:     '#639922',       // Verde muted (subtítulos sobre oscuro)
    CAFFE_DARK:       '#854F0B',       // Café oscuro (estados pendientes)
    CAFFE_LIGHT:      '#FAEEDA',       // Café claro (fondo badge pendiente)
    WARM_BG:          '#F1EFE8',       // Gris cálido fondo secciones
    WARM_BORDER:      '#D3D1C7',       // Borde gris cálido
    WARM_TEXT:        '#888780',       // Texto secundario gris cálido

    // ── Badges de status ─────────────────────────────────────────────────
    STATUS_SENT_BG:   '#EAF3DE',
    STATUS_SENT_TEXT: '#3B6D11',
    STATUS_PEND_BG:   '#FAEEDA',
    STATUS_PEND_TEXT: '#854F0B',
    STATUS_FAIL_BG:   '#FCEBEB',
    STATUS_FAIL_TEXT: '#A32D2D',
    STATUS_SYNC_BG:   '#E6F1FB',
    STATUS_SYNC_TEXT: '#185FA5',
};
