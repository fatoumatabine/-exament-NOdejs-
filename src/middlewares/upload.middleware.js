const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: process.env.CLOUDINARY_FOLDER || "gestion-approvisionnements",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image"
  })
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
