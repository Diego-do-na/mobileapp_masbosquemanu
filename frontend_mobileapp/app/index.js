import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter, Link } from "expo-router";

import API_URL from "../config";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";

function Login() {
  const [usuario,      setUsuario]      = useState('');
  const [contrasena,   setContrasena]   = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [visiblePwd,   setVisiblePwd]   = useState(false);
  const router   = useRouter();
  const { login, token } = useAuth();

  async function userLogin() {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/api/authParamedicos/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "usuario": usuario, "contrasena": contrasena })
      });

      const responseData = await response.json();

      if (responseData.success) {
        const newToken    = responseData.token || 'session_active';
        const newUserInfo = {
          usuario: responseData.usuario || usuario,
          nombre:  responseData.nombre  || '',
          id:      responseData.id      || responseData.data?.id || ''
        };

        await login(newToken, newUserInfo);
        router.replace("/home");
      } else {
        const responseMap = {
          "Este usuario no esta registrado": "*Usuario No Registrado",
          "Contraseña Incorrecta":           "*Contraseña Incorrecta",
          "Datos ingresados son invalidos":  "*Datos Invalidos"
        };

        setErrorMessage(responseMap[responseData.message] || responseData.message || "*Error en la autenticación");
      }

    } catch (error) {
      console.error("Error en el Login: ", error);

      if (error.message && error.message.includes('Network')) {
        setErrorMessage("*Error de conexión. Verifica tu internet");

        if (token) {
          Alert.alert(
            "Modo Offline",
            "No hay conexión a internet. ¿Desea continuar con la sesión guardada?",
            [
              { text: "Cancelar",          style: "cancel" },
              { text: "Continuar Offline", onPress: () => router.replace("/home") }
            ]
          );
        }
      } else {
        setErrorMessage("*Error inesperado. Intenta nuevamente");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function validCredentials() {
    if (!usuario.trim()) {
      setErrorMessage("*Usuario es requerido");
      return false;
    }
    if (usuario.length < 4) {
      setErrorMessage("*Usuario debe tener al menos 4 caracteres");
      return false;
    }
    if (usuario.length > 50) {
      setErrorMessage("*Usuario no puede tener más de 50 caracteres");
      return false;
    }
    if (!contrasena) {
      setErrorMessage("*Contraseña es requerida");
      return false;
    }
    if (contrasena.length < 8) {
      setErrorMessage("*Contraseña debe tener al menos 8 caracteres");
      return false;
    }
    return true;
  }

  return (
    <View style={styles.loginCard}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {/* Campo usuario */}
      <View style={styles.field}>
        <TextInput
          style={styles.fieldText}
          placeholder="Usuario"
          placeholderTextColor="#B4B2A9"
          value={usuario}
          onChangeText={(v) => { setUsuario(v); setErrorMessage(''); }}
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      {/* Campo contraseña */}
      <View style={styles.field}>
        <TextInput
          style={[styles.fieldText, { paddingRight: 46 }]}
          placeholder="Contraseña"
          placeholderTextColor="#B4B2A9"
          value={contrasena}
          onChangeText={(v) => { setContrasena(v); setErrorMessage(''); }}
          secureTextEntry={!visiblePwd}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => setVisiblePwd(!visiblePwd)}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={visiblePwd ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <AntDesign name={visiblePwd ? "eye-invisible" : "eye"} size={20} color={COLORS.WARM_TEXT} />
        </TouchableOpacity>
      </View>

      {/* Botón iniciar sesión */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.sendButton, isLoading && styles.disabledButton]}
        onPress={() => { if (validCredentials()) userLogin(); }}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión"
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Cargando..." : "Iniciar sesión"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Index() {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      extraHeight={80}
      style={{ flex: 1, backgroundColor: COLORS.FOREST_DARK }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Zona superior oscura */}
        <View style={styles.topZone}>
          <View style={styles.appIcon}>
            <View style={styles.iconDot} />
          </View>
          <View style={styles.titleArea}>
            <Text style={styles.baseText}>{"FRAP\nRegistro"}</Text>
            <Text style={styles.subtitle}>Atención prehospitalaria</Text>
          </View>
        </View>

        {/* Panel inferior crema */}
        <View style={styles.bottomPanel}>
          <Login />
          <Link href="/signUp" style={styles.linkText}>
            Crear cuenta nueva
          </Link>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  topZone: {
    flex: 1.4,
    backgroundColor: COLORS.FOREST_DARK,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },

  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2d5a0e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginLeft: 28,
  },

  iconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.FOREST_LIGHT,
  },

  titleArea: {
    paddingLeft: 28,
  },

  baseText: {
    color: COLORS.TEXT_WHITE,
    fontWeight: '800',
    fontSize: 48,
    letterSpacing: -1.5,
    lineHeight: 52,
  },

  subtitle: {
    color: COLORS.FOREST_MUTED,
    fontSize: 15,
    fontWeight: '400',
    marginTop: 8,
  },

  bottomPanel: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },

  loginCard: {
    width: '100%',
    gap: 14,
  },

  error: {
    color: '#C0392B',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },

  fieldText: {
    flex: 1,
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '400',
  },

  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 16,
  },

  sendButton: {
    backgroundColor: COLORS.FOREST_MID,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.6,
    backgroundColor: COLORS.DISABLED,
  },

  buttonText: {
    color: COLORS.FOREST_SOFT,
    fontSize: 17,
    fontWeight: '700',
  },

  linkText: {
    color: '#854F0B',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 24,
  },
});
