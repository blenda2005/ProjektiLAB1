const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

// CREATE
async function createTicket(ticket) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('date', sql.Date, ticket.date);
    request.input('time', sql.Time, ticket.time);
    request.input('seatCount', sql.Int, ticket.seatCount);
    request.input('seats', sql.NVarChar(100), ticket.seats);
    request.input('paymentMethod', sql.NVarChar(50), ticket.paymentMethod);
    request.input('status', sql.NVarChar(50), ticket.status);
    request.input('qr_path', sql.NVarChar(255), ticket.qr_path);
    request.input('discountId', sql.Int, ticket.discountId);
    request.input('hallsId', sql.Int, ticket.hallsId);
    request.input('scheduleId', sql.Int, ticket.scheduleId);
    request.input('movieId', sql.Int, ticket.movieId);
    request.input('adminId', sql.Int, ticket.adminId);
    request.input('clientId', sql.Int, ticket.clientId);
    await request.query(`
      INSERT INTO Tickets (date, time, seatCount, seats, paymentMethod, status, qr_path, discountId, hallsId, scheduleId, movieId, adminId, clientId)
      VALUES (@date, @time, @seatCount, @seats, @paymentMethod, @status, @qr_path, @discountId, @hallsId, @scheduleId, @movieId, @adminId, @clientId)
    `);
    return { message: 'Ticket created successfully' };
  } catch (err) {
    console.error('Error in createTicket:', err);
    throw err;
  }
}

// READ ALL
async function getAllTickets() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Tickets');
    return result.recordset;
  } catch (err) {
    console.error('Error in getAllTickets:', err);
    throw err;
  }
}

// READ BY ID
async function getTicketById(ticketId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('ticketId', sql.Int, ticketId)
      .query('SELECT * FROM Tickets WHERE ticketId = @ticketId');
    return result.recordset[0];
  } catch (err) {
    console.error('Error in getTicketById:', err);
    throw err;
  }
}

// UPDATE
async function updateTicket(ticketId, updates) {
  try {
    await sql.connect(dbConfig);
    const setClauses = [];
    const request = new sql.Request();
    request.input('ticketId', sql.Int, ticketId);
    if (updates.date !== undefined) {
      setClauses.push('date = @date');
      request.input('date', sql.Date, updates.date);
    }
    if (updates.time !== undefined) {
      setClauses.push('time = @time');
      request.input('time', sql.Time, updates.time);
    }
    if (updates.seatCount !== undefined) {
      setClauses.push('seatCount = @seatCount');
      request.input('seatCount', sql.Int, updates.seatCount);
    }
    if (updates.seats !== undefined) {
      setClauses.push('seats = @seats');
      request.input('seats', sql.NVarChar(100), updates.seats);
    }
    if (updates.paymentMethod !== undefined) {
      setClauses.push('paymentMethod = @paymentMethod');
      request.input('paymentMethod', sql.NVarChar(50), updates.paymentMethod);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar(50), updates.status);
    }
    if (updates.qr_path !== undefined) {
      setClauses.push('qr_path = @qr_path');
      request.input('qr_path', sql.NVarChar(255), updates.qr_path);
    }
    if (updates.discountId !== undefined) {
      setClauses.push('discountId = @discountId');
      request.input('discountId', sql.Int, updates.discountId);
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
    if (updates.adminId !== undefined) {
      setClauses.push('adminId = @adminId');
      request.input('adminId', sql.Int, updates.adminId);
    }
    if (updates.clientId !== undefined) {
      setClauses.push('clientId = @clientId');
      request.input('clientId', sql.Int, updates.clientId);
    }
    if (setClauses.length === 0) {
      return { message: 'Nothing to update' };
    }
    const sqlString = `UPDATE Tickets SET ${setClauses.join(', ')} WHERE ticketId = @ticketId`;
    await request.query(sqlString);
    return { message: 'Ticket updated successfully' };
  } catch (err) {
    console.error('Error in updateTicket:', err);
    throw err;
  }
}

// DELETE
async function deleteTicket(ticketId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('ticketId', sql.Int, ticketId)
      .query('DELETE FROM Tickets WHERE ticketId = @ticketId');
    return { message: 'Ticket deleted successfully' };
  } catch (err) {
    console.error('Error in deleteTicket:', err);
    throw err;
  }
}

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket
};
