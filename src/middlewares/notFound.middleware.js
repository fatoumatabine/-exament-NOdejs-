const AppError = require("../utils/appError");

const notFound = (req, res, next) => {
  next(new AppError(`Route introuvable : ${req.originalUrl}`, 404));
};

module.exports = notFound;
