const db = require("../config/db_connection");
const { respuestaExitosa, respuestaError } = require("../utils/helpers");
const { ejecutarEnTransaccion } = require("../utils/transacciones");

// Crear paciente con transacción
const crearPaciente = async (req, res) => {
    const { nombre, edad, genero, alergias = [], patologias = [], medicamentos = [] } = req.datosValidados;

    try {
        const resultado = await ejecutarEnTransaccion([
            // 1. Insertar paciente
            {
                sql: "INSERT INTO paciente (nombre, edad, genero) VALUES (?, ?, ?)",
                valores: [nombre, edad, genero]
            }
        ]);

        const pacienteId = resultado[0].insertId;

        // 2. Procesar alergias
        if (alergias.length > 0) {
            for (const alergiaNombre of alergias) {
                const [alergiaExistente] = await db.query(
                    "SELECT id_Alergia FROM alergia WHERE nombre = ?",
                    [alergiaNombre]
                );

                let alergiaId;
                if (alergiaExistente.length > 0) {
                    alergiaId = alergiaExistente[0].id_Alergia;
                } else {
                    const [nuevaAlergia] = await db.query(
                        "INSERT INTO alergia (nombre) VALUES (?)",
                        [alergiaNombre]
                    );
                    alergiaId = nuevaAlergia.insertId;
                }

                await db.query(
                    "INSERT INTO paciente_alergia (paciente_id, alergia_id) VALUES (?, ?)",
                    [pacienteId, alergiaId]
                );
            }
        }

        // 3. Procesar patologías
        if (patologias.length > 0) {
            for (const patologiaNombre of patologias) {
                const [patologiaExistente] = await db.query(
                    "SELECT id_Patologia FROM patologia WHERE nombre = ?",
                    [patologiaNombre]
                );

                let patologiaId;
                if (patologiaExistente.length > 0) {
                    patologiaId = patologiaExistente[0].id_Patologia;
                } else {
                    const [nuevaPatologia] = await db.query(
                        "INSERT INTO patologia (nombre) VALUES (?)",
                        [patologiaNombre]
                    );
                    patologiaId = nuevaPatologia.insertId;
                }

                await db.query(
                    "INSERT INTO paciente_patologia (paciente_id, patologia_id) VALUES (?, ?)",
                    [pacienteId, patologiaId]
                );
            }
        }

        // 4. Procesar medicamentos
        if (medicamentos.length > 0) {
            for (const medicamentoNombre of medicamentos) {
                const [medicamentoExistente] = await db.query(
                    "SELECT id_Medicamento FROM medicamento WHERE nombre = ?",
                    [medicamentoNombre]
                );

                let medicamentoId;
                if (medicamentoExistente.length > 0) {
                    medicamentoId = medicamentoExistente[0].id_Medicamento;
                } else {
                    const [nuevoMedicamento] = await db.query(
                        "INSERT INTO medicamento (nombre) VALUES (?)",
                        [medicamentoNombre]
                    );
                    medicamentoId = nuevoMedicamento.insertId;
                }

                await db.query(
                    "INSERT INTO paciente_medicamento (paciente_id, medicamento_id) VALUES (?, ?)",
                    [pacienteId, medicamentoId]
                );
            }
        }

        return respuestaExitosa(res, { id: pacienteId }, "Paciente creado exitosamente", 201);
    } catch (error) {
        console.error("Error crearPaciente:", error);
        return respuestaError(res, "Error al crear paciente", 500);
    }
};

// Obtener todos los pacientes
const obtenerPacientes = async (req, res) => {
    try {
        const { limite = 20, pagina = 1 } = req.query;
        const offset = (pagina - 1) * limite;

        // Obtener pacientes con información básica
        const [pacientes] = await db.query(
            `SELECT p.id_Paciente, p.nombre, p.edad, p.genero,
             GROUP_CONCAT(DISTINCT a.nombre) as alergias,
             GROUP_CONCAT(DISTINCT pt.nombre) as patologias,
             GROUP_CONCAT(DISTINCT m.nombre) as medicamentos
             FROM paciente p
             LEFT JOIN paciente_alergia pa ON p.id_Paciente = pa.paciente_id
             LEFT JOIN alergia a ON pa.alergia_id = a.id_Alergia
             LEFT JOIN paciente_patologia pp ON p.id_Paciente = pp.paciente_id
             LEFT JOIN patologia pt ON pp.patologia_id = pt.id_Patologia
             LEFT JOIN paciente_medicamento pm ON p.id_Paciente = pm.paciente_id
             LEFT JOIN medicamento m ON pm.medicamento_id = m.id_Medicamento
             GROUP BY p.id_Paciente
             ORDER BY p.nombre
             LIMIT ? OFFSET ?`,
            [parseInt(limite), parseInt(offset)]
        );

        // Contar total
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM paciente"
        );

        return respuestaExitosa(res, {
            pacientes,
            paginacion: {
                total: totalResult[0].total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(totalResult[0].total / limite)
            }
        });
    } catch (error) {
        console.error("Error obtenerPacientes:", error);
        return respuestaError(res, "Error al obtener pacientes", 500);
    }
};

