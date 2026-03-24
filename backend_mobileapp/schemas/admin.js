const { z } = require("zod");

const adminSchema = {
    registro: z.object({
        usuario: z.string()
            .min(4, "Usuario debe tener al menos 4 caracteres")
            .max(50, "Usuario no puede exceder 50 caracteres")
            .regex(/^[a-zA-Z0-9_]+$/, "Usuario solo puede contener letras, números y guiones bajos"),
        contrasena: z.string()
            .min(8, "Contraseña debe tener al menos 8 caracteres")
            .max(100, "Contraseña no puede exceder 100 caracteres")
            .regex(/[A-Z]/, "Contraseña debe contener al menos una mayúscula")
            .regex(/[0-9]/, "Contraseña debe contener al menos un número"),
        correo: z.string()
            .email("Correo electrónico inválido")
            .max(100, "Correo no puede exceder 100 caracteres"),
        nombre: z.string()
            .min(2, "Nombre debe tener al menos 2 caracteres")
            .max(100, "Nombre no puede exceder 100 caracteres")
            .optional()
    }),
    
    login: z.object({
        usuario: z.string()
            .min(1, "Usuario es requerido"),
        contrasena: z.string()
            .min(1, "Contraseña es requerida")
    }),
    
    actualizacion: z.object({
        usuario: z.string()
            .min(4)
            .max(50)
            .regex(/^[a-zA-Z0-9_]+$/)
            .optional(),
        contrasena: z.string()
            .min(8)
            .max(100)
            .regex(/[A-Z]/)
            .regex(/[0-9]/)
            .optional(),
        correo: z.string()
            .email()
            .max(100)
            .optional(),
        nombre: z.string()
            .min(2)
            .max(100)
            .optional(),
        activo: z.boolean().optional()
    })
};

module.exports = adminSchema;