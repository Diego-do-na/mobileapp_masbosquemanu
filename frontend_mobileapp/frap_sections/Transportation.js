import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, Text, Switch, TextInput, Alert } from "react-native";
import { useState } from "react";
import { SignatureCaptureModal, SignaturePreview, SignaturePlaceholder } from "./SignatureCapture";

function TransportSection({ data, onUpdate }) {
    const [showSignCanvas, setShowSignCanvas] = useState(false);

    const handleToggle = (value) => {
        onUpdate({ traslado_aceptado: value });
        if (!value) {
            onUpdate({ numero_unidad: '', nombre_operador: '', firma_operador: '' });
        }
    };

    const handleSignature = (signature) => {
        if (signature) {
            onUpdate({ firma_operador: signature });
            setShowSignCanvas(false);
        }
    };

    const handleDeleteSignature = () => {
        Alert.alert(
            "Eliminar firma",
            "¿Estás seguro de que quieres eliminar la firma del operador?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => onUpdate({ firma_operador: '' }) }
            ]
        );
    };

    return (
        <View style={{ marginRight: 15, marginTop: 50, marginBottom: 30 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.title}>Traslado Aceptado</Text>
                <Switch
                    trackColor={{ false: COLORS.SWITCH_TRACK_OFF, true: COLORS.SWITCH_TRACK_ON }}
                    thumbColor={data.traslado_aceptado ? COLORS.SWITCH_THUMB_ON : COLORS.SWITCH_THUMB_OFF}
                    ios_backgroundColor={COLORS.SWITCH_IOS_BG}
                    onValueChange={handleToggle}
                    value={data.traslado_aceptado}
                    style={{ transform: [{ scale: 1.2 }], top: -10 }}
                    accessibilityRole="switch"
                    accessibilityLabel="Indicar si el paciente aceptó el traslado"
                />
            </View>

            {data.traslado_aceptado && (
                <View style={styles.container}>
                    <Text style={styles.sectionTitle}>Información del Traslado</Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Número de Unidad:</Text>
                            <TextInput
                                placeholder="Ej: ABC-001"
                                style={styles.input}
                                value={data.numero_unidad}
                                onChangeText={(text) => onUpdate({ numero_unidad: text })}
                                accessibilityLabel="Número de unidad de ambulancia"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre del Operador:</Text>
                            <TextInput
                                placeholder="Nombre completo"
                                style={styles.input}
                                value={data.nombre_operador}
                                onChangeText={(text) => onUpdate({ nombre_operador: text })}
                                accessibilityLabel="Nombre completo del operador de la unidad"
                            />
                        </View>
                    </View>

                    <View style={styles.signatureSection}>
                        <Text style={styles.signatureLabel}>Firma del Operador:</Text>

                        {data.firma_operador ? (
                            <SignaturePreview
                                value={data.firma_operador}
                                onNew={() => setShowSignCanvas(true)}
                                onDelete={handleDeleteSignature}
                                newLabel="Nueva Firma"
                                deleteLabel="Eliminar"
                            />
                        ) : (
                            <SignaturePlaceholder
                                onPress={() => setShowSignCanvas(true)}
                                label="Capturar Firma del Operador"
                            />
                        )}
                    </View>
                </View>
            )}

            <SignatureCaptureModal
                title="Firma del Operador"
                visible={showSignCanvas}
                onClose={() => setShowSignCanvas(false)}
                onSave={handleSignature}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: "600",
        color: COLORS.TEXT,
        marginBottom: 20,
    },

    container: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 20,
        padding: 20,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: COLORS.TEXT,
        marginBottom: 20,
        textAlign: "center",
    },

    inputGroup: {
        gap: 20,
        marginBottom: 25,
    },

    inputContainer: {
        marginBottom: 5,
    },

    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.TEXT_MEDIUM,
        marginBottom: 8,
    },

    input: {
        backgroundColor: COLORS.SURFACE,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.BORDER_SOFT,
    },

    signatureSection: {
        marginBottom: 10,
    },

    signatureLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.TEXT_MEDIUM,
        marginBottom: 12,
    },
});

export default React.memo(TransportSection);
