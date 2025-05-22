const sql      = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

//CREATE
async function createAdmin(responsibility, userId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('responsibility', sql.NVarChar(255), responsibility)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO Admin (responsibility, userId) VALUES (@responsibility, @userId)
      `);
    return { message: 'Admin created successfully' };
  } catch (err) {
    if (err.number === 547) {
      const e = new Error('UserId nuk ekziston!');
      e.status = 404;
      throw e;
    }
    console.error('Gabim ne createAdmin:', err);
    throw err;
  }
}

//READ ALL
async function getAllAdmins() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Admin');
    return result.recordset;
  } catch (err) {
    console.error('Gabim ne getAllAdmins:', err);
    throw err;
  }
}

//READ BY ID
async function getAdminById(adminId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('adminId', sql.Int, adminId)
      .query('SELECT * FROM Admin WHERE adminId = @adminId');
    return result.recordset[0];
  } catch (err) {
    console.error('Gabim ne getAdminById:', err);
    throw err;
  }
}

//UPDATE
async function updateAdmin(adminId, updates) {
  try {
    await sql.connect(dbConfig);
    const setClauses = [];
    const request = new sql.Request();
    request.input('adminId', sql.Int, adminId);
    if (updates.responsibility !== undefined) {
      setClauses.push('responsibility = @responsibility');
      request.input('responsibility', sql.NVarChar(255), updates.responsibility);
    }
    if (updates.userId !== undefined) {
      setClauses.push('userId = @userId');
      request.input('userId', sql.Int, updates.userId);
    }
    if (setClauses.length === 0) {
      return { message: 'Nothing to update' };
    }
    const sqlString = `UPDATE Admin SET ${setClauses.join(', ')} WHERE adminId = @adminId`;
    await request.query(sqlString);
    return { message: 'Admin updated successfully' };
  } catch (err) {
    if (err.number === 547) {
      const e = new Error('UserId nuk ekziston!');
      e.status = 404;
      throw e;
    }
    console.error('Gabim ne updateAdmin:', err);
    throw err;
  }
}

//DELETE
async function deleteAdmin(adminId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('adminId', sql.Int, adminId)
      .query('DELETE FROM Admin WHERE adminId = @adminId');
    return { message: 'Admin deleted successfully' };
  } catch (err) {
    console.error('Gabim ne deleteAdmin:', err);
    throw err;
  }
}

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
};