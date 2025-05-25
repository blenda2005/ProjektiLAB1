//const sql = require('mssql/msnodesqlv8');
//const dbConfig = require('../config/db');
//
//// CREATE
//async function createHallScheduleMovie(hallsId, scheduleId, movieId) {
//  try {
//    if (!hallsId || !scheduleId || !movieId) throw new Error('hallsId, scheduleId or movieId missing');
//
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('hallsId', sql.Int, hallsId)
//      .input('scheduleId', sql.Int, scheduleId)
//      .input('movieId', sql.Int, movieId)
//      .query(`
//        INSERT INTO Halls_Schedule_Movie (hallsId, scheduleId, movieId)
//        VALUES (@hallsId, @scheduleId, @movieId)
//      `);
//
//    return { message: 'Hall-Schedule-Movie link created successfully' };
//  } catch (err) {
//    console.error('Error in createHallScheduleMovie:', err);
//    throw err;
//  }
//}
//
//// READ ALL
//async function getAllHallScheduleMovies() {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request().query('SELECT * FROM Halls_Schedule_Movie');
//    return result.recordset;
//  } catch (err) {
//    console.error('Error in getAllHallScheduleMovies:', err);
//    throw err;
//  }
//}
//
//// READ BY IDs
//async function getHallScheduleMovie(hallsId, scheduleId, movieId) {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request()
//      .input('hallsId', sql.Int, hallsId)
//      .input('scheduleId', sql.Int, scheduleId)
//      .input('movieId', sql.Int, movieId)
//      .query(`
//        SELECT * FROM Halls_Schedule_Movie
//        WHERE hallsId = @hallsId AND scheduleId = @scheduleId AND movieId = @movieId
//      `);
//
//    return result.recordset[0] || null;
//  } catch (err) {
//    console.error('Error in getHallScheduleMovie:', err);
//    throw err;
//  }
//}
//
//// DELETE
//async function deleteHallScheduleMovie(hallsId, scheduleId, movieId) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('hallsId', sql.Int, hallsId)
//      .input('scheduleId', sql.Int, scheduleId)
//      .input('movieId', sql.Int, movieId)
//      .query(`
//        DELETE FROM Halls_Schedule_Movie
//        WHERE hallsId = @hallsId AND scheduleId = @scheduleId AND movieId = @movieId
//      `);
//
//    return { message: 'Hall-Schedule-Movie link deleted successfully' };
//  } catch (err) {
//    console.error('Error in deleteHallScheduleMovie:', err);
//    throw err;
//  }
//}
//
//module.exports = {
//  createHallScheduleMovie,
//  getAllHallScheduleMovies,
//  getHallScheduleMovie,
//  deleteHallScheduleMovie
//};
//


const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

// CREATE lidhje halls-schedule-movie
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

// READ të gjitha lidhjet për një sallë dhe orar, me info movie
async function getMoviesByHallSchedule(hallsId, scheduleId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input('hallsId', sql.Int, hallsId)
      .input('scheduleId', sql.Int, scheduleId)
      .query(`
        SELECT m.* FROM Halls_Schedule_Movie hsm
        JOIN Movie m ON hsm.movieId = m.movieId
        WHERE hsm.hallsId = @hallsId AND hsm.scheduleId = @scheduleId
      `);

    return result.recordset;
  } catch (err) {
    console.error('Error in getMoviesByHallSchedule:', err);
    throw err;
  }
}

// DELETE lidhje halls-schedule-movie
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
  deleteHallScheduleMovie
};
