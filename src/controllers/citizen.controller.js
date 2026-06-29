import { response } from "express";
import ApiError from "../utils/apiError.js";
import { CitizenModel } from "../models/citizen.model.js";

export const addNewComplain = async (req, res, next) => {
  const { longitude, latitude, city, street, image, title, description } =
    req.body;

  if (longitude && latitude && city && street && title && description) {
    try {
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
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  } else {
    return next(
      new ApiError(
        404,
        "longitude, latitude, city, street, image, title, description cannot be empty"
      )
    );
  }
};
