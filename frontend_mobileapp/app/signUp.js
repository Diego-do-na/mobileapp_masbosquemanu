import { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AntDesign } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";

import API_URL from "../config";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";

export default function SignUp() {
    const [nombre,        setNombre]        = useState('');
    const [usuario,       setUsuario]       = useState('');
    const [correoEscolar, setCorreoEscolar] = useState('');
    const [correoInst,    setCorreoInst]    = useState('');
    const [contrasena,    setContrasena]    = useState('');
    const [errorMessage,  setErrorMessage]  = useState('');
    const [isLoading,     setIsLoading]     = useState(false);
    const [visiblePwd,    setVisiblePwd]    = useState(false);

    const { login } = useAuth();

    const sections = [
        { type: "Nombre Completo",      setter: setNombre,        value: nombre        },
        { type: "Correo Escolar",        setter: setCorreoEscolar, value: correoEscolar },
        { type: "Correo Institucional",  setter: setCorreoInst,    value: correoInst    },
        { type: "Usuario",               setter: setUsuario,       value: usuario       },
        { type: "Contraseña",            setter: setContrasena,    value: contrasena    },
    ];

    async function signUpParamedic() {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/paramedicos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "nombre":     nombre,
                    "correoInst": correoInst,
                    "correoEsc":  correoEscolar,
                    "usuario":    usuario,
                    "contrasena": contrasena,
                })
            });

            const responseData    = await response.json();
            const responseMessage = responseData.message;

            if (responseData.success && responseMessage === "Paramédico creado exitosamente") {
                const newToken    = responseData.token || 'session_active';
                const newUserInfo = {
                    usuario,
                    nombre,
                    id: responseData.id || responseData.data?.id || ''
                };

                await login(newToken, newUserInfo);
                router.replace("/home");
            } else {
                const responseMap = {
                    "El usuario ya esta registrado":       () => setErrorMessage("*Usuario ya registrado"),
                    "El correoInst ya esta registrado":    () => setErrorMessage("*Correo Institucional ya registrado"),
                    "Datos ingresados son invalidos":      () => setErrorMessage("*Datos Invalidos, revise los campos"),
                };

                const handler = responseMap[responseMessage];
                if (handler) {
                    handler();
                } else {
                    setErrorMessage("*Error al registrarse, revise los datos");
                }
            }

        } catch (error) {
            console.error("Error en el SignUp: ", error);
            setErrorMessage("*Error de conexion. Verifica tu internet");
        } finally {
            setIsLoading(false);
        }
    }

    function validForm() {
        if (!nombre.trim()) {
            setErrorMessage("*Nombre es requerido");
            return false;
        }
        if (!correoInst.trim() || !correoInst.includes('@')) {
            setErrorMessage("*Correo Institucional inválido");
            return false;
        }
        if (correoEscolar && !correoEscolar.includes('@')) {
            setErrorMessage("*Correo Escolar inválido");
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
        if (contrasena.length < 8) {
            setErrorMessage("*Contraseña debe tener al menos 8 caracteres");
            return false;
        }
        if (!/\d/.test(contrasena)) {
            setErrorMessage("*Contraseña debe contener al menos un numero");
            return false;
        }
        if (!/[A-Z]/.test(contrasena)) {
            setErrorMessage("*Contraseña debe contener al menos una mayuscula");
            return false;
        }
        return true;
    }

    return (
        <KeyboardAwareScrollView
            enableOnAndroid
            extraHeight={200}
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
                        <Text style={styles.title}>{"Crear\ncuenta"}</Text>
                        <Text style={styles.subtitle}>Regístrate para continuar</Text>
                    </View>
                </View>

                {/* Panel inferior crema */}
                <View style={styles.bottomPanel}>
                    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                    {sections.map((section, index) => (
                        <View style={styles.inputContainer} key={index}>
                            <View style={styles.field}>
                                <TextInput
                                    style={[styles.input, section.type === "Contraseña" && { paddingRight: 46 }]}
                                    placeholder={section.type}
                                    placeholderTextColor="#B4B2A9"
                                    onChangeText={(v) => { section.setter(v); setErrorMessage(''); }}
                                    value={section.value}
                                    secureTextEntry={section.type === "Contraseña" && !visiblePwd}
                                    editable={!isLoading}
                                    autoCapitalize={section.type === "Nombre Completo" ? "words" : "none"}
                                    keyboardType={
                                        section.type === "Correo Escolar" || section.type === "Correo Institucional"
                                            ? "email-address" : "default"
                                    }
                                />
                                {section.type === "Contraseña" && (
                                    <TouchableOpacity
                                        onPress={() => setVisiblePwd(!visiblePwd)}
                                        style={styles.eyeButton}
                                        accessibilityRole="button"
                                        accessibilityLabel={visiblePwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        <AntDesign
                                            name={visiblePwd ? "eye-invisible" : "eye"}
                                            size={20}
                                            color={COLORS.WARM_TEXT}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.sendButton, isLoading && styles.disabledButton]}
                        onPress={() => { if (validForm()) { setErrorMessage(""); signUpParamedic(); } }}
                        disabled={isLoading}
                        accessibilityRole="button"
                        accessibilityLabel="Registrarse"
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? "Registrando..." : "Registrarme"}
                        </Text>
                    </TouchableOpacity>

                    <Link href="/" style={styles.linkText}>
                        Ya tengo cuenta
                    </Link>
                </View>
            </SafeAreaView>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    topZone: {
        flex: 1,
        backgroundColor: COLORS.FOREST_DARK,
        justifyContent: 'space-between',
        paddingBottom: 24,
        minHeight: 200,
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

    title: {
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
        backgroundColor: '#F5F0E8',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },

    error: {
        color: '#C0392B',
        fontSize: 12,
        marginBottom: 12,
        textAlign: 'center',
    },

    inputContainer: {
        width: '100%',
        marginBottom: 14,
    },

    field: {
        position: 'relative',
    },

    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D3D1C7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.TEXT,
        height: 52,
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
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
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
    },
});
