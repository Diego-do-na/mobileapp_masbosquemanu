import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// GUARD DE AUTENTICACIÓN
// Lee el estado de AuthContext y redirige según si hay sesión activa.
// ---------------------------------------------------------------------------
function AuthGuard() {
  const { isLoading, token } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthScreen = segments[0] === 'signUp' || segments[0] === undefined;

    if (token && inAuthScreen) {
      router.replace("/home");
    } else if (!token && !inAuthScreen) {
      router.replace("/");
    }
  }, [token, isLoading, segments]);

  return null;
}

// ---------------------------------------------------------------------------
// LAYOUT RAÍZ
// ---------------------------------------------------------------------------
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"  options={{ title: 'Login'   }} />
        <Stack.Screen name="home"   options={{ title: 'Home'    }} />
        <Stack.Screen name="frap"   options={{ title: 'Frap'    }} />
        <Stack.Screen name="signUp" options={{ title: 'Sign Up' }} />
      </Stack>
    </AuthProvider>
  );
}
