const { prisma } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { normalizeString, parseId } = require("../utils/requestParsers");

const buildFournisseurPayload = (body, options = {}) => {
  const data = {};

  if (!options.partial || body.nom !== undefined) {
    data.nom = normalizeString(body.nom, "nom", { required: !options.partial });
  }

  if (!options.partial || body.telephone !== undefined) {
    data.telephone = normalizeString(body.telephone, "telephone", { required: !options.partial });
  }

  if (!options.partial || body.adresse !== undefined) {
    data.adresse = normalizeString(body.adresse, "adresse", { required: !options.partial });
  }

  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};

const createFournisseur = asyncHandler(async (req, res) => {
  const fournisseur = await prisma.fournisseur.create({
    data: buildFournisseurPayload(req.body)
  });

  res.status(201).json({
    success: true,
    message: "Fournisseur cree avec succes.",
    data: fournisseur
  });
});

const getFournisseurs = asyncHandler(async (req, res) => {
  const fournisseurs = await prisma.fournisseur.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({
    success: true,
    count: fournisseurs.length,
    data: fournisseurs
  });
});

const getFournisseurById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "fournisseur");

  const fournisseur = await prisma.fournisseur.findUnique({
    where: { id }
  });

  if (!fournisseur) {
    throw new AppError("Fournisseur introuvable.", 404);
  }

  res.status(200).json({
    success: true,
    data: fournisseur
  });
});

const updateFournisseur = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "fournisseur");

  const fournisseur = await prisma.fournisseur.findUnique({
    where: { id }
  });

  if (!fournisseur) {
    throw new AppError("Fournisseur introuvable.", 404);
  }

  const data = buildFournisseurPayload(req.body, { partial: true });
  const updatedFournisseur =
    Object.keys(data).length > 0
      ? await prisma.fournisseur.update({
          where: { id },
          data
        })
      : fournisseur;

  res.status(200).json({
    success: true,
    message: "Fournisseur modifie avec succes.",
    data: updatedFournisseur
  });
});

const deleteFournisseur = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "fournisseur");

  const fournisseur = await prisma.fournisseur.findUnique({
    where: { id }
  });

  if (!fournisseur) {
    throw new AppError("Fournisseur introuvable.", 404);
  }

  const linkedSupply = await prisma.approvisionnement.findFirst({
    where: { fournisseurId: id },
    select: { id: true }
  });

  if (linkedSupply) {
    throw new AppError(
      "Impossible de supprimer ce fournisseur car il est lie a des approvisionnements.",
      400
    );
  }

  await prisma.fournisseur.delete({
    where: { id }
  });

  res.status(200).json({
    success: true,
    message: "Fournisseur supprime avec succes."
  });
});

module.exports = {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur
};
