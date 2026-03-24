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
        <View>
            <Text style={styles.title}>Notas</Text>

            <View style={styles.wrapper}>
                <Text style={styles.label}>Observaciones</Text>
                <TextInput
                    multiline
                    textAlignVertical="top"
                    style={styles.containers}
                    placeholder="Describa las observaciones..."
                    value={observaciones}
                    onChangeText={handleObservacionesChange}
                    onContentSizeChange={(event) => {
                        setObservacionesHeight(event.nativeEvent.contentSize.height + 20);
                    }}
                    accessibilityLabel="Observaciones del reporte"
                />
            </View>

            <View style={styles.wrapper}>
                <Text style={styles.label}>Recomendaciones</Text>
                <TextInput
                    multiline
                    textAlignVertical="top"
                    style={styles.containers}
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
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_DARK,
        letterSpacing: -0.3,
        marginBottom: 12,
    },

    wrapper: {
        marginBottom: 14,
    },

    containers: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        fontSize: 15,
        fontWeight: '400',
        color: COLORS.TEXT,
        minHeight: 90,
    },

    label: {
        fontSize: 12,
        color: COLORS.WARM_TEXT,
        marginBottom: 6,
        fontWeight: '500',
    },
});

export default React.memo(NotesSection);
