const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

function formatDateTime(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function formatDate(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

//CREATE
async function createUser(user) {
  try {
    await sql.connect(dbConfig);

    const {
      firstName,
      lastName,
      gender,
      date_of_birth,
      address,
      zipCode,
      city,
      phoneNumber,
      passwordHash, 
      role,
      cinemaId,
      createdBy
    } = user;

    const pwBuffer = passwordHash
      ? (Buffer.isBuffer(passwordHash) ? passwordHash : Buffer.from(passwordHash, 'utf-8'))
      : null;

    const insertUser = await new sql.Request()
      .input("firstName", sql.NVarChar, firstName)
      .input("lastName", sql.NVarChar, lastName)
      .input("gender", sql.NVarChar, gender)
      .input("date_of_birth", sql.Date, date_of_birth)
      .input("address", sql.NVarChar, address)
      .input("zipCode", sql.NVarChar, zipCode)
      .input("city", sql.NVarChar, city)
      .input("phoneNumber", sql.NVarChar, phoneNumber)
      .input("passwordHash", sql.VarBinary, pwBuffer)
      .input("role", sql.NVarChar, role)
      .input("cinemaId", sql.Int, cinemaId)
      .input("createdAt", sql.DateTime, new Date())
      .input("createdBy", sql.NVarChar, createdBy)
      .query(`
        INSERT INTO Users 
          (firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, role, cinemaId, createdAt, createdBy)
        VALUES
          (@firstName, @lastName, @gender, @date_of_birth, @address, @zipCode, @city, @phoneNumber, @passwordHash, @role, @cinemaId, @createdAt, @createdBy);
        SELECT SCOPE_IDENTITY() AS userId;
      `);

    const userId = insertUser.recordset[0].userId;

    if (role === "Admin") {
      await new sql.Request()
        .input("userId", sql.Int, userId)
        .query(`INSERT INTO Admin (responsibility, userId) VALUES ('Default Responsibility', @userId)`);
    } else if (role === "Client") {
      await new sql.Request()
        .input("userId", sql.Int, userId)
        .query(`INSERT INTO Client (status, userId) VALUES ('Active', @userId)`);
    }

    return { message: "User created successfully", userId };
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
}

//READ
async function getAllUsers() {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query("SELECT * FROM Users");
    return result.recordset.map(user => ({
      ...user,
      createdAt: formatDateTime(user.createdAt),
      updatedAt: formatDateTime(user.updatedAt),
      date_of_birth: formatDate(user.date_of_birth),
      passwordHash: user.passwordHash ? user.passwordHash.toString('base64') : null
    }));
  } catch (err) {
    console.error("Error getting all users:", err);
    throw err;
  }
}

async function getUserById(id) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input("userId", sql.Int, id);
    const result = await request.query("SELECT * FROM Users WHERE userId = @userId");
    if (result.recordset.length === 0) return null;
    const user = result.recordset[0];
    return {
      ...user,
      createdAt: formatDateTime(user.createdAt),
      updatedAt: formatDateTime(user.updatedAt),
      date_of_birth: formatDate(user.date_of_birth),
      passwordHash: user.passwordHash ? user.passwordHash.toString('base64') : null
    };
  } catch (err) {
    console.error("Error getting user by ID:", err);
    throw err;
  }
}

