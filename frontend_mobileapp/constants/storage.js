// Claves centralizadas de almacenamiento para FrapApp.
// Importar desde aquí en lugar de definir strings inline en cada archivo.

// SecureStore solo permite: alfanuméricos, ".", "-" y "_"
// AsyncStorage acepta cualquier string, pero usamos el mismo formato para consistencia
export const TOKEN_KEY = 'frapapp_auth_token';
export const USER_KEY  = 'frapapp_user_data';

export const STORAGE_KEYS = {
    AUTH_TOKEN:      'frapapp_auth_token',
    USER_DATA:       'frapapp_user_data',
    PENDING_REPORTS: 'frapapp_pending_reports',
    OFFLINE_MODE:    'frapapp_offline_mode',
    LAST_SYNC:       'frapapp_last_sync',
};
