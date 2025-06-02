const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

//formatt --
function formatDateOnly(date) {
  if (!date) return null;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Formatim i njejt 
function formatDateTimeSQL(date) {
  if (!date) return null;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// CREATE 
async function createReservation(reservation) {
  const {
    seatCount, seats, type, status, reservationDate,
    createdBy, clientId, hallsId, scheduleId
  } = reservation;

  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();

    request
      .input('seatCount', sql.Int, seatCount)
      .input('seats', sql.NVarChar(255), seats)
      .input('type', sql.NVarChar(50), type)
      .input('status', sql.NVarChar(50), status)
      .input('reservationDate', sql.DateTime, formatDateTimeSQL(reservationDate))
      .input('createdBy', sql.NVarChar(100), createdBy)
      .input('clientId', sql.Int, clientId || null)
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId);

    const result = await request.query(`
      INSERT INTO Reservations (
        seatCount, seats, type, status, reservationDate,
        createdAt, createdBy, clientId, hallsId, scheduleId
      )
      OUTPUT INSERTED.reservationId
      VALUES (
        @seatCount, @seats, @type, @status, @reservationDate,
        GETDATE(), @createdBy, @clientId, @hallsId, @scheduleId
      )
    `);

    const reservationId = result.recordset[0].reservationId;
    return { message: 'Reservation u krijua me sukses', reservationId };

  } catch (err) {
    console.error('Gabim gjatë krijimit të reservation:', err);
    throw err;
  }
}

// READ all
async function getAllReservations() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Reservations');

    return result.recordset.map(r => ({
      ...r,
      reservationDate: formatDateOnly(r.reservationDate),
      createdAt: r.createdAt ? formatDateTimeSQL(r.createdAt) : null,
      updatedAt: r.updatedAt ? formatDateTimeSQL(r.updatedAt) : null,
    }));

  } catch (err) {
    console.error('Gabim gjatë marrjes së reservations:', err);
    throw err;
  }
}

// READ byid
async function getReservationById(reservationId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('reservationId', sql.Int, reservationId)
      .query('SELECT * FROM Reservations WHERE reservationId = @reservationId');

    if (result.recordset.length === 0) {
      throw new Error('Reservation nuk u gjet');
    }

    const r = result.recordset[0];
    r.reservationDate = formatDateOnly(r.reservationDate);
    r.createdAt = r.createdAt ? formatDateTimeSQL(r.createdAt) : null;
    r.updatedAt = r.updatedAt ? formatDateTimeSQL(r.updatedAt) : null;

    return r;

  } catch (err) {
    console.error('Gabim gjatë marrjes së reservation:', err);
    throw err;
  }
}

// UPDATE 
async function updateReservation(reservationId, reservationData, adminId) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('reservationId', sql.Int, reservationId);

    const fields = [];
    for (const [key, value] of Object.entries(reservationData)) {
      if (value === undefined || key === 'reservationId') continue;

      let dbValue = value;
      switch (key) {
        case 'reservationDate':
          dbValue = formatDateTimeSQL(dbValue);
          request.input(key, sql.DateTime, dbValue);
          break;
        case 'seatCount':
          request.input(key, sql.Int, dbValue);
          break;
        case 'seats':
        case 'type':
        case 'status':
        case 'createdBy':
        case 'updatedBy':
          request.input(key, sql.NVarChar, dbValue);
          break;
        case 'clientId':
        case 'hallsId':
        case 'scheduleId':
          request.input(key, sql.Int, dbValue || null);
          break;
        default:
          continue;
      }
      fields.push(`${key} = @${key}`);
    }

    if (fields.length === 0) throw new Error('Asnjë fushë për përditësim');

    
    fields.push('updatedAt = GETDATE()');
    fields.push('updatedBy = @updatedBy');

    request.input('updatedBy', sql.NVarChar(100), `admin_${adminId}`);

    const updateQuery = `
      UPDATE Reservations
      SET ${fields.join(', ')}
      WHERE reservationId = @reservationId
    `;

    await request.query(updateQuery);

    
    const adminReq = new sql.Request();
    adminReq.input('adminId', sql.Int, adminId);
    adminReq.input('reservationId', sql.Int, reservationId);
    adminReq.input('updatedBy', sql.NVarChar(100), `admin_${adminId}`);

    await adminReq.query(`
      MERGE Reservations_Admin AS target
      USING (SELECT @adminId AS adminId, @reservationId AS reservationId) AS source
      ON target.adminId = source.adminId AND target.reservationId = source.reservationId
      WHEN MATCHED THEN
        UPDATE SET updatedAt = GETDATE(), updatedBy = @updatedBy
      WHEN NOT MATCHED THEN
        INSERT (adminId, reservationId, createdBy, updatedAt, updatedBy)
        VALUES (@adminId, @reservationId, 'system', GETDATE(), @updatedBy);
    `);

    return { message: 'Reservation u përditësua me sukses' };

  } catch (err) {
    console.error('Gabim gjatë përditësimit të reservation:', err);
    throw err;
  }
}

// DELETE 
async function deleteReservation(reservationId, adminId) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('adminId', sql.Int, adminId);
    request.input('reservationId', sql.Int, reservationId);

    // Para se me fshi regjistro n Reservations_Admin nese nuk ekziston kjo 
    await request.query(`
      IF NOT EXISTS (
        SELECT 1 FROM Reservations_Admin WHERE adminId = @adminId AND reservationId = @reservationId
      )
      INSERT INTO Reservations_Admin (adminId, reservationId, createdBy)
      VALUES (@adminId, @reservationId, 'system')
    `);

    // Fshiji reservationn (me foreign keys me ON DELETE CASCADE ose NO ACTION, sipas konfigurimit)
    await new sql.Request()
      .input('reservationId', sql.Int, reservationId)
      .query('DELETE FROM Reservations WHERE reservationId = @reservationId');

    return { message: 'Reservation u fshi me sukses' };

  } catch (err) {
    console.error('Gabim gjatë fshirjes së reservation:', err);
    throw err;
  }
}

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
};

