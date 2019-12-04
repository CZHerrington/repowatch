const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const debug = require('debug')('[repowatch:controller:user]');

const User = require("../models/user.model");

router.post("/signup", async (req, res, next) => {
  const { username, email } = req.body;
  const id = req.session.user_id;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  const user = new User(username, email, hash);
  debug(["POST /signup - ", username, email]);

  const addUser = await user.save();

  if (addUser.name === "error" && addUser.code === "23505") {
    res.status(500).json({
        status: "error",
        statusCode: 500,
        error: addUser.code
      });
  } else {
    res.status(200).json({ status: "success", statusCode: 200 });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = new User(null, email, password);
  const response = await user.login();
  
  debug("POST /login - ", email);
  if (!!response.isValid) {
      const { id, username } = response;
      req.session.is_logged_in = true;
      req.session.username = username;
      req.session.user_id = id;
      
      debug("session: ", req.session);
      res.status(200).json({ status: "success", statusCode: 200 });
    } else {
        res.sendStatus(401);
    }
});

router.get("/logout", (req, res, next) => {
    debug("GET /logout");
  req.session.destroy(result => {
    res.status(200).json({ status: "success", statusCode: 200 });
  });
});

module.exports = router;
