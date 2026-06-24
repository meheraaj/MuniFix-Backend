import jwt from "jsonwebtoken";

export const generateToken = (email, id, role) => {
  const encodedToken = jwt.sign(
    {
      id,
      email,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  return encodedToken;
};

export const decodeToken = (token) => {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  return decodedToken;
};
