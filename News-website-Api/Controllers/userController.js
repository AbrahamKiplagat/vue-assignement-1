const { signAccessTocken, signRefreshToken } = require("../Helpers/jwt_helper");
const createError = require('http-errors');
const User = require("../Models/user");
const { authSchema } = require("../auth/auth_schema");

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
  }
};
