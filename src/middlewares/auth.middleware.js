const jwt = require("jsonwebtoken");

const { prisma } = require("../config/db");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Acces refuse. Token manquant.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nom: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError("Utilisateur introuvable.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError("Token invalide ou expire.", 401);
  }
});

module.exports = authenticate;
