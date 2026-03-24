const db = require("../config/db_connection");
const { respuestaExitosa, respuestaError, base64ABuffer } = require("../utils/helpers");
const { ejecutarEnTransaccion } = require("../utils/transacciones");

// Función auxiliar para insertar o obtener ID de una tabla de lookup
const insertarObtenerId = async (tabla, nombre, columnaId) => {
    if (!nombre) return null;
    
    const [existente] = await db.query(
        `SELECT ${columnaId} FROM ${tabla} WHERE nombre = ?`,
        [nombre]
    );
    
    if (existente.length > 0) {
        return existente[0][columnaId];
    }
    
    const [resultado] = await db.query(
        `INSERT INTO ${tabla} (nombre) VALUES (?)`,
        [nombre]
    );
    
    return resultado.insertId;
};

// Función auxiliar para procesar arrays de relaciones M:M
const procesarRelacionesMM = async (reporteId, items, tablaLookup, columnaIdLookup, tablaRelacion, columnaRelacion) => {
    if (!items || items.length === 0) return;
    
    for (const itemNombre of items) {
        const lookupId = await insertarObtenerId(tablaLookup, itemNombre, columnaIdLookup);
        
        if (lookupId) {
            await db.query(
                `INSERT INTO ${tablaRelacion} (reporte_id, ${columnaRelacion}) VALUES (?, ?)`,
                [reporteId, lookupId]
            );
        }
    }
};

