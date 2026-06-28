import { DeptModel } from "../models/department.model.js";
import { ProfileModel } from "../models/profile.model.js";
import ApiError from "../utils/apiError.js";

export const profile = async (req, res, next) => {
  try {
    const response = await ProfileModel.findByEmail(req.email);
    if (!response) {
      return next(new ApiError(404, "User not found"));
    }
    const dept = await DeptModel.getDeptNameById(response.department_id);
    if (!dept) return next(new ApiError(404, "Department not found"));

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      user: {
        ...response,
        department_name: dept.name,
        avatar_url: null,
      },
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const updateProfile = async (req, res, next) => {
  if (req.body.name) {
    await ProfileModel.updateName(req.body.name, req.email);
  } else {
    res.status(404).json({
      success: false,
      message: "Nothing to update",
    });
  }
  res.status(200).json({
    success: true,
    message: "Profile Updated",
  });
};

export const updatePassword = async (req, res, next) => {
  //
  if (req.body.oldpassword && req.body.newpassword) {
  }
  const response = await ProfileModel.updatePass(
    req.body.oldpassword,
    req.body.newpassword,
    req.email
  );

  if (response)
    return res.status(200).json({
      success: true,
      message: "Password updated",
    });
  res.status(404).json({
    success: false,
    message: "Something went wrong",
  });
};
