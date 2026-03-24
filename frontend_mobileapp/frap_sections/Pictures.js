import React from 'react';
import { COLORS } from '../constants/colors';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

// Muestra una alerta cuando un permiso fue denegado definitivamente,
// ofreciendo ir a Configuración del dispositivo para habilitarlo.
function mostrarAlertaPermisos(tipo) {
    Alert.alert(
        "Permiso requerido",
        `FrapApp necesita acceso a ${tipo} para registrar lesiones del paciente. Por favor habilita el permiso en Configuración.`,
        [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Abrir Configuración",
                onPress: () => Linking.openSettings(),
            },
        ]
    );
}

function PicturesSection({ data, onUpdate }) {
    const [permisosCamara, setPermisosCamara] = useState(null);
    const [permisosGaleria, setPermisosGaleria] = useState(null);

    // Solicitar permisos al montar
    useEffect(() => {
        (async () => {
            const { status: camaraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            setPermisosCamara(camaraStatus === 'granted');

            // Pedir permiso de MediaLibrary de forma explícita (lectura + escritura)
            const { status: mlStatus } = await MediaLibrary.requestPermissionsAsync();
            const galeriaOk = mlStatus === 'granted';
            setPermisosGaleria(galeriaOk);

            // Reflejar también en ImagePicker para selección de galería
            if (!galeriaOk) {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            }
        })();
    }, []);

    const tomarFoto = async () => {
        if (permisosCamara !== true) {
            // Intentar solicitar de nuevo; si sigue denegado, ofrecer Configuración
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                mostrarAlertaPermisos("la cámara");
                return;
            }
            setPermisosCamara(true);
        }

        try {
            const resultado = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
                exif: false
            });

            if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
                const nuevasFotos = [...data, resultado.assets[0].uri];
                onUpdate(nuevasFotos);

                // Guardar en galería del dispositivo (requiere permiso de escritura)
                try {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status === 'granted') {
                        await MediaLibrary.saveToLibraryAsync(resultado.assets[0].uri);
                    }
                } catch (error) {
                    if (__DEV__) console.log("No se pudo guardar en galería:", error);
                }
            }
        } catch (error) {
            console.error("Error al tomar foto:", error);
            Alert.alert(
                "Error",
                "No se pudo tomar la foto. Por favor intenta de nuevo.",
                [{ text: "OK" }]
            );
        }
    };

    const seleccionarDeGaleria = async () => {
        if (permisosGaleria !== true) {
            // Solicitar de nuevo explícitamente con MediaLibrary
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                mostrarAlertaPermisos("la galería de fotos");
                return;
            }
            setPermisosGaleria(true);
        }

        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
                allowsMultipleSelection: true,
                selectionLimit: 5,
            });

            if (!resultado.canceled && resultado.assets) {
                const nuevasFotos = resultado.assets.map(asset => asset.uri);
                const todasFotos = [...data, ...nuevasFotos];
                onUpdate(todasFotos);
            }
        } catch (error) {
            console.error("Error al seleccionar foto:", error);
            Alert.alert(
                "Error",
                "No se pudo seleccionar la foto. Por favor intenta de nuevo.",
                [{ text: "OK" }]
            );
        }
    };

    const eliminarFoto = (index) => {
        Alert.alert(
            "Eliminar foto",
            "¿Estás seguro de que quieres eliminar esta foto?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        const nuevasFotos = data.filter((_, i) => i !== index);
                        onUpdate(nuevasFotos);
                    }
                }
            ]
        );
    };

    const verFoto = (uri) => {
        Alert.alert(
            "Foto",
            "Vista previa de la foto. Para eliminarla mantén presionada.",
            [{ text: "OK" }]
        );
    };

    const limpiarTodas = () => {
        if (data.length === 0) return;

        Alert.alert(
            "Limpiar todas",
            `¿Eliminar todas las ${data.length} fotos?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar todas",
                    style: "destructive",
                    onPress: () => onUpdate([])
                }
            ]
        );
    };

    return (
        <View style={{ marginRight: 15, marginTop: 30 }}>
            <Text style={styles.title}>Fotos de Lesiones</Text>

            <View style={styles.mainContainer}>
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={[styles.buttons, styles.cameraButton]}
                        onPress={tomarFoto}
                        accessibilityRole="button"
                        accessibilityLabel="Tomar foto con la cámara"
                    >
                        <FontAwesome
                            name="camera"
                            size={20}
                            color={COLORS.BACKGROUND}
                        />
                        <Text style={styles.buttonText}>Cámara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttons, styles.galleryButton]}
                        onPress={seleccionarDeGaleria}
                        accessibilityRole="button"
                        accessibilityLabel="Seleccionar fotos de la galería"
                    >
                        <FontAwesome
                            name="photo"
                            size={20}
                            color={COLORS.PRIMARY_DARK}
                        />
                        <Text style={[styles.buttonText, styles.galleryButtonText]}>Galería</Text>
                    </TouchableOpacity>
                </View>

                {data.length > 0 ? (
                    <>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.scrollContainer}
                        >
                            <View style={styles.picturesContainer}>
                                {data.map((foto, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.fotoContainer}
                                        onPress={() => verFoto(foto)}
                                        onLongPress={() => eliminarFoto(index)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Ver foto ${index + 1}`}
                                    >
                                        <Image
                                            source={{ uri: foto }}
                                            style={styles.foto}
                                        />
                                        <View style={styles.overlay}>
                                            <Text style={styles.fotoIndice}>{index + 1}</Text>
                                            <TouchableOpacity
                                                style={styles.botonEliminar}
                                                onPress={() => eliminarFoto(index)}
                                                accessibilityRole="button"
                                                accessibilityLabel="Eliminar foto"
                                            >
                                                <FontAwesome5
                                                    name="trash"
                                                    size={12}
                                                    color={COLORS.BACKGROUND}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.contadorContainer}>
                            <Text style={styles.contadorTexto}>
                                {data.length} foto{data.length !== 1 ? 's' : ''}
                            </Text>
                            <TouchableOpacity
                                style={styles.botonLimpiar}
                                onPress={limpiarTodas}
                                accessibilityRole="button"
                                accessibilityLabel="Eliminar todas las fotos"
                            >
                                <Text style={styles.botonLimpiarTexto}>Limpiar todas</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <FontAwesome5
                            name="images"
                            color="gray"
                            size={50}
                        />
                        <Text style={styles.emptyText}>No hay fotos capturadas</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: "600",
        color: COLORS.TEXT,
        marginBottom: 13
    },

    mainContainer: {
        gap: 15,
        borderRadius: 20,
        backgroundColor: COLORS.BACKGROUND,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    buttonsRow: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 10
    },

    buttons: {
        borderRadius: 13,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        paddingVertical: 12,
        /*shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        */
    },

    cameraButton: {
        backgroundColor: COLORS.CAMERA_BUTTON,
        borderWidth: 1
    },

    galleryButton: {
        backgroundColor: COLORS.BACKGROUND,
        borderWidth: 1,
        borderColor: COLORS.PRIMARY_DARK
    },

    buttonText: {
        fontSize: 16,
        fontWeight: "bold"
    },

    galleryButtonText: {
        color: COLORS.PRIMARY_DARK
    },

    emptyContainer: {
        gap: 10,
        justifyContent: "center",
        padding: 20,
        height: 150,
        alignItems: "center",
        borderRadius: 15,
        width: "100%",
        alignSelf: "center",
        backgroundColor: COLORS.SURFACE
    },

    emptyText: {
        color: "gray",
        fontSize: 16
    },

    scrollContainer: {
        maxHeight: 160,
    },

    picturesContainer: {
        flexDirection: "row",
        gap: 10,
        paddingVertical: 5,
        height: 150,
        alignItems: "center",
    },

    fotoContainer: {
        position: 'relative',
        marginRight: 10,
    },

    foto: {
        width: 120,
        height: 120,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.PRIMARY_DARK,
    },

    overlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    fotoIndice: {
        backgroundColor: COLORS.OVERLAY_DARK,
        color: COLORS.BACKGROUND,
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },

    botonEliminar: {
        backgroundColor: COLORS.OVERLAY_RED,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    contadorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 5,
    },

    contadorTexto: {
        color: COLORS.PRIMARY_DARK,
        fontSize: 14,
        fontWeight: '600',
    },

    botonLimpiar: {
        backgroundColor: COLORS.DANGER_LIGHT,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },

    botonLimpiarTexto: {
        color: COLORS.BACKGROUND,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default React.memo(PicturesSection);
