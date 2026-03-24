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
        <View style={{ marginRight: 15, marginTop: 30 }}>
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
        fontSize: 30,
        fontWeight: "600",
        color: COLORS.TEXT,
        marginBottom: 13
    },

    options: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: 10,
        rowGap: 20,
        columnGap: 10
    },

    pupil: {
        borderRadius: 30,
        backgroundColor: COLORS.BACKGROUND,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 25,
        minWidth: 140,
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW_WARM, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
        height: 50
    },

    text: {
        fontSize: 16,
        color: COLORS.TEXT,
        fontWeight: "600"
    },

    buttonPressed: {
        backgroundColor: COLORS.SELECTED
    },

    textOnPress: {
        color: COLORS.BACKGROUND
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

export default React.memo(PupilsSection);
