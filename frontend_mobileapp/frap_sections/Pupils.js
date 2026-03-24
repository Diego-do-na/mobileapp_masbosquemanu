import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";
import { useState, useEffect } from "react";

function PupilsSection({ data, onUpdate }) {
    const [pressedButtons, setPressedButtons] = useState({});

    const pupils = ["Isocóricas", "Anisocóricas", "Midriasis", "Puntiformes"];

    // Inicializar pressedButtons basado en datos existentes
    useEffect(() => {
        const initialPressed = {};
        data.forEach(pupil => {
            if (pupils.includes(pupil)) {
                initialPressed[pupil] = true;
            }
        });
        setPressedButtons(initialPressed);
    }, []);

    // Efecto para actualizar el padre cuando cambia pressedButtons
    useEffect(() => {
        const selectedPupils = Object.keys(pressedButtons).filter(key => pressedButtons[key]);
        onUpdate(selectedPupils);
    }, [pressedButtons, onUpdate]); // Se ejecuta solo cuando pressedButtons cambia

    const handlePress = (pupil) => {
        setPressedButtons(prev => ({
            ...prev,
            [pupil]: !prev[pupil]
        }));
        // onUpdate ya no se llama aquí
    };

    return (
        <View>
            <Text style={styles.title}>Pupilas</Text>

            <View style={styles.options}>
                {pupils.map((pupil, index) => {
                    return (
                        <TouchableOpacity
                            style={[
                                styles.pupil,
                                pressedButtons[pupil] && styles.buttonPressed
                            ]}
                            key={index}
                            onPress={() => handlePress(pupil)}
                            accessibilityRole="button"
                            accessibilityLabel={pupil}
                        >
                            <Text style={[
                                styles.text,
                                pressedButtons[pupil] && styles.textOnPress
                            ]}>
                                {pupil}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {data && data.length > 0 && (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedLabel}>Seleccionadas:</Text>
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
    },

    pupil: {
        borderRadius: 20,
        backgroundColor: COLORS.BACKGROUND,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 130,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        height: 44,
    },

    text: {
        fontSize: 14,
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

export default React.memo(PupilsSection);
