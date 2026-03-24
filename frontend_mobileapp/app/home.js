import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";
import { STORAGE_KEYS } from "../constants/storage";
import API_URL from "../config";

// ---------------------------------------------------------------------------
// CONSTANTES DE STATUS
// ---------------------------------------------------------------------------
const STATUS_COLORS = {
    pending: COLORS.WARNING,
    syncing: COLORS.INFO,
    sent:    COLORS.SUCCESS,
    failed:  COLORS.DANGER,
};

const STATUS_LABELS = {
    pending: 'Pendiente',
    syncing: 'Enviando',
    sent:    'Enviado',
    failed:  'Error',
};

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------
export default function HomeScreen(){
    const { userInfo, logout } = useAuth();

    const [pendingReports,  setPendingReports]  = useState([]);
    const [isOnline,        setIsOnline]        = useState(true);
    const [checkingConn,    setCheckingConn]    = useState(false);

    // Verificar conectividad real al montar + escuchar cambios
    useEffect(() => {
        checkConnectivity();

        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                setIsOnline(false);
                return;
            }
            checkConnectivity();
        });

        return unsubscribe;
    }, []);

    // Recargar reportes pendientes cada vez que la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            loadPendingReports();
            checkConnectivity();
        }, [])
    );

    const checkConnectivity = async () => {
        setCheckingConn(true);
        try {
            const state = await NetInfo.fetch();
            if (!state.isConnected) { setIsOnline(false); return; }

            const controller = new AbortController();
            const timeoutId  = setTimeout(() => controller.abort(), 5000);
            try {
                const res = await fetch(`${API_URL}/api/health`, { signal: controller.signal });
                clearTimeout(timeoutId);
                setIsOnline(res.ok);
            } catch {
                clearTimeout(timeoutId);
                setIsOnline(false);
            }
        } catch {
            setIsOnline(false);
        } finally {
            setCheckingConn(false);
        }
    };

    const loadPendingReports = async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REPORTS);
            setPendingReports(raw ? JSON.parse(raw) : []);
        } catch (error) {
            console.error('Error al cargar reportes pendientes:', error);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que quieres salir?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace("/");
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert("Error", "No se pudo cerrar sesión");
                        }
                    }
                }
            ]
        );
    };

    // Reportes que no están en 'sent'
    const pendingCount = pendingReports.filter(r => r.status !== 'sent').length;

    return(
        <SafeAreaView style={styles.container}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="local-hospital" size={40} color={COLORS.PRIMARY} />
                    <Text style={styles.headerTitle}>FrapApp</Text>
                </View>

                <View style={styles.headerRight}>
                    {/* Indicador online / offline */}
                    <View style={[styles.connBadge, {backgroundColor: isOnline ? COLORS.SUCCESS : COLORS.DANGER}]}>
                        <Ionicons
                            name={isOnline ? "wifi" : "wifi-outline"}
                            size={12}
                            color="white"
                        />
                        <Text style={styles.connText}>{isOnline ? 'Online' : 'Offline'}</Text>
                    </View>

                    {userInfo && (
                        <View style={styles.userSection}>
                            <View style={styles.userInfo}>
                                <Ionicons name="person-circle" size={22} color={COLORS.PRIMARY} />
                                <Text style={styles.userName}>{userInfo.usuario}</Text>
                            </View>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={22} color={COLORS.DANGER} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Bienvenida ── */}
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>
                        {userInfo ? `Bienvenido,` : 'Bienvenido'}
                    </Text>
                    {userInfo && (
                        <Text style={styles.welcomeName}>
                            {userInfo.nombre || userInfo.usuario}
                        </Text>
                    )}
                </View>

                {/* ── Contador de pendientes (si hay) ── */}
                {pendingCount > 0 && (
                    <View style={[styles.syncBanner, {backgroundColor: isOnline ? COLORS.INFO + '22' : COLORS.WARNING + '22'}]}>
                        <Ionicons
                            name={isOnline ? "cloud-upload-outline" : "cloud-offline-outline"}
                            size={20}
                            color={isOnline ? COLORS.INFO : COLORS.WARNING}
                        />
                        <Text style={[styles.syncBannerText, {color: isOnline ? COLORS.INFO : COLORS.WARNING}]}>
                            {pendingCount} reporte{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de sincronizar
                        </Text>
                    </View>
                )}

                {/* ── Botón nuevo reporte ── */}
                <TouchableOpacity
                    style={styles.newReport}
                    onPress={() => router.navigate("/frap")}
                    activeOpacity={0.85}
                >
                    <View style={styles.newReportIcon}>
                        <FontAwesome5 name="notes-medical" size={60} color={COLORS.PRIMARY} />
                    </View>
                    <Text style={styles.newReportText}>Nuevo FRAP</Text>
                    <Text style={styles.newReportSubtext}>Registro de Atención Prehospitalaria</Text>
                </TouchableOpacity>

                {/* ── Reportes locales con badge de status ── */}
                {pendingReports.length > 0 && (
                    <View style={styles.pendingSection}>
                        <View style={styles.pendingHeader}>
                            <Text style={styles.pendingSectionTitle}>
                                Reportes locales ({pendingReports.length})
                            </Text>
                            <TouchableOpacity onPress={loadPendingReports}>
                                <Ionicons name="refresh" size={20} color={COLORS.PRIMARY_DARK} />
                            </TouchableOpacity>
                        </View>

                        {pendingReports.map((report, index) => {
                            const color         = STATUS_COLORS[report.status] ?? STATUS_COLORS.pending;
                            const label         = STATUS_LABELS[report.status] ?? report.status;
                            const pacienteNombre = report.paciente?.nombre ?? 'Sin nombre';
                            const fecha          = report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString('es-MX')
                                : '—';
                            const retryTime = report.nextRetryAt && report.status === 'pending'
                                ? new Date(report.nextRetryAt).toLocaleTimeString('es-MX', {
                                    hour: '2-digit', minute: '2-digit'
                                  })
                                : null;

                            return (
                                <View key={report.id ?? index} style={styles.pendingItem}>
                                    <View style={[styles.statusBadge, { backgroundColor: color }]}>
                                        <Text style={styles.statusBadgeText}>{label}</Text>
                                    </View>
                                    <View style={styles.pendingInfo}>
                                        <Text style={styles.pendingPatient} numberOfLines={1}>
                                            {pacienteNombre}
                                        </Text>
                                        <Text style={styles.pendingDate}>{fecha}</Text>
                                        {retryTime && (
                                            <Text style={styles.pendingRetry}>
                                                Reintento a las {retryTime}
                                            </Text>
                                        )}
                                        {report.status === 'failed' && (
                                            <Text style={styles.pendingFailed}>
                                                Error permanente — {report.attempts} intentos
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ---------------------------------------------------------------------------
// ESTILOS
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f5f2',
        paddingTop: 10,
    },

    // ── Header ──
    header: {
        width: "100%",
        minHeight: 70,
        backgroundColor: COLORS.HEADER_BG,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexWrap: 'wrap',
        gap: 8,
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: COLORS.TEXT_BLACK,
    },

    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexWrap: 'wrap',
    },

    connBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    connText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },

    userSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },

    userName: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.TEXT_DARK,
    },

    logoutButton: { padding: 4 },

    // ── Scroll ──
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        gap: 16,
    },

    // ── Bienvenida ──
    welcomeCard: {
        borderRadius: 16,
        backgroundColor: COLORS.BACKGROUND,
        paddingVertical: 16,
        paddingHorizontal: 20,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    welcomeText: {
        fontSize: 18,
        color: COLORS.TEXT_MUTED,
        fontWeight: '400',
    },

    welcomeName: {
        fontSize: 26,
        fontWeight: "bold",
        color: COLORS.TEXT_DARK,
        marginTop: 2,
    },

    // ── Banner sync ──
    syncBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },

    syncBannerText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // ── Botón nuevo reporte ──
    newReport: {
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 30,
        backgroundColor: COLORS.BACKGROUND,
        width: "100%",
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },

    newReportIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.APP_TINT,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    newReportText: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.TEXT_DARK,
        marginBottom: 4,
    },

    newReportSubtext: {
        fontSize: 13,
        color: COLORS.TEXT_MUTED,
    },

    // ── Sección reportes pendientes ──
    pendingSection: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 16,
        padding: 16,
        gap: 10,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    pendingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },

    pendingSectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.PRIMARY_DARK,
    },

    pendingItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.BORDER,
    },

    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 76,
        alignItems: "center",
        marginTop: 2,
    },

    statusBadgeText: {
        color: "white",
        fontSize: 11,
        fontWeight: "700",
    },

    pendingInfo: {
        flex: 1,
        gap: 2,
    },

    pendingPatient: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.TEXT,
    },

    pendingDate: {
        fontSize: 12,
        color: COLORS.TEXT_LIGHT,
    },

    pendingRetry: {
        fontSize: 11,
        color: COLORS.WARNING,
        fontStyle: "italic",
    },

    pendingFailed: {
        fontSize: 11,
        color: COLORS.DANGER,
        fontStyle: "italic",
    },
});
