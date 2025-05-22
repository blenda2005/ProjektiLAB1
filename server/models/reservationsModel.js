const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

// CREATE
async function createReservation(reservation) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('seatCount', sql.Int, reservation.seatCount);
    request.input('seats', sql.NVarChar(255), reservation.seats);
    request.input('type', sql.NVarChar(50), reservation.type);
    request.input('status', sql.NVarChar(50), reservation.status || 'Active');
    request.input('reservationDate', sql.Date, reservation.reservationDate);
    request.input('createdBy', sql.NVarChar(100), reservation.createdBy);
    request.input('clientId', sql.Int, reservation.clientId);
    request.input('hallsId', sql.Int, reservation.hallsId);
    request.input('scheduleId', sql.Int, reservation.scheduleId);
    request.input('movieId', sql.Int, reservation.movieId);
    await request.query(`
      INSERT INTO Reservations (seatCount, seats, type, status, reservationDate, createdBy, clientId, hallsId, scheduleId, movieId)
      VALUES (@seatCount, @seats, @type, @status, @reservationDate, @createdBy, @clientId, @hallsId, @scheduleId, @movieId)
    `);
    return { message: 'Reservation created successfully' };
  } catch (err) {
    console.error('Error in createReservation:', err);
    throw err;
  }
}

// READ ALL
async function getAllReservations() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Reservations');
    return result.recordset;
  } catch (err) {
    console.error('Error in getAllReservations:', err);
    throw err;
  }
}

// READ BY ID
async function getReservationById(reservationId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('reservationId', sql.Int, reservationId)
      .query('SELECT * FROM Reservations WHERE reservationId = @reservationId');
    return result.recordset[0];
  } catch (err) {
    console.error('Error in getReservationById:', err);
    throw err;
  }
}

// UPDATE
async function updateReservation(reservationId, updates) {
  try {
    await sql.connect(dbConfig);
    const setClauses = [];
    const request = new sql.Request();
    request.input('reservationId', sql.Int, reservationId);
    if (updates.seatCount !== undefined) {
      setClauses.push('seatCount = @seatCount');
      request.input('seatCount', sql.Int, updates.seatCount);
    }
    if (updates.seats !== undefined) {
      setClauses.push('seats = @seats');
      request.input('seats', sql.NVarChar(255), updates.seats);
    }
    if (updates.type !== undefined) {
      setClauses.push('type = @type');
      request.input('type', sql.NVarChar(50), updates.type);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar(50), updates.status);
    }
    if (updates.reservationDate !== undefined) {
      setClauses.push('reservationDate = @reservationDate');
      request.input('reservationDate', sql.Date, updates.reservationDate);
    }
    if (updates.updatedBy !== undefined) {
      setClauses.push('updatedBy = @updatedBy');
      request.input('updatedBy', sql.NVarChar(100), updates.updatedBy);
    }
    if (updates.clientId !== undefined) {
      setClauses.push('clientId = @clientId');
      request.input('clientId', sql.Int, updates.clientId);
    }
    if (updates.hallsId !== undefined) {
      setClauses.push('hallsId = @hallsId');
      request.input('hallsId', sql.Int, updates.hallsId);
    }
    if (updates.scheduleId !== undefined) {
      setClauses.push('scheduleId = @scheduleId');
      request.input('scheduleId', sql.Int, updates.scheduleId);
    }
    if (updates.movieId !== undefined) {
      setClauses.push('movieId = @movieId');
      request.input('movieId', sql.Int, updates.movieId);
    }
    setClauses.push('updatedAt = @updatedAt');
    request.input('updatedAt', sql.DateTime, new Date());
    if (setClauses.length === 1) {
      return { message: 'Nothing to update' };
    }
    const sqlString = `UPDATE Reservations SET ${setClauses.join(', ')} WHERE reservationId = @reservationId`;
    await request.query(sqlString);
    return { message: 'Reservation updated successfully' };
  } catch (err) {
    console.error('Error in updateReservation:', err);
    throw err;
  }
}

// DELETE
async function deleteReservation(reservationId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('reservationId', sql.Int, reservationId)
      .query('DELETE FROM Reservations WHERE reservationId = @reservationId');
    return { message: 'Reservation deleted successfully' };
  } catch (err) {
    console.error('Error in deleteReservation:', err);
    throw err;
  }
}

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation
};
