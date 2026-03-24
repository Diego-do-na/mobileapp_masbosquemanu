const { z } = require("zod");

//por ahora no tan estricto con schema
//regex(/^data:image\/[a-zA-Z]+;base64,/, "Formato de firma inválido")

// Schema para insumos
const insumoSchema = z.object({
    nombre: z.string()
        .min(2, "Nombre de insumo muy corto")
        .max(100, "Nombre de insumo muy largo"),
    cantidad: z.number()
        .int("Cantidad debe ser un número entero")
        .min(1, "Cantidad mínima es 1")
        .max(1000, "Cantidad máxima es 1000")
});

// Schema para signos vitales
const signosVitalesSchema = z.object({
    Temp: z.number()
        .int("Temperatura debe ser un número"),
        
        //.min(30, "Temperatura mínima: 30°C")
        //.max(45, "Temperatura máxima: 45°C"),
    FC: z.number()
        .int("Frecuencia cardíaca debe ser un número"),
        //.min(30, "FC mínima: 30 lpm")
        //.max(250, "FC máxima: 250 lpm"),
    FR: z.number()
        .int("Frecuencia respiratoria debe ser un número"),
        //.min(6, "FR mínima: 6 rpm")
        //.max(60, "FR máxima: 60 rpm"),
    SpO2: z.number()
        .int("SpO2 debe ser un número"),
        //.min(60, "SpO2 mínima: 60%")
        //.max(100, "SpO2 máxima: 100%"),
    T_A: z.string()
        .regex(/^\d{2,3}\/\d{2,3}$/, "Formato de presión arterial inválido (ej: 120/80)"),
    GLU: z.number()
        .int("Glucosa debe ser un número")
        //.min(30, "Glucosa mínima: 30 mg/dL")
        //.max(600, "Glucosa máxima: 600 mg/dL")
});

// Schema para nivel de conciencia (Glasgow)
const nivelConcienciaSchema = z.object({
    motora: z.number()
        .int("Puntuación motora debe ser un número entero")
        .min(1, "Puntuación motora mínima: 1")
        .max(6, "Puntuación motora máxima: 6"),
    verbal: z.number()
        .int("Puntuación verbal debe ser un número entero")
        .min(1, "Puntuación verbal mínima: 1")
        .max(5, "Puntuación verbal máxima: 5"),
    ocular: z.number()
        .int("Puntuación ocular debe ser un número entero")
        .min(1, "Puntuación ocular mínima: 1")
        .max(4, "Puntuación ocular máxima: 4")
}).refine(data => {
    const total = data.motora + data.verbal + data.ocular;
    return total >= 3 && total <= 15;
}, {
    message: "Puntuación total Glasgow debe estar entre 3 y 15",
    path: ["total"]
});

// Schema principal para reportes
const reporteSchema = {
    crear: z.object({
        // Información del paciente
        paciente_id: z.number()
            .int("ID de paciente inválido")
            .positive("ID de paciente debe ser positivo"),
        
        // Información del reporte
        fecha_hora: z.string()
            .datetime("Fecha y hora inválida")
            .optional()
            .default(() => new Date().toISOString()),
        
        observaciones: z.string()
            .max(2000, "Observaciones muy largas (máx 2000 caracteres)")
            .optional()
            .default(""),
        
        recomendaciones: z.string()
            .max(2000, "Recomendaciones muy largas (máx 2000 caracteres)")
            .optional()
            .default(""),
        
        traslado_aceptado: z.boolean(),
        
        // Información del traslado
        numero_unidad: z.string()
            .max(50, "Número de unidad muy largo")
            .optional()
            .default(0),
        
        nombre_operador: z.string()
            .max(100, "Nombre de operador muy largo")
            .optional()
            .default(""),
        
        firma_operador: z.string()
            .optional()
            .default(""),
        
        firma_paciente: z.string(),
        
        nombre_testigo: z.string()
            .max(100, "Nombre de testigo muy largo")
            .optional()
            .default(""),
        
        firma_testigo: z.string()
            .optional()
            .default(""),
        
        // Ubicación
        lugar_nombre: z.string()
            .min(2, "Nombre del lugar muy corto")
            .max(100, "Nombre del lugar muy largo"),
        
        // Signos vitales (anidado)
        signos_vitales: signosVitalesSchema,
        
        // Nivel de conciencia (anidado)
        nivel_conciencia: nivelConcienciaSchema,
        
        // Arrays para relaciones M:M
        lesiones: z.array(z.string()
            .min(2, "Nombre de lesión muy corto")
            .max(100, "Nombre de lesión muy largo"))
            .max(20, "Máximo 20 lesiones")
            .optional()
            .default([]),
        
        pupilas: z.array(z.string()
            .min(2, "Descripción de pupilas muy corta")
            .max(100, "Descripción de pupilas muy larga"))
            .max(10, "Máximo 10 descripciones de pupilas")
            .optional()
            .default([]),
        
        anatomicas: z.array(z.string()
            .min(2, "Descripción anatómica muy corta")
            .max(100, "Descripción anatómica muy larga"))
            .max(20, "Máximo 20 áreas anatómicas")
            .optional()
            .default([]),
        
        insumos: z.array(insumoSchema)
            .max(50, "Máximo 50 insumos")
            .optional()
            .default([]),
        
        fotografias: z.array(z.string()
            .regex(/^data:image\/[a-zA-Z]+;base64,/, "Formato de imagen inválido"))
            .max(10, "Máximo 10 fotografías")
            .optional()
            .default([])
    }),
    
    actualizar: z.object({
        observaciones: z.string().max(2000).optional(),
        recomendaciones: z.string().max(2000).optional(),
        traslado_aceptado: z.boolean().optional(),
        numero_unidad: z.string().max(50).optional(),
        nombre_operador: z.string().max(100).optional(),
        firma_operador: z.string().regex(/^data:image\/[a-zA-Z]+;base64,/).optional(),
        firma_paciente: z.string().regex(/^data:image\/[a-zA-Z]+;base64,/).optional(),
        nombre_testigo: z.string().max(100).optional(),
        firma_testigo: z.string().regex(/^data:image\/[a-zA-Z]+;base64,/).optional(),
        lugar_nombre: z.string().max(100).optional(),
        signos_vitales: signosVitalesSchema.optional(),
        nivel_conciencia: nivelConcienciaSchema.optional(),
        lesiones: z.array(z.string().max(100)).max(20).optional(),
        pupilas: z.array(z.string().max(100)).max(10).optional(),
        anatomicas: z.array(z.string().max(100)).max(20).optional(),
        insumos: z.array(insumoSchema).max(50).optional(),
        fotografias: z.array(z.string().regex(/^data:image\/[a-zA-Z]+;base64,/)).max(10).optional()
    }),
    
    buscar: z.object({
        pacienteId: z.number().int().positive().optional(),
        fechaInicio: z.string().datetime().optional(),
        fechaFin: z.string().datetime().optional(),
        lugar: z.string().optional(),
        numeroUnidad: z.string().optional(),
        limite: z.number().int().min(1).max(100).optional().default(20),
        pagina: z.number().int().min(1).optional().default(1),
        ordenarPor: z.enum(["fecha_hora", "paciente_id", "lugar_id"]).optional().default("fecha_hora"),
        orden: z.enum(["ASC", "DESC"]).optional().default("DESC")
    })
};

module.exports = reporteSchema;