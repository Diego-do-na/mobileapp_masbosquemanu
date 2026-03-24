const db = require("../config/db_connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { respuestaExitosa, respuestaError } = require("../utils/helpers");

// Login paramédico
const loginParamedico = async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;

        // Validar datos básicos
        if (!usuario || !contrasena) {
            return respuestaError(res, "Usuario y contraseña son requeridos", 400);
        }

        // Buscar paramédico
        const [paramedicos] = await db.query(
            "SELECT id_paramedico, nombre, usuario, contraseña, correoInst, correoEsc FROM paramedico WHERE usuario = ?",
            [usuario]
        );

        if (paramedicos.length === 0) {
            return respuestaError(res, "Credenciales incorrectas", 401);
        }

        const paramedico = paramedicos[0];

        // Verificar contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, paramedico.contraseña);
        if (!contrasenaValida) {
            return respuestaError(res, "Credenciales incorrectas", 401);
        }

        /*

        // Generar token JWT
        const token = jwt.sign(
            {
                id: paramedico.id_paramedico,
                usuario: paramedico.usuario,
                nombre: paramedico.nombre,
                rol: "paramedico"
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        */

        // Remover contraseña de la respuesta
        delete paramedico.contraseña;

        return respuestaExitosa(res, {
            usuario: paramedico,
            expira: "24h"
        }, "Login exitoso");
    } catch (error) {
        console.error("Error loginParamedico:", error);
        return respuestaError(res, "Error en autenticación", 500);
    }
};

// Verificar sesión
const verificarSesion = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return respuestaError(res, "Token no proporcionado", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario aún existe
        const [usuarios] = await db.query(
            "SELECT id_paramedico, nombre, usuario FROM paramedico WHERE id_paramedico = ? AND usuario = ?",
            [decoded.id, decoded.usuario]
        );

        if (usuarios.length === 0) {
            return respuestaError(res, "Sesión inválida", 401);
        }

        return respuestaExitosa(res, {
            valido: true,
            usuario: usuarios[0],
            expira: new Date(decoded.exp * 1000)
        }, "Sesión válida");
    } catch (error) {
        console.error("Error verificarSesion:", error);
        return respuestaError(res, "Sesión inválida", 401);
    }
};

// Logout (solo en frontend, el token sigue válido hasta expirar)
const logoutParamedico = async (req, res) => {
    try {
        return respuestaExitosa(res, null, "Sesión cerrada exitosamente (eliminar token en frontend)");
    } catch (error) {
        console.error("Error logoutParamedico:", error);
        return respuestaError(res, "Error al cerrar sesión", 500);
    }
};

module.exports = {
    loginParamedico,
    verificarSesion,
    logoutParamedico
};