// Crear reporte completo con transacción
const crearReporte = async (req, res) => {
    try {
        const {
            paciente_id,
            fecha_hora,
            observaciones,
            recomendaciones,
            traslado_aceptado,
            numero_unidad,
            nombre_operador,
            firma_operador,
            firma_paciente,
            nombre_testigo,
            firma_testigo,
            lugar_nombre,
            signos_vitales,
            nivel_conciencia,
            lesiones,
            pupilas,
            anatomicas,
            insumos,
            fotografias
        } = req.datosValidados;

        // Verificar que el paciente existe
        const [pacienteExiste] = await db.query(
            "SELECT id_Paciente FROM paciente WHERE id_Paciente = ?",
            [paciente_id]
        );

        if (pacienteExiste.length === 0) {
            return respuestaError(res, "Paciente no encontrado", 404);
        }

        // Usar transacción para todas las inserciones
        const resultado = await ejecutarEnTransaccion([
            // 1. Insertar lugar
            {
                sql: "INSERT INTO lugar (nombre) VALUES (?)",
                valores: [lugar_nombre]
            },
            
            // 2. Insertar signos vitales
            {
                sql: "INSERT INTO signos_vitales (Temp, FC, FR, SpO2, T_A, GLU) VALUES (?, ?, ?, ?, ?, ?)",
                valores: [
                    signos_vitales.Temp,
                    signos_vitales.FC,
                    signos_vitales.FR,
                    signos_vitales.SpO2,
                    signos_vitales.T_A,
                    signos_vitales.GLU
                ]
            },
            
            // 3. Insertar nivel de conciencia (calcular total)
            {
                sql: "INSERT INTO nivel_conciencia (motora, verbal, ocular, total) VALUES (?, ?, ?, ?)",
                valores: [
                    nivel_conciencia.motora,
                    nivel_conciencia.verbal,
                    nivel_conciencia.ocular,
                    nivel_conciencia.motora + nivel_conciencia.verbal + nivel_conciencia.ocular
                ]
            }
        ]);

        const lugarId = resultado[0].insertId;
        const signosId = resultado[1].insertId;
        const nivelConcienciaId = resultado[2].insertId;

        // 4. Insertar reporte principal
        const firmaPacienteBuffer = base64ABuffer(firma_paciente);
        const firmaOperadorBuffer = firma_operador ? base64ABuffer(firma_operador) : null;
        const firmaTestigoBuffer = firma_testigo ? base64ABuffer(firma_testigo) : null;

        const [reporteResultado] = await db.query(
            `INSERT INTO reporte (
                paciente_id, fecha_hora, observaciones, recomendaciones,
                traslado_aceptado, numero_unidad, nombre_operador, firma_operador,
                firma_paciente, nombre_testigo, firma_testigo,
                lugar_id, signos_id, nivel_conciencia_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                paciente_id,
                fecha_hora,
                observaciones || '',
                recomendaciones || '',
                traslado_aceptado ? 1 : 0,
                numero_unidad,
                nombre_operador || null,
                firmaOperadorBuffer,
                firmaPacienteBuffer,
                nombre_testigo || null,
                firmaTestigoBuffer,
                lugarId,
                signosId,
                nivelConcienciaId
            ]
        );

        const reporteId = reporteResultado.insertId;

        // 5. Procesar relaciones M:M
        await Promise.all([
            procesarRelacionesMM(reporteId, lesiones, 'lesion', 'id_Lesion', 'reporte_lesion', 'lesion_id'),
            procesarRelacionesMM(reporteId, pupilas, 'pupilas', 'id_Pupilas', 'reporte_pupilas', 'pupilas_id'),
            procesarRelacionesMM(reporteId, anatomicas, 'anatomica', 'id_Anatomica', 'reporte_anatomica', 'anatomica_id')
        ]);

        // 6. Procesar insumos
        if (insumos && insumos.length > 0) {
            for (const insumo of insumos) {
                const [resultado] = await db.query(
                        "INSERT INTO insumo (nombre, cantidad) VALUES (?, ?)",
                        [insumo.nombre, insumo.cantidad]
                    );

                const insumoId = resultado.insertId;
                
                // Relacionar con reporte
                await db.query(
                    "INSERT INTO reporte_insumo (reporte_id, insumo_id) VALUES (?, ?)",
                    [reporteId, insumoId]
                );
            }
        }

        // 7. Procesar fotografías
        if (fotografias && fotografias.length > 0) {
            for (const fotoBase64 of fotografias) {
                const fotoBuffer = base64ABuffer(fotoBase64);
                
                await db.query(
                    "INSERT INTO fotografias (reporte_id, foto) VALUES (?, ?)",
                    [reporteId, fotoBuffer]
                );
            }
        }

        return respuestaExitosa(res, { id: reporteId }, "Reporte creado exitosamente", 201);
    } catch (error) {
        console.error("Error crearReporte:", error);
        return respuestaError(res, "Error al crear reporte", 500);
    }
};

// Obtener todos los reportes
const obtenerReportes = async (req, res) => {
    try {
        const { limite = 20, pagina = 1 } = req.query;
        const offset = (pagina - 1) * limite;

        const [reportes] = await db.query(
            `SELECT r.id_Reporte, r.fecha_hora, r.traslado_aceptado, r.numero_unidad,
             p.nombre as paciente_nombre, p.edad as paciente_edad,
             l.nombre as lugar_nombre,
             sv.Temp, sv.FC, sv.FR, sv.SpO2, sv.T_A, sv.GLU
             FROM reporte r
             JOIN paciente p ON r.paciente_id = p.id_Paciente
             JOIN lugar l ON r.lugar_id = l.id_Lugar
             JOIN signos_vitales sv ON r.signos_id = sv.id_Signos
             ORDER BY r.fecha_hora DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limite), parseInt(offset)]
        );

        // Contar total
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM reporte"
        );

        return respuestaExitosa(res, {
            reportes,
            paginacion: {
                total: totalResult[0].total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(totalResult[0].total / limite)
            }
        });
    } catch (error) {
        console.error("Error obtenerReportes:", error);
        return respuestaError(res, "Error al obtener reportes", 500);
    }
};

