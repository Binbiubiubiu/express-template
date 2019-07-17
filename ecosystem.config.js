module.exports = {
    apps: [
        {
            name: "app",
            script: "app.js",
            instances: 2,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            exe_mode: "cluster",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};
