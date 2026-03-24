import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform } from "react-native";
import { useState, useEffect } from "react";

function InjurySection({ data, onUpdate }) {
    const [pressedButtons, setPressedButtons] = useState({});
    const [otherText, setOtherText] = useState('');

    const lesiones = [
        "Laceración", "Abrasión", "Contusión", "Sincope", "Luxación",
        "Fractura", "Esguince", "Inconsciente", "Hematoma", "Avulsión",
        "Edema", "Punción", "Quemadura"
    ];

    // Inicializar pressedButtons basado en datos existentes
    useEffect(() => {
        const selectedLesiones = Object.keys(pressedButtons).filter(key => pressedButtons[key]);

        // Agregar "otro" si existe
        if (otherText.trim()) {
            selectedLesiones.push(otherText.trim());
        }

        onUpdate(selectedLesiones);
    }, [pressedButtons, otherText, onUpdate]);

    const handlePress = (lesion) => {
        setPressedButtons(prev => ({
            ...prev,
            [lesion]: !prev[lesion]
        }));
        // onUpdate se llama en el useEffect
    };

    const handleOtherChange = (text) => {
        setOtherText(text);
        // onUpdate se llama en el useEffect
    };

    return (
        <View style={{ marginTop: 50, marginRight: 15 }}>
            <Text style={styles.title}>Tipo de Lesión</Text>

            <View style={styles.options}>
                {lesiones.map((lesion, index) => {
                    return (
                        <TouchableOpacity
                            style={[
                                styles.lesion,
                                pressedButtons[lesion] && styles.buttonPressed
                            ]}
                            key={index}
                            onPress={() => handlePress(lesion)}
                            accessibilityRole="button"
                            accessibilityLabel={lesion}
                        >
                            <Text style={[
                                styles.text,
                                pressedButtons[lesion] && styles.textOnPress
                            ]}>
                                {lesion}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TextInput
                placeholder="Otra lesión (especificar):"
                style={styles.other}
                value={otherText}
                onChangeText={handleOtherChange}
                accessibilityLabel="Otra lesión, especificar"
            />

            {data && data.length > 0 && (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedLabel}>Lesiones seleccionadas:</Text>
                    <Text style={styles.selectedText}>{data.join(', ')}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: "600",
        color: COLORS.TEXT,
    },

    options: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: 10,
        rowGap: 20,
        columnGap: 10,
        marginTop: 15,
        justifyContent: "center"
    },

    lesion: {
        borderRadius: 30,
        backgroundColor: COLORS.BACKGROUND,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 20,
        minWidth: 90,
        maxWidth: 120,
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW_WARM, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
        height: 50,
    },

    text: {
        fontSize: 12,
        color: COLORS.TEXT,
        fontWeight: "600"
    },

    buttonPressed: {
        backgroundColor: COLORS.SELECTED
    },

    textOnPress: {
        color: COLORS.BACKGROUND
    },

    other: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 25,
        marginTop: 20,
        paddingHorizontal: 20,
        fontSize: 18,
        height: 50,
        padding: 15,
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW_WARM, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
    },

    selectedContainer: {
        backgroundColor: COLORS.SURFACE_BLUE,
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        marginLeft: 5,
        borderWidth: 1,
        borderColor: COLORS.BORDER_BLUE
    },

    selectedLabel: {
        fontSize: 14,
        color: COLORS.TEXT_MUTED,
        fontWeight: "600",
        marginBottom: 5
    },

    selectedText: {
        fontSize: 16,
        color: COLORS.TEXT,
        fontStyle: "italic"
    }
});

export default React.memo(InjurySection);