// Obtener reporte por ID
const obtenerReportePorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener reporte básico
        const [reportes] = await db.query(
            `SELECT r.*, 
             p.nombre as paciente_nombre, p.edad as paciente_edad, p.genero as paciente_genero,
             l.nombre as lugar_nombre,
             sv.Temp, sv.FC, sv.FR, sv.SpO2, sv.T_A, sv.GLU,
             nc.motora, nc.verbal, nc.ocular, nc.total
             FROM reporte r
             JOIN paciente p ON r.paciente_id = p.id_Paciente
             JOIN lugar l ON r.lugar_id = l.id_Lugar
             JOIN signos_vitales sv ON r.signos_id = sv.id_Signos
             JOIN nivel_conciencia nc ON r.nivel_conciencia_id = nc.id_NivelConciencia
             WHERE r.id_Reporte = ?`,
            [id]
        );

        if (reportes.length === 0) {
            return respuestaError(res, "Reporte no encontrado", 404);
        }

        const reporte = reportes[0];

        // Convertir firmas a base64
        if (reporte.firma_paciente) {
            reporte.firma_paciente = `data:image/png;base64,${reporte.firma_paciente.toString('base64')}`;
        }
        if (reporte.firma_operador) {
            reporte.firma_operador = `data:image/png;base64,${reporte.firma_operador.toString('base64')}`;
        }
        if (reporte.firma_testigo) {
            reporte.firma_testigo = `data:image/png;base64,${reporte.firma_testigo.toString('base64')}`;
        }

        // Obtener lesiones
        const [lesiones] = await db.query(
            `SELECT l.nombre 
             FROM lesion l
             JOIN reporte_lesion rl ON l.id_Lesion = rl.lesion_id
             WHERE rl.reporte_id = ?`,
            [id]
        );
        reporte.lesiones = lesiones.map(l => l.nombre);

        // Obtener pupilas
        const [pupilas] = await db.query(
            `SELECT p.nombre 
             FROM pupilas p
             JOIN reporte_pupilas rp ON p.id_Pupilas = rp.pupilas_id
             WHERE rp.reporte_id = ?`,
            [id]
        );
        reporte.pupilas = pupilas.map(p => p.nombre);

        // Obtener áreas anatómicas
        const [anatomicas] = await db.query(
            `SELECT a.nombre 
             FROM anatomica a
             JOIN reporte_anatomica ra ON a.id_Anatomica = ra.anatomica_id
             WHERE ra.reporte_id = ?`,
            [id]
        );
        reporte.anatomicas = anatomicas.map(a => a.nombre);

        // Obtener insumos utilizados
        const [insumos] = await db.query(
            `SELECT i.nombre, ri.cantidad_usada as cantidad
             FROM insumo i
             JOIN reporte_insumo ri ON i.id_Insumo = ri.insumo_id
             WHERE ri.reporte_id = ?`,
            [id]
        );
        reporte.insumos = insumos;

        // Obtener alergias del paciente
        const [alergias] = await db.query(
            `SELECT a.nombre 
             FROM alergia a
             JOIN paciente_alergia pa ON a.id_Alergia = pa.alergia_id
             WHERE pa.paciente_id = ?`,
            [reporte.paciente_id]
        );
        reporte.alergias_paciente = alergias.map(a => a.nombre);

        // Obtener patologías del paciente
        const [patologias] = await db.query(
            `SELECT pt.nombre 
             FROM patologia pt
             JOIN paciente_patologia pp ON pt.id_Patologia = pp.patologia_id
             WHERE pp.paciente_id = ?`,
            [reporte.paciente_id]
        );
        reporte.patologias_paciente = patologias.map(p => p.nombre);

        // Obtener medicamentos del paciente
        const [medicamentos] = await db.query(
            `SELECT m.nombre 
             FROM medicamento m
             JOIN paciente_medicamento pm ON m.id_Medicamento = pm.medicamento_id
             WHERE pm.paciente_id = ?`,
            [reporte.paciente_id]
        );
        reporte.medicamentos_paciente = medicamentos.map(m => m.nombre);

        return respuestaExitosa(res, reporte);
    } catch (error) {
        console.error("Error obtenerReportePorId:", error);
        return respuestaError(res, "Error al obtener reporte", 500);
    }
};

