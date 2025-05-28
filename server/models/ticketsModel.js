const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

function formatDateTime(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function prepareTime(time) {
  if (!time) return null;

  if (time instanceof Date) {
    return time.toTimeString().slice(0, 8);
  }

  if (typeof time === 'string') {
    if (time.length === 5) return `${time}:00`;
    if (time.length === 8) return time;
  }

  return time;
}

// CREATE
async function createTicket(ticket) {
  const {
    date, time, seatCount, seats,
    paymentMethod, status, qr_path,
    discountId, hallsId, scheduleId, clientId
  } = ticket;

  try {
    await sql.connect(dbConfig);

    // Kontrollo nëse halls_schedule_movie ekziston për hallsId dhe scheduleId
    const checkHallsSchedule = await new sql.Request()
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT * FROM Halls_Schedule_Movie
        WHERE hallsId = @hallsId AND scheduleId = @scheduleId
      `);

    if (checkHallsSchedule.recordset.length === 0) {
      throw new Error(`Nuk ekziston lidhja hallsId=${hallsId} me scheduleId=${scheduleId} në Halls_Schedule_Movie`);
    }

    // Kontrollo nëse klienti ekziston (clientId mund të jetë null)
    if (clientId !== null && clientId !== undefined) {
      const checkClient = await new sql.Request()
        .input('clientId', sql.Int, clientId)
        .query('SELECT * FROM Client WHERE clientId = @clientId');

      if (checkClient.recordset.length === 0) {
        throw new Error(`Klienti me clientId=${clientId} nuk ekziston`);
      }
    }

    // Kontrollo nëse zbritja ekziston vetëm nëse discountId nuk është null
    if (discountId !== null && discountId !== undefined) {
      const checkDiscount = await new sql.Request()
        .input('discountId', sql.Int, discountId)
        .query('SELECT * FROM Discounts WHERE discountId = @discountId');

      if (checkDiscount.recordset.length === 0) {
        throw new Error(`Zbritja me discountId=${discountId} nuk ekziston`);
      }
    }

    // Insert biletën
    await new sql.Request()
      .input('date', sql.Date, new Date(date))
      .input('time', sql.Time, prepareTime(time))
      .input('seatCount', sql.Int, seatCount)
      .input('seats', sql.NVarChar(100), seats)
      .input('paymentMethod', sql.NVarChar(50), paymentMethod)
      .input('status', sql.NVarChar(50), status)
      .input('qr_path', sql.NVarChar(255), qr_path)
      .input('discountId', sql.Int, discountId)
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .input('clientId', sql.Int, clientId)
      .query(`
        INSERT INTO Tickets (
          date, time, seatCount, seats,
          paymentMethod, status, qr_path,
          discountId, hallsId, scheduleId, clientId
        )
        VALUES (
          @date, @time, @seatCount, @seats,
          @paymentMethod, @status, @qr_path,
          @discountId, @hallsId, @scheduleId, @clientId
        )
      `);

    return { message: 'Ticket created successfully' };
  } catch (err) {
    console.error('Error creating ticket:', err);
    throw err;
  }
}

// READ ALL
async function getAllTickets() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .query('SELECT * FROM Tickets');

    return result.recordset.map(ticket => ({
      ...ticket,
      date: formatDateTime(ticket.date),
      time: prepareTime(ticket.time)
    }));
  } catch (err) {
    console.error('Error fetching tickets:', err);
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

    if (result.recordset.length === 0) {
      throw new Error('Ticket not found');
    }

    const ticket = result.recordset[0];
    ticket.date = formatDateTime(ticket.date);
    ticket.time = prepareTime(ticket.time);
    return ticket;
  } catch (err) {
    console.error('Error fetching ticket by ID:', err);
    throw err;
  }
}

// UPDATE
async function updateTicket(ticketId, updates, adminId) {
  const {
    date, time, seatCount, seats,
    paymentMethod, status, qr_path,
    discountId, hallsId, scheduleId, clientId
  } = updates;

  try {
    await sql.connect(dbConfig);

    const now = new Date();
    const updatedBy = adminId ? `Admin_${adminId}` : 'System';

    // Kontrollo nëse halls_schedule_movie ekziston për hallsId dhe scheduleId
    const checkHallsSchedule = await new sql.Request()
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT * FROM Halls_Schedule_Movie
        WHERE hallsId = @hallsId AND scheduleId = @scheduleId
      `);

    if (checkHallsSchedule.recordset.length === 0) {
      throw new Error(`Nuk ekziston lidhja hallsId=${hallsId} me scheduleId=${scheduleId} në Halls_Schedule_Movie`);
    }

    // Kontrollo nëse klienti ekziston (clientId mund të jetë null)
    if (clientId !== null && clientId !== undefined) {
      const checkClient = await new sql.Request()
        .input('clientId', sql.Int, clientId)
        .query('SELECT * FROM Client WHERE clientId = @clientId');

      if (checkClient.recordset.length === 0) {
        throw new Error(`Klienti me clientId=${clientId} nuk ekziston`);
      }
    }

    // Kontrollo nëse zbritja ekziston vetëm nëse discountId nuk është null
    if (discountId !== null && discountId !== undefined) {
      const checkDiscount = await new sql.Request()
        .input('discountId', sql.Int, discountId)
        .query('SELECT * FROM Discounts WHERE discountId = @discountId');

      if (checkDiscount.recordset.length === 0) {
        throw new Error(`Zbritja me discountId=${discountId} nuk ekziston`);
      }
    }

    // 1. Update the ticket
    await new sql.Request()
      .input('ticketId', sql.Int, ticketId)
      .input('date', sql.Date, new Date(date))
      .input('time', sql.Time, prepareTime(time))
      .input('seatCount', sql.Int, seatCount)
      .input('seats', sql.NVarChar(100), seats)
      .input('paymentMethod', sql.NVarChar(50), paymentMethod)
      .input('status', sql.NVarChar(50), status)
      .input('qr_path', sql.NVarChar(255), qr_path)
      .input('discountId', sql.Int, discountId)
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .input('clientId', sql.Int, clientId)
      .input('updatedAt', sql.DateTime, now)
      .input('updatedBy', sql.NVarChar(100), updatedBy)
      .query(`
        UPDATE Tickets SET
          date = @date, time = @time, seatCount = @seatCount, seats = @seats,
          paymentMethod = @paymentMethod, status = @status, qr_path = @qr_path,
          discountId = @discountId, hallsId = @hallsId, scheduleId = @scheduleId,
          clientId = @clientId, updatedAt = @updatedAt, updatedBy = @updatedBy
        WHERE ticketId = @ticketId
      `);

    // 2. Log admin action in Tickets_Admin if adminId is provided
    if (adminId) {
      await new sql.Request()
        .input('adminId', sql.Int, adminId)
        .input('ticketId', sql.Int, ticketId)
        .input('actionDate', sql.DateTime, now)
        .query(`
          INSERT INTO Tickets_Admin (adminId, ticketId, actionDate)
          VALUES (@adminId, @ticketId, @actionDate)
        `);
    }

    return { message: 'Ticket updated successfully' };
  } catch (err) {
    console.error('Error updating ticket:', err);
    throw err;
  }
}

// DELETE
async function deleteTicket(ticketId) {
  try {
    await sql.connect(dbConfig);

    // Delete related entries in Tickets_Admin
    await new sql.Request()
      .input('ticketId', sql.Int, ticketId)
      .query('DELETE FROM Tickets_Admin WHERE ticketId = @ticketId');

    // Delete ticket itself
    await new sql.Request()
      .input('ticketId', sql.Int, ticketId)
      .query('DELETE FROM Tickets WHERE ticketId = @ticketId');

    return { message: 'Ticket deleted successfully' };
  } catch (err) {
    console.error('Error deleting ticket:', err);
    throw err;
  }
}

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
};