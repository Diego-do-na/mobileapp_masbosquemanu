const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Token no proporcionado o formato inválido"
        });
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado"
        });
    }
};

// Middleware para verificar rol de admin
const verificarAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Acceso denegado: Se requiere rol de administrador"
        });
    }
    next();
};

// Middleware para verificar rol de paramédico
const verificarParamedico = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== "paramedico") {
        return res.status(403).json({
            success: false,
            message: "Acceso denegado: Se requiere rol de paramédico"
        });
    }
    next();
};

module.exports = {
    verificarToken,
    verificarAdmin,
    verificarParamedico
};