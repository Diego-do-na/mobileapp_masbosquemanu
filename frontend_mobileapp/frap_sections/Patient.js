import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useState } from "react";
import { AntDesign } from "@expo/vector-icons";

function PatientSection({ data, onUpdate }) {
    const handleChange = (field, value) => {
        onUpdate({ [field]: value });
    };

    const handleArrayChange = (field, value) => {
        // Convertir string a array separado por comas
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
        onUpdate({ [field]: arrayValue });
    };

    const [genero, setGenero] = useState('Genero');
    const [showGeneros, setShowGeneros] = useState(false);

    const [alergiasText, setAlergiasText] = useState('');
    const [patologiasText, setPatologiasText] = useState('');
    const [medicamentosText, setMedicamentosText] = useState('');

    const generos = [
        { label: 'Femenino', value: 0 },
        { label: 'Masculino', value: 1 },
        { label: 'Otro', value: 2 }
    ];

    return (
        <>
            <Text style={styles.title}>Datos del Paciente</Text>

            <TextInput
                placeholder="Nombre Completo: "
                style={[styles.general, { flex: 1 }]}
                value={data.nombre}
                onChangeText={(newNombre) => handleChange('nombre', newNombre)}
                accessibilityLabel="Nombre completo del paciente"
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                    placeholder="Edad"
                    style={[styles.general, { flex: 1 }]}
                    keyboardType="numeric"
                    value={data.edad ? data.edad.toString() : ''}
                    onChangeText={(newEdad) => handleChange('edad', newEdad ? parseInt(newEdad) : '')}
                    accessibilityLabel="Edad del paciente"
                />
                <TouchableOpacity
                    onPress={() => setShowGeneros(!showGeneros)}
                    style={[styles.general, { flex: 2, height: "auto" }]}
                    accessibilityRole="button"
                    accessibilityLabel="Seleccionar género del paciente"
                >
                    <View style={styles.headerDropDown}>
                        <Text style={styles.text}>{genero}</Text>
                        <AntDesign
                            name={showGeneros ? "up" : "down"}
                            size={20}
                            color={COLORS.ICON_DARK}
                        />
                    </View>

                    {showGeneros && (
                        <>
                            <View style={{ flex: 1, borderWidth: 1, marginTop: 10, borderColor: COLORS.BORDER }} />

                            <View style={styles.dropDown}>
                                {generos.map((generoOption, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setGenero(generoOption.label);
                                                setShowGeneros(false);
                                                handleChange('genero', generoOption.value);
                                            }}
                                            key={index}
                                            style={{ marginTop: 5, paddingVertical: 8 }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Género: ${generoOption.label}`}
                                        >
                                            <Text style={styles.genders}>{generoOption.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}

                </TouchableOpacity>
            </View>

            <View style={{ marginRight: 15, marginLeft: 5, marginBottom: 30 }}>
                {/* Alergias */}
                <View style={styles.wrapper}>
                    <View style={styles.label}>
                        <Text style={styles.arrayLabel}>Alergias</Text>
                    </View>
                    <TextInput
                        multiline
                        textAlignVertical="center"
                        style={styles.optionals}
                        placeholder="Ej: Penicilina, Aspirina, ..."
                        value={alergiasText}
                        onChangeText={(text) => {
                            setAlergiasText(text);
                            handleArrayChange('alergias', text);
                        }}
                        accessibilityLabel="Alergias del paciente"
                    />

                </View>

                {/* Patologías */}
                <View style={styles.wrapper}>
                    <View style={styles.label}>
                        <Text style={styles.arrayLabel}>Patologías</Text>
                    </View>
                    <TextInput
                        multiline
                        textAlignVertical="center"
                        style={styles.optionals}
                        placeholder="Ej: Diabetes, Hipertensión, ..."
                        value={patologiasText}
                        onChangeText={(text) => {
                            setPatologiasText(text);
                            handleArrayChange('patologias', text);
                        }}
                        accessibilityLabel="Patologías del paciente"
                    />

                </View>

                {/* Medicamentos */}
                <View style={styles.wrapper}>
                    <View style={styles.label}>
                        <Text style={styles.arrayLabel}>Medicamentos</Text>
                    </View>
                    <TextInput
                        multiline
                        textAlignVertical="center"
                        style={styles.optionals}
                        placeholder="Ej: Metformina, Losartán, ..."
                        value={medicamentosText}
                        onChangeText={(text) => {
                            setMedicamentosText(text);
                            handleArrayChange('medicamentos', text);
                        }}
                        accessibilityLabel="Medicamentos del paciente"
                    />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: "700",
        color: COLORS.TEXT,
        marginRight: 15,
        marginTop: 50
    },

    general: {
        height: 60,
        padding: 15,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 15,
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW_WARM, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
        marginLeft: 5,
        fontSize: 20,
        fontWeight: "500",
        color: COLORS.TEXT,
        marginRight: 15,
        marginTop: 20
    },

    optionals: {
        padding: 15,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 15,
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW_WARM, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
        fontSize: 19,
        fontWeight: "500",
        color: COLORS.TEXT,
        minHeight: 70,
        marginTop: 5
    },

    wrapper: {
        marginTop: 10
    },

    headerDropDown: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
        alignItems: "center"
    },

    dropDown: {
        marginTop: 10,
        paddingHorizontal: 10
    },

    genders: {
        color: COLORS.TEXT,
        fontSize: 18,
        fontWeight: "500"
    },

    text: {
        fontSize: 20,
        color: "#535f64e8",
        fontWeight: "500"
    },

    arrayLabel: {
        fontSize: 16,
        color: COLORS.TEXT_MUTED,
        marginBottom: 8,
        fontWeight: "600"
    },

    arrayPreview: {
        backgroundColor: COLORS.SURFACE_BLUE,
        padding: 10,
        borderRadius: 10,
        marginTop: 8,
        borderWidth: 1,
        borderColor: COLORS.BORDER_BLUE
    },

    arrayPreviewText: {
        fontSize: 14,
        color: COLORS.TEXT,
        fontStyle: "italic"
    },

    label: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 10,
        bottom: -20,
        zIndex: 2,
        width: 150,
        left: 13,
        paddingLeft: 15
    }
});

export default React.memo(PatientSection);
