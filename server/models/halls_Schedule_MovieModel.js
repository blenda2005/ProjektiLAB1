const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');
//test
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
async function createHallScheduleMovie(hallsId, scheduleId, movieId) {
  try {
    if (!hallsId || !scheduleId || !movieId) throw new Error('hallsId, scheduleId, or movieId missing');

    await sql.connect(dbConfig);
    await new sql.Request()
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .input('movieId', sql.Int, movieId)
      .query(`
        INSERT INTO Halls_Schedule_Movie (hallsId, scheduleId, movieId)
        VALUES (@hallsId, @scheduleId, @movieId)
      `);

    return { message: 'Hall-Schedule-Movie link created successfully' };
  } catch (err) {
    console.error('Error in createHallScheduleMovie:', err);
    throw err;
  }
}

//READ ALL
async function getAllHallScheduleMovies() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .query('SELECT * FROM Halls_Schedule_Movie');
    return result.recordset;
  } catch (err) {
    console.error('Error in getAllHallScheduleMovies:', err);
    throw err;
  }
}


//Read by id-hall &schedule
async function getMoviesByHallSchedule(hallsId, scheduleId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT m.*, 
               s.date, 
               s.time
        FROM Halls_Schedule_Movie hsm
        JOIN Movie m ON hsm.movieId = m.movieId
        JOIN Schedule s ON hsm.scheduleId = s.scheduleId
        WHERE hsm.hallsId = @hallsId AND hsm.scheduleId = @scheduleId
      `);

    return result.recordset.map(row => {
      // Format date 
      const formattedDate = row.date ? row.date.toISOString().slice(0, 10) : null;

      // Format time
      let formattedTime = null;
      if (row.time) {
        if (row.time instanceof Date) {
          formattedTime = row.time.toTimeString().slice(0, 8);
        } else if (typeof row.time === 'string') {
          formattedTime = row.time.length >= 8 ? row.time.slice(0, 8) : row.time;
        }
      }

      // Format tjeter
      let formattedDuration = null;
      if (row.duration) {
        if (row.duration instanceof Date) {
          formattedDuration = row.duration.toTimeString().slice(0, 8);
        } else if (typeof row.duration === 'string') {
          formattedDuration = row.duration.length >= 8 ? row.duration.slice(0, 8) : row.duration;
        }
      }

      return {
        ...row,
        date: formattedDate,
        time: formattedTime,
        duration: formattedDuration,
      };
    });
  } catch (err) {
    console.error('Error fetching movies by hall and schedule:', err);
    throw err;
  }
}


// DELETE 
async function deleteHallScheduleMovie(hallsId, scheduleId, movieId) {
  try {
    if (!hallsId || !scheduleId || !movieId) throw new Error('Missing hallsId, scheduleId or movieId');

    await sql.connect(dbConfig);
    await new sql.Request()
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .input('movieId', sql.Int, movieId)
      .query(`
        DELETE FROM Halls_Schedule_Movie
        WHERE hallsId = @hallsId AND scheduleId = @scheduleId AND movieId = @movieId
      `);

    return { message: 'Hall-Schedule-Movie link deleted successfully' };
  } catch (err) {
    console.error('Error in deleteHallScheduleMovie:', err);
    throw err;
  }
}

module.exports = {
  createHallScheduleMovie,
  getMoviesByHallSchedule,
   getAllHallScheduleMovies,
  deleteHallScheduleMovie
};
