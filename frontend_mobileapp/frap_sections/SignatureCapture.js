/**
 * SignatureCapture — componente reutilizable para captura de firma.
 *
 * Props:
 *   title        {string}   — Texto del modal (p.ej. "Firma del Paciente")
 *   value        {string}   — URI / data-URL de la firma actual ('' si vacía)
 *   onSave       {fn}       — Callback(signatureDataUrl) al confirmar
 *   onDelete     {fn}       — Callback() al eliminar la firma existente
 *   deleteLabel  {string?}  — Texto del alert de confirmación al eliminar
 *   visible      {bool}     — Controla si el modal está visible
 *   onClose      {fn}       — Callback para cerrar el modal
 */
import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignatureScreen from 'react-native-signature-canvas';
import { useRef } from "react";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";

// Estilo CSS del lienzo de firma (compartido entre todos los usos)
export const SIGNATURE_WEB_STYLE = `.m-signature-pad {box-shadow: none; border: 2px dashed #ccc;}
    .m-signature-pad--body {border: none;}
    .m-signature-pad--footer {display: none; margin: 0px;}
    body,html {height: 100%; width: 100%;}`;

// ---------------------------------------------------------------------------
// MODAL DE CAPTURA
// ---------------------------------------------------------------------------
export function SignatureCaptureModal({ title, visible, onClose, onSave }) {
    const signatureRef = useRef(null);

    const handleClear   = () => signatureRef.current?.clearSignature();
    const handleConfirm = () => signatureRef.current?.readSignature();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <View style={styles.signatureContainer}>
                        <SignatureScreen
                            ref={signatureRef}
                            onOK={onSave}
                            onEmpty={() => Alert.alert("Firma vacía", "Por favor firme en el área")}
                            descriptionText=""
                            clearText="Limpiar"
                            confirmText="Guardar"
                            webStyle={SIGNATURE_WEB_STYLE}
                            autoClear={false}
                            imageType="image/png"
                        />
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.clearButton]}
                            onPress={handleClear}
                            accessibilityRole="button"
                            accessibilityLabel="Limpiar área de firma"
                        >
                            <FontAwesome5 name="trash" size={20} color={COLORS.BACKGROUND} />
                            <Text style={styles.modalButtonText}>Limpiar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar captura de firma"
                        >
                            <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={handleConfirm}
                            accessibilityRole="button"
                            accessibilityLabel="Guardar firma"
                        >
                            <FontAwesome name="check-circle" size={20} color={COLORS.BACKGROUND} />
                            <Text style={styles.modalButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// VISTA PREVIA + BOTONES (cuando ya hay firma)
// ---------------------------------------------------------------------------
export function SignaturePreview({ value, onNew, onDelete, newLabel = "Nueva Firma", deleteLabel = "Eliminar" }) {
    return (
        <View style={styles.previewContainer}>
            <Image
                source={{ uri: value }}
                style={styles.signaturePreview}
                resizeMode="contain"
            />
            <View style={styles.previewButtons}>
                <TouchableOpacity
                    style={[styles.previewButton, styles.newButton]}
                    onPress={onNew}
                    accessibilityRole="button"
                    accessibilityLabel={`Capturar nueva firma: ${newLabel}`}
                >
                    <FontAwesome5 name="pen" size={14} color={COLORS.BACKGROUND} />
                    <Text style={styles.previewButtonText}>{newLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.previewButton, styles.deleteButton]}
                    onPress={onDelete}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar firma: ${deleteLabel}`}
                >
                    <FontAwesome5 name="trash" size={14} color={COLORS.BACKGROUND} />
                    <Text style={styles.previewButtonText}>{deleteLabel}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ---------------------------------------------------------------------------
// PLACEHOLDER (cuando no hay firma)
// ---------------------------------------------------------------------------
export function SignaturePlaceholder({ onPress, label = "Capturar Firma" }) {
    return (
        <TouchableOpacity
            style={styles.placeholder}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <FontAwesome5 name="signature" size={24} color={COLORS.TEXT_MUTED} />
            <Text style={styles.placeholderText}>{label}</Text>
        </TouchableOpacity>
    );
}

// ---------------------------------------------------------------------------
// ESTILOS COMPARTIDOS
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_DARK,
        textAlign: 'center',
        paddingVertical: 16,
        backgroundColor: COLORS.SURFACE,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
        letterSpacing: -0.3,
    },

    signatureContainer: {
        flex: 1,
        margin: 12,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: 10,
        overflow: 'hidden',
    },

    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        backgroundColor: COLORS.SURFACE,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
        gap: 10,
    },

    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
    },

    clearButton:   { backgroundColor: COLORS.DANGER },
    cancelButton:  { backgroundColor: COLORS.BACKGROUND, borderWidth: 1, borderColor: COLORS.BORDER },
    confirmButton: { backgroundColor: COLORS.FOREST_MID },

    modalButtonText:   { color: COLORS.BACKGROUND, fontSize: 15, fontWeight: '700' },
    cancelButtonText:  { color: COLORS.TEXT },

    previewContainer: {
        alignItems: 'center',
        backgroundColor: COLORS.SURFACE,
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },

    signaturePreview: {
        width: 250,
        height: 100,
        marginBottom: 14,
    },

    previewButtons: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },

    previewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 10,
    },

    newButton:    { backgroundColor: COLORS.FOREST_MID },
    deleteButton: { backgroundColor: COLORS.DANGER },

    previewButtonText: { color: COLORS.BACKGROUND, fontSize: 13, fontWeight: '700' },

    placeholder: {
        backgroundColor: COLORS.SURFACE,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },

    placeholderText: {
        color: COLORS.WARM_TEXT,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
