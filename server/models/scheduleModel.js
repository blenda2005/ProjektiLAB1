const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');


// CREATE
//sync function createSchedule(date, status, time, price, createdBy) {
//   try {
//       console.log('► createSchedule inputs:', {
//           date,
//           time,
//           typeof_date: typeof date,
//           typeof_time: typeof time
//         });
//     await sql.connect(dbConfig);
//     const request = new sql.Request();
//     await request
//       .input('date', sql.Date, date)
//       .input('status', sql.NVarChar(50), status)
//       .input('time', sql.Time, time)
//       .input('price', sql.Decimal(10, 2), price)
//       .input('createdBy', sql.NVarChar(100), createdBy)
//       .query(`INSERT INTO Schedule (date, status, time, price, createdBy) VALUES (@date, @status, @time, @price, @createdBy)`);
//     return { message: 'Schedule created successfully' };
//   } catch (err) {
//     console.error('Gabim ne createSchedule:', err);
//     throw err;
//   }}
async function createSchedule(schedule) {
    try {
      const { date, status, time, price, createdBy } = schedule;
  
      console.log('► createSchedule inputs:', {
        date,
        time,
        typeof_date: typeof date,
        typeof_time: typeof time
      });
  
      // ▸ Kontroll i thjeshtë
      if (!date || !time) throw new Error('date or time missing');
  
      await sql.connect(dbConfig);
  
      const sqlDate = new Date(date);                 // '2025-05-21' → Date
      const sqlTime = time.length === 5 ? `${time}:00` : time;  // '14:30' → '14:30:00'
  
      await new sql.Request()
        .input('date',      sql.Date,           sqlDate)
        .input('status',    sql.NVarChar(50),   status)
        .input('time',      sql.Time,           sqlTime)
        .input('price',     sql.Decimal(10, 2), price)
        .input('createdBy', sql.NVarChar(100),  createdBy)
        .query(`
          INSERT INTO Schedule (date, status, time, price, createdBy)
          VALUES (@date, @status, @time, @price, @createdBy)
        `);
  
      return { message: 'Schedule created successfully' };
    } catch (err) {
      console.error('Gabim ne createSchedule:', err);
      throw err;
    }
  }

    // READ ALL 
    const getAllSchedules = async () => {
        try {
          const pool = await sql.connect(dbConfig);
          const result = await pool.request().query('SELECT * FROM Schedule');
      
          const formattedData = result.recordset.map(schedule => {
            return {
              ...schedule,
              date: schedule.date.toISOString().split('T')[0], // ruan vetem YYYY-MM-DD
              time: schedule.time.toString().substring(0,5)    // ruan vetem HH:mm
            };
          });
      
          return formattedData;
      
        } catch (err) {
          console.error('Gabim ne getSchedules:', err);
          throw err;
        }
      };
      
  
  // READ BY ID
  async function getScheduleById(scheduleId) {
    try {
      await sql.connect(dbConfig);
      const result = await new sql.Request()
        .input('scheduleId', sql.Int, scheduleId)
        .query('SELECT * FROM Schedule WHERE scheduleId = @scheduleId');
  
      const schedule = result.recordset[0];
      if (!schedule) return null;
  
      // Formatim i date dhe time
      schedule.date = schedule.date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      schedule.time = schedule.time.toString().substring(0, 5);   // 'HH:mm'
  
      return schedule;
  
    } catch (err) {
      console.error('Gabim ne getScheduleById:', err);
      throw err;
    }
  }

