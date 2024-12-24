// routes/policyRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPolicy,
  createOrUpdatePolicy,
  deletePolicy,
  getPolicies,
} = require("../../controllers/app/policyController");

// Route to get a specific policy by type
router.get("/:type", getPolicy);

// Route to create or update a policy
router.get("/", getPolicies);
router.post("/", createOrUpdatePolicy);

// Route to delete a policy by type
router.delete("/:type", deletePolicy);

module.exports = router;
