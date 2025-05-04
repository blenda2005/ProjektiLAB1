const express = require('express');
const sql = require('mssql');
const dbConfig = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MSSQL
sql.connect(dbConfig)
    .then(() => console.log('MSSQL connected successfully'))
    .catch(err => console.error('MSSQL connection error:', err));

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
