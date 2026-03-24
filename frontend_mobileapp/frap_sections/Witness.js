import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, Text, Switch, TextInput, Alert } from "react-native";
import { useState } from "react";
import { SignatureCaptureModal, SignaturePreview, SignaturePlaceholder } from "./SignatureCapture";

function WitnessSection({ data, onUpdate }) {
    const [isEnabled, setIsEnabled] = useState(
        data.nombre_testigo || data.firma_testigo ? true : false
    );
    const [showSignCanvas, setShowSignCanvas] = useState(false);

    const handleToggle = (value) => {
        setIsEnabled(value);
        if (!value) {
            onUpdate({ nombre_testigo: '', firma_testigo: '' });
        }
    };

    const handleSignature = (signature) => {
        if (signature) {
            onUpdate({ firma_testigo: signature });
            setShowSignCanvas(false);
        }
    };

    const handleDeleteSignature = () => {
        Alert.alert(
            "Eliminar firma",
            "¿Estás seguro de que quieres eliminar la firma del testigo?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => onUpdate({ firma_testigo: '' }) }
            ]
        );
    };

    return (
        <View style={{ marginRight: 15, marginTop: 50 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.title}>Testigo</Text>
                <Switch
                    trackColor={{ false: COLORS.SWITCH_TRACK_OFF, true: COLORS.SWITCH_TRACK_ON }}
                    thumbColor={isEnabled ? COLORS.SWITCH_THUMB_ON : COLORS.SWITCH_THUMB_OFF}
                    ios_backgroundColor={COLORS.SWITCH_IOS_BG}
                    onValueChange={handleToggle}
                    value={isEnabled}
                    style={{ transform: [{ scale: 1.2 }], top: -10 }}
                    accessibilityRole="switch"
                    accessibilityLabel="Activar sección de testigo"
                />
            </View>

            {isEnabled && (
                <View style={styles.container}>
                    <Text style={styles.sectionTitle}>Datos del Testigo</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Nombre del Testigo:</Text>
                        <TextInput
                            placeholder="Ingrese nombre completo"
                            style={styles.nameInput}
                            value={data.nombre_testigo}
                            onChangeText={(text) => onUpdate({ nombre_testigo: text })}
                            accessibilityLabel="Nombre completo del testigo"
                        />
                    </View>

                    <View style={styles.signatureSection}>
                        <Text style={styles.signatureLabel}>Firma del Testigo:</Text>

                        {data.firma_testigo ? (
                            <SignaturePreview
                                value={data.firma_testigo}
                                onNew={() => setShowSignCanvas(true)}
                                onDelete={handleDeleteSignature}
                                newLabel="Nueva Firma"
                                deleteLabel="Eliminar"
                            />
                        ) : (
                            <SignaturePlaceholder
                                onPress={() => setShowSignCanvas(true)}
                                label="Capturar Firma del Testigo"
                            />
                        )}
                    </View>
                </View>
            )}

            <SignatureCaptureModal
                title="Firma del Testigo"
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

    inputContainer: {
        marginBottom: 25,
    },

    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.TEXT_MEDIUM,
        marginBottom: 8,
    },

    nameInput: {
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

export default React.memo(WitnessSection);
