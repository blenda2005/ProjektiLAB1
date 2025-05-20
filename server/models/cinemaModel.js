const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

//CREATE
async function createCinema(name, city) {
  try {
    await sql.connect(dbConfig); // Krijon lidhjen me databazen
    const request = new sql.Request(); 
    await request
      .input('name', sql.NVarChar(50), name)
      .input('city', sql.NVarChar(50), city)
      .query('INSERT INTO Cinema (name, city) VALUES (@name, @city)');

    return { message: 'Cinema created successfully' };
  } catch (err) {
    console.error('Gabim ne createCinema:', err);
    throw err;
  }
}

//read
async function getAllCinemas() {
    try {
      await sql.connect(dbConfig);
      const result = await new sql.Request().query('SELECT * FROM Cinema');
      return result.recordset;
    } catch (err) {
      console.error('Gabim ne getAllCinemas:', err);
      throw err;
    }
  }
  
  async function getCinemaById(cinemaID) {
    try {
      await sql.connect(dbConfig);
      const result = await new sql.Request()
        .input('cinemaID', sql.Int, cinemaID)
        .query('SELECT * FROM Cinema WHERE cinemaID = @cinemaID');
      return result.recordset[0];
    } catch (err) {
      console.error('Gabim ne getCinemaById:', err);
      throw err;
    }
  }

  //UPDATE 
  async function updateCinema(cinemaID, name, city) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input('cinemaID', sql.Int, cinemaID)
      .input('name', sql.NVarChar(50), name)
      .input('city', sql.NVarChar(50), city)
      .query('UPDATE Cinema SET name = @name, city = @city WHERE cinemaID = @cinemaID');
    return { message: 'Cinema updated successfully' };
  } catch (err) {
    console.error('Gabim ne updateCinema:', err);
    throw err;
  }
}

//DELETE
async function deleteCinema(cinemaID) {
    try {
      await sql.connect(dbConfig);
      await new sql.Request()
        .input('cinemaID', sql.Int, cinemaID)
        .query('DELETE FROM Cinema WHERE cinemaID = @cinemaID');
      return { message: 'Cinema deleted successfully' };
    } catch (err) {
      console.error('Gabim ne deleteCinema:', err);
      throw err;
    }
  }
 

module.exports = {
  createCinema,
  getAllCinemas,
  getCinemaById,
  updateCinema,
  deleteCinema
};
