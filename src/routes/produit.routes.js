const express = require("express");

const {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
  deleteProduit,
  incrementStock,
  decrementStock
} = require("../controllers/produit.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.route("/").post(upload.single("image"), createProduit).get(getProduits);
router.route("/:id").get(getProduitById).put(upload.single("image"), updateProduit).delete(deleteProduit);
router.patch("/:id/increment", incrementStock);
router.patch("/:id/decrement", decrementStock);

module.exports = router;