// Obtener paciente por ID
const obtenerPacientePorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener paciente básico
        const [pacientes] = await db.query(
            "SELECT id_Paciente, nombre, edad, genero FROM paciente WHERE id_Paciente = ?",
            [id]
        );

        if (pacientes.length === 0) {
            return respuestaError(res, "Paciente no encontrado", 404);
        }

        const paciente = pacientes[0];

        // Obtener alergias
        const [alergias] = await db.query(
            `SELECT a.id_Alergia, a.nombre 
             FROM alergia a
             JOIN paciente_alergia pa ON a.id_Alergia = pa.alergia_id
             WHERE pa.paciente_id = ?`,
            [id]
        );

        // Obtener patologías
        const [patologias] = await db.query(
            `SELECT pt.id_Patologia, pt.nombre 
             FROM patologia pt
             JOIN paciente_patologia pp ON pt.id_Patologia = pp.patologia_id
             WHERE pp.paciente_id = ?`,
            [id]
        );

        // Obtener medicamentos
        const [medicamentos] = await db.query(
            `SELECT m.id_Medicamento, m.nombre 
             FROM medicamento m
             JOIN paciente_medicamento pm ON m.id_Medicamento = pm.medicamento_id
             WHERE pm.paciente_id = ?`,
            [id]
        );

        paciente.alergias = alergias;
        paciente.patologias = patologias;
        paciente.medicamentos = medicamentos;

        return respuestaExitosa(res, paciente);
    } catch (error) {
        console.error("Error obtenerPacientePorId:", error);
        return respuestaError(res, "Error al obtener paciente", 500);
    }
};

