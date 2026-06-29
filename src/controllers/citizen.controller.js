const ApiError = require("../utils/apiError.js");
const { ComplainModel } = require("../models/complain.model.js");

const addNewComplain = async (req, res, next) => {
  const { longitude, latitude, city, street, title, description } = req.body;
  try {
    if (longitude && latitude && city && street && title && description) {
      if (!req.files || req.files.length === 0) {
        return next(new ApiError(400, "Minimum 1 image required"));
      }

      const uploadedFiles = req.files.map((file) => ({
        file_url: file.path,
        public_id: file.filename,
      }));

      const imgURL = req.files.map((file) => file.path);

      const response = await ComplainModel.addNewComplain(
        longitude,
        latitude,
        city,
        street,
        title,
        description,
        req.user_id,
        imgURL
      );

      res.status(200).json({
        success: true,
        message: "complain added successfully",
        complain: response,
        uploadedFiles,
      });
    } else {
      return next(
        new ApiError(
          400,
          "longitude, latitude, city, street, title, description cannot be empty"
        )
      );
    }
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

// Get Complain List By UserID
const getComplainByUserId = async (req, res, next) => {
  const userID = req.user_id;

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const response = await ComplainModel.userComplainList(
      userID,
      limit,
      offset
    );

    if (response.length === 0) {
      return next(new ApiError(404, "No complaints found"));
    }

    const finalResponse = response.map((data) => ({
      id: data.id,
      title: data.title,
      poster: data.image_url,
      created_at: data.created_at,
      description: data.description,
      longitude: data.longitude,
      latitude: data.latitude,
      street: data.street,
      city: data.city,
    }));

    res.status(200).json({
      success: true,
      message: `${response.length} complaints found`,
      page,
      limit,
      hasMore: response.length === limit,
      complaints: finalResponse,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  addNewComplain,
  getComplainByUserId,
};
