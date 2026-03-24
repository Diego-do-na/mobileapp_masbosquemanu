import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather, Octicons, AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter, Link } from "expo-router";

import API_URL from "../config";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";

const icon_size = 80;

function Title(){
  return (
    <>
      <View style={styles.hospitalIcon}>
        <MaterialIcons
          name="local-hospital"
          size={icon_size / 1.5}
          color={COLORS.PRIMARY}
        />
      </View>

      <Text style={[styles.baseText, {marginBottom: 5}]}>FrapApp</Text>

      <Text style={{color: COLORS.TEXT_DARK + 'c0', fontSize: 18, marginTop: 20}}>
        Iniciar sesion para continuar
      </Text>
    </>
  )
};

function Login(){
  const [usuario,      setUsuario]      = useState('');
  const [contrasena,   setContrasena]   = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [visiblePwd,   setVisiblePwd]   = useState(false);
  const router   = useRouter();
  const { login, token } = useAuth();

  // Si ya hay sesión activa, el guard en _layout.tsx redirige automáticamente.
  // No se necesita checkExistingSession aquí.

  async function userLogin(){
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try{
      const response = await fetch(`${API_URL}/api/authParamedicos/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "usuario": usuario, "contrasena": contrasena })
      });

      const responseData = await response.json();

      if (responseData.success) {
        const newToken   = responseData.token || 'session_active';
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

        // Si ya hay token en contexto, ofrecer continuar offline
        if (token) {
          Alert.alert(
            "Modo Offline",
            "No hay conexión a internet. ¿Desea continuar con la sesión guardada?",
            [
              { text: "Cancelar",         style: "cancel" },
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
  };

  function validCredentials(){
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
  };

  return(
    <>
      <View style={styles.loginCard}>
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        <View style={styles.field}>
          <Feather name="user" size={30} style={{marginTop: 5}}/>
          <TextInput
            style={styles.fieldText}
            placeholder="Usuario"
            value={usuario}
            onChangeText={(newUsuario) => {
              setUsuario(newUsuario);
              setErrorMessage('');
            }}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={[styles.field, {marginTop: 10, marginBottom: 15}]}>
          <Octicons name="lock" size={30} style={{marginTop: 5}}/>
          <TextInput
            style={[styles.fieldText, {paddingRight: 40}]}
            placeholder="Contraseña"
            value={contrasena}
            onChangeText={(newContrasena) => {
              setContrasena(newContrasena);
              setErrorMessage('');
            }}
            secureTextEntry={!visiblePwd}
            editable={!isLoading}
          />

          <TouchableOpacity
            onPress={() => setVisiblePwd(!visiblePwd)}
            style={{position: "absolute", top: 10, right: 8}}
          >
            <AntDesign
              name={visiblePwd ? "eye-invisible" : "eye"}
              size={25}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <View style={{alignItems: "center"}}>
          <TouchableOpacity
            activeOpacity={0.2}
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={() => {
              if (validCredentials()) userLogin();
            }}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Cargando..." : "Ingresar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{flexDirection: "row", marginTop: 20}}>
        <Text>¿No tienes cuenta? </Text>
        <Link href="/signUp" style={{color: COLORS.SECONDARY}}>Registrate</Link>
      </View>
    </>
  )
}

export default function Index() {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      extraHeight={80}
      style={{flex: 1, backgroundColor: COLORS.BACKGROUND}}
    >
      <SafeAreaView style={styles.loginContainer}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.subContainer}>
            <Title />
            <Login />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    marginTop: 25
  },

  subContainer: {
    marginTop: 50,
    alignItems: "center",
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 25,
    backgroundColor: COLORS.BACKGROUND
  },

  hospitalIcon: {
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    width: icon_size,
    height: icon_size,
    borderRadius: icon_size / 2,
    backgroundColor: COLORS.BACKGROUND,
    ...Platform.select({
      ios:     { shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },

  baseText: {
    color: COLORS.TEXT_DARK,
    fontWeight: "bold",
    fontSize: 35
  },

  loginCard: {
    borderRadius: 20,
    ...Platform.select({
      ios:     { shadowColor: COLORS.SHADOW_LIGHT, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
    height: "auto",
    width: 300,
    marginTop: 40,
    paddingVertical: 50,
    paddingHorizontal: 20
  },

  sendButton: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 45,
    marginTop: 10,
    ...Platform.select({
      ios:     { shadowColor: 'rgb(61, 60, 60)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.81, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },

  disabledButton: {
    backgroundColor: COLORS.DISABLED,
    opacity: 0.7
  },

  buttonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 20,
    fontWeight: "bold"
  },

  error: {
    color: COLORS.DANGER,
    fontSize: 12,
    marginBottom: 5,
    top: -20,
    textAlign: "center"
  },

  field: {
    flexDirection: "row",
  },

  fieldText: {
    color: COLORS.TEXT_DARK,
    fontSize: 19,
    marginLeft: 10,
    borderRadius: 10,
    flex: 1,
    ...Platform.select({
      ios:     { shadowColor: 'rgb(122, 119, 119)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.73, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
    backgroundColor: COLORS.BACKGROUND,
    paddingLeft: 10,
    marginBottom: 10
  },
});
