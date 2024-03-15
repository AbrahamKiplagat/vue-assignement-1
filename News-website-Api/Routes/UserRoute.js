// UserRoute.js

const express = require("express");
const router = express.Router(); // Change 'routes' to 'router' for consistency
const userController = require('../Controllers/userController');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const User = require("../Models/user");
const { verifyAcccessToken } = require("../Helpers/jwt_helper");

// Define the registration route
router.post('/register', userController.registerUser);
router.post('/login', userController.login);
router.post('/refreshtoken', userController.login); // Should this be a POST request?

router.get('/register', userController.getRegisteredUser); // Use a comma and the function for route handler

// Route to initiate the forgot password process
router.post("/forgot-password", userController.forgotPassword);

// Route to handle the reset password process
router.post("/reset-password/:resetToken", userController.resetPassword);

module.exports = router;
