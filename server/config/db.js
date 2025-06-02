
const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=testKinema;Trusted_Connection=Yes;',
    options: {
        trustServerCertificate: true
    }
};

module.exports = config;

