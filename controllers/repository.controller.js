const express = require("express");
const router = express.Router();
const debug = require("debug")("[repowatch:controller:repository]");
const Repository = require("../models/repository.model");

router.get("/:id", async (req, res, next) => {
  // before sending response, parse into int and throw error if NaN;
  const { id } = req.params;

  const response = await Repository.getRepositoryById(id);
  debug("GET /repository/" + id, response);

  if (! response || response.name === "error") {
    res.status(500).json({
      status: "failure",
      data: { ...response }
    });
  } else {
    res.status(200).json({
      status: "success",
      data: {
        repository: { ...response }
      }
    });
  }
});



module.exports = router;
