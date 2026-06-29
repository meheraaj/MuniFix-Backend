const UserModel = require("../models/user.model.js");
const ApiError = require("../utils/apiError.js");
const { decodeToken } = require("../utils/jwt.token.js");

const checkAuth = async (req, res, next) => {
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
      req.role = dtt.role;
      req.user_id = dtt.id;
      next();
    } else return next(new ApiError(401, "Unauthorized"));
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token."));
  }
};

module.exports = checkAuth;
