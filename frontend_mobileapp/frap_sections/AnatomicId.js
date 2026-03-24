import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform } from "react-native";
import { useState, useEffect } from "react";

function AnatomicSection({ data, onUpdate }) {
    const [pressedButtons, setPressedButtons] = useState({});
    const [otherText, setOtherText] = useState('');

    const anatomicas = [
        "Cráneo", "Cara", "Cuello", "Columna", "Tórax", "Abdomen", "Clavícula",
        "Brazo", "Antebrazo", "Mano", "Dedos M.", "Pelvis", "Muslo", "Rodilla",
        "Pierna", "Tobillo", "Pie", "Dedos P.", "Hombro", "Genitales"
    ];

    // Inicializar pressedButtons basado en datos existentes
    useEffect(() => {
        const selectedAnatomicas = Object.keys(pressedButtons).filter(key => pressedButtons[key]);

        // Agregar "otro" si existe
        if (otherText.trim()) {
            selectedAnatomicas.push(otherText.trim());
        }

        onUpdate(selectedAnatomicas);
    }, [pressedButtons, otherText, onUpdate]);

    const handlePress = (anatomica) => {
        setPressedButtons(prev => ({
            ...prev,
            [anatomica]: !prev[anatomica]
        }));
        // onUpdate se llama automáticamente en el useEffect
    };

    const handleOtherChange = (text) => {
        setOtherText(text);
        // onUpdate se llama automáticamente en el useEffect
    };

    return (
        <View style={{ marginTop: 50, marginRight: 15 }}>
            <Text style={styles.title}>Identificación Anatómica</Text>

            <View style={styles.options}>
                {anatomicas.map((anatomica, index) => {
                    return (
                        <TouchableOpacity
                            style={[
                                styles.anatomica,
                                pressedButtons[anatomica] && styles.buttonPressed
                            ]}
                            key={index}
                            onPress={() => handlePress(anatomica)}
                            accessibilityRole="button"
                            accessibilityLabel={anatomica}
                        >
                            <Text style={[
                                styles.text,
                                pressedButtons[anatomica] && styles.textOnPress
                            ]}>
                                {anatomica}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TextInput
                placeholder="Otra área (especificar):"
                style={styles.other}
                value={otherText}
                onChangeText={handleOtherChange}
                accessibilityLabel="Otra área anatómica, especificar"
            />

            {data && data.length > 0 && (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedLabel}>Áreas seleccionadas:</Text>
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

    anatomica: {
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

export default React.memo(AnatomicSection);
