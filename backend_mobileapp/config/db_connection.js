const mysql = require("mysql2");
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "frap",
    port: process.env.DB_PORT || 3306,
    
    // Optimizaciones para servidor
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});

const db = pool.promise();

// Verificar conexion con reintentos
async function verificarConexion(maxRetries = 3, retryDelay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await db.query("SELECT 1");
            console.log("Conexion con base de datos establecida");
            return true;
        } catch (error) {
            console.log(`Intento ${attempt}/${maxRetries}: Error de conexion: ${error.message}`);
            
            if (attempt < maxRetries) {
                console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 1.5;
            } else {
                console.log("Todos los intentos de conexion fallaron");
                return false;
            }
        }
    }
}

// Funcion para transacciones
db.transaction = async (callback) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        connection.release();
        return result;
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Error en transaccion:", error);
        throw error;
    }
};

// Funciones de escape
db.escape = (value) => mysql.escape(value);
db.escapeId = (value) => mysql.escapeId(value);

verificarConexion();

module.exports = db;