// Obtener reportes por paciente
const obtenerReportesPorPaciente = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { limite = 20, pagina = 1 } = req.query;
        const offset = (pagina - 1) * limite;

        // Verificar que el paciente existe
        const [pacienteExiste] = await db.query(
            "SELECT id_Paciente FROM paciente WHERE id_Paciente = ?",
            [pacienteId]
        );

        if (pacienteExiste.length === 0) {
            return respuestaError(res, "Paciente no encontrado", 404);
        }

        const [reportes] = await db.query(
            `SELECT r.id_Reporte, r.fecha_hora, r.traslado_aceptado, r.numero_unidad,
             l.nombre as lugar_nombre,
             sv.Temp, sv.FC, sv.FR, sv.SpO2, sv.T_A, sv.GLU
             FROM reporte r
             JOIN lugar l ON r.lugar_id = l.id_Lugar
             JOIN signos_vitales sv ON r.signos_id = sv.id_Signos
             WHERE r.paciente_id = ?
             ORDER BY r.fecha_hora DESC
             LIMIT ? OFFSET ?`,
            [pacienteId, parseInt(limite), parseInt(offset)]
        );

        // Contar total
        const [totalResult] = await db.query(
            "SELECT COUNT(*) as total FROM reporte WHERE paciente_id = ?",
            [pacienteId]
        );

        return respuestaExitosa(res, {
            reportes,
            paginacion: {
                total: totalResult[0].total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(totalResult[0].total / limite)
            }
        });
    } catch (error) {
        console.error("Error obtenerReportesPorPaciente:", error);
        return respuestaError(res, "Error al obtener reportes del paciente", 500);
    }
};

