/*
    OWER-API v2
    @Author: KINDYEAR
    @Date: 2024-1-21
    app.js
*/
const express = require('express');
const os = require('os');
const cluster = require('cluster');
const { getCurrentTime } = require('./src/getCurrentTime');
const config = require('./config');
const packageInfo = require('./package.json');
const { PORT, HOST, API_KEY, CORE } = config;

//  处理多核心进程，引入Cluster
const numCPUs = parseInt(CORE, 10);
const effectiveCPUs = isNaN(numCPUs) || numCPUs <= 0 ? os.cpus().length : numCPUs;
let workerCount = 0;

if (cluster.isMaster) {
    for (let i = 0; i < effectiveCPUs; i++) {
        cluster.fork();
        workerCount++;
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`${getCurrentTime()} Worker ${worker.process.pid} died`);
        cluster.fork();
        workerCount++;
    });
    console.log(`
   ____ _       ____________        ___    ____  ____        ___ 
  / __ \\ |     / / ____/ __ \\      /   |  / __ \\/  _/  _   _|__ \\
 / / / / | /| / / __/ / /_/ /_____/ /| | / /_/ // /   | | / /_/ /
/ /_/ /| |/ |/ / /___/ _, _/_____/ ___ |/ ____// /    | |/ / __/ 
\\____/ |__/|__/_____/_/ |_|     /_/  |_/_/   /___/    |___/____/                                                            
`)
    console.log(`${getCurrentTime()} OWER-API v2 Strating...`);
    console.log(`${getCurrentTime()} OWER-API v2 Version: \u001b[33m${packageInfo.version}\u001b[0m`);
    console.log(`${getCurrentTime()} Service running on http://${HOST}:${PORT} with \u001b[33m${workerCount}\u001b[0m worker(s)`);
} else {
    const app = express();

    function authenticate(req, res, next) {
        const { apiKey } = req.query;

        if (!apiKey || apiKey !== API_KEY) {
            return res.status(400).json({ error: 'Unauthorized. Please provide a valid API key.' });
        }
        next();
    }

    //  API鉴权验证
    app.use(authenticate);

    //  路由模块引入
    const playerInfoController = require('./src/v2/playerInfoController');
    //const playerPCQuickInfoController = require('./src/v2/playerPCQuickInfoController')

    //  定义路由入口
    app.get('/v2/api/playerInfo', playerInfoController.getPlayerInfo);
    //app.get('v2/api/playerPCQuickInfo',playerInfoController.getPlayerPCQuickInfo)

    app.listen(PORT, HOST, () => {
        // console.log(`${getCurrentTime()} Worker ${cluster.worker.process.pid} is running`);
    });
}
