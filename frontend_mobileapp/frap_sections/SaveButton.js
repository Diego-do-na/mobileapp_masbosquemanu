import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Platform } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

function SaveButton({ onSave, isOffline, isSaving, pendingCount, onManualSync }) {
    return (
        <View style={styles.container}>
            {/* Botón de sincronización manual */}
            {pendingCount > 0 && (
                <TouchableOpacity
                    style={styles.syncButton}
                    onPress={onManualSync}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="Sincronizar reportes pendientes"
                >
                    <FontAwesome5
                        name="sync"
                        size={16}
                        color={COLORS.STATUS_SYNC_TEXT}
                    />
                    <Text style={styles.syncText}>
                        {isOffline ? 'Sincronizar' : `Pendientes: ${pendingCount}`}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Botón principal de guardar */}
            <TouchableOpacity
                style={[
                    styles.saveButton,
                    isOffline && styles.offlineButton,
                    isSaving && styles.disabledButton
                ]}
                onPress={onSave}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Guardar reporte FRAP"
            >
                {isSaving ? (
                    <ActivityIndicator color={COLORS.BACKGROUND} size="small" />
                ) : (
                    <>
                        <Ionicons
                            name={isOffline ? "cloud-offline" : "cloud-done"}
                            size={28}
                            color={COLORS.BACKGROUND}
                        />
                        <Text style={styles.saveText}>
                            {isOffline ? "Guardar Offline" : "Guardar Reporte"}
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Indicador de estado */}
            <View style={styles.statusInfo}>
                {isOffline && (
                    <Text style={styles.offlineInfo}>
                        Modo offline activado. Los reportes se guardarán localmente.
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
        paddingHorizontal: 12,
    },

    saveButton: {
        backgroundColor: COLORS.FOREST_MID,
        borderRadius: 14,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        width: '100%',
        justifyContent: 'center',
    },

    offlineButton: {
        backgroundColor: COLORS.DANGER,
    },

    disabledButton: {
        opacity: 0.7,
        backgroundColor: COLORS.BORDER,
    },

    saveText: {
        fontSize: 17,
        color: COLORS.FOREST_SOFT,
        fontWeight: '700',
    },

    syncButton: {
        backgroundColor: COLORS.STATUS_SYNC_BG,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },

    syncText: {
        color: COLORS.STATUS_SYNC_TEXT,
        fontSize: 13,
        fontWeight: '700',
    },

    statusInfo: {
        marginTop: 10,
        padding: 10,
        backgroundColor: COLORS.SURFACE,
        borderRadius: 10,
        width: '100%',
    },

    offlineInfo: {
        color: COLORS.CAFFE_DARK,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default React.memo(SaveButton);
