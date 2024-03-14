const mysql = require('mysql');
const bcrypt = require('bcrypt');

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

// Function to hash the password using bcrypt
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Define the User model object
const User = {
  // Function to create a new user
  createUser: (name, email, password) => {
    return new Promise((resolve, reject) => {
      hashPassword(password)
        .then((hashedPwd) => {
          const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
          connection.query(query, [name, email, hashedPwd], (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result.insertId);
          });
        })
        .catch((err) => reject(err));
    });
  },

  // Function to find a user by email
  findUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      connection.query(query, [email], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        if (results.length === 0) {
          resolve(null); // User not found
          return;
        }
        resolve(results[0]); // Return the first user found
      });
    });
  },

  // Function to compare password
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  }
};

module.exports = User;
