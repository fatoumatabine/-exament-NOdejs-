const AppError = require("../utils/appError");

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Erreur interne du serveur";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Identifiant invalide.";
  }

  if (error.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(error.keyValue || {})[0];
    message = `La valeur du champ ${duplicatedField} existe deja.`;
  }

  if (error.code === "P2002") {
    statusCode = 409;
    const duplicatedField = error.meta?.target?.[0] || "unique";
    message = `La valeur du champ ${duplicatedField} existe deja.`;
  }

  if (error.code === "P2025") {
    statusCode = 404;
    message = "Ressource introuvable.";
  }

  if (error.name === "MulterError") {
    statusCode = 400;
    message = error.message;
  }

  if (!(error instanceof AppError) && statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
