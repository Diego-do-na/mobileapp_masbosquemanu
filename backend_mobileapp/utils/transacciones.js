const db = require("../config/db_connection");

// Ejecutar múltiples consultas en transacción
const ejecutarEnTransaccion = async (operaciones) => {
    let connection;
    
    try {
        // Usar la función transaction que ya definimos en db_connection
        const resultado = await db.transaction(async (conn) => {
            const resultados = [];
            
            for (const operacion of operaciones) {
                const { sql, valores } = operacion;
                const [resultado] = await conn.query(sql, valores);
                resultados.push(resultado);
            }
            
            return resultados;
        });
        
        return resultado;
    } catch (error) {
        console.error("Error en transacción:", error);
        throw error;
    }
};

// Insertar con manejo de duplicados
const insertarOActualizar = async (tabla, datos, campoUnico) => {
    try {
        // Verificar si ya existe
        const [existente] = await db.query(
            `SELECT * FROM ${tabla} WHERE ${campoUnico} = ?`,
            [datos[campoUnico]]
        );
        
        if (existente.length > 0) {
            // Actualizar existente
            const id = existente[0][`id_${tabla}`];
            const campos = Object.keys(datos);
            const valores = Object.values(datos);
            
            const setClause = campos.map(campo => `${campo} = ?`).join(", ");
            
            await db.query(
                `UPDATE ${tabla} SET ${setClause} WHERE id_${tabla} = ?`,
                [...valores, id]
            );
            
            return id;
        } else {
            // Insertar nuevo
            const campos = Object.keys(datos);
            const valores = Object.values(datos);
            
            const placeholders = campos.map(() => "?").join(", ");
            
            const [resultado] = await db.query(
                `INSERT INTO ${tabla} (${campos.join(", ")}) VALUES (${placeholders})`,
                valores
            );
            
            return resultado.insertId;
        }
    } catch (error) {
        console.error(`Error en insertarOActualizar para tabla ${tabla}:`, error);
        throw error;
    }
};

module.exports = {
    ejecutarEnTransaccion,
    insertarOActualizar
};