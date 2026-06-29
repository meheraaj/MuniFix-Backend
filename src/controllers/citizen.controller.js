import { response } from "express";

export const addNewComplain = async (req, res, next) => {
  const {
    longitude,
    latitude,
    city,
    street,
    country,
    image,
    title,
    description,
  } = req.body;

  response.status(200).json(req.body);
};
