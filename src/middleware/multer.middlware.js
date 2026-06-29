const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");
const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => {
      const nameWithoutExt = path.parse(file.originalname).name;
      const cleanname = nameWithoutExt.replaceAll(" ", "-");
      const finalName = `${cleanname}-${Date.now()}`;
      return finalName;
    },
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
