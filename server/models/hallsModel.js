const sql      = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');



//CREATE
async function createHalls(type, name, capacity, cinemaId) {
    try {
      await sql.connect(dbConfig);
      await new sql.Request()
        .input('type', sql.NVarChar(50), type)  
        .input('name',  sql.NVarChar(50), name)
        .input('capacity', sql.Int, capacity)
        .input('cinemaId', sql.Int, cinemaId)
        .query(`
          INSERT INTO Halls (type, name, capacity, cinemaId) VALUES (@type, @name, @capacity, @cinemaId)
        `);
      return { message: 'Hall created successfully' };
    } catch (err) {
        
        if (err.number === 547) {
          const e = new Error('Kjo kinema nuk ekziston');
          e.status = 404;              
          throw e;
        }
        console.error('Gabim ne createHalls:', err);
        throw err;
      }
    }

  //READ ALL
  async function getAllHalls() {
    try {
      await sql.connect(dbConfig);
      const result = await new sql.Request()
        .query('SELECT * FROM Halls');
      return result.recordset;
    } catch (err) {
      console.error('Gabim ne getAllHalls:', err);
      throw err;
    }
  }

  //READ BY ID
  async function getHallsById(hallsId) {
    try {
      await sql.connect(dbConfig);
      const result = await new sql.Request()
        .input('hallsId', sql.Int, hallsId)
        .query('SELECT * FROM Halls WHERE hallsId = @hallsId');
      return result.recordset[0];
    } catch (err) {
      console.error('Gabim ne getHallById:', err);
      throw err;
    }
  }
  

  //UPDATE
  async function updateHalls(hallsId, type, name, capacity, cinemaId) {
    try {
      await sql.connect(dbConfig);
      await new sql.Request()
        .input('hallsId', sql.Int, hallsId)
        .input('type', sql.NVarChar(50), type)
        .input('name', sql.NVarChar(50), name)
        .input('capacity', sql.Int,  capacity)
        .input('cinemaId', sql.Int, cinemaId)
        .query(`
          UPDATE Halls
          SET type = @type, name = @name, capacity = @capacity, cinemaId = @cinemaId
          WHERE hallsId = @hallsId
        `);
      return { message: 'Hall updated successfully' };
    } catch (err) {
      console.error('Gabim ne updateHalls:', err);
      throw err;
    }
  }

  //DELETE
  async function deleteHalls(hallsId) {
    try {
      await sql.connect(dbConfig);
      await new sql.Request()
        .input('hallsId', sql.Int, hallsId)
        .query('DELETE FROM Halls WHERE hallsId = @hallsId');
      return { message: 'Hall deleted successfully' };
    } catch (err) {
      console.error('Gabim ne deleteHalls:', err);
      throw err;
    }
  }
  
module.exports = {
    createHalls,
    getAllHalls,
    getHallsById,
    updateHalls,
    deleteHalls
  };