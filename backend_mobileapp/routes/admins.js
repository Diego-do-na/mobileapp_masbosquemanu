const express = require("express");
const router = express.Router();
const { verificarToken, verificarAdmin } = require("../middleware/auth");
const { validarSchema, sanitizarDatos } = require("../middleware/validacion");
const adminSchema = require("../schemas/admin");

const {
    crearAdmin,
    obtenerAdmins,
    obtenerAdminPorId,
    actualizarAdmin,
    eliminarAdmin,
    loginAdmin
} = require("../controllers/admins");

// Publicas
router.post("/login", sanitizarDatos, validarSchema(adminSchema.login), loginAdmin);
router.post("/registro", sanitizarDatos, validarSchema(adminSchema.registro), crearAdmin);

// Protegidas - Solo admins
router.get("/", verificarToken, verificarAdmin, obtenerAdmins);
router.get("/:id", verificarToken, verificarAdmin, obtenerAdminPorId);
router.put("/:id", verificarToken, verificarAdmin, sanitizarDatos, validarSchema(adminSchema.actualizacion), actualizarAdmin);
router.delete("/:id", verificarToken, verificarAdmin, eliminarAdmin);

module.exports = router;