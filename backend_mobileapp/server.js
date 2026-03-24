const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { manejarErrores } = require("./middleware/errores");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Lista de origenes permitidos
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:5173",

    "https://tudominio.com",
];

// Configuracion de CORS segura
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Origen no permitido por CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Rate limiting para prevenir ataques
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 solicitudes por IP
    message: "Demasiadas solicitudes desde esta IP, intente mas tarde",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Headers de seguridad
app.use(helmet({
    contentSecurityPolicy: false, // Desactivar si usas scripts externos
    crossOriginResourcePolicy: { policy: "same-site" }
}));

// Parseo de JSON con limite de tamaño
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging de solicitudes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rutas de la API
const adminRoutes = require("./routes/admins");
const pacientesRoutes = require("./routes/pacientes");
const paramedicoRoutes = require("./routes/paramedicos");
const reportesRoutes = require("./routes/reportes");
const authParamedicosRoutes = require("./routes/authParamedicos");

app.use("/api/admins", adminRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/paramedicos", paramedicoRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/authParamedicos", authParamedicosRoutes);

// Ruta de salud
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        service: "FRAP API"
    });
});

// Ruta principal
app.get("/", (req, res) => {
    res.send("Backend FRAP en funcionamiento");
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: "Ruta no encontrada" 
    });
});

// Middleware de errores global
app.use((err, req, res, next) => {
    console.error("Error global:", err);
    
    // Errores de CORS
    if (err.message === "Origen no permitido por CORS") {
        return res.status(403).json({ 
            success: false, 
            message: "Acceso no autorizado" 
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

app.use(manejarErrores);

// Iniciar servidor
app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor ejecutandose en puerto ${port}`);
    console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
});

// Manejo de cierre gracioso
process.on("SIGTERM", () => {
    console.log("Cerrando servidor...");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("Servidor interrumpido");
    process.exit(0);
});