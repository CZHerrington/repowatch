const db = require("./conn");
const debug = require("debug")("[repowatch:model:repository]");

class Repository {
  constructor(name, description, url) {
    this.name = name;
    this.description = description;
    this.url = url;
  }

  static async getRepositoryById(repoId) {
    try {
      const response = await db.one(
        `SELECT * FROM repositories WHERE id = $1;`,
        [repoId]
      );
      debug('got repository!', response);
      return response;
    } catch (error) {
        debug('error!', error.message);
        return error;
    }
  }

  static async getSubscribers(repoId) {
    try {
      const response = await db.query(
        `SELECT * FROM subscriptions WHERE repo_id = $1;`,
        [repoId]
      );
      debug(`getSubscribers(id: ${repoId})`, response);
      return response;
    } catch (error) {
        debug('error!', error.message);
        return error;
    }
  }

  async save() {
    try {
      const response = await db.one(
        `INSERT INTO repositories (name, description, url)
                VALUES ($1, $2, $3)
                RETURNING id;`,
        [this.name, this.description, this.url]
      );
      debug("saving repo: ", response);
      return response;
    } catch (error) {
        debug('error!', error.message);
        return error;
    }
  }
}

module.exports = Repository;
