# express-template
a express template

## Contents
- [Integration](#Integration)
- [Dev](#Dev)
- [Deploy](#Deploy)
- [Config](#Config)

## Integration
- express-session + redis
- cookie-parser
- helmet
- multer
- pug
- serve-favicon
- serve-static
- http-errors
- errorhandler
- log4js(~~morgan~~)

### Dev
`nodemon` is popular developer tool

```
"scripts": {
    "dev": "nodemon app.js",
    ...
 }
```

```
$ yarn dev
```

### Deploy
`PM2` 

```
"scripts": {
    ...
    "start:pm2": "pm2 startOrRestart ecosystem.config.js --env production",
    "stop:pm2": "pm2 kill"
  },
```

```
$ yarn start:pm2
```
### Config
dotEnv file `.env`

```
#系统参数
system.port=3000
system.jsonp_callback_name=lb_cb
system.gzip=true

# redis 配置
redis.host=localhost
redis.port=6379
redis.pass=
redis.db=0
redis.prefix=lb_sess:

# session 配置
session.secret=lb_secret
session.pass=
session.db=0
session.prefix=lb_sess:

session.cookie.name=lb_s_id
session.cookie.path=/
session.cookie.domain=localhost
session.cookie.maxAge=360000

#渲染视图配置
views.dir=views
views.engine=pug
```
