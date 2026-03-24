const express = require("express");
const router = express.Router();
const { verificarToken, verificarParamedico } = require("../middleware/auth");
const { validarSchema, sanitizarDatos } = require("../middleware/validacion");
const reporteSchema = require("../schemas/reporte");

const {
    crearReporte,
    obtenerReportes,
    obtenerReportePorId,
    obtenerReportesPorPaciente,
    obtenerReportesPorFecha,
    actualizarReporte,
    eliminarReporte,
    subirFotografias,
    obtenerFotografiasReporte,
    descargarReportePDF
} = require("../controllers/reportes");

// Protegidas - Paramedicos
// por el momento no usarmeos tanta cosa
//router.post("/", verificarToken, verificarParamedico, sanitizarDatos, validarSchema(reporteSchema.crear), crearReporte);
router.post("/", sanitizarDatos, validarSchema(reporteSchema.crear), crearReporte);

router.get("/", verificarToken, verificarParamedico, obtenerReportes);
router.get("/paciente/:pacienteId", verificarToken, verificarParamedico, obtenerReportesPorPaciente);
router.get("/fecha", verificarToken, verificarParamedico, obtenerReportesPorFecha);
router.get("/:id", verificarToken, verificarParamedico, obtenerReportePorId);
router.get("/:id/pdf", verificarToken, verificarParamedico, descargarReportePDF);
router.put("/:id", verificarToken, verificarParamedico, sanitizarDatos, validarSchema(reporteSchema.actualizar), actualizarReporte);
router.delete("/:id", verificarToken, verificarParamedico, eliminarReporte);

// Fotografias
router.post("/:id/fotografias", verificarToken, verificarParamedico, subirFotografias);
router.get("/:id/fotografias", verificarToken, verificarParamedico, obtenerFotografiasReporte);

module.exports = router;