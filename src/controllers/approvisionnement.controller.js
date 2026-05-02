const { prisma } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { parseDateValue, parseId, parseNumber } = require("../utils/requestParsers");

const approvisionnementInclude = {
  fournisseur: {
    select: {
      id: true,
      nom: true,
      telephone: true,
      adresse: true,
      createdAt: true,
      updatedAt: true
    }
  },
  produit: {
    select: {
      id: true,
      libelle: true,
      prixUnitaire: true,
      quantiteEnStock: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true
    }
  }
};

const resolveForeignKeys = (body, currentApprovisionnement) => {
  const fournisseurValue =
    body.fournisseurId ?? body.fournisseur ?? currentApprovisionnement?.fournisseurId;
  const produitValue = body.produitId ?? body.produit ?? currentApprovisionnement?.produitId;

  if (fournisseurValue === undefined || produitValue === undefined) {
    throw new AppError("Les champs fournisseurId et produitId sont obligatoires.", 400);
  }

  return {
    fournisseurId: parseId(fournisseurValue, "fournisseur"),
    produitId: parseId(produitValue, "produit")
  };
};

const createApprovisionnement = asyncHandler(async (req, res) => {
  const { date, quantite } = req.body;

  if (quantite === undefined) {
    throw new AppError("Les champs quantite, fournisseurId et produitId sont obligatoires.", 400);
  }

  const parsedQuantity = parseNumber(quantite, "quantite", { min: 1, integer: true });
  const { fournisseurId, produitId } = resolveForeignKeys(req.body);

  const approvisionnement = await prisma.$transaction(async (tx) => {
    const [existingFournisseur, existingProduit] = await Promise.all([
      tx.fournisseur.findUnique({ where: { id: fournisseurId }, select: { id: true } }),
      tx.produit.findUnique({ where: { id: produitId }, select: { id: true } })
    ]);

    if (!existingFournisseur) {
      throw new AppError("Fournisseur introuvable.", 404);
    }

    if (!existingProduit) {
      throw new AppError("Produit introuvable.", 404);
    }

    await tx.produit.update({
      where: { id: produitId },
      data: {
        quantiteEnStock: {
          increment: parsedQuantity
        }
      }
    });

    return tx.approvisionnement.create({
      data: {
        date: parseDateValue(date),
        quantite: parsedQuantity,
        fournisseurId,
        produitId
      },
      include: approvisionnementInclude
    });
  });

  res.status(201).json({
    success: true,
    message: "Approvisionnement cree avec succes.",
    data: approvisionnement
  });
});

const getApprovisionnements = asyncHandler(async (req, res) => {
  const approvisionnements = await prisma.approvisionnement.findMany({
    include: approvisionnementInclude,
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({
    success: true,
    count: approvisionnements.length,
    data: approvisionnements
  });
});

const getApprovisionnementById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "approvisionnement");

  const approvisionnement = await prisma.approvisionnement.findUnique({
    where: { id },
    include: approvisionnementInclude
  });

  if (!approvisionnement) {
    throw new AppError("Approvisionnement introuvable.", 404);
  }

  res.status(200).json({
    success: true,
    data: approvisionnement
  });
});

const updateApprovisionnement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "approvisionnement");

  const updatedApprovisionnement = await prisma.$transaction(async (tx) => {
    const approvisionnement = await tx.approvisionnement.findUnique({
      where: { id }
    });

    if (!approvisionnement) {
      throw new AppError("Approvisionnement introuvable.", 404);
    }

    const { fournisseurId, produitId } = resolveForeignKeys(req.body, approvisionnement);
    const newQuantite =
      req.body.quantite !== undefined
        ? parseNumber(req.body.quantite, "quantite", { min: 1, integer: true })
        : approvisionnement.quantite;
    const newDate =
      req.body.date !== undefined ? parseDateValue(req.body.date) : approvisionnement.date;

    const [existingFournisseur, currentProduit, targetProduit] = await Promise.all([
      tx.fournisseur.findUnique({ where: { id: fournisseurId }, select: { id: true } }),
      tx.produit.findUnique({ where: { id: approvisionnement.produitId } }),
      tx.produit.findUnique({ where: { id: produitId } })
    ]);

    if (!existingFournisseur) {
      throw new AppError("Fournisseur introuvable.", 404);
    }

    if (!currentProduit || !targetProduit) {
      throw new AppError("Produit introuvable.", 404);
    }

    if (currentProduit.id === targetProduit.id) {
      const difference = newQuantite - approvisionnement.quantite;

      if (difference > 0) {
        await tx.produit.update({
          where: { id: currentProduit.id },
          data: {
            quantiteEnStock: {
              increment: difference
            }
          }
        });
      } else if (difference < 0) {
        const updateResult = await tx.produit.updateMany({
          where: {
            id: currentProduit.id,
            quantiteEnStock: {
              gte: Math.abs(difference)
            }
          },
          data: {
            quantiteEnStock: {
              decrement: Math.abs(difference)
            }
          }
        });

        if (updateResult.count === 0) {
          throw new AppError(
            "Modification impossible car elle ferait passer le stock du produit en dessous de zero.",
            400
          );
        }
      }
    } else {
      const currentProductUpdate = await tx.produit.updateMany({
        where: {
          id: currentProduit.id,
          quantiteEnStock: {
            gte: approvisionnement.quantite
          }
        },
        data: {
          quantiteEnStock: {
            decrement: approvisionnement.quantite
          }
        }
      });

      if (currentProductUpdate.count === 0) {
        throw new AppError(
          "Modification impossible car la suppression de l'ancien approvisionnement rendrait le stock negatif.",
          400
        );
      }

      await tx.produit.update({
        where: { id: targetProduit.id },
        data: {
          quantiteEnStock: {
            increment: newQuantite
          }
        }
      });
    }

    return tx.approvisionnement.update({
      where: { id },
      data: {
        date: newDate,
        quantite: newQuantite,
        fournisseurId,
        produitId
      },
      include: approvisionnementInclude
    });
  });

  res.status(200).json({
    success: true,
    message: "Approvisionnement modifie avec succes.",
    data: updatedApprovisionnement
  });
});

const deleteApprovisionnement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "approvisionnement");

  await prisma.$transaction(async (tx) => {
    const approvisionnement = await tx.approvisionnement.findUnique({
      where: { id }
    });

    if (!approvisionnement) {
      throw new AppError("Approvisionnement introuvable.", 404);
    }

    const produit = await tx.produit.findUnique({
      where: { id: approvisionnement.produitId }
    });

    if (!produit) {
      throw new AppError("Produit introuvable.", 404);
    }

    const updateResult = await tx.produit.updateMany({
      where: {
        id: produit.id,
        quantiteEnStock: {
          gte: approvisionnement.quantite
        }
      },
      data: {
        quantiteEnStock: {
          decrement: approvisionnement.quantite
        }
      }
    });

    if (updateResult.count === 0) {
      throw new AppError(
        "Suppression impossible car elle ferait passer le stock du produit en dessous de zero.",
        400
      );
    }

    await tx.approvisionnement.delete({
      where: { id }
    });
  });

  res.status(200).json({
    success: true,
    message: "Approvisionnement supprime avec succes."
  });
});

module.exports = {
  createApprovisionnement,
  getApprovisionnements,
  getApprovisionnementById,
  updateApprovisionnement,
  deleteApprovisionnement
};
