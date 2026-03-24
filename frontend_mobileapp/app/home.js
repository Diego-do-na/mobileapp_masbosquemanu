import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
// HELPERS DE STATUS
// ---------------------------------------------------------------------------
const STATUS_STYLE = {
    pending: { bg: COLORS.STATUS_PEND_BG, text: COLORS.STATUS_PEND_TEXT },
    syncing: { bg: COLORS.STATUS_SYNC_BG, text: COLORS.STATUS_SYNC_TEXT },
    sent:    { bg: COLORS.STATUS_SENT_BG, text: COLORS.STATUS_SENT_TEXT },
    failed:  { bg: COLORS.STATUS_FAIL_BG, text: COLORS.STATUS_FAIL_TEXT },
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
export default function HomeScreen() {
    const { userInfo, logout } = useAuth();

    const [pendingReports, setPendingReports] = useState([]);
    const [isOnline,       setIsOnline]       = useState(true);
    const [checkingConn,   setCheckingConn]   = useState(false);

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

    const pendingCount = pendingReports.filter(r => r.status !== 'sent').length;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View>
                            <Text style={styles.greeting}>Buenos</Text>
                            <Text style={styles.userName}>
                                {userInfo?.nombre || userInfo?.usuario || 'Paramédico'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        {/* Badge conectividad */}
                        <View style={[
                            styles.connBadge,
                            { backgroundColor: isOnline ? COLORS.STATUS_SENT_BG : COLORS.STATUS_PEND_BG }
                        ]}>
                            <Ionicons
                                name={isOnline ? "wifi" : "wifi-outline"}
                                size={11}
                                color={isOnline ? COLORS.STATUS_SENT_TEXT : COLORS.STATUS_PEND_TEXT}
                            />
                            <Text style={[
                                styles.connText,
                                { color: isOnline ? COLORS.STATUS_SENT_TEXT : COLORS.STATUS_PEND_TEXT }
                            ]}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>

                        {/* Avatar */}
                        <View style={styles.avatar}>
                            <View style={styles.avatarDot} />
                        </View>

                        {/* Logout */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar sesión"
                        >
                            <Ionicons name="log-out-outline" size={20} color={COLORS.WARM_TEXT} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Banner sync ── */}
                {pendingCount > 0 && (
                    <View style={[
                        styles.syncBanner,
                        { backgroundColor: isOnline ? COLORS.STATUS_SYNC_BG : COLORS.STATUS_PEND_BG }
                    ]}>
                        <Ionicons
                            name={isOnline ? "cloud-upload-outline" : "cloud-offline-outline"}
                            size={16}
                            color={isOnline ? COLORS.STATUS_SYNC_TEXT : COLORS.STATUS_PEND_TEXT}
                        />
                        <Text style={[
                            styles.syncBannerText,
                            { color: isOnline ? COLORS.STATUS_SYNC_TEXT : COLORS.STATUS_PEND_TEXT }
                        ]}>
                            {pendingCount} reporte{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de sincronizar
                        </Text>
                    </View>
                )}

                {/* ── Card nuevo FRAP ── */}
                <TouchableOpacity
                    style={styles.newReport}
                    onPress={() => router.navigate("/frap")}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Crear nuevo reporte FRAP"
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.newReportLabel}>Nuevo reporte</Text>
                        <Text style={styles.newReportText}>+ Nuevo FRAP</Text>
                        <View style={styles.newReportBadge}>
                            <Text style={styles.newReportBadgeText}>Formulario completo</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.FOREST_LIGHT} />
                </TouchableOpacity>

                {/* ── Sección reportes recientes ── */}
                {pendingReports.length > 0 && (
                    <View style={styles.reportsSection}>
                        <View style={styles.reportsSectionHeader}>
                            <Text style={styles.reportsSectionTitle}>Reportes recientes</Text>
                            <TouchableOpacity
                                onPress={loadPendingReports}
                                accessibilityRole="button"
                                accessibilityLabel="Actualizar lista de reportes"
                            >
                                <Ionicons name="refresh" size={18} color={COLORS.WARM_TEXT} />
                            </TouchableOpacity>
                        </View>

                        {pendingReports.map((report, index) => {
                            const statusStyle    = STATUS_STYLE[report.status] ?? STATUS_STYLE.pending;
                            const label          = STATUS_LABELS[report.status] ?? report.status;
                            const pacienteNombre = report.paciente?.nombre ?? 'Sin nombre';
                            const fecha          = report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString('es-MX', {
                                    hour: '2-digit', minute: '2-digit'
                                  })
                                : '—';
                            const retryTime = report.nextRetryAt && report.status === 'pending'
                                ? new Date(report.nextRetryAt).toLocaleTimeString('es-MX', {
                                    hour: '2-digit', minute: '2-digit'
                                  })
                                : null;

                            return (
                                <View key={report.id ?? index} style={styles.reportItem}>
                                    <View style={styles.reportItemInfo}>
                                        <Text style={styles.reportPatient} numberOfLines={1}>
                                            {pacienteNombre}
                                        </Text>
                                        <Text style={styles.reportDate}>{fecha}</Text>
                                        {retryTime && (
                                            <Text style={styles.reportRetry}>Reintento a las {retryTime}</Text>
                                        )}
                                        {report.status === 'failed' && (
                                            <Text style={styles.reportFailed}>
                                                Error permanente — {report.attempts} intentos
                                            </Text>
                                        )}
                                    </View>

                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                                            {label}
                                        </Text>
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
        backgroundColor: COLORS.BACKGROUND,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

    headerLeft: {
        flex: 1,
    },

    greeting: {
        fontSize: 13,
        color: COLORS.WARM_TEXT,
        fontWeight: '400',
    },

    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.FOREST_DARK,
        letterSpacing: -0.5,
        marginTop: 2,
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    connBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },

    connText: {
        fontSize: 11,
        fontWeight: '700',
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.FOREST_SOFT,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.FOREST_MID,
    },

    logoutButton: {
        padding: 4,
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
        fontWeight: '500',
    },

    // ── Nuevo FRAP ──
    newReport: {
        backgroundColor: COLORS.FOREST_MID,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    newReportLabel: {
        fontSize: 12,
        color: COLORS.FOREST_LIGHT,
        fontWeight: '500',
        marginBottom: 6,
        letterSpacing: 0.2,
    },

    newReportText: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.TEXT_WHITE,
        letterSpacing: -0.5,
        marginBottom: 12,
    },

    newReportBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#2d5a0e',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    newReportBadgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.FOREST_LIGHT,
    },

    // ── Reportes recientes ──
    reportsSection: {
        gap: 8,
    },

    reportsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

    reportsSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.FOREST_DARK,
        letterSpacing: -0.3,
    },

    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.SURFACE,
        borderRadius: 14,
        padding: 14,
        gap: 10,
    },

    reportItemInfo: {
        flex: 1,
        gap: 2,
    },

    reportPatient: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.TEXT,
    },

    reportDate: {
        fontSize: 12,
        color: COLORS.WARM_TEXT,
        fontWeight: '400',
    },

    reportRetry: {
        fontSize: 11,
        color: COLORS.CAFFE_DARK,
        fontStyle: 'italic',
    },

    reportFailed: {
        fontSize: 11,
        color: COLORS.DANGER,
        fontStyle: 'italic',
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },

    statusBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
