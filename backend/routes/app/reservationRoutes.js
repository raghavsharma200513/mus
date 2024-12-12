const express = require("express");
const reservationController = require("../../controllers/app/reservationController");

const router = express.Router();

router.route("/").post(reservationController.createReservation);
router.route("/get").post(reservationController.getAllReservations);

router
  .route("/:id")
  .get(reservationController.getReservation)
  .patch(reservationController.updateStatus)
  .delete(reservationController.deleteReservation);

module.exports = router;
