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
        <View>
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

    lesion: {
        borderRadius: 20,
        backgroundColor: COLORS.BACKGROUND,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        minWidth: 80,
        maxWidth: 130,
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

export default React.memo(InjurySection);