//UPDATE
async function updateUser(id, user) {
  try {
    await sql.connect(dbConfig);

    const {
      firstName,
      lastName,
      gender,
      date_of_birth,
      address,
      zipCode,
      city,
      phoneNumber,
      passwordHash,
      role,
      updatedBy
    } = user;

    const updatedAt = new Date();

    const pwBuffer = passwordHash
      ? (Buffer.isBuffer(passwordHash) ? passwordHash : Buffer.from(passwordHash, 'utf-8'))
      : null;

    await new sql.Request()
      .input("userId", sql.Int, id)
      .input("firstName", sql.NVarChar, firstName)
      .input("lastName", sql.NVarChar, lastName)
      .input("gender", sql.NVarChar, gender)
      .input("date_of_birth", sql.Date, date_of_birth)
      .input("address", sql.NVarChar, address)
      .input("zipCode", sql.NVarChar, zipCode)
      .input("city", sql.NVarChar, city)
      .input("phoneNumber", sql.NVarChar, phoneNumber)
      .input("passwordHash", sql.VarBinary, pwBuffer)
      .input("role", sql.NVarChar, role)
      .input("updatedAt", sql.DateTime, updatedAt)
      .input("updatedBy", sql.NVarChar, updatedBy)
      .query(`
        UPDATE Users SET
          firstName = @firstName,
          lastName = @lastName,
          gender = @gender,
          date_of_birth = @date_of_birth,
          address = @address,
          zipCode = @zipCode,
          city = @city,
          phoneNumber = @phoneNumber,
          passwordHash = @passwordHash,
          role = @role,
          updatedAt = @updatedAt,
          updatedBy = @updatedBy
        WHERE userId = @userId
      `);

    return { message: "User updated successfully" };
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
}

//DELETE
//async function deleteUser(id) {
//  try {
//    await sql.connect(dbConfig);
//    const request = new sql.Request();
//    request.input("userId", sql.Int, id);
//    await request.query("DELETE FROM Users WHERE userId = @userId");
//    return { message: "User deleted successfully" };
//  } catch (err) {
//    console.error("Error deleting user:", err);
//    throw err;
//  }
//}
async function deleteUser(id) {
  try {
    await sql.connect(dbConfig);

    // Merr rolin e perdoruesit
    const userResult = await new sql.Request()
      .input("userId", sql.Int, id)
      .query("SELECT role FROM Users WHERE userId = @userId");

    if (userResult.recordset.length === 0) {
      return { message: "User not found" };
    }

    const role = userResult.recordset[0].role;

    // Fshije nga Admin ose Client para Users
    if (role === "Admin") {
      await new sql.Request()
        .input("userId", sql.Int, id)
        .query("DELETE FROM Admin WHERE userId = @userId");
    } else if (role === "Client") {
      await new sql.Request()
        .input("userId", sql.Int, id)
        .query("DELETE FROM Client WHERE userId = @userId");
    }

    // Pastaj fshije nga Users
    await new sql.Request()
      .input("userId", sql.Int, id)
      .query("DELETE FROM Users WHERE userId = @userId");

    return { message: "User deleted successfully" };
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};



//const sql      = require('mssql/msnodesqlv8');
//const dbConfig = require('../config/db');
//
////CREATE        
//async function createUsers(firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, cinemaId, createdBy) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('firstName', sql.NVarChar(50), firstName)
//      .input('lastName', sql.NVarChar(50), lastName)
//      .input('gender', sql.NVarChar(10), gender)
//      .input('date_of_birth', sql.Date, date_of_birth)
//      .input('address', sql.NVarChar(100), address)
//      .input('zipCode', sql.NVarChar(10), zipCode)
//      .input('city', sql.NVarChar(50), city)
//      .input('phoneNumber', sql.NVarChar(20), phoneNumber)
//      .input('passwordHash', sql.VarBinary(255), passwordHash)
//      .input('cinemaId', sql.Int, cinemaId)
//      .input('createdBy', sql.NVarChar(100), createdBy)
//      .query(`
//        INSERT INTO Users (firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, cinemaId, createdBy)
//        VALUES (@firstName, @lastName, @gender, @date_of_birth, @address, @zipCode, @city, @phoneNumber, @passwordHash, @cinemaId, @createdBy)
//      `);
//    return { message: 'User created successfully' };
//  } catch (err) {
//    console.error('Gabim ne createUsers:', err);
//    throw err;
//  }
//}
////READ ALL
//async function getAllUsers() {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request()
//      .query('SELECT * FROM Users');
//    return result.recordset;
//  } catch (err) {
//    console.error('Gabim ne getAllUsers:', err);
//    throw err;
//  }
//}
////READ BY ID
//async function getUsersById(userId) {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request()
//      .input('userId', sql.Int, userId)
//      .query('SELECT * FROM Users WHERE userId = @userId');
//    return result.recordset[0];
//  } catch (err) {
//    console.error('Gabim ne getUsersById:', err);
//    throw err;
//  }
//}
////UPDATE
//async function updateUsers(userId, updates) {  
//  try {
//    await sql.connect(dbConfig);
//    const setClauses = [];
//    const request = new sql.Request();
//    request.input('userId', sql.Int, userId);
//    if (updates.firstName !== undefined) {
//      setClauses.push('firstName = @firstName');
//      request.input('firstName', sql.NVarChar(50), updates.firstName);
//    }
//    if (updates.lastName !== undefined) {
//      setClauses.push('lastName = @lastName');
//      request.input('lastName', sql.NVarChar(50), updates.lastName);
//    }
//    if (updates.gender !== undefined) {
//      setClauses.push('gender = @gender');
//      request.input('gender', sql.NVarChar(10), updates.gender);
//    }
//    if (updates.date_of_birth !== undefined) {
//      setClauses.push('date_of_birth = @date_of_birth');
//      request.input('date_of_birth', sql.Date, updates.date_of_birth);
//    }
//    if (updates.address !== undefined) {
//      setClauses.push('address = @address');
//      request.input('address', sql.NVarChar(100), updates.address);
//    }
//    if (updates.zipCode !== undefined) {
//      setClauses.push('zipCode = @zipCode');
//      request.input('zipCode', sql.NVarChar(10), updates.zipCode);
//    }
//    if (updates.city !== undefined) {
//      setClauses.push('city = @city');
//      request.input('city', sql.NVarChar(50), updates.city);
//    }
//    if (updates.phoneNumber !== undefined) {
//      setClauses.push('phoneNumber = @phoneNumber');
//      request.input('phoneNumber', sql.NVarChar(20), updates.phoneNumber);
//    }
//    if (updates.passwordHash !== undefined) {
//      setClauses.push('passwordHash = @passwordHash');
//      request.input('passwordHash', sql.VarBinary(255), updates.passwordHash);
//    }
//    if (updates.cinemaId !== undefined) {
//      setClauses.push('cinemaId = @cinemaId');
//      request.input('cinemaId', sql.Int, updates.cinemaId);
//    }
//    if (updates.updatedBy !== undefined) {
//      setClauses.push('updatedBy = @updatedBy');
//      request.input('updatedBy', sql.NVarChar(100), updates.updatedBy);
//    }
//    setClauses.push('updatedAt = @updatedAt');
//    request.input('updatedAt', sql.DateTime, new Date());
//    if (setClauses.length === 1) {
//      return { message: 'Nothing to update' };
//    }
//    const sqlString = `UPDATE Users SET ${setClauses.join(', ')} WHERE userId = @userId`;
//    await request.query(sqlString);
//    return { message: 'User updated successfully' };
//  } catch (err) {
//    console.error('Gabim ne updateUsers:', err);
//    throw err;
//  }
//}
////DELETE
//async function deleteUsers(userId) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('userId', sql.Int, userId)
//      .query('DELETE FROM Users WHERE userId = @userId');
//    return { message: 'User deleted successfully' };
//  } catch (err) {
//    console.error('Gabim ne deleteUsers:', err);
//    throw err;
//  }
//}
////EXPORT
//module.exports = {
//    createUsers,
//    getAllUsers,
//    getUsersById,
//    updateUsers,
//    deleteUsers 
//};