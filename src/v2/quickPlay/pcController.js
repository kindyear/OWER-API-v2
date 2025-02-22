/*
    quickPlay/pcController.js
    处理玩家PC平台快速模式的排行信息
*/

const cheerio = require('cheerio');
const {getCurrentTime} = require('../../getCurrentTime');
const nameSearch = require("../../nameSearch");
const cacheManager = require("../../cacheManager");

// 定义type与category-id的映射关系
const typeToCategoryIdMap = {
    'time-played': '0x0860000000000021', // Time Played
    'games-won': '0x0860000000000039', // Games Won
    'win-percentage': '0x08600000000003D1', // Win Percentage
    'best-weapon-accuracy': '0x08600000000001BB', // Weapon Accuracy - Best in Game
    'eliminations-per-life': '0x08600000000003D2', // Eliminations per Life
    'best-kill-streak': '0x0860000000000223', // Kill Streak - Best
    'best-multikill': '0x0860000000000346', // Multikill - Best
    'avg-eliminations': '0x08600000000004D4', // Eliminations - Avg per 10 Min
    'avg-deaths': '0x08600000000004D3', // Deaths - Avg per 10 Min
    'avg-final-blows': '0x08600000000004D5', // Final Blows - Avg per 10 Min
    'avg-solo-kills': '0x08600000000004DA', // Solo Kills - Avg per 10 Min
    'avg-objective-kills': '0x08600000000004D8', // Objective Kills - Avg per 10 Min
    'avg-objective-time': '0x08600000000004D9', // Objective Time - Avg per 10 Min
    'avg-hero-damage': '0x08600000000004BD', // Hero Damage Done - Avg per 10 Min
    'avg-healing-done': '0x08600000000004D6' // Healing Done - Avg per 10 Min
};

// 提取PC平台快速游戏排行榜数据的函数
async function getPCQuickPlayInfo(req, res) {
    try {
        let {playerTag, type, refreshCache} = req.query;
        console.log(`${getCurrentTime()} Received API request for quick play hero rankings: \u001b[33m${playerTag}\u001b[0m type: \u001b[33m${type}\u001b[0m`);
        // 将type参数转换为小写
        const selectedType = type ? type.toLowerCase() : null;

        // 根据type参数选择对应的category-id
        const categoryId = selectedType ? typeToCategoryIdMap[selectedType] : null;

        if (!categoryId) {
            console.log(`${getCurrentTime()} Invalid type: ${type} for ${playerTag}`);
            return res.status(500).json({error: 'Invalid type. Please provide a valid type for the rankings.'});
        }

        // 若 refreshCache 参数为字符串 "true"，则强制刷新缓存
        let shouldRefreshCache = refreshCache && refreshCache.toLowerCase() === 'true';

        if (shouldRefreshCache === undefined) {
            shouldRefreshCache = false;
        }

        let playerNameCardID = "";
        let playerAvatarID = "";
        [playerTag, playerNameCardID, playerAvatarID] = await nameSearch(playerTag);

        if (playerTag === null) {
            console.log(`${getCurrentTime()} \u001b[33m` + playerTag + `\u001b[0m Not Found`);
            return res.status(200).json({error: 'Player not found.'});
        }
        const currentUNIXTime = new Date().getTime();


        // 获取HTML内容，支持强制刷新缓存
        const htmlContent = await cacheManager.fetchHtmlContent(playerTag, shouldRefreshCache);
        const $ = cheerio.load(htmlContent);
        const errorElement = $('.error-contain');
        const isError = !!errorElement.length;
        if (isError) {
            console.log(`${getCurrentTime()} \u001b[33m` + playerTag + `\u001b[0m Not Found`);
            return res.status(200).json({
                error: "Player not found."
            });
        }


        // 检查私密信息元素
        const privateElement = $('.Profile-private---msg');
        const isPrivate = !!privateElement.length;

        // 提取页面内容
        const playerName = $('h1.Profile-player--name').text();
        const playerIcon = $('.Profile-player--portrait').attr('src');
        if (isPrivate) {
            const isPrivateResult = {
                private: true,
                playerTag: playerTag,
                playerName: playerName,
                playerIcon: playerIcon,
                playerIconID: playerAvatarID.trim(),
                playerNameCardID: playerNameCardID.trim(),
                gameMode: 'quickPlay',
                platform: 'pc',
                type: type ? type.toLowerCase() : null,
                heroRankings: [],
                refreshCache: shouldRefreshCache,
                currentTime: currentUNIXTime
            };
            console.log(`${getCurrentTime()} \u001b[33m${playerTag} (Private)\u001b[0m's quick play hero rankings data has been scraped successfully.`);
            return res.status(200).json(isPrivateResult);
        }

        // 定位到目标元素
        const progressBarsElement = $(`.main-content .mouseKeyboard-view.Profile-view blz-section.Profile-heroSummary .Profile-heroSummary--view.quickPlay-view .Profile-progressBars[data-category-id="${categoryId}"]`);
        // 提取排行榜数据
        const heroRankings = [];

        // 从progressBarsElement中提取排行榜数据
        progressBarsElement.find('.Profile-progressBar').each((index, element) => {
            const heroName = $(element).find('.Profile-progressBar-title').text();
            const heroData = $(element).find('.Profile-progressBar-description').text();

            heroRankings.push({heroName, heroData});
        });

        const result = {
            private: isPrivate,
            playerTag,
            playerName: playerName,
            playerIcon: playerIcon,
            playerIconID: playerAvatarID.trim(),
            playerNameCardID: playerNameCardID.trim(),
            gameMode: 'quickPlay',
            platform: 'pc',
            type: selectedType,
            heroRankings,
            refreshCache: shouldRefreshCache,
            currentTime: currentUNIXTime
        };

        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m's quick play hero rankings data has been scraped successfully.`);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        res.status(500).json({error: 'Failed to scrape data.'});
    }
}

module.exports = {getPCQuickPlayInfo};
