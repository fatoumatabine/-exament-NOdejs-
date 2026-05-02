const express = require("express");

const {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur
} = require("../controllers/fournisseur.controller");

const router = express.Router();

router.route("/").post(createFournisseur).get(getFournisseurs);
router.route("/:id").get(getFournisseurById).put(updateFournisseur).delete(deleteFournisseur);

module.exports = router;
