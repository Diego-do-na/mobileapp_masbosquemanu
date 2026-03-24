import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, TextInput, View, Text, Platform } from "react-native";
import { useState } from "react";

function NotesSection({ observaciones, recomendaciones, onUpdate }) {
    const [heightObservaciones, setObservacionesHeight] = useState(80);
    const [heightRecomendaciones, setRecomendacionesHeight] = useState(80);

    const handleObservacionesChange = (text) => {
        onUpdate({ observaciones: text });
    };

    const handleRecomendacionesChange = (text) => {
        onUpdate({ recomendaciones: text });
    };

    return (
        <View style={{ marginTop: 50, marginRight: 15, marginBottom: 20 }}>
            <Text style={styles.title}>Notas</Text>

            <View style={styles.wrapper}>
                <View style={styles.topLabel}>
                    <Text style={styles.label}>Observaciones</Text>
                </View>
                <TextInput
                    multiline
                    textAlignVertical="top"
                    style={[styles.containers, { flex: 1 }]}
                    placeholder="Describa las observaciones ..."
                    value={observaciones}
                    onChangeText={handleObservacionesChange}
                    onContentSizeChange={(event) => {
                        setObservacionesHeight(event.nativeEvent.contentSize.height + 20);
                    }}
                    accessibilityLabel="Observaciones del reporte"
                />
            </View>

            <View style={[styles.wrapper, { height: 80 }]}>
                <View style={styles.topLabel}>
                    <Text style={styles.label}>Recomendaciones</Text>
                </View>
                <TextInput
                    multiline
                    textAlignVertical="top"
                    style={[styles.containers, { flex: 1 }]}
                    placeholder="Describa las recomendaciones..."
                    value={recomendaciones}
                    onChangeText={handleRecomendacionesChange}
                    onContentSizeChange={(event) => {
                        setRecomendacionesHeight(event.nativeEvent.contentSize.height + 20);
                    }}
                    accessibilityLabel="Recomendaciones del reporte"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: "600",
        color: COLORS.TEXT,
    },

    wrapper: {
        marginLeft: 5,
        marginBottom: 50,
        height: 80
    },

    containers: {
        padding: 15,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 15,
        ...Platform.select({
            ios:     { shadowColor: COLORS.SHADOW_WARM, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
        fontSize: 18,
        fontWeight: "500",
        color: COLORS.TEXT,
        minHeight: 100
    },

    label: {
        fontSize: 16,
        color: COLORS.TEXT_MUTED,
        marginBottom: 8,
        fontWeight: "600",
        marginLeft: 5
    },

    topLabel: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 10,
        bottom: -20,
        zIndex: 2,
        width: 170,
        left: 13,
        paddingLeft: 5
    }
});

export default React.memo(NotesSection);
