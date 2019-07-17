const createError = require("http-errors");
const express = require("express");
const router = express.Router();

const { log } = require("../middlewares/log4j");
const upload = require("../middlewares/upload");

/** 模版渲染的例子 */
router.get("/", function(req, res, next) {
    log.info(req.cookies);
    return res.render("index", { title: "Hey", message: "hello" });
});

/**抛出异常的例子 */
router.get("/error", function(req, res, next) {
    log.info("测试错误");
    return next(createError(500, "测试错误"));
});

/**文件上传单个的例子 */
router.get("/upload_single", upload.single("avatar"), function(req, res, next) {
    return res.send(req.file);
});

/**文件上传多个文件的例子 */
router.get("/upload_many", upload.array("photos", 12), function(
    req,
    res,
    next
) {
    return res.send(req.files);
});

/**文件上传多个不同名称文件的例子 */
router.get(
    "/upload_form_name",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "gallery", maxCount: 8 }
    ]),
    function(req, res, next) {
        return res.send(req.files);
    }
);

module.exports = router;
