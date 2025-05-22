const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

// CREATE
async function createEvent(event) {
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('title', sql.NVarChar(100), event.title);
    request.input('description', sql.NVarChar(sql.MAX), event.description);
    request.input('date', sql.Date, event.date);
    request.input('time', sql.Time, event.time);
    request.input('posterPath', sql.NVarChar(255), event.posterPath);
    request.input('status', sql.NVarChar(50), event.status || 'Active');
    request.input('hallsId', sql.Int, event.hallsId);
    request.input('scheduleId', sql.Int, event.scheduleId);
    request.input('movieId', sql.Int, event.movieId);
    request.input('discountId', sql.Int, event.discountId);
    request.input('createdBy', sql.NVarChar(100), event.createdBy);
    await request.query(`
      INSERT INTO Events (title, description, date, time, posterPath, status, hallsId, scheduleId, movieId, discountId, createdBy)
      VALUES (@title, @description, @date, @time, @posterPath, @status, @hallsId, @scheduleId, @movieId, @discountId, @createdBy)
    `);
    return { message: 'Event created successfully' };
  } catch (err) {
    console.error('Error in createEvent:', err);
    throw err;
  }
}

// READ ALL
async function getAllEvents() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request().query('SELECT * FROM Events');
    return result.recordset;
  } catch (err) {
    console.error('Error in getAllEvents:', err);
    throw err;
  }
}

// READ BY ID
async function getEventById(eventId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('eventId', sql.Int, eventId)
      .query('SELECT * FROM Events WHERE eventId = @eventId');
    return result.recordset[0];
  } catch (err) {
    console.error('Error in getEventById:', err);
    throw err;
  }
}

// UPDATE
async function updateEvent(eventId, updates) {
  try {
    await sql.connect(dbConfig);
    const setClauses = [];
    const request = new sql.Request();
    request.input('eventId', sql.Int, eventId);
    if (updates.title !== undefined) {
      setClauses.push('title = @title');
      request.input('title', sql.NVarChar(100), updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = @description');
      request.input('description', sql.NVarChar(sql.MAX), updates.description);
    }
    if (updates.date !== undefined) {
      setClauses.push('date = @date');
      request.input('date', sql.Date, updates.date);
    }
    if (updates.time !== undefined) {
      setClauses.push('time = @time');
      request.input('time', sql.Time, updates.time);
    }
    if (updates.posterPath !== undefined) {
      setClauses.push('posterPath = @posterPath');
      request.input('posterPath', sql.NVarChar(255), updates.posterPath);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar(50), updates.status);
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
    if (updates.discountId !== undefined) {
      setClauses.push('discountId = @discountId');
      request.input('discountId', sql.Int, updates.discountId);
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
    const sqlString = `UPDATE Events SET ${setClauses.join(', ')} WHERE eventId = @eventId`;
    await request.query(sqlString);
    return { message: 'Event updated successfully' };
  } catch (err) {
    console.error('Error in updateEvent:', err);
    throw err;
  }
}

// DELETE
async function deleteEvent(eventId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('eventId', sql.Int, eventId)
      .query('DELETE FROM Events WHERE eventId = @eventId');
    return { message: 'Event deleted successfully' };
  } catch (err) {
    console.error('Error in deleteEvent:', err);
    throw err;
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
