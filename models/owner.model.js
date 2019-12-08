const db = require("./conn");
const debug = require("debug")("[repowatch:model:owner]");

/* obviously rewrite */
class Owner {
  constructor(name, displayName, description, url) {
    this.name = name;
    this.description = description;
    this.url = url;

    this.displayName = displayName ? displayName : name;
  }

  static async getOwnerById(ownerId) {
    try {
      const response = await db("owners").where({ id: ownerId });
      debug("getOwnerById(): ", response);

      if (response === []) {
        return false;
      }

      return response[0];
    } catch (error) {
      debug("error!", error, error.message);
    }
  }

  static async getOwnerByName(ownerName) {
    try {
      const response = await db("owners").where({ name: ownerName });
      debug("getOwnerByName(): ", response);

      if (response === []) {
        return false;
      }

      return response[0];
    } catch (error) {
      debug("error!", error, error.message);
    }
  }

  static async getAllRepositories(id) {
    // needs to be tested
    try {
      const response = await db("repositories")
        .where({ owner_id: id })
        .select("*");
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

  async save() {
    try {
      const response = await db("owners")
        .returning("*")
        .insert({
          name: this.name,
          display_name: this.displayName,
          description: this.description,
          url: this.url
        });
      debug("creating owner: ", response);
      return response[0];
    } catch (error) {
      debug("error!", error.message);
      return error;
    }
  }
}

module.exports = Owner;
