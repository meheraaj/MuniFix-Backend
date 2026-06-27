const { UserModel } = require("../models/user.model.js");
const ApiError = require("../utils/apiError");
const express = require("express");
const { verifyPassword } = require("../utils/validator.js");
const { generateToken } = require("../utils/jwt.token.js");

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, department_id, role } = req.body;

    if (!name || !email || !phone || !password) {
      return next(
        new ApiError(
          400,
          "Name, email, Password and phone are required fields."
        )
      );
    }

    // Check email already exist or not

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return next(
        new ApiError(409, "An Account with this email already exist.")
      );
    }

    const newUser = await UserModel.createUser({
      name,
      email,
      password,
      phone,
      department_id,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Account registered successfully",
      user: newUser,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await UserModel.findByEmail(email);
    if (!existingUser) {
      return next(new ApiError(409, "Account not found with this email."));
    }

    const loginResponse = await UserModel.loginUser({ email, password });

    let matched = await verifyPassword(password, loginResponse.password);

    if (matched) {
      const jwtToken = generateToken(loginResponse);
      return res.status(200).json({
        success: true,
        message: "Login Success.",
        users: {
          email: email,
          id: loginResponse.id,
        },
        authtoken: jwtToken,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "wrong password.",
        email: email,
      });
    }
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  register,
  login,
};
