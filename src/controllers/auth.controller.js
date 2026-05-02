const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { prisma } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { normalizeString } = require("../utils/requestParsers");

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });

const buildAuthResponse = (user) => ({
  success: true,
  message: "Authentification reussie.",
  token: generateToken(user.id),
  user: {
    id: user.id,
    nom: user.nom,
    email: user.email
  }
});

const register = asyncHandler(async (req, res) => {
  const nom = normalizeString(req.body.nom, "nom", { required: true });
  const email = normalizeString(req.body.email, "email", { required: true }).toLowerCase();
  const { password } = req.body;

  if (!password) {
    throw new AppError("Les champs nom, email et password sont obligatoires.", 400);
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new AppError("Le mot de passe doit contenir au moins 6 caracteres.", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError("Un utilisateur avec cet email existe deja.", 409);
  }

  const user = await prisma.user.create({
    data: {
      nom,
      email,
      password: await bcrypt.hash(password, 10)
    }
  });

  res.status(201).json(buildAuthResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const email = normalizeString(req.body.email, "email", { required: true }).toLowerCase();
  const { password } = req.body;

  if (!password) {
    throw new AppError("Les champs email et password sont obligatoires.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Email ou mot de passe invalide.", 401);
  }

  res.status(200).json(buildAuthResponse(user));
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = {
  register,
  login,
  me
};
