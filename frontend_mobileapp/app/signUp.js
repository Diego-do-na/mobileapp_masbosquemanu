import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";

import API_URL from "../config";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";

export default function SignUp(){
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
        {type: "Nombre Completo",       setter: setNombre},
        {type: "Correo Escolar",         setter: setCorreoEscolar},
        {type: "Correo Institucional",   setter: setCorreoInst},
        {type: "Usuario",                setter: setUsuario},
        {type: "Contraseña",             setter: setContrasena}
    ];

    async function signUpParamedic(){
        if (isLoading) return;

        setIsLoading(true);

        try{
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

        } catch (error){
            console.error("Error en el SignUp: ", error);
            setErrorMessage("*Error de conexion. Verifica tu internet");
        } finally {
            setIsLoading(false);
        }
    };

    function validForm(){
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
        if (usuario.length < 4){
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
        if (!/\d/.test(contrasena)){
            setErrorMessage("*Contraseña debe contener al menos un numero");
            return false;
        }
        if (!/[A-Z]/.test(contrasena)){
            setErrorMessage("*Contraseña debe contener al menos una mayuscula");
            return false;
        }
        return true;
    }

    return (
        <KeyboardAwareScrollView
            enableOnAndroid
            extraHeight={200}
            style={{flex: 1, backgroundColor: COLORS.BACKGROUND}}
        >
        <SafeAreaView style={styles.screen}>
            <View style={styles.signUpContainer}>
                <FontAwesome
                    name="user-circle"
                    size={100}
                    color={COLORS.SIGNUP_ACCENT}
                    style={{marginBottom: 30}}
                />

                {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

                {sections.map((section, index) => {
                    return (
                        <View style={styles.inputContainer} key={index}>
                            <View style={{flexDirection: "row", gap: 2}}>
                                <Text style={{color: COLORS.DANGER}}>
                                    {section.type === "Correo Escolar" ? "" : "*"}
                                </Text>
                                <Text style={styles.text}>{section.type}</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                onChangeText={(newInput) => {
                                    section.setter(newInput);
                                    setErrorMessage('');
                                }}
                                value={
                                    section.type === "Nombre Completo"     ? nombre :
                                    section.type === "Correo Escolar"       ? correoEscolar :
                                    section.type === "Correo Institucional" ? correoInst :
                                    section.type === "Usuario"              ? usuario : contrasena
                                }
                                secureTextEntry={section.type === "Contraseña" && !visiblePwd}
                                editable={!isLoading}
                            />
                            {section.type === "Contraseña" && (
                                <TouchableOpacity
                                    onPress={() => setVisiblePwd(!visiblePwd)}
                                    style={{position: "absolute", top: 38, right: 15}}
                                >
                                    <AntDesign
                                        name={visiblePwd ? "eye-invisible" : "eye"}
                                        size={25}
                                        color="gray"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                })}

                <TouchableOpacity
                    style={[styles.sendButton, isLoading && styles.disabledButton]}
                    onPress={() => {
                        if (validForm()){
                            setErrorMessage("");
                            signUpParamedic();
                        }
                    }}
                    disabled={isLoading}
                >
                    <Text style={{fontSize: 23, color: COLORS.BACKGROUND}}>
                        {isLoading ? "Registrando..." : "Registrarme"}
                    </Text>
                </TouchableOpacity>

                <View style={{flexDirection: "row", marginTop: 20}}>
                    <Text>¿Ya tienes cuenta? </Text>
                    <Link href="/" style={{color: COLORS.SECONDARY}}>Iniciar Sesion</Link>
                </View>
            </View>
        </SafeAreaView>
       </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 30,
        paddingTop: 20
    },

    signUpContainer: {
        borderRadius: 20,
        backgroundColor: COLORS.CONTAINER_BG,
        alignItems: "center",
        padding: 20,
        width: "100%",
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
            android: { elevation: 3 },
        }),
        paddingTop: 30
    },

    input: {
        backgroundColor: COLORS.INPUT_BG,
        borderRadius: 15,
        marginTop: 5,
        height: 42,
        paddingHorizontal: 20,
        fontSize: 15,
        borderColor: "rgba(0, 0, 0, 0.14)",
        borderWidth: 0.8,
        paddingRight: 50
    },

    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.TEXT_BLACK + 'b6'
    },

    inputContainer: {
        alignSelf: "flex-start",
        width: "100%",
        marginBottom: 15
    },

    sendButton: {
        borderRadius: 20,
        backgroundColor: COLORS.SIGNUP_BUTTON,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
            android: { elevation: 3 },
        }),
    },

    disabledButton: {
        opacity: 0.7,
        backgroundColor: COLORS.TEXT_MUTED
    },

    error: {
        color: COLORS.DANGER,
        fontSize: 12,
        marginBottom: 5,
        top: -20,
        textAlign: "center"
    },
});
