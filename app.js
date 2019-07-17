const path = require("path");
const fs = require("fs");

const express = require("express");
const createError = require("http-errors");
const errorhandler = require("errorhandler");
const notifier = require("node-notifier");

const config = require("./readConfig");
const { logger, log } = require("./middlewares/log4j");

const isProd = process.env.NODE_ENV === "production";

const app = express();
/**全局变量的设置 */
app.set("jsonp callback name", config["system.jsonp_callback_name"]);

/**全局中间件 */
app.use(require("cors")());
app.use(require("helmet")());
app.use(require("serve-favicon")(path.join(__dirname, "favicon.png")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("cookie-parser")());
/**日志 */
if (!isProd) {
    //     app.use(require("morgan")("dev"));
    app.use(logger);
}

/**静态资源 */
app.use(express.static(path.join(__dirname, "public")));
/**会话设置 */
const session = require("express-session");
const RedisStore = require("connect-redis")(session);

app.use(
    session({
        store: new RedisStore({
            host: config["redis.host"],
            port: +config["redis.port"],
            pass: config["redis.pass"],
            db: +config["redis.db"], //存取的数据库
            prefix: config["redis.prefix"]
        }),
        name: config["session.cookie.name"], //cookie名称
        secret: config["session.secret"], //加密key
        resave: true, //session 重写,过期时间重置, (设置成false 可以让过期时间不变)
        rolling: true, //是否同步到客户端cookie session信息
        saveUninitialized: false, //不管是否登录访问都保存session
        cookie: {
            // path: config["session.cookie.path"],
            // domain: config["session.cookie.domain"],
            httpOnly: true,
            secure: false,
            maxAge: +config["session.cookie.maxAge"]
        }
    })
);

/**模版引擎配置 */
app.set("views", path.join(__dirname, config["views.dir"]));
app.set("view engine", config["views.engine"]);

app.get("/", function(req, res, next) {
    res.render("page/index", { title: "express template", message: "hello world" });
});

/**路由 */
fs.readdirSync("./routes")
    .map(item => item.match(/^([^\.]+)?/g))
    .filter(Boolean)
    .forEach(item => {
        app.use(`/${item}`, require(`./routes/${item}`));
    });

/** 404配置 */
app.use(function(req, res, next) {
    next(createError(404, "Not Found"));
});

/**debug */
if (!isProd) {
    // only use in development
    app.use(errorhandler({ log: errorNotification }));
}

function errorNotification(err, str, req, res) {
   
    var title = "Error in " + req.method + " " + req.url;

    notifier.notify({
        title: title,
        message: str
    });
}

/** 错误处理*/
app.use(function(err, req, res, next) {
    log.error(err);
    res.status(err.status || 500).render("error", { err: err });
});

const PORT = +config["system.port"];
app.listen(PORT, () => log.info(` app start listen at http://localhost:${PORT}`));
