const { z } = require("zod");

// Middleware para validación con Zod
const validarSchema = (schema) => {
    return (req, res, next) => {
        try {
            const resultado = schema.safeParse(req.body);
            
            if (!resultado.success) {
                const errores = resultado.error;
                
                return res.status(400).json({
                    success: false,
                    message: "Errores de validación",
                    errors: errores
                });
            }
            
            req.datosValidados = resultado.data;
            next();
        } catch (error) {
            console.error("Error en validación:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno en validación"
            });
        }
    };
};

// Sanitización básica de strings
const sanitizarInput = (obj) => {
    const sanitizado = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            // Remover espacios extra y tags HTML básicos
            sanitizado[key] = value
                .trim()
                .replace(/<[^>]*>/g, "")
                .replace(/\\/g, "")
                .replace(/\0/g, "");
        } else {
            sanitizado[key] = value;
        }
    }

    console.log(sanitizado);
    
    return sanitizado;
};

// Middleware de sanitización
const sanitizarDatos = (req, res, next) => {
    if (req.body) {
        req.body = sanitizarInput(req.body);
    }
    if (req.query) {
        req.query = sanitizarInput(req.query);
    }
    next();
};

module.exports = {
    validarSchema,
    sanitizarDatos
};