require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Import cors module

const userRoutes = require("./Routes/UserRoute");

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

const PORT = process.env.PORT || 3001;

// MySQL database connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3307',
  user: 'root',
  password: '',
  database: 'laravelvue'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
