import jwt from "jsonwebtoken";

export const generateToken = (data) => {
  const encodedToken = jwt.sign(
    {
      email: data.email,
      id: data.id,
      role: data.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  return encodedToken;
};

export const decodeToken = async (token) => {
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
  return decodedToken;
};
