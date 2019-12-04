const path = require("path");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const chalk = require("chalk");

const maxFileSize = "2M";

// initialize morgan
morgan.token("colorful-method", (req, res, arg) => {
  const method = req.method.toLowerCase();
  return chalk.white(method);
});
morgan.token("colorful-status", (req, res, arg) => {
  const status = res.statusCode;
  // get status color
  const color =
    status >= 500 || status === 404
      ? "red"
      : status >= 400
      ? "yellow"
      : status >= 300
      ? "cyan"
      : status >= 200
      ? "yellow"
      : "white";
  const string = chalk[color](status);
  return string;
});

morgan.token("colorful-error", (req, res, arg) => chalk.red("[ERROR]"));

// set up filestreams
const accessLogFS = rfs.createStream("access.log", {
  // interval: '1d', // rotate daily
  size: maxFileSize,
  path: path.join(__dirname, "log"),
  compress: true
});

const errorLogFS = rfs.createStream("error.log", {
  size: maxFileSize,
  path: path.join(__dirname, "log"),
  compress: true
});

const behaviors = {
  all: {
    dev: morgan(
      ":remote-user :colorful-method :url :colorful-status :response-time ms - :res[content-length]"
    ),
    production: morgan("combined", { stream: accessLogFS })
  },
  error: {
    dev: morgan(
      ":colorful-error :remote-user :colorful-method :url :colorful-status :response-time ms - :res[content-length]",
      { skip: (req, res) => res.statusCode < 400 }
    ),
    production: morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
      stream: errorLogFS
    })
  }
};

function log(env) {
  const environment = env || process.env.ENVIRONMENT || "dev";
  return behaviors.all[environment] || behaviors.all["dev"];
}

function errorlog(env) {
  const environment = env || process.env.ENVIRONMENT || "dev";
  return behaviors.error[environment] || behaviors.error["dev"];
}

module.exports = { log, errorlog };
