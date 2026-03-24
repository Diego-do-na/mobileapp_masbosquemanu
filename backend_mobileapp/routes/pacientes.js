const express = require("express");
const router = express.Router();
const { verificarToken, verificarParamedico } = require("../middleware/auth");
const { validarSchema, sanitizarDatos } = require("../middleware/validacion");
const pacienteSchema = require("../schemas/paciente");

const {
    crearPaciente,
    obtenerPacientes,
    obtenerPacientePorId,
    actualizarPaciente,
    buscarPacientes,
    obtenerHistorialPaciente
} = require("../controllers/pacientes");

// Protegidas - Paramedicos
//por el momento sin token
//router.post("/", verificarToken, verificarParamedico, sanitizarDatos, validarSchema(pacienteSchema.crear), crearPaciente);
router.post("/", sanitizarDatos, validarSchema(pacienteSchema.crear), crearPaciente);

router.get("/", verificarToken, verificarParamedico, obtenerPacientes);
router.get("/buscar", verificarToken, verificarParamedico, buscarPacientes);
router.get("/:id", verificarToken, verificarParamedico, obtenerPacientePorId);
router.get("/:id/historial", verificarToken, verificarParamedico, obtenerHistorialPaciente);
router.put("/:id", verificarToken, verificarParamedico, sanitizarDatos, validarSchema(pacienteSchema.actualizar), actualizarPaciente);

module.exports = router;