const express = require("express");
const router = express.Router();
const debug = require("debug")("[repowatch:controller:repository]");
const Repository = require("../models/repository.model");
const Owner = require("../models/owner.model");
const {
  octokit,
  getUserData,
  getOrgData,
  getOwnerDataFromRepoData,
  getRepoData,
  getAllOrgRepoData,
  getRepoFromAllRepoData
} = require("../utilities/github-api");

// this route gets a repository by its owner name and repository name,
// and creates the owner and repo in the database if they do not exist
router.get("/:owner_name/:repository_name", async (req, res, next) => {
  const { owner_name, repository_name } = req.params;
  try {
    let ownerQuery = await Owner.getOwnerByName(owner_name);

    if (!ownerQuery) {
      /* if owner does not exist in database */
      const { status, headers, data } = await getOrgData(owner_name);
      if (status === 404) {
        res
          .status(status)
          .json({
            status: "failure",
            error: "org not found",
            name: owner_name
          });
      }
      const owner = new Owner(
        data.login,
        data.name,
        "Organization",
        data.description || data.bio,
        data.html_url
      );
      ownerQuery = await owner.save('*');
      debug("NEW OWNER: ", ownerQuery);
    }

    let repositoryQuery = await Repository.getRepositoryByOwner(
      repository_name,
      owner_name
    );

    // debug("repositoryQuery", { repositoryQuery });

    if (!repositoryQuery) {
      /* if repositoryQuery returns false, the repository doesnt exist and we need to create it */
      // in a production app, you would save all repo data returned, not just the one you're looking for
      const request = await getAllOrgRepoData(owner_name);
      const data = getRepoFromAllRepoData(repository_name, request);
      if (!data) {
        res
          .status(404)
          .json({
            status: "failure",
            error: "repository not found",
            name: repository_name
          });
      }
      debug({owner_id: ownerQuery.id})
      let repository = new Repository(
        data.name,
        data.description,
        data.html_url,
        data.language,
        ownerQuery.id,
      );
      repositoryQuery = await repository.save('*');
      debug("NEW REPO: ", repositoryQuery)
    }

    res.status(200).json({ repository: repositoryQuery, owner: ownerQuery });
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    res.status(status).json({
      error: error.message,
      status: "failure1",
      error
    });
  }
});

router.get("/:id", async (req, res, next) => {
  // before sending response, parse into int and throw error if NaN;
  const { id } = req.params;
  try {
    const response = await Repository.getRepositoryById(id);
    debug("GET /repository/" + id, response);

    if (!response) {
      res.status(404).json({ status: "failure", error: "not found", id });
    } else if (response.name === "error") {
      res.status(500).json({ status: "failure", error: response.code, id });
    } else {
      res.status(200).json({
        status: "success",
        data: { repository: response }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "failure",
      error,
      id
    });
  }
});

router.get("/:id/subscribers", async (req, res, next) => {
  const { id } = req.params;
  const response = await Repository.getSubscribers(id);

  if (response.name === "error") {
    res.status(500).json({
      status: "failure",
      data: { error: response.routine }
    });
  } else {
    res.status(200).json({
      status: "success",
      data: { subscribers: response }
    });
  }
});

router.get("/:id/subscriptions", async (req, res, next) => {
  const { id } = req.params;
  const response = await Repository.getSubscriptions(id);

  if (response.name === "error") {
    res.status(500).json({
      status: "failure",
      data: { error: response.routine }
    });
  } else {
    res.status(200).json({
      status: "success",
      data: { subscribers: response }
    });
  }
});

router.put("/", async (req, res, next) => {
  // wip
  const { repository, owner } = req.body;

  res.status(200).json({
    repository,
    owner,
    body: req.body
  });
});

module.exports = router;
