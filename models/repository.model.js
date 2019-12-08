const db = require("./conn");
const debug = require("debug")("[repowatch:model:repository]");
const Owner = require("./owner.model");

class Repository {
  constructor(name, description, url, programming_language, owner_id) {
    this.name = name;
    this.description = description;
    this.url = url;
    this.programming_language = programming_language;
    this.owner_id = owner_id;
  }

  static async getRepositoryById(repositoryId) {
    try {
      const response = await db("repositories").where({ id: repositoryId });
      debug("getRepositoryById(): ", response);

      if (response === []) {
        return false;
      }

      return response[0];
    } catch (error) {
      debug("error!", error, error.message);
      return error;
    }
  }

  static async getRepositoryByOwner(repositoryName, ownerName) {
    debug(`getRepositoryByOwner(${repositoryName}, ${ownerName})`);
    try {
      const owner = await Owner.getOwnerByName(ownerName);
      debug(owner);

      if (!owner) {
        debug(`owner ${ownerName} does not exist in database!`);
        return false;
      }

      const repository = await db("repositories").where({
        name: repositoryName,
        owner_id: owner.id
      });

      if (repository === []) {
        debug(
          `repository ${ownerName}/${repositoryName} does not exist in database!`
        );
        return false;
      }

      return repository[0];
    } catch (error) {
      debug("error!", error);
      return error;
    }
  }

  static async getSubscribers(id) {
    try {
      const response = await db("subscriptions")
        .where("repository_id", id)
        .select("users.*")
        .distinct("users.id")
        .innerJoin("users", "subscriptions.user_id", "=", "users.id");

      debug(`getSubscribers(id: ${id})`, response);

      if (response === []) {
        return false;
      }

      return response;
    } catch (error) {
      debug("error!", error.message);
      return error;
    }
  }

  static async getSubscriptions(id) {
    try {
      const response = await db("subscriptions")
        .select("*")
        .where("repository_id", id);
      debug(`getSubscriptions(id: ${id})`, response);

      if (response === []) {
        return false;
      }

      return response;
    } catch (error) {
      debug("error!", error.message);
      return error;
    }
  }

  static async getOwner(repositoryId) {
    try {
      const response = await db("repositories")
        .where("repositories.id", repositoryId)
        .select("owners.*")
        .innerJoin("owners", "repositories.owner_id", "=", "owners.id");
      debug("getOwner()", response);

      if (response === []) {
        return false;
      }

      return response;
    } catch (error) {
      debug("error!", error.message);
      return error;
    }
  }

  async save(columnValueArray) {
      const values = (columnValueArray) ? columnValueArray.join(" ") : null;
      debug("VALUES ", values)
    try {
      const response = await db("repositories")
        .returning(values)
        .insert({
          name: this.name,
          description: this.description,
          url: this.url,
          programming_language: this.programming_language,
          owner_id: this.owner_id
        });
      debug("saving repo: ", response);
      return response[0];
    } catch (error) {
      debug("error!", error.message);
      return error;
    }
  }
}

module.exports = Repository;
