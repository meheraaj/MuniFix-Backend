const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user.model.js");
const ApiError = require("../utils/apiError");
const express = require("express");

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

module.exports = {
  register,
};
