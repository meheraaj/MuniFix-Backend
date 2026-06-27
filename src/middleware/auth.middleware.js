import { UserModel } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { decodeToken } from "../utils/jwt.token.js";

export const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const token = authHeader.split(" ")[1];

    const decodedToken = await decodeToken(token);
    const dtt = decodedToken;

    const userValid = await UserModel.findByEmail(dtt.email);
    if (userValid) {
      req.email = dtt.email;
      next();
    } else return next(new ApiError(401, "Unauthorized"));
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token."));
  }
};
