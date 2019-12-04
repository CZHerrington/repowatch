require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const {log, errorlog } = require('./logger');
const debug = require('debug')('[repowatch:app]');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const ENV = process.env.NODE_ENV || 'dev';

// import route controllers
const UserController = require('./controllers/user.controller');
const RepositoryController = require('./controllers/repository.controller');

/* initialize express, set up middleware */
app.disable("x-powered-by");
app.use(log(ENV));
app.use(errorlog(ENV));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(cookieParser());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    // store: new FileStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    is_logged_in: false
}));

// register route controllers
app.use('/user', UserController);
app.use('/repository/', RepositoryController);

module.exports = app;