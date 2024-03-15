const bcrypt = require('bcrypt');
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: '3307',
    user: 'root',
    password: '',
    database: 'laravelvue'
  }
});

// Function to hash the password using bcrypt
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Define the User model object
const User = {
  // Function to create a new user
  createUser: async (name, email, password) => {
    try {
      const hashedPwd = await hashPassword(password);
      const userId = await knex('users').insert({ name, email, password: hashedPwd });
      return userId[0];
    } catch (error) {
      throw error;
    }
  },

  // Function to find a user by email
  findUserByEmail: async (email) => {
    try {
      const user = await knex('users').where('email', email).first();
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Function to compare password
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  }
};

module.exports = User;
