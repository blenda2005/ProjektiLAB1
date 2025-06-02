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

// Kontrollo nese adminId dhe ticketId ekzistojn para s eme kriju
async function checkAdminAndTicketExist(adminId, ticketId) {
  await sql.connect(dbConfig);
  const request = new sql.Request();
  request.input('adminId', sql.Int, adminId);
  request.input('ticketId', sql.Int, ticketId);

  const adminResult = await request.query('SELECT 1 FROM Admin WHERE adminId = @adminId');
  const ticketResult = await request.query('SELECT 1 FROM Tickets WHERE ticketId = @ticketId');

  return {
    adminExists: adminResult.recordset.length > 0,
    ticketExists: ticketResult.recordset.length > 0
  };
}

// CREATE
async function createTicketAdmin(data) {
  const { adminId, ticketId, createdBy, updatedBy } = data;

  const { adminExists, ticketExists } = await checkAdminAndTicketExist(adminId, ticketId);
  if (!adminExists) throw new Error('Admin ID nuk ekziston.');
  if (!ticketExists) throw new Error('Ticket ID nuk ekziston.');

  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('adminId', sql.Int, adminId)
      .input('ticketId', sql.Int, ticketId)
      .input('createdBy', sql.NVarChar(100), createdBy)
      .input('updatedBy', sql.NVarChar(100), updatedBy)
      .query(`
        INSERT INTO Tickets_Admin (adminId, ticketId, createdBy, updatedBy)
        VALUES (@adminId, @ticketId, @createdBy, @updatedBy)
      `);
    return { message: 'Tickets_Admin entry created successfully' };
  } catch (err) {
    console.error('Error creating Tickets_Admin:', err);
    throw err;
  }
}

// READ ALL
async function getAllTicketsAdmins() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Tickets_Admin');
    return result.recordset.map(record => ({
      ...record,
      createdAt: formatDateTime(record.createdAt),
      updatedAt: record.updatedAt ? formatDateTime(record.updatedAt) : null
    }));
  } catch (err) {
    console.error('Error fetching Tickets_Admin entries:', err);
    throw err;
  }
}

// READ BY ID
async function getTicketAdminById(adminId, ticketId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('adminId', sql.Int, adminId)
      .input('ticketId', sql.Int, ticketId)
      .query('SELECT * FROM Tickets_Admin WHERE adminId = @adminId AND ticketId = @ticketId');

    if (result.recordset.length === 0) throw new Error('Tickets_Admin entry not found');

    const record = result.recordset[0];
    return {
      ...record,
      createdAt: formatDateTime(record.createdAt),
      updatedAt: record.updatedAt ? formatDateTime(record.updatedAt) : null
    };
  } catch (err) {
    console.error('Error fetching Tickets_Admin by ID:', err);
    throw err;
  }
}

// UPDATE
async function updateTicketAdmin(adminId, ticketId, updateData) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    const fields = [];

    request.input('adminId', sql.Int, adminId);
    request.input('ticketId', sql.Int, ticketId);

    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'updatedBy') {
        request.input('updatedBy', sql.NVarChar(100), value);
        fields.push(`updatedBy = @updatedBy`);
      }
    }

    fields.push('updatedAt = GETDATE()');

    const query = `
      UPDATE Tickets_Admin SET
      ${fields.join(', ')}
      WHERE adminId = @adminId AND ticketId = @ticketId
    `;

    await request.query(query);
    return { message: 'Tickets_Admin updated successfully' };
  } catch (err) {
    console.error('Error updating Tickets_Admin:', err);
    throw err;
  }
}

// DELETE
async function deleteTicketAdmin(adminId, ticketId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('adminId', sql.Int, adminId)
      .input('ticketId', sql.Int, ticketId)
      .query('DELETE FROM Tickets_Admin WHERE adminId = @adminId AND ticketId = @ticketId');
    return { message: 'Tickets_Admin entry deleted successfully' };
  } catch (err) {
    console.error('Error deleting Tickets_Admin entry:', err);
    throw err;
  }
}

module.exports = {
  createTicketAdmin,
  getAllTicketsAdmins,
  getTicketAdminById,
  updateTicketAdmin,
  deleteTicketAdmin
};
