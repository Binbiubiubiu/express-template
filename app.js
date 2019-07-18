const path = require("path");
const fs = require("fs");

const express = require("express");
const createError = require("http-errors");
const errorhandler = require("errorhandler");
const notifier = require("node-notifier");

const config = require("./readConfig");
const { logger, log } = require("./middlewares/log4j");

const isProd = process.env.NODE_ENV === "production";
log.info(config);
const app = express();
/**全局变量的设置 */
app.set("jsonp callback name", `${config["SYSTEM_NAME"]}_cb`);

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
            host: config["REDIS_HOST"],
            port: +config["REDIS_PORT"],
            pass: config["REDIS_PASS"],
            db: +config["REDIS_DB"], //存取的数据库
            prefix: `${config["SYSTEM_NAME"]}_prefix:`
        }),
        name: `${config["SYSTEM_NAME"]}_s_id`, //cookie名称
        secret: `${config["SYSTEM_NAME"]}_secret`, //加密key
        //需要登录,以下配置
        resave: true /*强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。*/,
        saveUninitialized: false, //强制将未初始化的 session 存储。  默认值是true  建议设置成true
        //不需要登录,以下配置
        // resave: false,
        // saveUninitialized: true,
        rolling: true, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
        cookie: {
            // path: config["SESSION_COOKIE_PATH"],
            // domain: config["SESSION_COOKIE_DOMAIN"],
            httpOnly: true,
            secure: false,
            maxAge: +config["SESSION_COOKIE_MAXAGE"]
        }
    })
);

/**模版引擎配置 */
app.set("views", path.join(__dirname, config["VIEWS_DIR"]));
app.set("view engine", config["VIEWS_ENGINE"]);

app.get("/", function(req, res, next) {
    res.render("index", { title: "express template", message: "hello world" });
});

app.get("/error", function(req, res, next) {
    res.render("error", { err: error });
});

/**测试session */
app.get("/login", function (req, res, next) {
    req.session.userInfo = {name:'testUser'}
    res.render("index", {});
});

/**测试销毁session */
app.get("/loginout", function(req, res, next) {
    req.session.destroy(function(err) {
        console.log(err);
    });
    res.redirect("login");
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

/**debug 开发环境的错误处理 */
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

/** 生产环境的错误处理*/
app.use(function(err, req, res, next) {
    log.error(err);
    res.status(err.status || 500).render("error", { err: err });
});

const PORT = +config["SYSTEM_PORT"];
app.listen(PORT, () =>
    log.info(` app start listen at http://localhost:${PORT}`)
);