// Obtener reportes por fecha
const obtenerReportesPorFecha = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, limite = 20, pagina = 1 } = req.query;
        const offset = (pagina - 1) * limite;

        let condiciones = [];
        let valores = [];

        if (fechaInicio) {
            condiciones.push("r.fecha_hora >= ?");
            valores.push(fechaInicio);
        }

        if (fechaFin) {
            condiciones.push("r.fecha_hora <= ?");
            valores.push(fechaFin);
        }

        const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

        const [reportes] = await db.query(
            `SELECT r.id_Reporte, r.fecha_hora, r.traslado_aceptado, r.numero_unidad,
             p.nombre as paciente_nombre,
             l.nombre as lugar_nombre
             FROM reporte r
             JOIN paciente p ON r.paciente_id = p.id_Paciente
             JOIN lugar l ON r.lugar_id = l.id_Lugar
             ${whereClause}
             ORDER BY r.fecha_hora DESC
             LIMIT ? OFFSET ?`,
            [...valores, parseInt(limite), parseInt(offset)]
        );

        // Contar total
        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM reporte r ${whereClause}`,
            valores
        );

        return respuestaExitosa(res, {
            reportes,
            paginacion: {
                total: totalResult[0].total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(totalResult[0].total / limite)
            }
        });
    } catch (error) {
        console.error("Error obtenerReportesPorFecha:", error);
        return respuestaError(res, "Error al obtener reportes por fecha", 500);
    }
};

// Actualizar reporte
const actualizarReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.datosValidados;

        // Verificar que el reporte existe
        const [reporteExiste] = await db.query(
            "SELECT id_Reporte FROM reporte WHERE id_Reporte = ?",
            [id]
        );

        if (reporteExiste.length === 0) {
            return respuestaError(res, "Reporte no encontrado", 404);
        }

        // Actualizar campos básicos del reporte
        const camposReporte = [];
        const valoresReporte = [];

        if (datos.observaciones !== undefined) {
            camposReporte.push("observaciones = ?");
            valoresReporte.push(datos.observaciones);
        }

        if (datos.recomendaciones !== undefined) {
            camposReporte.push("recomendaciones = ?");
            valoresReporte.push(datos.recomendaciones);
        }

        if (datos.traslado_aceptado !== undefined) {
            camposReporte.push("traslado_aceptado = ?");
            valoresReporte.push(datos.traslado_aceptado ? 1 : 0);
        }

        if (datos.numero_unidad !== undefined) {
            camposReporte.push("numero_unidad = ?");
            valoresReporte.push(datos.numero_unidad);
        }

        if (datos.nombre_operador !== undefined) {
            camposReporte.push("nombre_operador = ?");
            valoresReporte.push(datos.nombre_operador || null);
        }

        if (datos.firma_operador !== undefined) {
            const firmaBuffer = base64ABuffer(datos.firma_operador);
            camposReporte.push("firma_operador = ?");
            valoresReporte.push(firmaBuffer);
        }

        if (datos.firma_paciente !== undefined) {
            const firmaBuffer = base64ABuffer(datos.firma_paciente);
            camposReporte.push("firma_paciente = ?");
            valoresReporte.push(firmaBuffer);
        }

        if (datos.nombre_testigo !== undefined) {
            camposReporte.push("nombre_testigo = ?");
            valoresReporte.push(datos.nombre_testigo || null);
        }

        if (datos.firma_testigo !== undefined) {
            const firmaBuffer = base64ABuffer(datos.firma_testigo);
            camposReporte.push("firma_testigo = ?");
            valoresReporte.push(firmaBuffer);
        }

        if (camposReporte.length > 0) {
            valoresReporte.push(id);
            await db.query(
                `UPDATE reporte SET ${camposReporte.join(", ")} WHERE id_Reporte = ?`,
                valoresReporte
            );
        }

        return respuestaExitosa(res, null, "Reporte actualizado exitosamente");
    } catch (error) {
        console.error("Error actualizarReporte:", error);
        return respuestaError(res, "Error al actualizar reporte", 500);
    }
};

// Eliminar reporte
const eliminarReporte = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que existe
        const [reporteExiste] = await db.query(
            "SELECT id_Reporte FROM reporte WHERE id_Reporte = ?",
            [id]
        );

        if (reporteExiste.length === 0) {
            return respuestaError(res, "Reporte no encontrado", 404);
        }

        // Usar transacción para eliminar todo relacionado
        await ejecutarEnTransaccion([
            // Eliminar relaciones M:M
            { sql: "DELETE FROM reporte_lesion WHERE reporte_id = ?", valores: [id] },
            { sql: "DELETE FROM reporte_pupilas WHERE reporte_id = ?", valores: [id] },
            { sql: "DELETE FROM reporte_anatomica WHERE reporte_id = ?", valores: [id] },
            { sql: "DELETE FROM reporte_insumo WHERE reporte_id = ?", valores: [id] },
            { sql: "DELETE FROM fotografias WHERE reporte_id = ?", valores: [id] },
            
            // Obtener IDs de tablas relacionadas para eliminarlas después
            { sql: "SELECT lugar_id, signos_id, nivel_conciencia_id FROM reporte WHERE id_Reporte = ?", valores: [id] }
        ]);

        // Eliminar el reporte principal
        await db.query(
            "DELETE FROM reporte WHERE id_Reporte = ?",
            [id]
        );

        // NOTA: No eliminamos lugar, signos_vitales, nivel_conciencia 
        // por si otros reportes los usan (en un sistema real habría que verificar)

        return respuestaExitosa(res, null, "Reporte eliminado exitosamente");
    } catch (error) {
        console.error("Error eliminarReporte:", error);
        return respuestaError(res, "Error al eliminar reporte", 500);
    }
};

// Subir fotografías a un reporte
const subirFotografias = async (req, res) => {
    try {
        const { id } = req.params;
        const { fotografias } = req.body;

        if (!fotografias || !Array.isArray(fotografias) || fotografias.length === 0) {
            return respuestaError(res, "No se proporcionaron fotografías", 400);
        }

        // Verificar que el reporte existe
        const [reporteExiste] = await db.query(
            "SELECT id_Reporte FROM reporte WHERE id_Reporte = ?",
            [id]
        );

        if (reporteExiste.length === 0) {
            return respuestaError(res, "Reporte no encontrado", 404);
        }

        // Limitar número de fotos
        if (fotografias.length > 10) {
            return respuestaError(res, "Máximo 10 fotografías por reporte", 400);
        }

        // Procesar cada foto
        for (const fotoBase64 of fotografias) {
            if (!fotoBase64.startsWith('data:image')) {
                return respuestaError(res, "Formato de imagen inválido", 400);
            }

            const fotoBuffer = base64ABuffer(fotoBase64);
            
            // Verificar tamaño (max 5MB)
            if (fotoBuffer.length > 5 * 1024 * 1024) {
                return respuestaError(res, "Cada foto debe ser menor a 5MB", 400);
            }

            await db.query(
                "INSERT INTO fotografias (reporte_id, foto) VALUES (?, ?)",
                [id, fotoBuffer]
            );
        }

        return respuestaExitosa(res, null, "Fotografías subidas exitosamente");
    } catch (error) {
        console.error("Error subirFotografias:", error);
        return respuestaError(res, "Error al subir fotografías", 500);
    }
};

// Obtener fotografías de un reporte
const obtenerFotografiasReporte = async (req, res) => {
    try {
        const { id } = req.params;

        const [fotografias] = await db.query(
            "SELECT id_Fotografia, foto FROM fotografias WHERE reporte_id = ?",
            [id]
        );

        // Convertir a base64
        const fotosBase64 = fotografias.map(foto => ({
            id: foto.id_Fotografia,
            imagen: `data:image/png;base64,${foto.foto.toString('base64')}`
        }));

        return respuestaExitosa(res, { fotografias: fotosBase64 });
    } catch (error) {
        console.error("Error obtenerFotografiasReporte:", error);
        return respuestaError(res, "Error al obtener fotografías", 500);
    }
};

// Descargar reporte en PDF (esqueleto - necesitarías implementar PDF generation)
const descargarReportePDF = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener reporte completo
        const [reportes] = await db.query(
            `SELECT r.*, 
             p.nombre as paciente_nombre, p.edad as paciente_edad, p.genero as paciente_genero,
             l.nombre as lugar_nombre,
             sv.Temp, sv.FC, sv.FR, sv.SpO2, sv.T_A, sv.GLU,
             nc.motora, nc.verbal, nc.ocular, nc.total
             FROM reporte r
             JOIN paciente p ON r.paciente_id = p.id_Paciente
             JOIN lugar l ON r.lugar_id = l.id_Lugar
             JOIN signos_vitales sv ON r.signos_id = sv.id_Signos
             JOIN nivel_conciencia nc ON r.nivel_conciencia_id = nc.id_NivelConciencia
             WHERE r.id_Reporte = ?`,
            [id]
        );

        if (reportes.length === 0) {
            return respuestaError(res, "Reporte no encontrado", 404);
        }

        // TODO: Implementar generación de PDF con una librería como pdfkit
        // Por ahora solo devolvemos los datos
        return respuestaExitosa(res, {
            mensaje: "Funcionalidad de PDF pendiente de implementar",
            datos: reportes[0]
        });

        // Ejemplo con pdfkit:
        // const PDFDocument = require('pdfkit');
        // const doc = new PDFDocument();
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `attachment; filename=reporte-${id}.pdf`);
        // doc.pipe(res);
        // doc.text(`Reporte Médico #${id}`);
        // ...
        // doc.end();
    } catch (error) {
        console.error("Error descargarReportePDF:", error);
        return respuestaError(res, "Error al generar PDF", 500);
    }
};

module.exports = {
    crearReporte,
    obtenerReportes,
    obtenerReportePorId,
    obtenerReportesPorPaciente,
    obtenerReportesPorFecha,
    actualizarReporte,
    eliminarReporte,
    subirFotografias,
    obtenerFotografiasReporte,
    descargarReportePDF
};