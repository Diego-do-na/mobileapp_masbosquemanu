import { StyleSheet, Text, ScrollView, View, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import General from "../frap_sections/General";
import Patient from "../frap_sections/Patient";
import Vitals from "../frap_sections/Vitals";
import ESCGW from "../frap_sections/ESCGW";
import Pupils from "../frap_sections/Pupils";
import Signature from "../frap_sections/Signature";
import Pictures from "../frap_sections/Pictures";
import Injury from "../frap_sections/Injury";
import AnatomicId from "../frap_sections/AnatomicId";
import Notes from "../frap_sections/Notes";
import Witness from "../frap_sections/Witness";
import Transport from "../frap_sections/Transportation";
import Supplies from "../frap_sections/Supplies";
import SaveButton from "../frap_sections/SaveButton";
import { router } from "expo-router";

import API_URL from "../config";
import { STORAGE_KEYS } from "../constants/storage";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// CONSTANTES
// ---------------------------------------------------------------------------
/** Directorio persistente donde se copian las fotos de reportes offline */
const FRAP_IMAGES_DIR = FileSystem.documentDirectory + 'frap_images/';

/** Esperas antes de cada reintento: intento 1→5s, 2→15s, 3→45s, 4→2min, 5→5min */
const RETRY_DELAYS_MS = [5_000, 15_000, 45_000, 120_000, 300_000];
const MAX_ATTEMPTS    = RETRY_DELAYS_MS.length;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Convierte una firma (file:// URI) a data: base64 URI usando FileSystem.
 * Si ya es data: URI la devuelve tal cual (caso habitual para firmas SVG/canvas).
 * Si es otro string (path SVG, etc.) lo devuelve sin cambios.
 */
const uriToBase64 = async (uri) => {
    if (!uri) return null;
    if (uri.startsWith('data:')) return uri;
    if (!uri.startsWith('file://')) return uri;
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
        console.warn('No se pudo convertir URI a base64:', error);
        return uri;
    }
};

/**
 * Convierte un array de URIs de fotografías a strings base64 para enviar al servidor.
 * Se llama SOLO en el momento del POST, nunca antes.
 */
const convertFotografiasToBase64 = async (fotografias) => {
    if (!Array.isArray(fotografias) || fotografias.length === 0) return [];
    const results = await Promise.all(
        fotografias.map(async (uri) => {
            if (!uri) return null;
            if (uri.startsWith('data:')) return uri;
            try {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                return `data:image/jpeg;base64,${base64}`;
            } catch {
                return null;
            }
        })
    );
    return results.filter(Boolean);
};

/**
 * Serializa solo las firmas a base64 para AsyncStorage.
 * Las fotografías se guardan como rutas persistentes (file://) — no se convierten aquí.
 */
const serializeImages = async (payload) => {
    const result = { ...payload };
    result.firma_paciente = await uriToBase64(payload.firma_paciente) ?? payload.firma_paciente;
    result.firma_testigo  = await uriToBase64(payload.firma_testigo)  ?? payload.firma_testigo;
    result.firma_operador = await uriToBase64(payload.firma_operador) ?? payload.firma_operador;
    return result;
};

/** Crea el directorio de imágenes si no existe */
const ensureImagesDir = async () => {
    const info = await FileSystem.getInfoAsync(FRAP_IMAGES_DIR);
    if (!info.exists) {
        await FileSystem.makeDirectoryAsync(FRAP_IMAGES_DIR, { intermediates: true });
    }
};

/**
 * Copia un URI temporal de cámara/galería a documentDirectory.
 * Devuelve la ruta persistente. Si ya es data: URI o no existe, lo retorna sin cambios.
 */
const copyImageToStorage = async (uri) => {
    if (!uri || uri.startsWith('data:')) return uri;
    await ensureImagesDir();
    const ext = uri.split('.').pop().split('?')[0] || 'jpg';
    const filename = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const destUri = FRAP_IMAGES_DIR + filename;
    await FileSystem.copyAsync({ from: uri, to: destUri });
    return destUri;
};

/** Elimina las imágenes persistentes de un reporte tras sincronizarlo con éxito */
const cleanupImages = async (fotografias) => {
    if (!Array.isArray(fotografias)) return;
    for (const uri of fotografias) {
        if (uri?.startsWith(FRAP_IMAGES_DIR)) {
            try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { /* ignorar */ }
        }
    }
};

/**
 * Verificación real de conectividad:
 * 1. NetInfo.isConnected (adaptador de red activo)
 * 2. Ping con timeout de 5s a /api/health
 * Solo retorna true si ambas pasan.
 */
const checkRealConnectivity = async () => {
    try {
        const state = await NetInfo.fetch();
        if (!state.isConnected) return false;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
            const res = await fetch(`${API_URL}/api/health`, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return res.ok;
        } catch {
            clearTimeout(timeoutId);
            return false;
        }
    } catch {
        return false;
    }
};

// ---------------------------------------------------------------------------
// HEADER COMPONENTE
// ---------------------------------------------------------------------------
function Header({ isOffline, pendingCount }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Volver atrás"
            >
                <Ionicons name="arrow-back" size={20} color={COLORS.FOREST_MID} />
            </TouchableOpacity>

            <Text style={styles.headerText}>{"Nuevo\nFRAP"}</Text>

            {(isOffline || pendingCount > 0) ? (
                <View style={[
                    styles.headerBadge,
                    { backgroundColor: isOffline ? COLORS.STATUS_PEND_BG : COLORS.STATUS_SYNC_BG }
                ]}>
                    <Text style={[
                        styles.headerBadgeText,
                        { color: isOffline ? COLORS.STATUS_PEND_TEXT : COLORS.STATUS_SYNC_TEXT }
                    ]}>
                        {isOffline ? 'Offline' : `${pendingCount} pend.`}
                    </Text>
                </View>
            ) : (
                <View style={[styles.headerBadge, { backgroundColor: COLORS.STATUS_SENT_BG }]}>
                    <Text style={[styles.headerBadgeText, { color: COLORS.STATUS_SENT_TEXT }]}>Activo</Text>
                </View>
            )}
        </View>
    );
}

