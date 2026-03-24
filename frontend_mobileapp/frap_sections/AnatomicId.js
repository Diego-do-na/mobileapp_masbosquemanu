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
        <View>
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
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_DARK,
        letterSpacing: -0.3,
        marginBottom: 12,
    },

    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 10,
        columnGap: 10,
        justifyContent: 'flex-start',
    },

    anatomica: {
        borderRadius: 20,
        backgroundColor: COLORS.BACKGROUND,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        minWidth: 80,
        maxWidth: 120,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        height: 40,
    },

    text: {
        fontSize: 12,
        color: COLORS.TEXT,
        fontWeight: '500',
    },

    buttonPressed: {
        backgroundColor: COLORS.SELECTED,
        borderColor: COLORS.SELECTED,
    },

    textOnPress: {
        color: COLORS.BACKGROUND,
    },

    other: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 10,
        marginTop: 12,
        paddingHorizontal: 14,
        fontSize: 15,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        color: COLORS.TEXT,
    },

    selectedContainer: {
        backgroundColor: COLORS.SURFACE_ALT,
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },

    selectedLabel: {
        fontSize: 12,
        color: COLORS.WARM_TEXT,
        fontWeight: '500',
        marginBottom: 4,
    },

    selectedText: {
        fontSize: 14,
        color: COLORS.TEXT,
        fontStyle: 'italic',
    },
});

export default React.memo(AnatomicSection);
