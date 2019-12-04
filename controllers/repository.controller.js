const express = require("express");
const router = express.Router();
const debug = require("debug")("[repowatch:controller:repository]");
const Repository = require("../models/repository.model");

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const repository = await Repository.getRepositoryById(id);

  debug("GET /repository/", + id, repository);

  res.status(200).json({ status: "success", data: { repository } });
});

module.exports = router;
