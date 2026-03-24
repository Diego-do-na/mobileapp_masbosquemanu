const db = require("../config/db_connection");
const bcrypt = require("bcrypt");
const { respuestaExitosa, respuestaError, base64ABuffer } = require("../utils/helpers");

// Crear paramédico
const crearParamedico = async (req, res) => {
    try {
        const { nombre, correoInst, correoEsc, usuario, contrasena, firma_paramedico } = req.datosValidados;

        // Verificar duplicados
        const [duplicados] = await db.query(
            "SELECT id_paramedico FROM paramedico WHERE usuario = ? OR correoInst = ?",
            [usuario, correoInst]
        );

        if (duplicados.length > 0) {
            return respuestaError(res, "Usuario o correo institucional ya registrado", 400);
        }

        // Hash de contraseña
        const hash = await bcrypt.hash(contrasena, 10);

        // Convertir firma a Buffer
        const firmaBuffer = firma_paramedico ? base64ABuffer(firma_paramedico) : '';

        // Insertar paramédico
        const [resultado] = await db.query(
            "INSERT INTO paramedico (nombre, correoInst, correoEsc, usuario, contraseña, firma_paramedico) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, correoInst, correoEsc, usuario, hash, firmaBuffer]
        );

        return respuestaExitosa(res, { id: resultado.insertId }, "Paramédico creado exitosamente", 201);
    } catch (error) {
        console.error("Error crearParamedico:", error);
        return respuestaError(res, "Error al crear paramédico", 500);
    }
};

// Obtener todos los paramédicos
const obtenerParamedicos = async (req, res) => {
    try {
        const [paramedicos] = await db.query(
            "SELECT id_paramedico, nombre, correoInst, correoEsc, usuario FROM paramedico ORDER BY nombre"
        );

        return respuestaExitosa(res, paramedicos);
    } catch (error) {
        console.error("Error obtenerParamedicos:", error);
        return respuestaError(res, "Error al obtener paramédicos", 500);
    }
};

// Obtener paramédico por ID
const obtenerParamedicoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [paramedicos] = await db.query(
            "SELECT id_paramedico, nombre, correoInst, correoEsc, usuario FROM paramedico WHERE id_paramedico = ?",
            [id]
        );

        if (paramedicos.length === 0) {
            return respuestaError(res, "Paramédico no encontrado", 404);
        }

        return respuestaExitosa(res, paramedicos[0]);
    } catch (error) {
        console.error("Error obtenerParamedicoPorId:", error);
        return respuestaError(res, "Error al obtener paramédico", 500);
    }
};

// Obtener firma del paramédico
const obtenerFirmaParamedico = async (req, res) => {
    try {
        const { id } = req.params;

        const [paramedicos] = await db.query(
            "SELECT firma_paramedico FROM paramedico WHERE id_paramedico = ?",
            [id]
        );

        if (paramedicos.length === 0 || !paramedicos[0].firma_paramedico) {
            return respuestaError(res, "Firma no encontrada", 404);
        }

        const firmaBuffer = paramedicos[0].firma_paramedico;
        const firmaBase64 = `data:image/png;base64,${firmaBuffer.toString('base64')}`;

        return respuestaExitosa(res, { firma: firmaBase64 });
    } catch (error) {
        console.error("Error obtenerFirmaParamedico:", error);
        return respuestaError(res, "Error al obtener firma", 500);
    }
};

// Actualizar paramédico
const actualizarParamedico = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.datosValidados;

        // Verificar que existe
        const [existe] = await db.query(
            "SELECT id_paramedico FROM paramedico WHERE id_paramedico = ?",
            [id]
        );

        if (existe.length === 0) {
            return respuestaError(res, "Paramédico no encontrado", 404);
        }

        // Preparar campos para actualizar
        const campos = [];
        const valores = [];

        if (datos.nombre !== undefined) {
            campos.push("nombre = ?");
            valores.push(datos.nombre);
        }

        if (datos.correoInst !== undefined) {
            // Verificar duplicado de correo
            const [duplicado] = await db.query(
                "SELECT id_paramedico FROM paramedico WHERE correoInst = ? AND id_paramedico != ?",
                [datos.correoInst, id]
            );
            
            if (duplicado.length > 0) {
                return respuestaError(res, "El correo institucional ya está en uso", 400);
            }
            campos.push("correoInst = ?");
            valores.push(datos.correoInst);
        }

        if (datos.correoEsc !== undefined) {
            campos.push("correoEsc = ?");
            valores.push(datos.correoEsc || null);
        }

        if (datos.usuario !== undefined) {
            // Verificar duplicado de usuario
            const [duplicado] = await db.query(
                "SELECT id_paramedico FROM paramedico WHERE usuario = ? AND id_paramedico != ?",
                [datos.usuario, id]
            );
            
            if (duplicado.length > 0) {
                return respuestaError(res, "El usuario ya está en uso", 400);
            }
            campos.push("usuario = ?");
            valores.push(datos.usuario);
        }

        if (datos.contrasena !== undefined) {
            const hash = await bcrypt.hash(datos.contrasena, 10);
            campos.push("contraseña = ?");
            valores.push(hash);
        }

        if (datos.firma_paramedico !== undefined) {
            const firmaBuffer = base64ABuffer(datos.firma_paramedico);
            campos.push("firma_paramedico = ?");
            valores.push(firmaBuffer);
        }

        if (campos.length === 0) {
            return respuestaError(res, "No hay datos para actualizar", 400);
        }

        valores.push(id);

        const sql = `UPDATE paramedico SET ${campos.join(", ")} WHERE id_paramedico = ?`;
        await db.query(sql, valores);

        return respuestaExitosa(res, null, "Paramédico actualizado exitosamente");
    } catch (error) {
        console.error("Error actualizarParamedico:", error);
        return respuestaError(res, "Error al actualizar paramédico", 500);
    }
};

// Eliminar paramédico
const eliminarParamedico = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que existe
        const [existe] = await db.query(
            "SELECT id_paramedico FROM paramedico WHERE id_paramedico = ?",
            [id]
        );

        if (existe.length === 0) {
            return respuestaError(res, "Paramédico no encontrado", 404);
        }

        // Verificar si tiene reportes asociados
        const [reportes] = await db.query(
            "SELECT COUNT(*) as total FROM reporte" // Cambiar si agregas relación
        );

        if (parseInt(reportes[0].total) > 0) {
            return respuestaError(res, "No se puede eliminar paramédico con reportes asociados", 400);
        }

        await db.query(
            "DELETE FROM paramedico WHERE id_paramedico = ?",
            [id]
        );

        return respuestaExitosa(res, null, "Paramédico eliminado exitosamente");
    } catch (error) {
        console.error("Error eliminarParamedico:", error);
        return respuestaError(res, "Error al eliminar paramédico", 500);
    }
};

module.exports = {
    crearParamedico,
    obtenerParamedicos,
    obtenerParamedicoPorId,
    obtenerFirmaParamedico,
    actualizarParamedico,
    eliminarParamedico
};