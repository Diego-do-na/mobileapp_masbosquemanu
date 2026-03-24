import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, TextInput, View, Text, Platform } from "react-native";
import { useState, useEffect } from "react";

// Rangos fisiológicos aceptables. Valores fuera de rango muestran error inline
// y bloquean el guardado del reporte vía onValidationChange(false).
const RANGES = {
    Temp: { min: 30,  max: 45,  label: "Temp. (°C)",  hint: "30–45 °C"   },
    FC:   { min: 0,   max: 300, label: "FC",           hint: "0–300 lpm"  },
    FR:   { min: 0,   max: 60,  label: "FR",           hint: "0–60 rpm"   },
    SpO2: { min: 0,   max: 100, label: "SpO2",         hint: "0–100 %"    },
    GLU:  { min: 0,   max: 999, label: "GLU",          hint: "0–999 mg/dL"},
};

// T/A se valida por separado (formato "PAS/PAD" con PAS 0–300 y PAD 0–200)
const validateTA = (value) => {
    if (!value) return null; // campo opcional
    if (!/^\d{1,3}\/\d{1,3}$/.test(value)) return "Formato: 120/80";
    const [pas, pad] = value.split('/').map(Number);
    if (pas < 0 || pas > 300) return "PAS debe ser 0–300";
    if (pad < 0 || pad > 200) return "PAD debe ser 0–200";
    if (pas <= pad)            return "PAS debe ser mayor que PAD";
    return null;
};

function VitalsSection({ data, onUpdate, onValidationChange }) {
    const [errors, setErrors] = useState({});

    // Notificar al padre cuando cambia el estado de validación
    useEffect(() => {
        const hasErrors = Object.values(errors).some(e => e !== null && e !== undefined);
        if (onValidationChange) onValidationChange(!hasErrors);
    }, [errors]);

    const handleChange = (field, rawValue) => {
        if (field === "T_A") {
            const error = validateTA(rawValue);
            setErrors(prev => ({ ...prev, T_A: error }));
            onUpdate({ [field]: rawValue });
            return;
        }

        // Campos numéricos
        const numValue = rawValue !== '' ? parseInt(rawValue, 10) : '';
        let error = null;

        if (numValue !== '' && !isNaN(numValue)) {
            const range = RANGES[field];
            if (range && (numValue < range.min || numValue > range.max)) {
                error = `${range.hint}`;
            }
        }

        setErrors(prev => ({ ...prev, [field]: error }));
        onUpdate({ [field]: numValue });
    };

    const vitals = [
        { text: "Temp. (°C)", field: "Temp", keyboardType: "numeric", placeholder: "Ej: 36" },
        { text: "FC",         field: "FC",   keyboardType: "numeric", placeholder: "Ej: 80" },
        { text: "FR",         field: "FR",   keyboardType: "numeric", placeholder: "Ej: 16" },
        { text: "SpO2",       field: "SpO2", keyboardType: "numeric", placeholder: "Ej: 98" },
        { text: "T/A",        field: "T_A",  keyboardType: "default", placeholder: "Ej: 120/80" },
        { text: "GLU",        field: "GLU",  keyboardType: "numeric", placeholder: "Ej: 90"  },
    ];

    return (
        <View>
            <Text style={styles.title} allowFontScaling={false}>Signos Vitales</Text>

            <View style={styles.section}>
                {vitals.map((vital) => {
                    const hasError = errors[vital.field];
                    return (
                        <View key={vital.field} style={styles.vitalContainer}>
                            <Text style={styles.vitalLabel} allowFontScaling={false}>{vital.text}</Text>
                            <TextInput
                                placeholder={vital.placeholder}
                                style={[styles.vital, hasError && styles.vitalError]}
                                keyboardType={vital.keyboardType}
                                value={data[vital.field] ? data[vital.field].toString() : ''}
                                onChangeText={(newInput) => handleChange(vital.field, newInput)}
                                allowFontScaling={false}
                                accessibilityLabel={`Campo de ${vital.text}`}
                            />
                            {hasError && (
                                <Text style={styles.errorText} allowFontScaling={false}>{errors[vital.field]}</Text>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 12,
        columnGap: 12,
        justifyContent: 'space-between',
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_DARK,
        letterSpacing: -0.3,
        marginBottom: 12,
    },

    vitalContainer: {
        width: '47%',
    },

    vitalLabel: {
        fontSize: 12,
        color: COLORS.WARM_TEXT,
        marginBottom: 4,
        fontWeight: '500',
        marginLeft: 2,
    },

    vital: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        color: COLORS.TEXT,
        fontSize: 16,
        fontWeight: '400',
    },

    vitalError: {
        borderWidth: 1.5,
        borderColor: COLORS.DANGER,
    },

    errorText: {
        color: COLORS.DANGER,
        fontSize: 11,
        marginTop: 3,
        marginLeft: 2,
        fontWeight: '500',
    },

    topLabel: {
        marginBottom: 4,
    },
});

export default React.memo(VitalsSection);
