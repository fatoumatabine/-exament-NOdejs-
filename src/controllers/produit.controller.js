const cloudinary = require("../config/cloudinary");
const { prisma } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { normalizeString, parseId, parseNumber } = require("../utils/requestParsers");

const destroyImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Suppression Cloudinary impossible :", error.message);
  }
};

const buildProduitPayload = (body, options = {}) => {
  const data = {};

  if (!options.partial || body.libelle !== undefined) {
    data.libelle = normalizeString(body.libelle, "libelle", { required: !options.partial });
  }

  if (!options.partial || body.prixUnitaire !== undefined) {
    if (body.prixUnitaire === undefined) {
      throw new AppError("Le champ prixUnitaire est obligatoire.", 400);
    }

    data.prixUnitaire = parseNumber(body.prixUnitaire, "prixUnitaire", { min: 0 });
  }

  const stockValue = body.quantiteEnStock ?? body.quantiteStock;

  if (stockValue !== undefined) {
    data.quantiteEnStock = parseNumber(stockValue, "quantiteEnStock", {
      min: 0,
      integer: true
    });
  } else if (!options.partial) {
    data.quantiteEnStock = 0;
  }

  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};

const createProduit = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Une image est obligatoire pour creer un produit.", 400);
  }

  try {
    const produit = await prisma.produit.create({
      data: {
        ...buildProduitPayload(req.body),
        imageUrl: req.file.path,
        imagePublicId: req.file.filename
      }
    });

    res.status(201).json({
      success: true,
      message: "Produit cree avec succes.",
      data: produit
    });
  } catch (error) {
    await destroyImage(req.file.filename);
    throw error;
  }
});

const getProduits = asyncHandler(async (req, res) => {
  const produits = await prisma.produit.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({
    success: true,
    count: produits.length,
    data: produits
  });
});

const getProduitById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "produit");

  const produit = await prisma.produit.findUnique({
    where: { id }
  });

  if (!produit) {
    throw new AppError("Produit introuvable.", 404);
  }

  res.status(200).json({
    success: true,
    data: produit
  });
});

const updateProduit = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "produit");

  const produit = await prisma.produit.findUnique({
    where: { id }
  });

  if (!produit) {
    if (req.file) {
      await destroyImage(req.file.filename);
    }

    throw new AppError("Produit introuvable.", 404);
  }

  const previousImagePublicId = produit.imagePublicId;

  try {
    const data = buildProduitPayload(req.body, { partial: true });

    if (req.file) {
      data.imageUrl = req.file.path;
      data.imagePublicId = req.file.filename;
    }

    const updatedProduit =
      Object.keys(data).length > 0
        ? await prisma.produit.update({
            where: { id },
            data
          })
        : produit;

    if (req.file && previousImagePublicId !== req.file.filename) {
      await destroyImage(previousImagePublicId);
    }

    res.status(200).json({
      success: true,
      message: "Produit modifie avec succes.",
      data: updatedProduit
    });
  } catch (error) {
    if (req.file) {
      await destroyImage(req.file.filename);
    }

    throw error;
  }
});

const deleteProduit = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "produit");

  const produit = await prisma.produit.findUnique({
    where: { id }
  });

  if (!produit) {
    throw new AppError("Produit introuvable.", 404);
  }

  const linkedSupply = await prisma.approvisionnement.findFirst({
    where: { produitId: id },
    select: { id: true }
  });

  if (linkedSupply) {
    throw new AppError(
      "Impossible de supprimer ce produit car il est lie a des approvisionnements.",
      400
    );
  }

  await prisma.produit.delete({
    where: { id }
  });
  await destroyImage(produit.imagePublicId);

  res.status(200).json({
    success: true,
    message: "Produit supprime avec succes."
  });
});

const incrementStock = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "produit");

  const { quantite } = req.body;

  if (quantite === undefined) {
    throw new AppError("Le champ quantite est obligatoire.", 400);
  }

  const incrementValue = parseNumber(quantite, "quantite", { min: 1, integer: true });
  const produit = await prisma.$transaction(async (tx) => {
    const existingProduit = await tx.produit.findUnique({
      where: { id }
    });

    if (!existingProduit) {
      throw new AppError("Produit introuvable.", 404);
    }

    return tx.produit.update({
      where: { id },
      data: {
        quantiteEnStock: {
          increment: incrementValue
        }
      }
    });
  });

  res.status(200).json({
    success: true,
    message: "Stock incremente avec succes.",
    data: produit
  });
});

const decrementStock = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "produit");

  const { quantite } = req.body;

  if (quantite === undefined) {
    throw new AppError("Le champ quantite est obligatoire.", 400);
  }

  const decrementValue = parseNumber(quantite, "quantite", { min: 1, integer: true });
  const produit = await prisma.$transaction(async (tx) => {
    const existingProduit = await tx.produit.findUnique({
      where: { id }
    });

    if (!existingProduit) {
      throw new AppError("Produit introuvable.", 404);
    }

    const updateResult = await tx.produit.updateMany({
      where: {
        id,
        quantiteEnStock: {
          gte: decrementValue
        }
      },
      data: {
        quantiteEnStock: {
          decrement: decrementValue
        }
      }
    });

    if (updateResult.count === 0) {
      throw new AppError(
        "Stock insuffisant. La quantite a decrementer depasse le stock disponible.",
        400
      );
    }

    return tx.produit.findUnique({
      where: { id }
    });
  });

  res.status(200).json({
    success: true,
    message: "Stock decremente avec succes.",
    data: produit
  });
});

module.exports = {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
  deleteProduit,
  incrementStock,
  decrementStock
};