//// UPDATE 
//ync function updateSchedule(scheduleId, date, status, time, price, updatedBy) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('scheduleId', sql.Int, scheduleId)
//      .input('date', sql.Date, date)
//      .input('status', sql.NVarChar(50), status)
//      .input('time', sql.Time, time)
//      .input('price', sql.Decimal(10, 2), price)
//      .input('updatedBy', sql.NVarChar(100), updatedBy)
//      .input('updatedAt', sql.DateTime, new Date())
//      .query(`UPDATE Schedule SET 
//              date = @date, status = @status, time = @time, price = @price, 
//              updatedBy = @updatedBy, updatedAt = @updatedAt
//              WHERE scheduleId = @scheduleId`);
//    return { message: 'Schedule updated successfully' };
//  } catch (err) {
//    console.error('Gabim ne updateSchedule:', err);
//    throw err;
//  }
//}
async function updateSchedule(scheduleId, updates) {
    try {
      await sql.connect(dbConfig);
      const setClauses = [];
      const request    = new sql.Request();
      request.input('scheduleId', sql.Int, scheduleId);
  
    if (updates.date !== undefined) {
        setClauses.push('date = @date');
        request.input('date', sql.Date, updates.date);
      }
    if (updates.status !== undefined) {
        setClauses.push('status = @status');
        request.input('status', sql.NVarChar(50), updates.status);
      }
    if (updates.time !== undefined) {
        setClauses.push('time = @time');
        request.input('time', sql.Time, updates.time);
      }
    if (updates.price !== undefined) {
        setClauses.push('price = @price');
        request.input('price', sql.Decimal(10, 2), updates.price);
      }
      setClauses.push('updatedBy = @updatedBy');
      setClauses.push('updatedAt = @updatedAt');
      request.input('updatedBy', sql.NVarChar(100), updates.updatedBy);
      request.input('updatedAt', sql.DateTime, new Date());
  
      if (setClauses.length === 2) { 
        return { message: 'Nothing to update' };
      }  const sqlString = `
        UPDATE Schedule
        SET ${setClauses.join(', ')}  WHERE scheduleId = @scheduleId
      `;
      await request.query(sqlString);
     return { message: 'Schedule updated successfully' };
    } catch (err) {
      console.error('Gabim ne updateSchedule:', err);
      throw err;
    }}

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
      console.error('Gabim ne deleteSchedule:', err);
      throw err;
    }
  }


/*-----------------------------------------------------------
                     Halls_Schedule
----------------------------------------------------------- */

// CREATE (shton nje lidhje salla-orari)
async function createHallSchedule(hallsId, scheduleId) {
    try {
      await sql.connect(dbConfig);
      await new sql.Request()
        .input('hallsId', sql.Int, hallsId)
        .input('scheduleId', sql.Int, scheduleId)
        .query(`
          INSERT INTO Halls_Schedule (hallsId, scheduleId) VALUES (@hallsId, @scheduleId)
        `);
      return { message: 'Lidhja Halls_Schedule u krijua' };
    } catch (err) {
      if (err.number === 547) {
        const e = new Error('Halla ose orari nuk ekziston');
        e.status = 404;
        throw e;
      }if (err.number === 2627) { 
        const e = new Error('Kjo lidhje ekziston tashmë');
        e.status = 409;
        throw e;
      }console.error('Gabim ne lidhje halls_schedule:', err);
      throw err;
    } }
  
  // READ ALL
  async function getHallsSchedule(filter = {}) {
    const { hallsId, scheduleId } = filter;
    try {
      await sql.connect(dbConfig);
      const request = new sql.Request();
      let query = 'SELECT * FROM Halls_Schedule WHERE 1=1';
    if (hallsId) {
        query += ' AND hallsId = @hallsId';
        request.input('hallsId', sql.Int, hallsId);
      }
    if (scheduleId) {
        query += ' AND scheduleId = @scheduleId';
        request.input('scheduleId', sql.Int, scheduleId);
      }  const { recordset } = await request.query(query);
      return recordset;
    } catch (err) {
      console.error('Gabim ne getHallsSchedule:', err);
      throw err;
    }
  }
  
  // DELETE 
  async function deleteHallSchedule(hallsId, scheduleId) {
    try {
      await sql.connect(dbConfig);
      await new sql.Request()
        .input('hallsId',    sql.Int, hallsId)
        .input('scheduleId', sql.Int, scheduleId)
        .query(`
          DELETE FROM Halls_Schedule  WHERE hallsId = @hallsId AND scheduleId = @scheduleId
        `);
      return { message: 'Lidhja u fshi me sukses' };
    } catch (err) {
      console.error('Gabim ne deleteHallSchedule:', err);
      throw err;
    }
  }
  
  module.exports = {
    /* Schedule */
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
    /* Halls_Schedule */
    createHallSchedule,
    getHallsSchedule,
    deleteHallSchedule
  };