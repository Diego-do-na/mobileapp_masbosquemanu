const { z } = require("zod");

const paramedicoSchema = {
    crear: z.object({
        nombre: z.string()
            .min(2, "Nombre debe tener al menos 2 caracteres")
            .max(100, "Nombre no puede exceder 100 caracteres"),
        correoInst: z
            .email("Correo institucional inválido")
            .max(100, "Correo no puede exceder 100 caracteres"),
        correoEsc: z
            .union([
                z.literal(''),  // Permite string vacío
                z.email("Correo escolar inválido")
                .max(100, "Correo no puede exceder 100 caracteres")
            ])
            .optional()
            .default(''),
        usuario: z.string()
            .min(4, "Usuario debe tener al menos 4 caracteres")
            .max(50, "Usuario no puede exceder 50 caracteres")
            .regex(/^[a-zA-Z0-9_]+$/, "Usuario solo puede contener letras, números y guiones bajos"),
        contrasena: z.string()
            .min(8, "Contraseña debe tener al menos 8 caracteres")
            .max(100, "Contraseña no puede exceder 100 caracteres")
            .regex(/[A-Z]/, "Contraseña debe contener al menos una mayúscula")
            .regex(/[0-9]/, "Contraseña debe contener al menos un número"),
        firma_paramedico: z.string()
            .min(10, "Firma inválida")
            .regex(/^data:image\/[a-zA-Z]+;base64,/, "Formato de imagen inválido")
            .optional()
    }),
    
    actualizar: z.object({
        nombre: z.string()
            .min(2)
            .max(100)
            .optional(),
        correoInst: z
            .email()
            .max(100)
            .optional(),
        correoEsc: z
            .email()
            .max(100)
            .optional(),
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
        firma_paramedico: z.string()
            .regex(/^data:image\/[a-zA-Z]+;base64,/)
            .optional()
    })
};

module.exports = paramedicoSchema;