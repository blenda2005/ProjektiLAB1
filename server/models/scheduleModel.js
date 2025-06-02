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

// CREATE
async function createSchedule(schedule) {
  try {
    const { date, status, time, price, createdBy } = schedule;

    if (!date || !time) throw new Error('Date or time missing');

    await sql.connect(dbConfig);

    const sqlDate = new Date(date); 
    let sqlTime = time;
    if (typeof sqlTime === 'string' && sqlTime.length === 5) {
      sqlTime = `${sqlTime}:00`; 
    }

    await new sql.Request()
      .input('date', sql.Date, sqlDate)
      .input('status', sql.NVarChar(50), status)
      .input('time', sql.Time, sqlTime)
      .input('price', sql.Decimal(10, 2), price)
      .input('createdBy', sql.NVarChar(100), createdBy)
      .query(`
        INSERT INTO Schedule (date, status, time, price, createdBy)
        VALUES (@date, @status, @time, @price, @createdBy)
      `);

    return { message: 'Schedule created successfully' };
  } catch (err) {
    console.error('Error in createSchedule:', err);
    throw err;
  }
}

// READ ALL
async function getAllSchedules() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Schedule');

    const formattedData = result.recordset.map(schedule => {
     
      const dateFormatted = schedule.date instanceof Date
        ? schedule.date.toISOString().split('T')[0]
        : schedule.date;

      
      let timeFormatted = '';
      if (schedule.time) {
        if (schedule.time instanceof Date) {
          timeFormatted = schedule.time.toTimeString().slice(0, 5);
        } else if (typeof schedule.time === 'string') {
          timeFormatted = schedule.time.slice(0, 5);
        } else if (schedule.time.hours !== undefined && schedule.time.minutes !== undefined) {
          timeFormatted = `${String(schedule.time.hours).padStart(2, '0')}:${String(schedule.time.minutes).padStart(2, '0')}`;
        } else {
          timeFormatted = String(schedule.time).slice(0, 5);
        }
      }

      return {
        ...schedule,
        date: dateFormatted,
        time: timeFormatted,
        createdAt: formatDateTime(schedule.createdAt),
        updatedAt: schedule.updatedAt ? formatDateTime(schedule.updatedAt) : null
      };
    });

    return formattedData;

  } catch (err) {
    console.error('Error in getAllSchedules:', err);
    throw err;
  }
}

// READ BY ID
async function getScheduleById(scheduleId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('scheduleId', sql.Int, scheduleId)
      .query('SELECT * FROM Schedule WHERE scheduleId = @scheduleId');

    const schedule = result.recordset[0];
    if (!schedule) return null;

    
    schedule.date = schedule.date instanceof Date
      ? schedule.date.toISOString().split('T')[0]
      : schedule.date;

    
    if (schedule.time instanceof Date) {
      schedule.time = schedule.time.toTimeString().slice(0, 5);
    } else if (typeof schedule.time === 'string') {
      schedule.time = schedule.time.slice(0, 5);
    } else {
      schedule.time = '';
    }

    schedule.createdAt = formatDateTime(schedule.createdAt);
    schedule.updatedAt = schedule.updatedAt ? formatDateTime(schedule.updatedAt) : null;

    return schedule;

  } catch (err) {
    console.error('Error in getScheduleById:', err);
    throw err;
  }
}

// UPDATE
async function updateSchedule(scheduleId, updates) {
  try {
    await sql.connect(dbConfig);
    const setClauses = [];
    const request = new sql.Request();

    request.input('scheduleId', sql.Int, scheduleId);

    if (updates.date !== undefined) {
      setClauses.push('date = @date');
      const dateVal = updates.date instanceof Date ? updates.date : new Date(updates.date);
      request.input('date', sql.Date, dateVal);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar(50), updates.status);
    }
    if (updates.time !== undefined) {
      setClauses.push('time = @time');
      let timeVal = updates.time;
      if (typeof timeVal === 'string' && timeVal.length === 5) {
        timeVal = `${timeVal}:00`;
      }
      request.input('time', sql.Time, timeVal);
    }
    if (updates.price !== undefined) {
      setClauses.push('price = @price');
      request.input('price', sql.Decimal(10, 2), updates.price);
    }

    setClauses.push('updatedBy = @updatedBy');
    setClauses.push('updatedAt = @updatedAt');
    request.input('updatedBy', sql.NVarChar(100), updates.updatedBy || 'system');
    request.input('updatedAt', sql.DateTime, new Date());

    if (setClauses.length === 2) {
      
      return { message: 'Nothing to update' };
    }

    const sqlString = `
      UPDATE Schedule
      SET ${setClauses.join(', ')}
      WHERE scheduleId = @scheduleId
    `;

    await request.query(sqlString);

    return { message: 'Schedule updated successfully' };
  } catch (err) {
    console.error('Error in updateSchedule:', err);
    throw err;
  }
}

// DELETE
async function deleteSchedule(scheduleId) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('scheduleId', sql.Int, scheduleId)
      .query('DELETE FROM Schedule WHERE scheduleId = @scheduleId');
    return { message: 'Schedule deleted successfully' };
  } catch (err) {
    if (err.number === 547) {  
      const e = new Error('Ky orar është i lidhur me salla dhe nuk mund të fshihet.');
      e.status = 409;
      throw e;
    }
    console.error('Error in deleteSchedule:', err);
    throw err;
  }
}

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
};
