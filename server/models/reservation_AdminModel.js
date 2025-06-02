const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

//formati
function formatDateOnly(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


function formatTime(time) {
  if (!time) return null;
  if (time instanceof Date) return time.toTimeString().slice(0, 8);
  if (typeof time === 'string') return time.length === 5 ? `${time}:00` : time;
  return time;
}

// CREATE 
async function createReservationAdmin(reservationAdmin) {
  const { reservationId, adminId, createdBy } = reservationAdmin;

  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();

    request
      .input('reservationId', sql.Int, reservationId)
      .input('adminId', sql.Int, adminId)
      .input('createdBy', sql.NVarChar(100), createdBy || 'system');

    await request.query(`
      INSERT INTO Reservations_Admin (reservationId, adminId, createdBy)
      VALUES (@reservationId, @adminId, @createdBy)
    `);

    return { message: 'Rezervimi_Admin u krijua me sukses' };

  } catch (err) {
    console.error('Gabim gjatë krijimit të Reservations_Admin:', err);
    throw err;
  }
}

// READ all
async function getAllReservationsAdmin() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Reservations_Admin');

    return result.recordset.map(row => ({
      ...row,
      createdAt: row.createdAt ? formatDateOnly(row.createdAt) : null,
      updatedAt: row.updatedAt ? formatDateOnly(row.updatedAt) : null,
    }));

  } catch (err) {
    console.error('Gabim gjatë marrjes së Reservations_Admin:', err);
    throw err;
  }
}

// READ by PK (reservationId + adminId)
async function getReservationAdminById(reservationId, adminId) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('reservationId', sql.Int, reservationId);
    request.input('adminId', sql.Int, adminId);

    const result = await request.query(`
      SELECT * FROM Reservations_Admin
      WHERE reservationId = @reservationId AND adminId = @adminId
    `);

    if (result.recordset.length === 0) {
      throw new Error('Rezervimi_Admin nuk u gjet');
    }

    const row = result.recordset[0];
    return {
      ...row,
      createdAt: row.createdAt ? formatDateOnly(row.createdAt) : null,
      updatedAt: row.updatedAt ? formatDateOnly(row.updatedAt) : null,
    };

  } catch (err) {
    console.error('Gabim gjatë marrjes së Reservations_Admin:', err);
    throw err;
  }
}

// UPDATE 
async function updateReservationAdmin(reservationId, adminId, updatedBy) {
  try {
    await sql.connect(dbConfig);

    const request = new sql.Request();
    request.input('reservationId', sql.Int, reservationId);
    request.input('adminId', sql.Int, adminId);
    request.input('updatedBy', sql.NVarChar(100), updatedBy || `admin_${adminId}`);

    await request.query(`
      MERGE Reservations_Admin AS target
      USING (SELECT @reservationId AS reservationId, @adminId AS adminId) AS source
      ON target.reservationId = source.reservationId AND target.adminId = source.adminId
      WHEN MATCHED THEN
        UPDATE SET updatedAt = GETDATE(), updatedBy = @updatedBy
      WHEN NOT MATCHED THEN
        INSERT (reservationId, adminId, createdBy, updatedAt, updatedBy)
        VALUES (@reservationId, @adminId, 'system', GETDATE(), @updatedBy);
    `);

    return { message: 'Rezervimi_Admin u përditësua me sukses' };

  } catch (err) {
    console.error('Gabim gjatë përditësimit të Reservations_Admin:', err);
    throw err;
  }
}

// DELETE 
async function deleteReservationAdmin(reservationId, adminId) {
  try {
    await sql.connect(dbConfig);

    const request = new sql.Request();
    request.input('reservationId', sql.Int, reservationId);
    request.input('adminId', sql.Int, adminId);

    await request.query(`
      DELETE FROM Reservations_Admin
      WHERE reservationId = @reservationId AND adminId = @adminId
    `);

    return { message: 'Rezervimi_Admin u fshi me sukses' };

  } catch (err) {
    console.error('Gabim gjatë fshirjes së Reservations_Admin:', err);
    throw err;
  }
}

module.exports = {
  createReservationAdmin,
  getAllReservationsAdmin,
  getReservationAdminById,
  updateReservationAdmin,
  deleteReservationAdmin,
};
