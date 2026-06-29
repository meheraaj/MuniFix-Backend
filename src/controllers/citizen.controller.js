const { response } = require("express");
const ApiError = require("../utils/apiError.js");
const { CitizenModel } = require("../models/citizen.model.js");

const addNewComplain = async (req, res, next) => {
  const { longitude, latitude, city, street, image, title, description } =
    req.body;
  try {
    if (longitude && latitude && city && street && title && description) {
      if (!req.files || req.files.length === 0) {
        return next(new ApiError(400, "Minimum 1 image required"));
      }

      const uploadedFiles = req.files.map((file) => ({
        file_url: file.path,
        public_id: file.filename,
      }));

      const response = await CitizenModel.addNewComplain(
        longitude,
        latitude,
        city,
        street,

        title,
        description,
        req.user_id
      );

      res.status(200).json({
        success: true,
        message: "complain added successfully",
        complain: {
          ...response,
        },
      });
    } else {
      return next(
        new ApiError(
          404,
          "longitude, latitude, city, street, image, title, description cannot be empty"
        )
      );
    }
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = { addNewComplain };
