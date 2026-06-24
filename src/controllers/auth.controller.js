import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";

export const register = async (req, res, next) => {
  const { name, email, phone, password, department_id, role } = req.body;

  if (!(name || email || phone || password)) {
    throw new ApiError(
      400,
      "Name, email, Password and phone are required fields."
    );
  }

  
};
