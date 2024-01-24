/*
    OWER-API v2
    @Author: KINDYEAR
    @Date: 2024-1-21
    app.js
*/
const express = require('express');
const os = require('os');
const cluster = require('cluster');
const {getCurrentTime} = require('./src/getCurrentTime');
const config = require('./config');
const packageInfo = require('./package.json');
const {PORT, HOST, API_KEY, CORE} = config;
let finalWorkerCount = 0;

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
    finalWorkerCount = workerCount;

} else {
    const app = express();

    function authenticate(req, res, next) {
        const {apiKey} = req.query;

        if (!apiKey || apiKey !== API_KEY) {
            return res.status(400).json({error: 'Unauthorized. Please provide a valid API key.'});
        }
        next();
    }
    //  路由模块引入
    const secretConverter = require('./src/tools/secretConverter');

    const playerInfoController = require('./src/v2/playerInfoController');
    const getPCQuickPlayInfoController = require('./src/v2/quickPlay/pcController');
    const getConsoleQuickPlayInfoController = require('./src/v2/quickPlay/consoleController');
    const getPCCompetitivePlayInfoController = require('./src/v2/competitivePlay/pcController');
    const getConsoleCompetitivePlayInfoController = require('./src/v2/competitivePlay/consoleController');
    const getPCQuickPlayHeroInfoController = require('./src/v2/quickPlayHero/pcController');
    const getConsoleQuickPlayHeroInfoController = require('./src/v2/quickPlayHero/consoleController');
    const getPCCompetitivePlayHeroInfoController = require('./src/v2/competitivePlayHero/pcController');
    const getConsoleCompetitivePlayHeroInfoController = require('./src/v2/competitivePlayHero/consoleController');

    //  定义路由入口
    app.get('/', (req, res) => {
        res.send(`
        <h1>OWER-API v2</h1>
        <p>OWER-API v2 is running.</p>
        <p>Version: ${packageInfo.version}</p>
        <p>Service running on <a href="http://${HOST}:${PORT}">http://${HOST}:${PORT}</a> with ${cluster.worker.id} worker(s)</p>
        `);
    });
    app.get('/tool/secretConverter', secretConverter.convertDeviceSecret);
    app.get('/v2/api/version', (req, res) => {
        const result = {
            name: packageInfo.name,
            version: packageInfo.version,
            description: packageInfo.description,
            author: packageInfo.author,
            workers: cluster.worker.id,
            time: new Date().getTime()
        }
        return res.status(200).json(result);
    });

    //  API鉴权验证
    app.use(authenticate);

    //  注册各模块路由
    app.get('/v2/api/playerInfo', playerInfoController.getPlayerInfo);
    app.get('/v2/api/playerPCQuickInfo', getPCQuickPlayInfoController.getPCQuickPlayInfo);
    app.get('/v2/api/playerConsoleQuickInfo', getConsoleQuickPlayInfoController.getConsoleQuickPlayInfo);
    app.get('/v2/api/playerPCCompetitiveInfo', getPCCompetitivePlayInfoController.getPCCompetitivePlayInfo);
    app.get('/v2/api/playerConsoleCompetitiveInfo', getConsoleCompetitivePlayInfoController.getConsoleCompetitivePlayInfo);
    app.get('/v2/api/playerPCQuickHerosInfo', getPCQuickPlayHeroInfoController.getPCQuickPlayHeroInfo);
    app.get('/v2/api/playerConsoleQuickHerosInfo', getConsoleQuickPlayHeroInfoController.getConsoleQuickPlayHeroInfo);
    app.get('/v2/api/playerPCCompetitiveHerosInfo', getPCCompetitivePlayHeroInfoController.getPCCompetitivePlayHeroInfo);
    app.get('/v2/api/playerConsoleCompetitiveHerosInfo', getConsoleCompetitivePlayHeroInfoController.getConsoleCompetitivePlayHeroInfo);

    app.listen(PORT, HOST, () => {
        // console.log(`${getCurrentTime()} Worker ${cluster.worker.process.pid} is running`);
    });
}
