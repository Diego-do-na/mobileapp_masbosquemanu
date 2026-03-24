import React from 'react';
import { COLORS } from '../constants/colors';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { FontAwesome5 } from "@expo/vector-icons";

function SuppliesSection({ data, onUpdate }) {
    const [contadores, setContadores] = useState({});
    const [showAllOptions, setShowAllOptions] = useState(false);
    const [selectedInsumos, setSelectedInsumos] = useState([]);
    const [customSupply, setCustomSupply] = useState('');
    const [customQuantity, setCustomQuantity] = useState('1');

    const insumosDisponibles = [
        { id: 1, nombre: "Jabón quirúrgico" },
        { id: 2, nombre: "Gasas Esteriles" },
        { id: 3, nombre: "Vendas 20cm" },
        { id: 4, nombre: "Vendas 10cm" },
        { id: 5, nombre: "Vendas 5cm" },
        { id: 6, nombre: "Cinta de Tela" },
        { id: 7, nombre: "Botella de Agua" },
        { id: 8, nombre: "Algodon" },
        { id: 9, nombre: "Guantes" },
        { id: 10, nombre: "Cubrebocas" },
        { id: 11, nombre: "Gel Topico" },
        { id: 12, nombre: "Parches Protectores (Grandes)" },
    ];

    // Inicializar contadores basado en datos existentes
    useEffect(() => {
        const initialContadores = {};
        const initialSelected = [];

        data.forEach(insumo => {
            const existingInsumo = insumosDisponibles.find(i => i.nombre === insumo.nombre);
            if (existingInsumo) {
                initialContadores[existingInsumo.id] = insumo.cantidad;
                initialSelected.push(existingInsumo.id);
            }
        });

        setContadores(initialContadores);
        setSelectedInsumos(initialSelected);
    }, []);

    const incrementar = (id) => {
        const nuevoValor = (contadores[id] || 0) + 1;
        const nuevosContadores = { ...contadores, [id]: nuevoValor };
        setContadores(nuevosContadores);
        updateBackend(nuevosContadores);
    };

    const decrementar = (id) => {
        if (!contadores[id] || contadores[id] <= 0) return;

        const nuevoValor = contadores[id] - 1;
        const nuevosContadores = { ...contadores, [id]: nuevoValor };
        setContadores(nuevosContadores);

        if (nuevoValor === 0) {
            setSelectedInsumos(prev => prev.filter(itemId => itemId !== id));
        }

        updateBackend(nuevosContadores);
    };

    const updateBackend = (contadoresObj) => {
        const insumosArray = Object.entries(contadoresObj)
            .filter(([_, cantidad]) => cantidad > 0)
            .map(([id, cantidad]) => ({
                nombre: insumosDisponibles.find(i => i.id === parseInt(id)).nombre,
                cantidad
            }));

        onUpdate(insumosArray);
    };

    const agregarInsumo = (insumo) => {
        if (!selectedInsumos.includes(insumo.id)) {
            setSelectedInsumos(prev => [...prev, insumo.id]);
        }

        incrementar(insumo.id);
    };

    const quitarInsumo = (id) => {
        setSelectedInsumos(prev => prev.filter(itemId => itemId !== id));

        const nuevosContadores = { ...contadores };
        delete nuevosContadores[id];
        setContadores(nuevosContadores);

        updateBackend(nuevosContadores);
    };

    const agregarCustomInsumo = () => {
        if (!customSupply.trim()) {
            Alert.alert("Por favor ingrese el nombre del insumo");
            return;
        }

        const cantidad = parseInt(customQuantity) || 1;
        const nuevoInsumo = {
            nombre: customSupply.trim(),
            cantidad: cantidad
        };

        const nuevosInsumos = [...data, nuevoInsumo];
        onUpdate(nuevosInsumos);

        // Limpiar campos
        setCustomSupply('');
        setCustomQuantity('1');

        Alert.alert("Éxito", "Insumo personalizado agregado");
    };

    const eliminarInsumoPersonalizado = (index) => {
        const nuevosInsumos = data.filter((_, i) => i !== index);
        onUpdate(nuevosInsumos);
    };

    const toggleShowOptions = () => {
        setShowAllOptions(!showAllOptions);
    };

    return (
        <>
            <Text style={styles.title}>Insumos</Text>
            <View style={styles.container}>

                {/* Sección para insumo personalizado */}
                <View style={styles.customSection}>
                    <Text style={styles.subtitulo}>Agregar insumo personalizado:</Text>
                    <View style={styles.customInputs}>
                        <TextInput
                            style={styles.customTextInput}
                            placeholder="Nombre: "
                            value={customSupply}
                            onChangeText={setCustomSupply}
                            accessibilityLabel="Nombre del insumo personalizado"
                        />
                        <TextInput
                            style={styles.customQuantityInput}
                            placeholder="Cant."
                            keyboardType="numeric"
                            value={customQuantity}
                            onChangeText={setCustomQuantity}
                            accessibilityLabel="Cantidad del insumo personalizado"
                        />
                        <TouchableOpacity
                            style={styles.customAddButton}
                            onPress={agregarCustomInsumo}
                            accessibilityRole="button"
                            accessibilityLabel="Agregar insumo personalizado"
                        >
                            <Text style={styles.customAddButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Botón para mostrar/ocultar todas las opciones */}
                <TouchableOpacity
                    style={styles.botonToggle}
                    onPress={toggleShowOptions}
                    accessibilityRole="button"
                    accessibilityLabel={showAllOptions ? "Ocultar lista de insumos" : "Ver todos los insumos disponibles"}
                >
                    <FontAwesome5
                        name={showAllOptions ? "chevron-up" : "chevron-down"}
                        size={14}
                        color={COLORS.ICON_DARK}
                    />
                    <Text style={styles.botonToggleTexto}>
                        {showAllOptions ? "Ocultar opciones" : "Ver todos los insumos"}
                    </Text>
                </TouchableOpacity>

                {/* Lista de insumos seleccionados (siempre visible) */}
                <View style={styles.listaSeleccionados}>
                    <Text style={styles.subtitulo}>Insumos utilizados:</Text>

                    {/* Insumos de la lista */}
                    {selectedInsumos
                        .filter(id => contadores[id] > 0)
                        .map(id => {
                            const insumo = insumosDisponibles.find(i => i.id === id);
                            return (
                                <View key={id} style={styles.insumoSeleccionado}>
                                    <View style={styles.insumoInfo}>
                                        <Text style={styles.insumoNombreSeleccionado}>
                                            {insumo.nombre}
                                        </Text>
                                        <View style={styles.contadorContainer}>
                                            <TouchableOpacity
                                                style={styles.botonContador}
                                                onPress={() => decrementar(id)}
                                                accessibilityRole="button"
                                                accessibilityLabel="Reducir cantidad del insumo"
                                            >
                                                <Text style={styles.botonTexto}>-</Text>
                                            </TouchableOpacity>

                                            <Text style={styles.cantidadTexto}>
                                                {contadores[id] || 0}
                                            </Text>

                                            <TouchableOpacity
                                                style={styles.botonContador}
                                                onPress={() => incrementar(id)}
                                                accessibilityRole="button"
                                                accessibilityLabel="Aumentar cantidad del insumo"
                                            >
                                                <Text style={styles.botonTexto}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.botonQuitar}
                                        onPress={() => quitarInsumo(id)}
                                        accessibilityRole="button"
                                        accessibilityLabel="Eliminar insumo"
                                    >
                                        <Text style={styles.botonQuitarTexto}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    }

                    {/* Insumos personalizados */}
                    {data.filter(insumo =>
                        !insumosDisponibles.some(i => i.nombre === insumo.nombre)
                    ).map((insumo, index) => (
                        <View key={`custom-${index}`} style={styles.insumoSeleccionado}>
                            <View style={styles.insumoInfo}>
                                <Text style={styles.insumoNombreSeleccionado}>
                                    {insumo.nombre} (personalizado)
                                </Text>
                                <Text style={styles.cantidadTexto}>
                                    Cantidad: {insumo.cantidad}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.botonQuitar}
                                onPress={() => eliminarInsumoPersonalizado(index)}
                                accessibilityRole="button"
                                accessibilityLabel="Eliminar insumo personalizado"
                            >
                                <Text style={styles.botonQuitarTexto}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Lista completa de opciones (solo visible cuando showAllOptions es true) */}
                {showAllOptions && (
                    <View style={styles.listaCompleta}>
                        <Text style={styles.subtitulo}>Seleccionar insumos:</Text>
                        <View style={styles.grid}>
                            {insumosDisponibles.map(insumo => {
                                const estaSeleccionado = selectedInsumos.includes(insumo.id);
                                const cantidad = contadores[insumo.id] || 0;

                                return (
                                    <TouchableOpacity
                                        key={insumo.id}
                                        style={[
                                            styles.botonInsumo,
                                            estaSeleccionado && styles.botonInsumoSeleccionado
                                        ]}
                                        onPress={() => agregarInsumo(insumo)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Agregar insumo: ${insumo.nombre}`}
                                    >
                                        <Text style={[
                                            styles.botonInsumoTexto,
                                            estaSeleccionado && styles.botonInsumoTextoSeleccionado
                                        ]}>
                                            {insumo.nombre}
                                            {cantidad > 0 && (
                                                <Text style={styles.cantidadEnBoton}> ({cantidad})</Text>
                                            )}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={styles.botonCerrar}
                            onPress={() => setShowAllOptions(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar lista de insumos"
                        >
                            <Text style={styles.botonCerrarTexto}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        padding: 14,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.TEXT_DARK,
        letterSpacing: -0.3,
        marginBottom: 6,
    },

    customSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: COLORS.SURFACE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.BORDER_LIGHT
    },

    customInputs: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10
    },

    customTextInput: {
        flex: 3,
        backgroundColor: COLORS.BACKGROUND,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.BORDER_SOFT,
        fontSize: 14
    },

    customQuantityInput: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.BORDER_SOFT,
        fontSize: 14,
        textAlign: 'center'
    },

    customAddButton: {
        backgroundColor: COLORS.ADD_BUTTON,
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },

    customAddButtonText: {
        color: COLORS.BACKGROUND,
        fontSize: 20,
        fontWeight: 'bold'
    },

    botonToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.SECONDARY_ITEM,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignSelf: 'flex-start',
    },

  botonToggleTexto: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
  },
  subtitulo: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.WARM_TEXT,
    marginBottom: 8,
  },
  listaSeleccionados: {
    minHeight: 80,
    marginBottom: 20,
  },
  insumoSeleccionado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  insumoInfo: {
    flex: 1,
  },
  insumoNombreSeleccionado: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_NAVY,
    marginBottom: 6,
  },
  contadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonContador: {
    backgroundColor: COLORS.ADD_BUTTON_ALT,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  botonTexto: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: 'bold'
  },
  cantidadTexto: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_NAVY,
  },
  botonQuitar: {
    marginLeft: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ff6b6bc2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonQuitarTexto: {
    color: COLORS.BACKGROUND,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  sinInsumos: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  // Estilos para la lista completa de opciones
  listaCompleta: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  botonInsumo: {
    width: '48%',
    backgroundColor: COLORS.BACKGROUND,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_SOFT,
    alignItems: 'center',
  },
  botonInsumoSeleccionado: {
    backgroundColor: COLORS.BUTTON_GREY,
    borderColor: '#646d64b7',
    borderWidth: 2,
  },
  botonInsumoTexto: {
    fontSize: 13,
    color: COLORS.TEXT_MEDIUM,
    textAlign: 'center',
  },
  botonInsumoTextoSeleccionado: {
    color: '#2c3e50de',
    fontWeight: '600',
  },
  cantidadEnBoton: {
    color: '#3d3f3d',
    fontWeight: '700',
  },
  botonCerrar: {
    backgroundColor: COLORS.ADD_BUTTON,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCerrarTexto: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(SuppliesSection);
