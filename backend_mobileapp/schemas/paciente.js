const { z } = require("zod");

const pacienteSchema = {
    crear: z.object({
        nombre: z.string()
            .min(2, "Nombre debe tener al menos 2 caracteres")
            .max(100, "Nombre no puede exceder 100 caracteres")
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Nombre solo puede contener letras y espacios"),
        edad: z.number()
            .int("Edad debe ser un número entero")
            .min(0, "Edad mínima es 0")
            .max(120, "Edad máxima es 120"),
        genero: z.union([
            z.literal(0, { message: "Género: 0=Femenino, 1=Masculino, 2=Otro" }),
            z.literal(1, { message: "Género: 0=Femenino, 1=Masculino, 2=Otro" }),
            z.literal(2, { message: "Género: 0=Femenino, 1=Masculino, 2=Otro" })
        ]),
        alergias: z.array(z.string()
            .min(2, "Nombre de alergia muy corto")
            .max(100, "Nombre de alergia muy largo"))
            .max(20, "Máximo 20 alergias")
            .optional()
            .default([]),
        patologias: z.array(z.string()
            .min(2, "Nombre de patología muy corto")
            .max(100, "Nombre de patología muy largo"))
            .max(20, "Máximo 20 patologías")
            .optional()
            .default([]),
        medicamentos: z.array(z.string()
            .min(2, "Nombre de medicamento muy corto")
            .max(100, "Nombre de medicamento muy largo"))
            .max(20, "Máximo 20 medicamentos")
            .optional()
            .default([])
    }),
    
    actualizar: z.object({
        nombre: z.string()
            .min(2)
            .max(100)
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
            .optional(),
        edad: z.number()
            .int()
            .min(0)
            .max(120)
            .optional(),
        genero: z.union([
            z.literal(0),
            z.literal(1),
            z.literal(2)
        ]).optional(),
        alergias: z.array(z.string().min(2).max(100))
            .max(20)
            .optional(),
        patologias: z.array(z.string().min(2).max(100))
            .max(20)
            .optional(),
        medicamentos: z.array(z.string().min(2).max(100))
            .max(20)
            .optional()
    }),
    
    buscar: z.object({
        nombre: z.string().optional(),
        edadMin: z.number().int().min(0).max(120).optional(),
        edadMax: z.number().int().min(0).max(120).optional(),
        genero: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
        limite: z.number().int().min(1).max(100).optional().default(20),
        pagina: z.number().int().min(1).optional().default(1)
    })
};

module.exports = pacienteSchema;