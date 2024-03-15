const { signAccessTocken, signRefreshToken } = require("../Helpers/jwt_helper");
const createError = require('http-errors');
const User = require("../Models/user");
const { authSchema } = require("../auth/auth_schema");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const knex = require('knex');
module.exports = {
  registerUser: async (req, res, next) => {
    try {
      console.log("Request Body:", req.body);
  
      // Validate request body against authSchema
      const result = await authSchema.validateAsync(req.body);

      // Ensure all required fields are present in the request body
      if (!result.name || !result.email || !result.password) {
        throw createError.BadRequest('Name, email, and password are required');
      }

      // Create a new user
      const exists = await User.findUserByEmail(result.email);
      if (exists) throw createError.Conflict(`${result.email} is already registered`);
  
      const userId = await User.createUser(result.name, result.email, result.password);
      const accessToken = await signAccessTocken(userId);
      const refreshToken = await signRefreshToken(userId);
  
      res.status(200).send({ accessToken, refreshToken });
    } catch (error) {
      console.log(error.message);
  
      // Handle Joi validation error
      if (error.isJoi === true) {
        const errorMessage = error.details.map(detail => detail.message).join('; ');
        return res.status(422).json({ error: errorMessage });
      }
  
      // Handle other errors
      next(error);
    }
  },

  getRegisteredUser: async (req, res) => {
    try {
      const users = await User.getAllUsers();
      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "internal server error" });
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      const user = await User.findUserByEmail(result.email);
      if (!user) throw createError.NotFound("User Not registered");

      const isPasswordValid = await User.comparePassword(req.body.password, user.password);
      if (!isPasswordValid) throw createError.Unauthorized("Invalid User Name/Password");

      const accessToken = await signAccessTocken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.status(200).send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) return next(createError.BadRequest('Invalid User Name/Password'));
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      const accessToken = await signAccessTocken(userId);
      const refToken = await signRefreshToken(userId);
      res.status(200).send({ accessToken, refreshToken: refToken });
    } catch (error) {
      next(error);
    }
  },

  GetUser: async (req, res, next) => {
    const id = req.params.id;
    try {
      const user = await User.findUserById(id);
      if (!user) {
        throw createError(404, "User does not exist");
      }
      res.status(200).send(user);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  UpdateUser: async (req, res, next) => {
    try {
      const id = req.params.id;
      const update = req.body;
      const user = await User.updateUserById(id, update);
      res.send(user);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  DeleteUser: async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await User.deleteUserById(id);
      if (!user) {
        throw createError(404, "User does not exist");
      }
      res.status(200).send(user);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findUserByEmail(email);
      if (!user) throw createError.NotFound('User not found');

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour

      await knex('users')
        .where('email', email)
        .update({ resetPasswordToken: resetToken, resetPasswordExpires: user.resetPasswordExpires });

      // Send password reset email
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'kurerelagat01@gmail.com', // Your Gmail email address
          pass: '@KurereLagat01' // Your Gmail password
        }
      });

      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `http://localhost:5173/reset-password/${resetToken}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          throw createError.InternalServerError('Error sending email');
        } else {
          console.log('Email sent: ' + info.response);
          res.status(200).json({ message: 'Password reset email sent' });
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  resetPassword: async (req, res, next) => {
    try {
      const { resetToken } = req.params;
      const { newPassword, confirmPassword } = req.body;

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        throw createError.BadRequest('Passwords do not match');
      }

      // Find user by reset token
      const user = await knex('users')
        .where('resetPasswordToken', resetToken)
        .where('resetPasswordExpires', '>', Date.now())
        .first();

      // If no user found or reset token expired
      if (!user) {
        throw createError.BadRequest('Invalid or expired reset token');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password and clear reset token fields
      await knex('users')
        .where('id', user.id)
        .update({ password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null });

      // Respond with success message
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
};