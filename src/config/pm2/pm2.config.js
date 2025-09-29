module.exports = {
    apps: [
        {
            name: 'app',
            // Cron job every 1 hour is a commonly used cron schedule
            // https://crontab.guru/every-1-hour
            cron_restart: '0 * * * *',
            autorestart:  false,
            script:       `node ./dist/scripts/refreshSheets.js`,
        },{
            name: 'server',
            cron_restart: '0 0 */1 * *',
            autorestart: false,
            script: `node ./dist/app.js`,
        }
    ]
};
