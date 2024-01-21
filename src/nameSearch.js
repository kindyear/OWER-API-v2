module.exports = function nameSearch(playerTag) {
    const axios = require('axios');
    const config = require("../config");
    const rawPlayerTag = playerTag.replace("-", "#");
    const searchApiURL = `${config.NAME_SEARCH}/${encodeURIComponent(rawPlayerTag)}`;
    const defaultPlayerNameCardID = null;
    const defaultPlayerAvatarID = null;
    const defaultPlayerTag = null;

    return axios.get(searchApiURL)
        .then(response => {
            const apiData = response.data;
            if (Array.isArray(apiData) && apiData.length > 0) {
                const exactMatch = apiData.find(info => info.battleTag === rawPlayerTag);
                if (exactMatch) {
                    const exactMatchBattleTag = exactMatch.battleTag.replace("#", "-");
                    const exactMatchPlayerNameCardID = exactMatch.namecard;
                    const exactMatchPlayerAvatarID = exactMatch.portrait;
                    return [exactMatchBattleTag, exactMatchPlayerNameCardID, exactMatchPlayerAvatarID];
                } else {
                    const lowerCasePlayerTag = rawPlayerTag.toLowerCase();
                    const fuzzyMatch = apiData.find(info => info.battleTag.toLowerCase() === lowerCasePlayerTag);
                    if (fuzzyMatch) {
                        const fuzzyMatchBattleTag = fuzzyMatch.battleTag.replace("#", "-");
                        const fuzzyMatchPlayerNameCardID = fuzzyMatch.namecard;
                        const fuzzyMatchPlayerAvatarID = fuzzyMatch.portrait;
                        return [fuzzyMatchBattleTag, fuzzyMatchPlayerNameCardID, fuzzyMatchPlayerAvatarID];
                    } else {
                        return [defaultPlayerTag, defaultPlayerNameCardID, defaultPlayerAvatarID];
                    }
                }
            } else {
                return [defaultPlayerTag, defaultPlayerNameCardID, defaultPlayerAvatarID];
            }
        });
};
