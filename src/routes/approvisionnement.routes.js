const express = require("express");

const {
  createApprovisionnement,
  getApprovisionnements,
  getApprovisionnementById,
  updateApprovisionnement,
  deleteApprovisionnement
} = require("../controllers/approvisionnement.controller");

const router = express.Router();

router.route("/").post(createApprovisionnement).get(getApprovisionnements);
router
  .route("/:id")
  .get(getApprovisionnementById)
  .put(updateApprovisionnement)
  .delete(deleteApprovisionnement);

module.exports = router;
