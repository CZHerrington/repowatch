const Octokit = require("@octokit/rest");
const octoDebug = require("debug")("[repowatch:utilities:github-api]");
const debug = require("debug")("[repowatch:utilities:getters]");
const axios = require("axios");

const githubApiUrl = "https://api.github.com";

const octokit = Octokit({
  userAgent: "repowatch v0.0.2",
  baseUrl: githubApiUrl,
  log: {
    debug: octoDebug,
    info: octoDebug,
    warn: octoDebug,
    error: octoDebug
  }
});

// const issues = await api.issues.listForRepo({ owner: owner, repo: repository });
// const watched = await api.activity.listReposWatchedByUser({
//   username: "CZHerrington"
// });

async function getRepoData(ownerName, repoName) {
  const request = axios(`${githubApiUrl}/repos/${ownerName}/${repoName}`);
  if (request.statusCode === 403) {
    throw new Error("Error: need github api authentication!");
  }
  return request;
}

async function getOrgData(orgName) {
  const request = await axios(`https://api.github.com/orgs/${orgName}`);
  if (request.statusCode === 403) {
    throw new Error("Error: need github api authentication!");
  }
  return request;
}

async function getUserData(userName) {
    const request = await axios(`https://api.github.com/users/${userName}`);
    if (request.statusCode === 403) {
      throw new Error("Error: need github api authentication!");
    }
    return request;
  }

async function getOwnerDataFromRepoData(request) {
    const { owner } = request.data;
    if (owner.type === "User") {
        return getOrgData(owner.login);
    } else if (owner.type === "Organization") {
        return getUserData(owner.login);
    }
}

async function getAllOrgRepoData(orgName) {
  // https://api.github.com/orgs/facebook/repos
  const request = await axios(`https://api.github.com/orgs/${orgName}/repos`);
  if (request.status === 403) {
    throw new Error("Error: need github api authentication!");
  }
  return request;
}

function getRepoFromAllRepoData(name, request) {
    debug("getRepoFromAllRepoData():")
    debug(name, request.data.map(repo => repo.name))
  const { data } = request;
  const repository = data.filter(repo => repo.name === name);
  if (repository === []) {
    return false;
  }

  return repository[0];
}

module.exports = {
  octokit,
  getOrgData,
  getRepoData,
  getUserData,
  getOwnerDataFromRepoData,
  getAllOrgRepoData,
  getRepoFromAllRepoData
};
