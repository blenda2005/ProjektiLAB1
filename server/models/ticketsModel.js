const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');


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
async function createTicket(ticket) {
  const {
    date, time, seatCount, seats, paymentMethod, status,
    qr_path, discountId, hallsId, scheduleId, clientId
  } = ticket;

  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();

    request
      .input('date', sql.Date, date)
      .input('time', sql.Time, formatTime(time))
      .input('seatCount', sql.Int, seatCount)
      .input('seats', sql.NVarChar(100), seats)
      .input('paymentMethod', sql.NVarChar(50), paymentMethod)
      .input('status', sql.NVarChar(50), status)
      .input('qr_path', sql.NVarChar(255), qr_path)
      .input('discountId', sql.Int, discountId || null)
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .input('clientId', sql.Int, clientId || null);

    const result = await request.query(`
      INSERT INTO Tickets (
        date, time, seatCount, seats, paymentMethod, status,
        qr_path, discountId, hallsId, scheduleId, clientId
      )
      OUTPUT INSERTED.ticketId
      VALUES (
        @date, @time, @seatCount, @seats, @paymentMethod, @status,
        @qr_path, @discountId, @hallsId, @scheduleId, @clientId
      )
    `);

    const ticketId = result.recordset[0].ticketId;
    return { message: 'Ticket u krijua me sukses', ticketId };

  } catch (err) {
    console.error('Gabim gjatë krijimit të ticket:', err);
    throw err;
  }
}

// READ all 
async function getAllTickets() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Tickets');

    return result.recordset.map(ticket => ({
      ...ticket,
      date: formatDateOnly(ticket.date),
      time: formatTime(ticket.time)
    }));

  } catch (err) {
    console.error('Gabim gjatë marrjes së tickets:', err);
    throw err;
  }
}

// READ by ID
async function getTicketById(ticketId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('ticketId', sql.Int, ticketId)
      .query('SELECT * FROM Tickets WHERE ticketId = @ticketId');

    if (result.recordset.length === 0) {
      throw new Error('Ticket nuk u gjet');
    }

    const ticket = result.recordset[0];
    ticket.date = formatDateOnly(ticket.date);
    ticket.time = formatTime(ticket.time);

    return ticket;

  } catch (err) {
    console.error('Gabim gjatë marrjes së ticket:', err);
    throw err;
  }
}

// UPDATE +
async function updateTicket(ticketId, ticketData, adminId) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('ticketId', sql.Int, ticketId);

    const fields = [];
    for (const [key, value] of Object.entries(ticketData)) {
      if (value === undefined || key === 'ticketId') continue;

      let dbValue = value;
      switch (key) {
        case 'date':
          request.input(key, sql.Date, dbValue);
          break;
        case 'time':
          dbValue = formatTime(dbValue);
          request.input(key, sql.Time, dbValue);
          break;
        case 'seatCount':
          request.input(key, sql.Int, dbValue);
          break;
        case 'seats':
        case 'paymentMethod':
        case 'status':
        case 'qr_path':
          request.input(key, sql.NVarChar, dbValue);
          break;
        case 'discountId':
        case 'hallsId':
        case 'scheduleId':
        case 'clientId':
          request.input(key, sql.Int, dbValue || null);
          break;
      }
      fields.push(`${key} = @${key}`);
    }

    if (fields.length === 0) throw new Error('Asnjë fushë për përditësim');

    const updateQuery = `
      UPDATE Tickets
      SET ${fields.join(', ')}
      WHERE ticketId = @ticketId
    `;

    await request.query(updateQuery);

    
    const adminReq = new sql.Request();
    adminReq.input('adminId', sql.Int, adminId);
    adminReq.input('ticketId', sql.Int, ticketId);
    adminReq.input('updatedBy', sql.NVarChar(100), `admin_${adminId}`);

    await adminReq.query(`
      MERGE Tickets_Admin AS target
      USING (SELECT @adminId AS adminId, @ticketId AS ticketId) AS source
      ON target.adminId = source.adminId AND target.ticketId = source.ticketId
      WHEN MATCHED THEN
        UPDATE SET updatedAt = GETDATE(), updatedBy = @updatedBy
      WHEN NOT MATCHED THEN
        INSERT (adminId, ticketId, createdBy, updatedAt, updatedBy)
        VALUES (@adminId, @ticketId, 'system', GETDATE(), @updatedBy);
    `);

    return { message: 'Ticket u përditësua me sukses' };

  } catch (err) {
    console.error('Gabim gjatë përditësimit të ticket:', err);
    throw err;
  }
}

// DELETE 
async function deleteTicket(ticketId, adminId) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('adminId', sql.Int, adminId);
    request.input('ticketId', sql.Int, ticketId);

    //logjika  efshirjes si am heret 
    await request.query(`
      IF NOT EXISTS (
        SELECT 1 FROM Tickets_Admin WHERE adminId = @adminId AND ticketId = @ticketId
      )
      INSERT INTO Tickets_Admin (adminId, ticketId, createdBy)
      VALUES (@adminId, @ticketId, 'system')
    `);

   
    await new sql.Request()
      .input('ticketId', sql.Int, ticketId)
      .query('DELETE FROM Tickets WHERE ticketId = @ticketId');

    return { message: 'Ticket u fshi me sukses' };

  } catch (err) {
    console.error('Gabim gjatë fshirjes së ticket:', err);
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