// ---------------------------------------------------------------------------
// PANTALLA PRINCIPAL
// ---------------------------------------------------------------------------
export default function Frap() {
    const { token } = useAuth();
    const navigation = useNavigation();

    const [patientData, setPatientData] = useState({
        nombre: '',
        edad: '',
        genero: 0,
        alergias: [],
        patologias: [],
        medicamentos: []
    });

    const [reportData, setReportData] = useState({
        paciente_id: null,
        fecha_hora: new Date().toISOString(),
        lugar_nombre: '',
        signos_vitales: { Temp: '', FC: '', FR: '', SpO2: '', T_A: '', GLU: '' },
        nivel_conciencia: { motora: null, verbal: null, ocular: null },
        lesiones: [],
        pupilas: [],
        anatomicas: [],
        observaciones: '',
        recomendaciones: '',
        traslado_aceptado: false,
        numero_unidad: '',
        nombre_operador: '',
        firma_operador: '',
        firma_paciente: '',
        nombre_testigo: '',
        firma_testigo: '',
        insumos: [],
        fotografias: []
    });

    const [isOffline, setIsOffline]                   = useState(false);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);
    const [isSaving, setIsSaving]                     = useState(false);
    const [vitalsValid, setVitalsValid]               = useState(true);
    const [isDirty, setIsDirty]                       = useState(false);

    // Evitar sincronizaciones en paralelo
    const isSyncingRef = useRef(false);

    // -----------------------------------------------------------------------
    // GUARDIA DE NAVEGACIÓN — muestra alerta si hay datos sin guardar
    // -----------------------------------------------------------------------
    usePreventRemove(isDirty && !isSaving, ({ data }) => {
        Alert.alert(
            '¿Salir sin guardar?',
            'Los datos del reporte se perderán.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: () => navigation.dispatch(data.action),
                },
            ]
        );
    });

    // Callbacks memorizados para secciones pesadas
    const handlePupilsUpdate     = useCallback((pupilas)    => updateReportData({ pupilas }),    []);
    const handleAnatomicasUpdate = useCallback((anatomicas) => updateReportData({ anatomicas }), []);
    const handleInjuriesUpdate   = useCallback((lesiones)   => updateReportData({ lesiones }),   []);

    // -----------------------------------------------------------------------
    // MONTAR: escuchar red y cargar contador de pendientes
    // -----------------------------------------------------------------------
    useEffect(() => {
        // Cargar cantidad de reportes pendientes al abrir la pantalla
        loadPendingReportsCount();

        const unsubscribe = NetInfo.addEventListener(async (state) => {
            if (!state.isConnected) {
                setIsOffline(true);
                return;
            }
            // El adaptador dice "conectado" — verificar que el servidor sea reachable
            const reallyOnline = await checkRealConnectivity();
            setIsOffline(!reallyOnline);

            if (reallyOnline && !isSyncingRef.current) {
                loadPendingReportsCount().then(count => {
                    if (count > 0) syncPendingReports();
                });
            }
        });

        return unsubscribe;
    }, []);

    // -----------------------------------------------------------------------
    // HELPERS DE ESTADO
    // -----------------------------------------------------------------------
    const updateReportData  = (newData) => { setIsDirty(true); setReportData(prev  => ({ ...prev,  ...newData })); };
    const updatePatientData = (newData) => { setIsDirty(true); setPatientData(prev => ({ ...prev, ...newData })); };

    // -----------------------------------------------------------------------
    // REPORTES PENDIENTES: cargar, guardar, sincronizar
    // -----------------------------------------------------------------------

    /** Devuelve el número de reportes pendientes y actualiza el estado */
    const loadPendingReportsCount = async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REPORTS);
            const reports = raw ? JSON.parse(raw) : [];
            setPendingReportsCount(reports.length);
            return reports.length;
        } catch (error) {
            console.error('Error al cargar reportes pendientes:', error);
            return 0;
        }
    };

    /**
     * Guarda un reporte en la cola local de pendientes.
     * Copia las fotografías de URIs temporales de cámara a documentDirectory
     * (rutas persistentes que sobreviven reinicios de app) y serializa las firmas.
     */
    const saveReportLocally = async (reportPayload) => {
        try {
            // 1. Copiar fotos a almacenamiento persistente (file:// temporal → documentDirectory)
            const persistedFotos = await Promise.all(
                (reportPayload.fotografias || []).map(copyImageToStorage)
            );

            // 2. Serializar firmas a base64; fotografías ya son rutas persistentes (no convertir)
            const serializedPayload = await serializeImages({
                ...reportPayload,
                fotografias: persistedFotos,
            });

            const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REPORTS);
            const reports = raw ? JSON.parse(raw) : [];

            const offlineReport = {
                ...serializedPayload,
                id:        `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
                status:    'pending',
                attempts:  0,
            };

            reports.push(offlineReport);
            await AsyncStorage.setItem(STORAGE_KEYS.PENDING_REPORTS, JSON.stringify(reports));
            await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'true');

            setPendingReportsCount(reports.length);
            return offlineReport.id;
        } catch (error) {
            console.error('Error al guardar localmente:', error);
            throw error;
        }
    };

    /**
     * Intenta subir todos los reportes elegibles al servidor.
     * - Reportes con status 'failed' se omiten (máx intentos alcanzado).
     * - Reportes con nextRetryAt en el futuro se omiten hasta su turno.
     * - Backoff exponencial: 5s → 15s → 45s → 120s → 300s antes de cada reintento.
     * - Tras MAX_ATTEMPTS fallos marca el reporte como 'failed' pero NO lo elimina.
     */
    const syncPendingReports = async () => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;

        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REPORTS);
            const reports = raw ? JSON.parse(raw) : [];
            if (reports.length === 0) return;

            const now = new Date();

            // Dividir entre reportes a procesar ahora y los que deben esperar
            const eligible = reports.filter(r =>
                r.status !== 'failed' &&
                (!r.nextRetryAt || new Date(r.nextRetryAt) <= now)
            );
            const skipped = reports.filter(r =>
                r.status === 'failed' ||
                (r.nextRetryAt && new Date(r.nextRetryAt) > now)
            );

            if (eligible.length === 0) return;

            if (__DEV__) console.log(`Sincronizando ${eligible.length} reportes...`);

            // Marcar como 'syncing' en AsyncStorage para que home.js lo refleje
            await AsyncStorage.setItem(STORAGE_KEYS.PENDING_REPORTS, JSON.stringify([
                ...eligible.map(r => ({ ...r, status: 'syncing' })),
                ...skipped,
            ]));

            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const successIds  = [];
            const resultReports = [];

            for (const report of eligible) {
                try {
                    const { paciente, id, createdAt, status, attempts, nextRetryAt, ...reportFields } = report;

                    // Convertir fotos persistentes a base64 para el servidor
                    const fotografiasBase64 = await convertFotografiasToBase64(reportFields.fotografias || []);

                    // 1. Crear paciente
                    const patientRes = await fetch(`${API_URL}/api/pacientes`, {
                        method: 'POST', headers,
                        body: JSON.stringify(paciente),
                    });
                    if (!patientRes.ok) throw new Error('Error al crear paciente offline');
                    const patientResult = await patientRes.json();

                    // 2. Crear reporte
                    const reportRes = await fetch(`${API_URL}/api/reportes`, {
                        method: 'POST', headers,
                        body: JSON.stringify({
                            ...reportFields,
                            paciente_id: patientResult.data?.id || patientResult.id,
                            fotografias: fotografiasBase64,
                        }),
                    });
                    if (!reportRes.ok) throw new Error('Error al crear reporte offline');

                    successIds.push(id);
                    await cleanupImages(reportFields.fotografias); // liberar espacio
                    if (__DEV__) console.log(`✅ Reporte ${id} sincronizado`);

                } catch (error) {
                    console.error(`❌ Error al sincronizar ${report.id}:`, error);
                    const newAttempts = (report.attempts || 0) + 1;

                    if (newAttempts >= MAX_ATTEMPTS) {
                        // Marcar permanentemente como fallido — NO eliminar
                        resultReports.push({
                            ...report, attempts: newAttempts,
                            status: 'failed',
                            failedAt: new Date().toISOString(),
                        });
                    } else {
                        // Calcular cuándo reintentar según backoff
                        const delay = RETRY_DELAYS_MS[newAttempts - 1];
                        resultReports.push({
                            ...report, attempts: newAttempts,
                            status: 'pending',
                            nextRetryAt: new Date(Date.now() + delay).toISOString(),
                        });
                    }
                }
            }

            // Estado final: omitidos + fallidos/pendientes (los exitosos se eliminan)
            const finalReports = [...skipped, ...resultReports];
            await AsyncStorage.setItem(STORAGE_KEYS.PENDING_REPORTS, JSON.stringify(finalReports));
            setPendingReportsCount(finalReports.length);

            if (!finalReports.some(r => r.status !== 'failed')) {
                await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_MODE);
                await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            }

            if (successIds.length > 0) {
                Alert.alert(
                    "Sincronización completada",
                    `${successIds.length} reporte(s) enviados exitosamente` +
                    (resultReports.length > 0 ? `\n${resultReports.length} reporte(s) fallaron.` : ''),
                    [{ text: "OK" }]
                );
            }

        } catch (error) {
            console.error('Error en sincronización:', error);
            Alert.alert("Error", "No se pudo completar la sincronización");
        } finally {
            isSyncingRef.current = false;
        }
    };

    // -----------------------------------------------------------------------
    // GUARDAR REPORTE (decide online vs offline)
    // -----------------------------------------------------------------------
    const handleSaveReport = async () => {
        if (isSaving) return;
        setIsSaving(true);

        try {
            // Validaciones básicas
            if (!patientData.nombre.trim()) {
                Alert.alert("Error", "Nombre del paciente es requerido");
                return;
            }
            if (!patientData.edad) {
                Alert.alert("Error", "Edad del paciente es requerida");
                return;
            }
            if (!reportData.lugar_nombre) {
                Alert.alert("Error", "Lugar de ocurrencia es requerido");
                return;
            }
            if (reportData.signos_vitales.T_A && !/^\d{2,3}\/\d{2,3}$/.test(reportData.signos_vitales.T_A)) {
                Alert.alert("Error", "Formato de presión arterial inválido. Use: 120/80");
                return;
            }
            if (!vitalsValid) {
                Alert.alert("Signos Vitales", "Hay valores fuera de rango en los signos vitales. Corrígelos antes de guardar.");
                return;
            }

            // Verificar conectividad real en el momento de guardar
            const online = await checkRealConnectivity();
            setIsOffline(!online);

            if (!online) {
                await saveOfflineReport();
            } else {
                await enviarDatosOnline();
            }

        } catch (error) {
            console.error('Error al guardar reporte:', error);
            Alert.alert("Error", "Ocurrió un error al guardar el reporte");
        } finally {
            setIsSaving(false);
        }
    };

    // -----------------------------------------------------------------------
    // GUARDAR OFFLINE
    // -----------------------------------------------------------------------
    const saveOfflineReport = async () => {
        try {
            const pacientePayload = {
                ...patientData,
                edad: parseInt(patientData.edad) || 0,
                _id: `offline_patient_${Date.now()}`
            };

            const vitales = buildSignosVitales();
            const nivelConciencia = buildNivelConciencia();

            const reportPayload = {
                paciente: pacientePayload,
                fecha_hora:        reportData.fecha_hora,
                lugar_nombre:      reportData.lugar_nombre,
                observaciones:     reportData.observaciones     || '',
                recomendaciones:   reportData.recomendaciones   || '',
                traslado_aceptado: reportData.traslado_aceptado,
                numero_unidad:     reportData.numero_unidad     || '',
                nombre_operador:   reportData.nombre_operador   || '',
                firma_operador:    reportData.firma_operador    || '',
                firma_paciente:    reportData.firma_paciente    || '',
                nombre_testigo:    reportData.nombre_testigo    || '',
                firma_testigo:     reportData.firma_testigo     || '',
                signos_vitales:    vitales,
                nivel_conciencia:  nivelConciencia,
                lesiones:          reportData.lesiones,
                pupilas:           reportData.pupilas,
                anatomicas:        reportData.anatomicas,
                insumos:           reportData.insumos,
                fotografias:       reportData.fotografias   // se serializan en saveReportLocally
            };

            const reportId = await saveReportLocally(reportPayload);

            Alert.alert(
                "Guardado Offline ✅",
                `Reporte guardado localmente.\nID: ${reportId.substring(0, 12)}...\n\nSe enviará automáticamente cuando haya conexión.`,
                [
                    { text: "Ver Pendientes",   onPress: showPendingReports },
                    { text: "Nuevo Reporte",     onPress: resetForm, style: "default" }
                ]
            );

        } catch (error) {
            console.error('Error al guardar offline:', error);
            Alert.alert("Error", "No se pudo guardar el reporte offline");
        }
    };

    // -----------------------------------------------------------------------
    // ENVIAR ONLINE
    // -----------------------------------------------------------------------
    const enviarDatosOnline = async () => {
        try {
            // Por el momento sin token (ajustar cuando el backend lo requiera)
            const headers = { 'Content-Type': 'application/json' };

            // 1. Crear paciente
            const patientResponse = await fetch(`${API_URL}/api/pacientes`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ ...patientData, edad: parseInt(patientData.edad) || 0 }),
            });

            const patientResult = await patientResponse.json();

            if (!patientResult.success) {
                throw new Error(patientResult.message || 'Error al crear paciente');
            }

            // 2. Convertir fotos a base64 AHORA, solo en el momento del envío
            const fotografiasBase64 = await convertFotografiasToBase64(reportData.fotografias);

            const vitales       = buildSignosVitales();
            const nivelConciencia = buildNivelConciencia();

            // 3. Preparar reporte
            const reportPayload = {
                paciente_id:       patientResult.data.id,
                fecha_hora:        reportData.fecha_hora,
                lugar_nombre:      reportData.lugar_nombre,
                observaciones:     reportData.observaciones     || '',
                recomendaciones:   reportData.recomendaciones   || '',
                traslado_aceptado: reportData.traslado_aceptado,
                numero_unidad:     reportData.numero_unidad     || '',
                nombre_operador:   reportData.nombre_operador   || '',
                firma_operador:    reportData.firma_operador    || '',
                firma_paciente:    reportData.firma_paciente    || '',
                nombre_testigo:    reportData.nombre_testigo    || '',
                firma_testigo:     reportData.firma_testigo     || '',
                signos_vitales:    vitales,
                nivel_conciencia:  nivelConciencia,
                lesiones:          reportData.lesiones,
                pupilas:           reportData.pupilas,
                anatomicas:        reportData.anatomicas,
                insumos:           reportData.insumos,
                fotografias:       fotografiasBase64,
            };

            if (!reportPayload.nivel_conciencia) delete reportPayload.nivel_conciencia;

            // 3. Enviar reporte
            const reportResponse = await fetch(`${API_URL}/api/reportes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(reportPayload),
            });

            const reportResult = await reportResponse.json();

            if (!reportResult.success) {
                throw new Error(reportResult.message || 'Error al crear reporte');
            }

            Alert.alert(
                "Éxito ✅",
                "Reporte guardado en el servidor",
                [{ text: "OK", onPress: () => { resetForm(); router.replace("/home"); } }]
            );

        } catch (error) {
            console.error('Error al enviar online:', error);

            // Si falla por conexión, ofrecer guardar offline
            Alert.alert(
                "Error de conexión",
                "No se pudo conectar al servidor. ¿Desea guardar el reporte localmente?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Guardar Offline",
                        onPress: () => {
                            setIsOffline(true);
                            saveOfflineReport();
                        }
                    }
                ]
            );
        }
    };

    // -----------------------------------------------------------------------
    // HELPERS DE PAYLOAD
    // -----------------------------------------------------------------------

    /** Convierte los signos vitales a números y elimina los vacíos */
    const buildSignosVitales = () => {
        const raw = reportData.signos_vitales;
        const v = {
            Temp: raw.Temp  ? parseInt(raw.Temp)  : null,
            FC:   raw.FC    ? parseInt(raw.FC)    : null,
            FR:   raw.FR    ? parseInt(raw.FR)    : null,
            SpO2: raw.SpO2  ? parseInt(raw.SpO2)  : null,
            T_A:  raw.T_A   || null,
            GLU:  raw.GLU   ? parseInt(raw.GLU)   : null,
        };
        // Eliminar nulos y vacíos para no mandar campos basura al servidor
        Object.keys(v).forEach(k => { if (v[k] === null || v[k] === '') delete v[k]; });
        return v;
    };

    /** Devuelve nivel_conciencia sólo si tiene al menos un valor */
    const buildNivelConciencia = () => {
        const nc = reportData.nivel_conciencia;
        if (nc.motora || nc.verbal || nc.ocular) return nc;
        return null;
    };

    // -----------------------------------------------------------------------
    // MOSTRAR PENDIENTES / SINCRONIZACIÓN MANUAL
    // -----------------------------------------------------------------------
    const showPendingReports = async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REPORTS);
            const reports = raw ? JSON.parse(raw) : [];

            if (reports.length === 0) {
                Alert.alert("Reportes Pendientes", "No hay reportes pendientes de enviar.");
                return;
            }

            const reportList = reports.map((r, i) =>
                `• ${i+1}. ${r.paciente?.nombre ?? 'Sin nombre'} — ${new Date(r.createdAt).toLocaleDateString()}`
            ).join('\n');

            Alert.alert(
                `Reportes Pendientes (${reports.length})`,
                reportList,
                [
                    { text: "Cerrar" },
                    { text: "Sincronizar Ahora", onPress: syncPendingReports }
                ]
            );
        } catch (error) {
            console.error('Error al mostrar reportes pendientes:', error);
        }
    };

    const handleManualSync = () => {
        if (pendingReportsCount > 0) {
            Alert.alert(
                "Sincronizar",
                `¿Enviar ${pendingReportsCount} reporte(s) pendientes al servidor?`,
                [
                    { text: "Cancelar",      style: "cancel" },
                    { text: "Sincronizar",   onPress: syncPendingReports }
                ]
            );
        } else {
            Alert.alert("Sincronizar", "No hay reportes pendientes para sincronizar.");
        }
    };

    // -----------------------------------------------------------------------
    // RESET DEL FORMULARIO
    // -----------------------------------------------------------------------
    const resetForm = () => {
        setIsDirty(false);
        setPatientData({ nombre: '', edad: '', genero: 0, alergias: [], patologias: [], medicamentos: [] });
        setReportData({
            paciente_id: null,
            fecha_hora: new Date().toISOString(),
            lugar_nombre: '',
            signos_vitales: { Temp: '', FC: '', FR: '', SpO2: '', T_A: '', GLU: '' },
            nivel_conciencia: { motora: null, verbal: null, ocular: null },
            lesiones: [], pupilas: [], anatomicas: [],
            observaciones: '', recomendaciones: '',
            traslado_aceptado: false,
            numero_unidad: '', nombre_operador: '',
            firma_operador: '', firma_paciente: '',
            nombre_testigo: '', firma_testigo: '',
            insumos: [], fotografias: []
        });
    };

    // -----------------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------------
    return (
        <SafeAreaView style={styles.frapContainer}>
            <Header isOffline={isOffline} pendingCount={pendingReportsCount} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionCard}>
                    <General data={reportData} onUpdate={updateReportData} />
                </View>
                <View style={styles.sectionCard}>
                    <Patient data={patientData} onUpdate={updatePatientData} />
                </View>
                <View style={styles.sectionCard}>
                    <Vitals
                        data={reportData.signos_vitales}
                        onUpdate={(newVitals) => updateReportData({
                            signos_vitales: { ...reportData.signos_vitales, ...newVitals }
                        })}
                        onValidationChange={setVitalsValid}
                    />
                </View>
                <View style={styles.sectionCard}>
                    <ESCGW
                        data={reportData.nivel_conciencia}
                        onUpdate={(newGlasgow) => updateReportData({
                            nivel_conciencia: { ...reportData.nivel_conciencia, ...newGlasgow }
                        })}
                    />
                </View>
                <View style={styles.sectionCard}>
                    <Pupils data={reportData.pupilas} onUpdate={handlePupilsUpdate} />
                </View>
                <View style={styles.sectionCard}>
                    <Injury data={reportData.lesiones} onUpdate={handleInjuriesUpdate} />
                </View>
                <View style={styles.sectionCard}>
                    <AnatomicId data={reportData.anatomicas} onUpdate={handleAnatomicasUpdate} />
                </View>
                <View style={styles.sectionCard}>
                    <Supplies data={reportData.insumos} onUpdate={(insumos) => updateReportData({ insumos })} />
                </View>
                <View style={styles.sectionCard}>
                    <Notes
                        observaciones={reportData.observaciones}
                        recomendaciones={reportData.recomendaciones}
                        onUpdate={(updates) => updateReportData(updates)}
                    />
                </View>
                <View style={styles.sectionCard}>
                    <Pictures data={reportData.fotografias} onUpdate={(fotografias) => updateReportData({ fotografias })} />
                </View>
                <View style={styles.sectionCard}>
                    <Signature data={reportData.firma_paciente} onUpdate={(firma_paciente) => updateReportData({ firma_paciente })} />
                </View>
                <View style={styles.sectionCard}>
                    <Witness
                        data={{ nombre_testigo: reportData.nombre_testigo, firma_testigo: reportData.firma_testigo }}
                        onUpdate={(updates) => updateReportData(updates)}
                    />
                </View>
                <View style={styles.sectionCard}>
                    <Transport
                        data={{
                            traslado_aceptado: reportData.traslado_aceptado,
                            numero_unidad:     reportData.numero_unidad,
                            nombre_operador:   reportData.nombre_operador,
                            firma_operador:    reportData.firma_operador
                        }}
                        onUpdate={(updates) => updateReportData(updates)}
                    />
                </View>
                <SaveButton
                    onSave={handleSaveReport}
                    isOffline={isOffline}
                    isSaving={isSaving}
                    pendingCount={pendingReportsCount}
                    onManualSync={handleManualSync}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

// ---------------------------------------------------------------------------
// ESTILOS
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    frapContainer: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },

    scrollContent: {
        paddingHorizontal: 12,
        paddingBottom: 20,
        gap: 10,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.BACKGROUND,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
        gap: 12,
    },

    backButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.FOREST_SOFT,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerText: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.FOREST_DARK,
        letterSpacing: -0.5,
        lineHeight: 26,
    },

    headerBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },

    headerBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },

    // ── Tarjeta de sección ──
    sectionCard: {
        backgroundColor: COLORS.SURFACE,
        borderRadius: 16,
        padding: 16,
    },
});