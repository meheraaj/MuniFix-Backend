const { UserModel } = require("../models/user.model.js");
const ApiError = require("../utils/apiError.js");
const { decodeToken } = require("../utils/jwt.token.js");

const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new ApiError(401, "Unauthorized"));
  }
  if(authHeader.length <= 6)
        return next(new ApiError(401, "Unauthorized"));


  try {
    const token = authHeader.split(" ")[1];

    const decodedToken = await decodeToken(token);
    const dtt = decodedToken;

    const userValid = await UserModel.findByEmail(dtt.email);
    const isEmailVerified = userValid ? userValid.email_verified : false;

    if (userValid && isEmailVerified) {
      req.email = dtt.email;
      req.user_id = dtt.id;
      req.role = dtt.role;
      next();
    }else if(userValid) {
      return next(new ApiError(401, "Email not verified."));
    } else {
      return next(new ApiError(401, "Unauthorized"));
    }
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token."));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(new ApiError(403, "Forbidden: Access denied for your role."));
    }
    next();
  };
};

module.exports = {
  checkAuth,
  restrictTo,
};

