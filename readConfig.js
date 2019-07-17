const path = require("path");
const fs = require("fs");

/**加载配置文件 */
const isProd = process.env.NODE_ENV === "production";
let configFile = null;
try {
    configFile = fs.readFileSync(
        path.resolve(__dirname, `.env.${isProd ? "prod" : "dev"}`)
    );
} catch (e) {
    console.log(e);
    process.exit(1);
}

const config = require("dotEnv").parse(configFile);
// console.log(config)
module.exports = config;
