const log4js = require("log4js");

log4js.configure("./log4js.json");

var logger = log4js.getLogger("app");

exports.log = logger;

exports.logger = log4js.connectLogger(log4js.getLogger("http"), {
    level: "auto"
});
