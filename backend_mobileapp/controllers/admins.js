const db = require("../config/db_connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { respuestaExitosa, respuestaError } = require("../utils/helpers");

// Crear admin
const crearAdmin = async (req, res) => {
    try {
        const { usuario, contrasena, correo, nombre } = req.datosValidados;

        // Verificar duplicados
        const [duplicados] = await db.query(
            "SELECT id_admin FROM admin WHERE usuario = ? OR correo = ?",
            [usuario, correo]
        );

        if (duplicados.length > 0) {
            return respuestaError(res, "Usuario o correo ya registrado", 400);
        }

        // Hash de contraseña
        const hash = await bcrypt.hash(contrasena, 10);

        // Insertar admin
        const [resultado] = await db.query(
            "INSERT INTO admin (usuario, contraseña, correo, nombre) VALUES (?, ?, ?, ?)",
            [usuario, hash, correo, nombre || null]
        );

        return respuestaExitosa(res, { id: resultado.insertId }, "Admin creado exitosamente", 201);
    } catch (error) {
        console.error("Error crearAdmin:", error);
        return respuestaError(res, "Error al crear administrador", 500);
    }
};

// Login admin
const loginAdmin = async (req, res) => {
    try {
        const { usuario, contrasena } = req.datosValidados;

        // Buscar admin
        const [admins] = await db.query(
            "SELECT id_admin, usuario, contraseña, correo, nombre, activo FROM admin WHERE usuario = ?",
            [usuario]
        );

        if (admins.length === 0) {
            return respuestaError(res, "Credenciales incorrectas", 401);
        }

        const admin = admins[0];

        // Verificar si está activo
        if (!admin.activo) {
            return respuestaError(res, "Cuenta desactivada", 403);
        }

        // Verificar contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, admin.contraseña);
        if (!contrasenaValida) {
            return respuestaError(res, "Credenciales incorrectas", 401);
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: admin.id_admin,
                usuario: admin.usuario,
                nombre: admin.nombre,
                rol: "admin"
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Remover contraseña de la respuesta
        delete admin.contraseña;

        return respuestaExitosa(res, {
            token,
            usuario: admin,
            expira: "24h"
        }, "Login exitoso");
    } catch (error) {
        console.error("Error loginAdmin:", error);
        return respuestaError(res, "Error en autenticación", 500);
    }
};

// Obtener todos los admins
const obtenerAdmins = async (req, res) => {
    try {
        const [admins] = await db.query(
            "SELECT id_admin, usuario, correo, nombre, fecha_creacion, activo FROM admin ORDER BY fecha_creacion DESC"
        );

        return respuestaExitosa(res, admins);
    } catch (error) {
        console.error("Error obtenerAdmins:", error);
        return respuestaError(res, "Error al obtener administradores", 500);
    }
};

// Obtener admin por ID
const obtenerAdminPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [admins] = await db.query(
            "SELECT id_admin, usuario, correo, nombre, fecha_creacion, activo FROM admin WHERE id_admin = ?",
            [id]
        );

        if (admins.length === 0) {
            return respuestaError(res, "Administrador no encontrado", 404);
        }

        return respuestaExitosa(res, admins[0]);
    } catch (error) {
        console.error("Error obtenerAdminPorId:", error);
        return respuestaError(res, "Error al obtener administrador", 500);
    }
};

// Actualizar admin
const actualizarAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.datosValidados;

        // Verificar que existe
        const [existe] = await db.query(
            "SELECT id_admin FROM admin WHERE id_admin = ?",
            [id]
        );

        if (existe.length === 0) {
            return respuestaError(res, "Administrador no encontrado", 404);
        }

        // Preparar campos para actualizar
        const campos = [];
        const valores = [];

        if (datos.usuario !== undefined) {
            // Verificar duplicado de usuario
            const [duplicado] = await db.query(
                "SELECT id_admin FROM admin WHERE usuario = ? AND id_admin != ?",
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

        if (datos.correo !== undefined) {
            // Verificar duplicado de correo
            const [duplicado] = await db.query(
                "SELECT id_admin FROM admin WHERE correo = ? AND id_admin != ?",
                [datos.correo, id]
            );
            
            if (duplicado.length > 0) {
                return respuestaError(res, "El correo ya está en uso", 400);
            }
            campos.push("correo = ?");
            valores.push(datos.correo);
        }

        if (datos.nombre !== undefined) {
            campos.push("nombre = ?");
            valores.push(datos.nombre);
        }

        if (datos.activo !== undefined) {
            campos.push("activo = ?");
            valores.push(datos.activo ? 1 : 0);
        }

        if (campos.length === 0) {
            return respuestaError(res, "No hay datos para actualizar", 400);
        }

        valores.push(id);

        const sql = `UPDATE admin SET ${campos.join(", ")} WHERE id_admin = ?`;
        await db.query(sql, valores);

        return respuestaExitosa(res, null, "Administrador actualizado exitosamente");
    } catch (error) {
        console.error("Error actualizarAdmin:", error);
        return respuestaError(res, "Error al actualizar administrador", 500);
    }
};

// Eliminar admin (soft delete)
const eliminarAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que no sea el último admin activo
        const [adminsActivos] = await db.query(
            "SELECT COUNT(*) as total FROM admin WHERE activo = 1"
        );

        if (adminsActivos[0].total <= 1) {
            return respuestaError(res, "No se puede eliminar el último administrador activo", 400);
        }

        // Soft delete (desactivar)
        await db.query(
            "UPDATE admin SET activo = 0 WHERE id_admin = ?",
            [id]
        );

        return respuestaExitosa(res, null, "Administrador eliminado exitosamente");
    } catch (error) {
        console.error("Error eliminarAdmin:", error);
        return respuestaError(res, "Error al eliminar administrador", 500);
    }
};

module.exports = {
    crearAdmin,
    loginAdmin,
    obtenerAdmins,
    obtenerAdminPorId,
    actualizarAdmin,
    eliminarAdmin
};