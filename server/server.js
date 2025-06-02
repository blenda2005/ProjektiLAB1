
const express = require('express');
const cors = require('cors'); 
const sql = require('mssql');
const dbConfig = require('./config/db');
const initializeDatabase = require('./migrations/initializeDatabase'); 
const cinemaRoutes = require('./routes/cinemaRoutes');
const hallRoutes   = require('./routes/hallsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
//const hallsScheduleRoutes = require('./routes/halls_ScheduleRoutes');
const movieRoutes = require('./routes/movieRoutes');
const hallsScheduleMovieRoutes = require('./routes/halls_Schedule_MovieRoutes');
const usersRoutes = require('./routes/usersRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const discountsRoutes = require('./routes/discountsRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const ticketsAdminRoutes = require('./routes/tickets_AdminRoutes.js');
const reservationsRoutes = require('./routes/reservationRoutes.js');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

 //Connect to MSSQL
sql.connect(dbConfig)
    .then(async () => {
        console.log('MSSQL connected successfully');
        await initializeDatabase(); // krijohen tabelat
    })
    .catch(err => console.error('MSSQL connection error:', err));

    
    // Routes for entity
    app.use('/api/cinemas', cinemaRoutes);
    app.use('/api/halls',   hallRoutes); 
    app.use('/api/schedules', scheduleRoutes);
    //app.use('/api/halls-schedule', hallsScheduleRoutes);
    app.use('/api/movies', movieRoutes);
    app.use('/api/halls-schedule-movie', hallsScheduleMovieRoutes);
    app.use('/api/users',   usersRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/clients', clientRoutes);
    app.use('/api/discounts', discountsRoutes);
    app.use('/api/tickets', ticketsRoutes);
    app.use('/api/events', eventsRoutes);
    app.use("/api/tickets-admin", ticketsAdminRoutes);
    app.use('/api/reservations', reservationsRoutes);



    // per kapjen e gabimeve
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: 'Internal server error' });
  });


    app.get('/', (req, res) => {
         res.send('Server is running');
    });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});