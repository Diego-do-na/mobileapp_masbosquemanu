const { z } = require("zod");

const authParamedicoSchema = z.object({
    usuario: z.string()
        .min(1, "Usuario es requerido")
        .max(50, "Usuario no puede exceder 50 caracteres"),
    contrasena: z.string()
        .min(1, "Contraseña es requerida")
        .max(100, "Contraseña no puede exceder 100 caracteres")
});

module.exports = authParamedicoSchema;