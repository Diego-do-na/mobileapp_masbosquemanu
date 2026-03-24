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
                        size={20}
                        color={COLORS.BACKGROUND}
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
        alignItems: "center",
        marginTop: 40,
        marginBottom: 60,
        paddingRight: 20,
        paddingLeft: 10
    },

    saveButton: {
        backgroundColor: COLORS.SAVE_BUTTON,
        borderRadius: 20,
        alignItems: "center",
        flexDirection: "row",
        gap: 15,
        paddingHorizontal: 30,
        //borderColor: "#2c4e24",
        //borderWidth: 3,
        paddingVertical: 15,
        width: "100%",
        justifyContent: "center",
        ...Platform.select({
            ios:     { shadowColor: 'rgb(75, 72, 72)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
    },

    offlineButton: {
        backgroundColor: COLORS.DANGER
    },

    disabledButton: {
        opacity: 0.7
    },

    saveText: {
        fontSize: 20,
        color: COLORS.BACKGROUND,
        fontWeight: "bold"
    },

    syncButton: {
        backgroundColor: COLORS.INFO,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        marginBottom: 15,
        alignSelf: "flex-start"
    },

    syncText: {
        color: COLORS.BACKGROUND,
        fontSize: 14,
        fontWeight: "600"
    },

    statusInfo: {
        marginTop: 15,
        padding: 10,
        backgroundColor: COLORS.SURFACE,
        borderRadius: 10,
        width: "100%"
    },

    offlineInfo: {
        color: COLORS.DANGER,
        fontSize: 12,
        textAlign: "center",
        fontStyle: "italic"
    }
});

export default React.memo(SaveButton);
