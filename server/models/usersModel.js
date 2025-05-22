const sql      = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

//CREATE        
async function createUsers(firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, cinemaId, createdBy) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('firstName', sql.NVarChar(50), firstName)
      .input('lastName', sql.NVarChar(50), lastName)
      .input('gender', sql.NVarChar(10), gender)
      .input('date_of_birth', sql.Date, date_of_birth)
      .input('address', sql.NVarChar(100), address)
      .input('zipCode', sql.NVarChar(10), zipCode)
      .input('city', sql.NVarChar(50), city)
      .input('phoneNumber', sql.NVarChar(20), phoneNumber)
      .input('passwordHash', sql.VarBinary(255), passwordHash)
      .input('cinemaId', sql.Int, cinemaId)
      .input('createdBy', sql.NVarChar(100), createdBy)
      .query(`
        INSERT INTO Users (firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, cinemaId, createdBy)
        VALUES (@firstName, @lastName, @gender, @date_of_birth, @address, @zipCode, @city, @phoneNumber, @passwordHash, @cinemaId, @createdBy)
      `);
    return { message: 'User created successfully' };
  } catch (err) {
    console.error('Gabim ne createUsers:', err);
    throw err;
  }
}
//READ ALL
async function getAllUsers() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .query('SELECT * FROM Users');
    return result.recordset;
  } catch (err) {
    console.error('Gabim ne getAllUsers:', err);
    throw err;
  }
}
//READ BY ID
async function getUsersById(userId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Users WHERE userId = @userId');
    return result.recordset[0];
  } catch (err) {
    console.error('Gabim ne getUsersById:', err);
    throw err;
  }
}
//UPDATE
async function updateUsers(userId, updates) {  
  try {
    await sql.connect(dbConfig);
    const setClauses = [];
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    if (updates.firstName !== undefined) {
      setClauses.push('firstName = @firstName');
      request.input('firstName', sql.NVarChar(50), updates.firstName);
    }
    if (updates.lastName !== undefined) {
      setClauses.push('lastName = @lastName');
      request.input('lastName', sql.NVarChar(50), updates.lastName);
    }
    if (updates.gender !== undefined) {
      setClauses.push('gender = @gender');
      request.input('gender', sql.NVarChar(10), updates.gender);
    }
    if (updates.date_of_birth !== undefined) {
      setClauses.push('date_of_birth = @date_of_birth');
      request.input('date_of_birth', sql.Date, updates.date_of_birth);
    }
    if (updates.address !== undefined) {
      setClauses.push('address = @address');
      request.input('address', sql.NVarChar(100), updates.address);
    }
    if (updates.zipCode !== undefined) {
      setClauses.push('zipCode = @zipCode');
      request.input('zipCode', sql.NVarChar(10), updates.zipCode);
    }
    if (updates.city !== undefined) {
      setClauses.push('city = @city');
      request.input('city', sql.NVarChar(50), updates.city);
    }
    if (updates.phoneNumber !== undefined) {
      setClauses.push('phoneNumber = @phoneNumber');
      request.input('phoneNumber', sql.NVarChar(20), updates.phoneNumber);
    }
    if (updates.passwordHash !== undefined) {
      setClauses.push('passwordHash = @passwordHash');
      request.input('passwordHash', sql.VarBinary(255), updates.passwordHash);
    }
    if (updates.cinemaId !== undefined) {
      setClauses.push('cinemaId = @cinemaId');
      request.input('cinemaId', sql.Int, updates.cinemaId);
    }
    if (updates.updatedBy !== undefined) {
      setClauses.push('updatedBy = @updatedBy');
      request.input('updatedBy', sql.NVarChar(100), updates.updatedBy);
    }
    setClauses.push('updatedAt = @updatedAt');
    request.input('updatedAt', sql.DateTime, new Date());
    if (setClauses.length === 1) {
      return { message: 'Nothing to update' };
    }
    const sqlString = `UPDATE Users SET ${setClauses.join(', ')} WHERE userId = @userId`;
    await request.query(sqlString);
    return { message: 'User updated successfully' };
  } catch (err) {
    console.error('Gabim ne updateUsers:', err);
    throw err;
  }
}
//DELETE
async function deleteUsers(userId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('userId', sql.Int, userId)
      .query('DELETE FROM Users WHERE userId = @userId');
    return { message: 'User deleted successfully' };
  } catch (err) {
    console.error('Gabim ne deleteUsers:', err);
    throw err;
  }
}
//EXPORT
module.exports = {
    createUsers,
    getAllUsers,
    getUsersById,
    updateUsers,
    deleteUsers 
};