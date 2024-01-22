const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');
const {getCurrentTime} = require('./getCurrentTime');
const cron = require('node-cron');
const config = require('../config')

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const CACHE_EXPIRATION_TIME = config.CACHE_EXPIRATION_TIME; // 12 hours
const CLEANUP_CRON_PATTERN = config.CLEANUP_CRON_PATTERN; // Every day at midnight

// 确保缓存目录存在
async function createCacheDir() {
    try {
        await fs.access(CACHE_DIR);
    } catch (error) {
        console.error(`${getCurrentTime()} Cache directory does not exist. Creating...`);
        await fs.mkdir(CACHE_DIR);
        console.log(`${getCurrentTime()} Cache directory created successfully.`);
    }
}


// 生成缓存文件名
function generateCacheFileName(playerTag) {
    return `${playerTag}.html`;
}

// 获取HTML内容，支持强制刷新缓存
async function fetchHtmlContent(playerTag, forceRefresh = false) {
    const url = `${config.DATA_SOURCE}${encodeURIComponent(playerTag)}/`;
    const cacheFileName = generateCacheFileName(playerTag);
    const cacheFilePath = path.join(CACHE_DIR, cacheFileName);

    try {
        if (!forceRefresh) {
            // 尝试读取缓存文件
            const fileContent = await fs.readFile(cacheFilePath, 'utf-8');
            console.log(`${getCurrentTime()} Cache hit for \u001b[33m${playerTag}\u001b[0m. Using cached content.`);
            return fileContent;
        }
    } catch (error) {
        // 缓存文件不存在或读取失败，继续获取最新内容
        console.error(`${getCurrentTime()} Cache miss for \u001b[33m${playerTag}\u001b[0m. Reading fresh content. Error: ${error.message}`);
    }

    // 读取最新HTML内容
    const response = await axios.get(url);
    const htmlContent = response.data;

    // 保存HTML缓存
    await createCacheDir();
    await fs.writeFile(cacheFilePath, htmlContent);
    console.log(`${getCurrentTime()} Cache updated for \u001b[33m${playerTag}\u001b[0m.`);
    return htmlContent;
}

// 清理过期HTML缓存
async function cleanExpiredHtmlCache() {
    try {
        const files = await fs.readdir(CACHE_DIR);
        const currentTime = Date.now();

        for (const file of files) {
            const filePath = path.join(CACHE_DIR, file);
            const fileStat = await fs.stat(filePath);

            if (currentTime - fileStat.mtime.getTime() > CACHE_EXPIRATION_TIME) {
                await fs.unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Error cleaning expired HTML cache:', error.message);
    }
}

// 设置定时任务，每天清理一次过期缓存
cron.schedule(CLEANUP_CRON_PATTERN, async () => {
    console.log('Running scheduled task: Cleaning expired HTML cache');
    await cleanExpiredHtmlCache();
});

module.exports = {
    fetchHtmlContent,
};
