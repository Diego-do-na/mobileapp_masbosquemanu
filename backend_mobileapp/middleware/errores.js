// Clases personalizadas de errores
class ErrorAPI extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperacional = true;
    }
}

class ErrorValidacion extends ErrorAPI {
    constructor(message = "Error de validación") {
        super(message, 400);
    }
}

class ErrorNoEncontrado extends ErrorAPI {
    constructor(message = "Recurso no encontrado") {
        super(message, 404);
    }
}

class ErrorNoAutorizado extends ErrorAPI {
    constructor(message = "No autorizado") {
        super(message, 401);
    }
}

class ErrorProhibido extends ErrorAPI {
    constructor(message = "Acceso prohibido") {
        super(message, 403);
    }
}

// Middleware para manejo de errores
const manejarErrores = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Error interno del servidor";
    
    // Log para desarrollo
    if (process.env.NODE_ENV === "development") {
        console.error("Error:", {
            mensaje: err.message,
            stack: err.stack,
            ruta: req.path,
            metodo: req.method,
            timestamp: new Date().toISOString()
        });
    } else {
        console.error("Error:", err.message);
    }
    
    // Errores de base de datos
    if (err.code === "ER_DUP_ENTRY") {
        err.message = "Registro duplicado";
        err.statusCode = 409;
    }
    
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        err.message = "Referencia a registro inexistente";
        err.statusCode = 400;
    }
    
    if (err.code === "ER_DATA_TOO_LONG") {
        err.message = "Datos demasiado largos";
        err.statusCode = 400;
    }
    
    // Respuesta al cliente
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

module.exports = {
    ErrorAPI,
    ErrorValidacion,
    ErrorNoEncontrado,
    ErrorNoAutorizado,
    ErrorProhibido,
    manejarErrores
};