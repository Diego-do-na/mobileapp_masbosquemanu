const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Hash de contraseñas
const hashContrasena = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
};

// Comparar contraseñas
const compararContrasenas = async (contrasena, hash) => {
    return await bcrypt.compare(contrasena, hash);
};

// Generar token JWT
const generarToken = (payload, expiresIn = "24h") => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verificar token JWT
const verificarToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Formatear respuesta exitosa
const respuestaExitosa = (res, data = null, mensaje = "Operación exitosa", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message: mensaje,
        data: data
    });
};

// Formatear respuesta de error
const respuestaError = (res, mensaje = "Error en la operación", statusCode = 400, errores = null) => {
    const respuesta = {
        success: false,
        message: mensaje
    };
    
    if (errores) {
        respuesta.errors = errores;
    }
    
    return res.status(statusCode).json(respuesta);
};

// Generar número de reporte único
const generarNumeroReporte = () => {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `RPT-${año}${mes}${dia}-${random}`;
};

// Validar formato de email
const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Limitar string a longitud máxima
const limitarString = (str, maxLength = 100) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + "...";
};

// Convertir base64 a Buffer
const base64ABuffer = (base64String) => {
    if (!base64String || !base64String.startsWith('data:image')) {
        return null;
    }
    
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(base64Data, 'base64');
};

// Obtener tipo MIME de imagen
const obtenerTipoMIME = (base64String) => {
    const match = base64String.match(/^data:(image\/\w+);base64,/);
    return match ? match[1] : 'image/png';
};

module.exports = {
    hashContrasena,
    compararContrasenas,
    generarToken,
    verificarToken,
    respuestaExitosa,
    respuestaError,
    generarNumeroReporte,
    validarEmail,
    limitarString,
    base64ABuffer,
    obtenerTipoMIME
};