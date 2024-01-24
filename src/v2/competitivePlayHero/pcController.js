/*
    competitivePlayHero/pcController.js
    处理玩家PC平台竞技模式英雄信息
*/

const cheerio = require('cheerio');
const {getCurrentTime} = require('../../getCurrentTime');
const heroesData = require('../../../data/herosData.json');
const nameSearch = require("../../nameSearch");
const cacheManager = require("../../cacheManager");

async function getPCCompetitivePlayHeroInfo(req, res) {
    try {
        let {playerTag, heroID, refreshCache} = req.query;
        const heroName = heroesData.find(hero => hero.heroID.toString() === heroID).heroName;
        console.log(`${getCurrentTime()} Received pc competitive hero info request with playerTag: \u001b[33m${playerTag}\u001b[0m, heroID: \u001b[33m${heroID}\u001b[0m, heroName: \u001b[33m${heroName}\u001b[0m.`);

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
        let $ = cheerio.load(htmlContent);
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

        // 填充用户信息
        const playerName = $('h1.Profile-player--name').text();
        const playerIcon = $('.Profile-player--portrait').attr('src');

        if (isPrivate) {

            const isPrivateResult = {
                private: isPrivate,
                playerTag: playerTag,
                playerName: playerName,
                playerIcon: playerIcon,
                playerIconID: playerAvatarID.trim(),
                playerNameCardID: playerNameCardID.trim(),
                gameMode: 'competitive',
                platform: 'pc',
                heroID: heroID,
                heroName: heroName,
                quickHeroData: [],
                refreshCache: shouldRefreshCache,
                currentTime: currentUNIXTime
            };
            console.log(`${getCurrentTime()} \u001b[33m${playerTag} (Private)\u001b[0m‘s pc quickPlay hero data for heroID \u001b[33m${heroID}\u001b[0m has been scraped successfully.`);
            return res.status(200).json(isPrivateResult);
        }

        // 获取页面元素中的所有英雄信息
        const heroElements = $('body > div.main-content > div.mouseKeyboard-view.Profile-view > blz-section.stats.competitive-view > div.Profile-heroSummary--header > select[data-dropdown-id="hero-dropdown"] option')
            .map((index, element) => ({
                heroName: $(element).attr('option-id'), // 使用 option-id 作为英雄名字
                heroSourceID: $(element).val() // 使用 value 作为英雄的源ID
            }))
            .get();

        // 复制 JSON 模板，并根据页面元素中的数据进行匹配和处理
        const processedHeroesData = heroesData.map(heroData => {
            const heroSourceID = getHeroSourceID(heroData.heroName, heroElements);
            return {
                ...heroData,
                heroSourceID: heroSourceID !== null ? heroSourceID.toString() : null
            };
        });

        //  console.log(`${getCurrentTime()} Processed Hero Data:`, processedHeroesData);

        // 根据传入的 heroName 获取匹配的 selectedHero 对象
        const selectedHero = processedHeroesData.find(hero => hero.heroID.toString() === heroID);

        if (!selectedHero) {
            //console.error(`No hero found with ID ${heroID} in heroesData.`);
            return res.status(200).json({error: `No hero found with heroID \u001b[33m${heroID}\u001b, heroName: \u001b[33m${heroName}\u001b[0m [0m in heroesData.`});
        }

        if (selectedHero.heroSourceID === null) {
            console.log(`${getCurrentTime()} Error: Hero with heroID \u001b[33m${heroID}\u001b[0m, heroName: \u001b[33m${heroName}\u001b[0m does not exist.`);
            return res.status(200).json({
                error: `The requested hero cannot be found in the player's information.`
            });
        }

        // 构建动态的选择器
        const heroSelector = `.mouseKeyboard-view.Profile-view blz-section.stats.competitive-view span.stats-container.option-${selectedHero.heroSourceID}`;

        // 提取指定位置的元素信息
        const competitiveHeroData = $(heroSelector).html();

        // 使用Cheerio解析元素信息
        $ = cheerio.load(competitiveHeroData);
        const parsedHeroData = [];
        $('.category').each((index, category) => {
            const categoryName = $(category).find('.header p').text().trim();
            const categoryData = [];
            $(category).find('.content .stat-item').each((index, statItem) => {
                const statName = $(statItem).find('.name').text().trim();
                const statValue = $(statItem).find('.value').text().trim();
                categoryData.push({statName, statValue});
            });
            parsedHeroData.push({categoryName, categoryData});
        });

        //console.log(`${getCurrentTime()} Quick Hero Data:`, parsedHeroData);
        const result = {
            private: isPrivate,
            playerTag,
            playerName: playerName,
            playerIcon: playerIcon,
            playerIconID: playerAvatarID.trim(),
            playerNameCardID: playerNameCardID.trim(),
            gameMode: 'competitive',
            platform: 'pc',
            heroID: selectedHero.heroID,
            heroName: selectedHero.heroName,
            heroSourceID: selectedHero.heroSourceID,
            quickHeroData: parsedHeroData,
            refreshCache: shouldRefreshCache,
            currentTime: currentUNIXTime
        };
        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s pc competitive hero data for heroID \u001b[33m${heroID}\u001b[0m has been scraped successfully.`);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        res.status(500).json({error: 'Failed to scrape data.'});
    }
}

// 创建一个函数来获取英雄的 heroSourceID
function getHeroSourceID(heroName, heroElements) {
    const heroElement = heroElements.find(element => element.heroName === heroName);
    return heroElement ? heroElement.heroSourceID : null;
}

module.exports = {getPCCompetitivePlayHeroInfo};