const db = require("./conn");
const bcrypt = require("bcryptjs");
const debug = require('debug')("[repowatch:model:user]")

class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  checkPassword(hash) {
    return bcrypt.compareSync(this.password, hash);
  }

  static async getSubscriptions(userId) {
    try {
      const response = await db.one(
        `SELECT * FROM subscriptions WHERE user_id=$1;`,
        [userId]
      );
      debug(`getSubscriptions(id: ${userId})`, response);
      return response;
    } catch (error) {
      debug('error!', error.message);
      return error;
    }
  }

  async login() {
    try {
      const response = await db.one(
        `SELECT id, username, password FROM users WHERE email = $1;`,
        [this.email]
      );
      debug("login attempt: ", response.email);
      const isValid = this.checkPassword(response.password);
      debug("login attempt by " + this.email, isValid ? 'successful' : 'unsuccessful');
      if (!!isValid) {
        const { username, id } = response;
        this.username = username;
        return { isValid, id, username };
      } else {
        return { isValid };
      }
    } catch (error) {
      debug('error!', error.message);
      return error;
    }
  }

  async save() {
    try {
      const response = await db.one(
        `INSERT INTO users (username, email, password)
                VALUES ($1, $2, $3)
                RETURNING id;`,
        [this.username, this.email, this.password]
      );
      debug("saving user: ", response);
      return response;
    } catch (error) {
      debug('error!', error.message);
      return error;
    }
  }
}

module.exports = User;
