import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, USER_KEY } from '../constants/storage';

// ---------------------------------------------------------------------------
// CONTEXTO
// ---------------------------------------------------------------------------
const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// PROVIDER
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
    const [token,     setToken]     = useState(null);
    const [userInfo,  setUserInfo]  = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar sesión guardada al montar
    useEffect(() => {
        loadStoredSession();
    }, []);

    const loadStoredSession = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
            const storedUser  = await SecureStore.getItemAsync(USER_KEY);
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUserInfo(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('AuthContext: error cargando sesión:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Guarda token + datos de usuario en SecureStore y actualiza el estado.
     * @param {string} newToken
     * @param {{ usuario: string, nombre: string, id: string }} newUserInfo
     */
    const login = async (newToken, newUserInfo) => {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUserInfo));
        setToken(newToken);
        setUserInfo(newUserInfo);
    };

    /** Borra la sesión de SecureStore y limpia el estado. */
    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        setToken(null);
        setUserInfo(null);
    };

    return (
        <AuthContext.Provider value={{ token, userInfo, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// HOOK DE CONSUMO
// ---------------------------------------------------------------------------
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
