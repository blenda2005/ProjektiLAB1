//const sql = require('mssql/msnodesqlv8');
//const dbConfig = require('../config/db');
//
//// CREATE
//async function createClient(status = 'Active', userId) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('status', sql.NVarChar(50), status)
//      .input('userId', sql.Int, userId)
//      .query(`
//        INSERT INTO Client (status, userId) VALUES (@status, @userId)
//      `);
//    return { message: 'Client created successfully' };
//  } catch (err) {
//    if (err.number === 547) {
//      const e = new Error('UserId nuk ekziston!');
//      e.status = 404;
//      throw e;
//    }
//    console.error('Gabim ne createClient:', err);
//    throw err;
//  }
//}
//
//// READ ALL
//async function getAllClients() {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request().query('SELECT * FROM Client');
//    return result.recordset;
//  } catch (err) {
//    console.error('Gabim ne getAllClients:', err);
//    throw err;
//  }
//}
//
//// READ BY ID
//async function getClientById(clientId) {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request()
//      .input('clientId', sql.Int, clientId)
//      .query('SELECT * FROM Client WHERE clientId = @clientId');
//    return result.recordset[0];
//  } catch (err) {
//    console.error('Gabim ne getClientById:', err);
//    throw err;
//  }
//}
//
//// UPDATE
//async function updateClient(clientId, updates) {
//  try {
//    await sql.connect(dbConfig);
//    const setClauses = [];
//    const request = new sql.Request();
//    request.input('clientId', sql.Int, clientId);
//    if (updates.status !== undefined) {
//      setClauses.push('status = @status');
//      request.input('status', sql.NVarChar(50), updates.status);
//    }
//    if (updates.userId !== undefined) {
//      setClauses.push('userId = @userId');
//      request.input('userId', sql.Int, updates.userId);
//    }
//    if (setClauses.length === 0) {
//      return { message: 'Nothing to update' };
//    }
//    const sqlString = `UPDATE Client SET ${setClauses.join(', ')} WHERE clientId = @clientId`;
//    await request.query(sqlString);
//    return { message: 'Client updated successfully' };
//  } catch (err) {
//    if (err.number === 547) {
//      const e = new Error('UserId nuk ekziston!');
//      e.status = 404;
//      throw e;
//    }
//    console.error('Gabim ne updateClient:', err);
//    throw err;
//  }
//}
//
//// DELETE
//async function deleteClient(clientId) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('clientId', sql.Int, clientId)
//      .query('DELETE FROM Client WHERE clientId = @clientId');
//    return { message: 'Client deleted successfully' };
//  } catch (err) {
//    console.error('Gabim ne deleteClient:', err);
//    throw err;
//  }
//}
//
//module.exports = {
//  createClient,
//  getAllClients,
//  getClientById,
//  updateClient,
//  deleteClient
//};
//


const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

async function updateClientStatus(userId, status) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input("userId", sql.Int, userId)
      .input("status", sql.NVarChar, status)
      .query("UPDATE Client SET status = @status WHERE userId = @userId");

    return { message: "Client updated successfully" };
  } catch (err) {
    console.error("Error updating client:", err);
    throw err;
  }
}

//read
async function getAllClients() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .query("SELECT * FROM Client");

    return result.recordset;
  } catch (err) {
    console.error("Error fetching all clients:", err);
    throw err;
  }
}


async function getClientByUserId(userId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Client WHERE userId = @userId");

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Error fetching client:", err);
    throw err;
  }
}

module.exports = {
  updateClientStatus,
  getAllClients,
  getClientByUserId
};