// Buscar pacientes
const buscarPacientes = async (req, res) => {
    try {
        const { nombre, edadMin, edadMax, genero, limite = 20, pagina = 1 } = req.query;
        const offset = (pagina - 1) * limite;

        let condiciones = [];
        let valores = [];

        if (nombre) {
            condiciones.push("p.nombre LIKE ?");
            valores.push(`%${nombre}%`);
        }

        if (edadMin) {
            condiciones.push("p.edad >= ?");
            valores.push(edadMin);
        }

        if (edadMax) {
            condiciones.push("p.edad <= ?");
            valores.push(edadMax);
        }

        if (genero) {
            condiciones.push("p.genero = ?");
            valores.push(genero);
        }

        const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

        // Obtener pacientes filtrados
        const [pacientes] = await db.query(
            `SELECT p.id_Paciente, p.nombre, p.edad, p.genero
             FROM paciente p
             ${whereClause}
             ORDER BY p.nombre
             LIMIT ? OFFSET ?`,
            [...valores, parseInt(limite), parseInt(offset)]
        );

        // Contar total filtrado
        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM paciente p ${whereClause}`,
            valores
        );

        return respuestaExitosa(res, {
            pacientes,
            paginacion: {
                total: totalResult[0].total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(totalResult[0].total / limite)
            }
        });
    } catch (error) {
        console.error("Error buscarPacientes:", error);
        return respuestaError(res, "Error al buscar pacientes", 500);
    }
};

// Obtener historial del paciente (reportes)
const obtenerHistorialPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el paciente existe
        const [pacienteExiste] = await db.query(
            "SELECT id_Paciente FROM paciente WHERE id_Paciente = ?",
            [id]
        );

        if (pacienteExiste.length === 0) {
            return respuestaError(res, "Paciente no encontrado", 404);
        }

        // Obtener reportes del paciente
        const [reportes] = await db.query(
            `SELECT r.id_Reporte, r.fecha_hora, r.observaciones, r.traslado_aceptado,
             l.nombre as lugar, sv.Temp, sv.FC, sv.FR, sv.SpO2, sv.T_A, sv.GLU
             FROM reporte r
             JOIN lugar l ON r.lugar_id = l.id_Lugar
             JOIN signos_vitales sv ON r.signos_id = sv.id_Signos
             WHERE r.paciente_id = ?
             ORDER BY r.fecha_hora DESC`,
            [id]
        );

        return respuestaExitosa(res, { reportes });
    } catch (error) {
        console.error("Error obtenerHistorialPaciente:", error);
        return respuestaError(res, "Error al obtener historial", 500);
    }
};

// Actualizar paciente
const actualizarPaciente = async (req, res) => {
    const { id } = req.params;
    const { nombre, edad, genero, alergias, patologias, medicamentos } = req.datosValidados;

    try {
        await db.transaction(async (connection) => {
            // 1. Actualizar datos básicos del paciente
            const campos = [];
            const valores = [];

            if (nombre !== undefined) {
                campos.push("nombre = ?");
                valores.push(nombre);
            }

            if (edad !== undefined) {
                campos.push("edad = ?");
                valores.push(edad);
            }

            if (genero !== undefined) {
                campos.push("genero = ?");
                valores.push(genero);
            }

            if (campos.length > 0) {
                valores.push(id);
                await connection.query(
                    `UPDATE paciente SET ${campos.join(", ")} WHERE id_Paciente = ?`,
                    valores
                );
            }

            // 2. Manejar alergias (reemplazar todas)
            if (alergias !== undefined) {
                // Eliminar alergias actuales
                await connection.query(
                    "DELETE FROM paciente_alergia WHERE paciente_id = ?",
                    [id]
                );

                // Agregar nuevas alergias
                for (const alergiaNombre of alergias) {
                    const [alergiaExistente] = await connection.query(
                        "SELECT id_Alergia FROM alergia WHERE nombre = ?",
                        [alergiaNombre]
                    );

                    let alergiaId;
                    if (alergiaExistente.length > 0) {
                        alergiaId = alergiaExistente[0].id_Alergia;
                    } else {
                        const [nuevaAlergia] = await connection.query(
                            "INSERT INTO alergia (nombre) VALUES (?)",
                            [alergiaNombre]
                        );
                        alergiaId = nuevaAlergia.insertId;
                    }

                    await connection.query(
                        "INSERT INTO paciente_alergia (paciente_id, alergia_id) VALUES (?, ?)",
                        [id, alergiaId]
                    );
                }
            }

            // 3. Manejar patologías (reemplazar todas)
            if (patologias !== undefined) {
                await connection.query(
                    "DELETE FROM paciente_patologia WHERE paciente_id = ?",
                    [id]
                );

                for (const patologiaNombre of patologias) {
                    const [patologiaExistente] = await connection.query(
                        "SELECT id_Patologia FROM patologia WHERE nombre = ?",
                        [patologiaNombre]
                    );

                    let patologiaId;
                    if (patologiaExistente.length > 0) {
                        patologiaId = patologiaExistente[0].id_Patologia;
                    } else {
                        const [nuevaPatologia] = await connection.query(
                            "INSERT INTO patologia (nombre) VALUES (?)",
                            [patologiaNombre]
                        );
                        patologiaId = nuevaPatologia.insertId;
                    }

                    await connection.query(
                        "INSERT INTO paciente_patologia (paciente_id, patologia_id) VALUES (?, ?)",
                        [id, patologiaId]
                    );
                }
            }

            // 4. Manejar medicamentos (reemplazar todas)
            if (medicamentos !== undefined) {
                await connection.query(
                    "DELETE FROM paciente_medicamento WHERE paciente_id = ?",
                    [id]
                );

                for (const medicamentoNombre of medicamentos) {
                    const [medicamentoExistente] = await connection.query(
                        "SELECT id_Medicamento FROM medicamento WHERE nombre = ?",
                        [medicamentoNombre]
                    );

                    let medicamentoId;
                    if (medicamentoExistente.length > 0) {
                        medicamentoId = medicamentoExistente[0].id_Medicamento;
                    } else {
                        const [nuevoMedicamento] = await connection.query(
                            "INSERT INTO medicamento (nombre) VALUES (?)",
                            [medicamentoNombre]
                        );
                        medicamentoId = nuevoMedicamento.insertId;
                    }

                    await connection.query(
                        "INSERT INTO paciente_medicamento (paciente_id, medicamento_id) VALUES (?, ?)",
                        [id, medicamentoId]
                    );
                }
            }
        });

        return respuestaExitosa(res, null, "Paciente actualizado exitosamente");
    } catch (error) {
        console.error("Error actualizarPaciente:", error);
        return respuestaError(res, "Error al actualizar paciente", 500);
    }
};

module.exports = {
    crearPaciente,
    obtenerPacientes,
    obtenerPacientePorId,
    buscarPacientes,
    obtenerHistorialPaciente,
    actualizarPaciente
};