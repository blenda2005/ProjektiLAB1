const sql = require('mssql'); // Importo sql veçmas
const dbConfig = require('../config/db'); // Merr configun

async function initializeDatabase() {
    try {
        const pool = await sql.connect(dbConfig); // Lidhja me DB

        // 1. Cinema
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Cinema' AND xtype='U')
            CREATE TABLE Cinema (
                cinemaId INT PRIMARY KEY IDENTITY(1,1),
                city NVARCHAR(50) NOT NULL,
                name NVARCHAR(50) NOT NULL
            )
        `);
        console.log('Tabela Cinema u krijua me sukses!');

        // 2. Halls
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Halls' AND xtype='U')
            CREATE TABLE Halls (
                hallsId INT PRIMARY KEY IDENTITY(1,1),
                type NVARCHAR(50) NOT NULL CHECK (type IN ('2D', '3D', 'IMAX', 'VIP')),
                name NVARCHAR(50) NOT NULL,
                capacity INT NOT NULL CHECK (capacity > 0),
                cinemaId INT FOREIGN KEY REFERENCES Cinema(cinemaId)ON DELETE CASCADE
            )
        `);
        console.log('Tabela Halls u krijua me sukses!');

        // 3. Schedule
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Schedule' AND xtype='U')
            CREATE TABLE Schedule (
                scheduleId INT IDENTITY(1,1) PRIMARY KEY,
                date DATE NOT NULL,
                status NVARCHAR(50) NOT NULL,
                time TIME NOT NULL,
                price DECIMAL(10,2) CHECK (price >= 0),
                createdAt DATETIME DEFAULT GETDATE(),
                createdBy NVARCHAR(100) NOT NULL,
                updatedAt DATETIME,
                updatedBy NVARCHAR(100)
            )
        `);
        console.log('Tabela Schedule u krijua me sukses!');

       // // 4. Halls_Schedule
       // await pool.request().query(`
       //     IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Halls_Schedule' AND xtype='U')
       //     CREATE TABLE Halls_Schedule (
       //         hallsId INT NOT NULL,
       //         scheduleId INT NOT NULL,
       //         PRIMARY KEY (hallsId, scheduleId),
       //         FOREIGN KEY (hallsId) REFERENCES Halls(hallsId) ON DELETE CASCADE,
       //         FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId) ON DELETE CASCADE
       //     )
       // `);
       // console.log('Tabela Halls_Schedule u krijua me sukses!');

        // 4. Movie
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Movie' AND xtype='U')
            CREATE TABLE Movie (
                movieId INT PRIMARY KEY IDENTITY(1,1),
                title NVARCHAR(100) NOT NULL,
                genre NVARCHAR(50) NOT NULL,
                age_Restriction VARCHAR(3) NOT NULL CHECK (age_Restriction IN ('+6', '+12', '+15', '+18', '+21')),
                description NVARCHAR(MAX),
                duration TIME NOT NULL,
                language NVARCHAR(50) NOT NULL,
                subtitled BIT DEFAULT 0,
                format NVARCHAR(5) NOT NULL DEFAULT '2D' CHECK (format IN ('2D', '3D', 'IMAX', '4DX')),
                status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
                posterPath NVARCHAR(255),
                createdAt DATETIME DEFAULT GETDATE(),
                createdBy NVARCHAR(50) NOT NULL,
                updatedAt DATETIME,
                updatedBy NVARCHAR(50)
            )
        `);
        console.log('Tabela Movie u krijua me sukses!');

        // 5. Halls_Schedule_Movie
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Halls_Schedule_Movie' AND xtype='U')
            CREATE TABLE Halls_Schedule_Movie (
                hallsId INT NOT NULL,
                scheduleId INT NOT NULL,
                movieId INT NOT NULL,
                PRIMARY KEY (hallsId, scheduleId),
                FOREIGN KEY (hallsId) REFERENCES Halls(hallsId) ON DELETE CASCADE,
                FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId) ON DELETE CASCADE,
                FOREIGN KEY (movieId) REFERENCES Movie(movieId) ON DELETE CASCADE
            )
        `);
        console.log('Tabela Halls_Schedule_Movie u krijua me sukses!');

        //6. Users
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
            userId INT PRIMARY KEY IDENTITY(1,1),
            firstName NVARCHAR(50) NOT NULL,
            lastName NVARCHAR(50) NOT NULL,
            gender NVARCHAR(10),
            date_of_birth DATE,
            address NVARCHAR(100),
            zipCode NVARCHAR(10),
            city NVARCHAR(50),
            phoneNumber NVARCHAR(20) UNIQUE,
            passwordHash VARBINARY(255) NOT NULL,
            role NVARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Client')),
            createdAt DATETIME DEFAULT GETDATE(),
            createdBy NVARCHAR(100),
            updatedAt DATETIME,
            updatedBy NVARCHAR(100),
            cinemaId INT,
            FOREIGN KEY (cinemaId) REFERENCES Cinema(cinemaId) ON DELETE SET NULL
        )
        `);
        console.log('Tabela Users u krijua me sukses!');

         // 7. Admin
         await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Admin' AND xtype='U')
            CREATE TABLE Admin (
            adminId INT PRIMARY KEY IDENTITY(1,1),
            responsibility  NVARCHAR(255),
            userId INT NOT NULL,
            FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
            )
        `);
        console.log('Tabela Admin u krijua me sukses!');

         // 8. Client
         await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Client' AND xtype='U')
            CREATE TABLE Client (
             clientId INT PRIMARY KEY IDENTITY(1,1),
             status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
             userId INT NOT NULL,
             FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
            )
        `);
        console.log('Tabela Client u krijua me sukses!');

         // 9. Discounts
         await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Discounts' AND xtype='U')
            CREATE TABLE Discounts (
             discountId INT PRIMARY KEY IDENTITY(1,1),
             type NVARCHAR(100) NOT NULL,
             percentage DECIMAL(5,2) NOT NULL CHECK (percentage BETWEEN 0 AND 80),
             start_date DATE NOT NULL,
             end_date DATE NOT NULL,
             CHECK (start_date < end_date),
             status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
             createdAt DATETIME DEFAULT GETDATE(),
             createdBy NVARCHAR(100),
             updatedAt DATETIME,
             updatedBy NVARCHAR(100)
            )
        `);
        console.log('Tabela Discounts u krijua me sukses!');

         // 10. Tickets
         await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tickets' AND xtype='U')
            CREATE TABLE Tickets (
            ticketId INT PRIMARY KEY IDENTITY(1,1),
            date DATE NOT NULL,
            time TIME NOT NULL,
            seatCount INT NOT NULL,
            seats NVARCHAR(100),
            paymentMethod NVARCHAR(50),
            status NVARCHAR(50) NOT NULL,
            qr_path NVARCHAR(255),
            discountId INT null,
            hallsId INT NOT NULL,
            scheduleId INT NOT NULL,
            clientId INT NULL,
            FOREIGN KEY (discountId) REFERENCES Discounts(discountId),
            FOREIGN KEY (hallsId, scheduleId) REFERENCES Halls_Schedule_Movie(hallsId, scheduleId),
            FOREIGN KEY (clientId) REFERENCES Client(clientId)
            )
        `);
        console.log('Tabela Tickets u krijua me sukses!');

        // 13. Events
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Events' AND xtype='U')
            CREATE TABLE Events (
            eventId INT PRIMARY KEY IDENTITY(1,1),
            title NVARCHAR(100) NOT NULL,
            description NVARCHAR(MAX),
            date DATE NOT NULL,
            time TIME NOT NULL,
            posterPath NVARCHAR(255),
            status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
            hallsId INT,
            scheduleId INT,
            discountId INT,
            createdAt DATETIME DEFAULT GETDATE(),
            createdBy NVARCHAR(100),
            updatedAt DATETIME,
            updatedBy NVARCHAR(100),
            FOREIGN KEY (hallsId, scheduleId) REFERENCES Halls_Schedule_Movie(hallsId, scheduleId) ON DELETE CASCADE,
            FOREIGN KEY (discountId) REFERENCES Discounts(discountId) ON DELETE SET NULL
            )
        `);
        console.log('Tabela Events u krijua me sukses!');

         // 14. Tickets_Admin
         await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tickets_Admin' AND xtype='U')
            CREATE TABLE Tickets_Admin (
            adminId INT NOT NULL,
            ticketId INT NOT NULL,
            createdAt DATETIME DEFAULT GETDATE(),
            createdBy NVARCHAR(100),
            updatedAt DATETIME,
            updatedBy NVARCHAR(100),
            PRIMARY KEY (adminId, ticketId),
            FOREIGN KEY (adminId) REFERENCES Admin(adminId) ON DELETE CASCADE,
            FOREIGN KEY (ticketId) REFERENCES Tickets(ticketId) ON DELETE CASCADE
            )
        `);
        console.log('Tabela Tickets_Admin  u krijua me sukses!');

        // 14. Reservations
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reservations' AND xtype='U')
            CREATE TABLE Reservations (
            reservationId INT PRIMARY KEY IDENTITY(1,1),
            seatCount INT NOT NULL CHECK (seatCount > 0),
            seats NVARCHAR(255),
            type NVARCHAR(50),
            status NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
            reservationDate DATE NOT NULL,
            createdAt DATETIME DEFAULT GETDATE(),
            createdBy NVARCHAR(100),
            updatedAt DATETIME,
            updatedBy NVARCHAR(100),
            clientId INT,
            hallsId INT,
            scheduleId INT,
            FOREIGN KEY (clientId) REFERENCES Client(clientId) ON DELETE CASCADE,
            FOREIGN KEY (hallsId, scheduleId) REFERENCES Halls_Schedule_Movie(hallsId, scheduleId) ON DELETE CASCADE

            )
        `);
        console.log('Tabela Reservations  u krijua me sukses!');

          // 16.  Reservations_Admin 
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reservations_Admin' AND xtype='U')
            CREATE TABLE Reservations_Admin (
            reservationId INT NOT NULL,
            adminId INT NOT NULL,
            createdAt DATETIME DEFAULT GETDATE(),
            createdBy NVARCHAR(100), 
            updatedAt DATETIME,
            updatedBy NVARCHAR(100),
            PRIMARY KEY (adminId, reservationId),
            FOREIGN KEY (adminId) REFERENCES Admin(adminId) ON DELETE NO ACTION ,
            FOREIGN KEY (reservationId) REFERENCES Reservations(reservationId) ON DELETE NO ACTION
            )
        `);
        console.log('Tabela Reservations_Admin  u krijua me sukses!');



    } catch (err) {
        console.error('Gabim gjatë inicializimit të databazës:', err.message);
    }
}

module.exports = initializeDatabase;
