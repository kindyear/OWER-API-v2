/*
    playerInfoController.js
    处理玩家生涯信息
*/
require('axios');
const cheerio = require('cheerio');
const { DOMParser } = require('xmldom');
const fs = require('fs');
const config = require('../../config');
const {getCurrentTime} = require('../getCurrentTime');
const nameSearch = require('../nameSearch');
const cacheManager = require('../cacheManager');

async function getPlayerInfo(req, res) {
    try {
        let {playerTag, refreshCache} = req.query;
        console.log(`${getCurrentTime()} Received API request: \u001b[33m${playerTag}\u001b[0m`);

        // 若 refreshCache 参数为字符串 "true"，则强制刷新缓存
        let shouldRefreshCache = refreshCache && refreshCache.toLowerCase() === 'true';

        if(shouldRefreshCache === undefined){
            shouldRefreshCache = false;
        }

        if (!playerTag) {
            return res.status(400).json({error: 'playerTag is required.'});
        }

        let playerNameCardID = "";
        let playerAvatarID = "";
        [playerTag, playerNameCardID, playerAvatarID] = await nameSearch(playerTag);

        if (playerTag === null) {
            return res.status(200).json({error: 'Player not found.'});
        }

        // 获取HTML内容，支持强制刷新缓存
        const htmlContent = await cacheManager.fetchHtmlContent(playerTag, shouldRefreshCache);
        const $ = cheerio.load(htmlContent);
        const errorElement = $('.error-contain');
        const isError = !!errorElement.length;
        if (isError) {
            console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m Not Found`);
            return {
                error: "Player not found."
            };
        }

        // 检查私密信息元素
        const privateElement = $('.Profile-private---msg');
        const isPrivate = !!privateElement.length;

        // 提取页面内容
        const playerTitle = $('h2.Profile-player--title').text();
        const playerName = $('h1.Profile-player--name').text();
        const playerIcon = $('.Profile-player--portrait').attr('src');
        const endorsementIconSrc = $('.Profile-playerSummary--endorsement').attr('src');
        const endorsementLevel = endorsementIconSrc.match(/endorsement\/(\d+)/)[1];

        const playerCompetitiveInfo = {
            PC: {
                Tank: {},
                Damage: {},
                Support: {}
            },
            Console: {
                Tank: {},
                Damage: {},
                Support: {}
            }
        };

        const roles = ['Tank', 'Damage', 'Support'];

        roles.forEach((role) => {
            let PCRoleWrapper;
            let ConsoleRoleWrapper;

            // 处理 Damage 角色图片标签的特殊情况
            PCRoleWrapper = $(`.mouseKeyboard-view.Profile-playerSummary--rankWrapper .Profile-playerSummary--roleWrapper:has(.Profile-playerSummary--role img[src*="${role === 'Damage' ? 'offense' : role.toLowerCase()}"])`);
            ConsoleRoleWrapper = $(`.controller-view.Profile-playerSummary--rankWrapper .Profile-playerSummary--roleWrapper:has(.Profile-playerSummary--role)`);

            // 打印筛选前的 ConsoleRoleWrapper 的 HTML 元素
            // console.log('ConsoleRoleWrapper (Before Filter):', ConsoleRoleWrapper.html());

            // 筛选出符合条件的元素
            const filteredConsoleRoleWrapper = ConsoleRoleWrapper.filter(function () {
                const htmlContent = $(this).html();
                const xlinkHrefMatch = htmlContent.match(/xlink:href="([^"]*)"/);
                const xlinkHref = xlinkHrefMatch ? xlinkHrefMatch[1] : null;
                // console.log(xlinkHref);
                return xlinkHref && xlinkHref.includes(role === 'Damage' ? 'offense' : role.toLowerCase());
            });


            // console.log('PC: '+ PCRoleWrapper.length + '\n' + 'CS: ' + ConsoleRoleWrapper.length + '\n' + 'FCS: ' + filteredConsoleRoleWrapper.length);

            // 打印筛选后的 filteredConsoleRoleWrapper 的 HTML 元素
            // console.log('filteredConsoleRoleWrapper:', filteredConsoleRoleWrapper.html());

            // 处理 PC 平台
            if (PCRoleWrapper.length > 0) {
                const rankElement = PCRoleWrapper.find('.Profile-playerSummary--rank');
                updatePlayerCompetitiveInfo('PC', role, rankElement);
                saveWrapperToFile(PCRoleWrapper.html(), 'PCRoleWrapper.html');
            } else {
                // 如果没有找到该角色，则设置为 null
                playerCompetitiveInfo.PC[role] = null;
            }

            // 处理 Console 平台
            if (ConsoleRoleWrapper.length > 0) {
                const rankElement = filteredConsoleRoleWrapper.find('.Profile-playerSummary--rank');
                updatePlayerCompetitiveInfo('Console', role, rankElement);
                saveWrapperToFile(ConsoleRoleWrapper.html(), 'ConsoleRoleWrapper.html');
            } else {
                // 如果没有找到该角色，则设置为 null
                playerCompetitiveInfo.Console[role] = null;
            }
        });

        // 更新 playerCompetitiveInfo 对象的函数
        function updatePlayerCompetitiveInfo(platform, role, rankElement) {
            const rankSrc = rankElement.attr('src');
            const rankName = rankSrc ? rankSrc.match(/rank\/(.*?)-\w+/)[1].replace("Tier", "") : '';
            const rankTier = rankSrc ? parseInt(rankSrc.match(/rank\/.*?-(\d+)/)[1]) : 0;

            playerCompetitiveInfo[platform][role] = {
                [`playerCompetitive${platform}${role}`]: rankName,
                [`playerCompetitive${platform}${role}Tier`]: rankTier,
            };
        }

        // 保存 HTML 内容到本地文件的函数
        function saveWrapperToFile(htmlContent, fileName) {
            fs.writeFileSync(fileName, htmlContent, 'utf-8');
            // console.log(`Wrapper content saved to ${fileName}`);
        }

        const currentUNIXTime = Math.floor(Date.now() / 1000);
        // 构造JSON格式输出
        const result = {
            private: isPrivate,
            //用户基础生涯信息
            playerBaseInfo: {
                playerTag: playerTag,
                playerName: playerName.trim(),
                playerTitle: playerTitle.trim(),
                playerIcon: playerIcon.trim(),
                playerIconID: playerAvatarID.trim(),
                playerNameCardID: playerNameCardID.trim(),
                endorsementLevel: parseInt(endorsementLevel)
            },
            //用户竞技信息
            playerCompetitiveInfo: playerCompetitiveInfo,
            refreshCache: shouldRefreshCache,
            currentTime: currentUNIXTime,
        };

        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s data has been scraped successfully.`);
        return res.json(result);


    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        res.status(500).json({error: 'Failed to scrape data.'});
    }
}

module.exports = {
    getPlayerInfo,
};
