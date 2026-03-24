import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { SignatureCaptureModal, SignaturePreview, SignaturePlaceholder } from "./SignatureCapture";

function SignatureSection({ data, onUpdate }) {
    const [showSignCanvas, setShowSignCanvas] = useState(false);

    const handleSignature = (signature) => {
        if (signature) {
            onUpdate(signature);
            setShowSignCanvas(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Eliminar firma",
            "¿Estás seguro de que quieres eliminar esta firma?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => onUpdate('') }
            ]
        );
    };

    return (
        <View style={{ marginRight: 15, marginTop: 50 }}>
            <Text style={styles.title}>Firma del Paciente</Text>

            <View style={styles.mainContainer}>
                <TouchableOpacity
                    style={styles.signButton}
                    onPress={() => setShowSignCanvas(true)}
                    accessibilityRole="button"
                    accessibilityLabel={data ? "Capturar nueva firma del paciente" : "Capturar firma del paciente"}
                >
                    <Text style={styles.buttonText}>
                        {data ? "Firmar de Nuevo" : "Firmar Aquí"}
                    </Text>
                </TouchableOpacity>

                {data ? (
                    <SignaturePreview
                        value={data}
                        onNew={() => setShowSignCanvas(true)}
                        onDelete={handleDelete}
                        newLabel="Nueva Firma"
                        deleteLabel="Eliminar"
                    />
                ) : (
                    <SignaturePlaceholder
                        onPress={() => setShowSignCanvas(true)}
                        label="Firma no capturada"
                    />
                )}
            </View>

            <SignatureCaptureModal
                title="Firma del Paciente"
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
        marginBottom: 13,
    },

    mainContainer: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 15,
    },

    signButton: {
        backgroundColor: COLORS.PRIMARY_DARK,
        borderRadius: 15,
        paddingVertical: 15,
        width: "100%",
        alignItems: "center",
    },

    buttonText: {
        fontSize: 18,
        color: COLORS.BACKGROUND,
        fontWeight: "600",
    },
});

export default React.memo(SignatureSection);
