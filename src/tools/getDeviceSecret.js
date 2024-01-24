/*
    getDeviceSecret.js
    用于获取设备密钥
*/

const axios = require('axios');
const config = require('../../config');
const {getCurrentTime} = require("../getCurrentTime");
const unixTime = new Date().getTime();
async function getDeviceSecret(req, res) {
    try {
        let blzApis = {
            // 获取SSO登录令牌
            getSSOToken: '',
            // 获取Serial序列号和restoreCode恢复码
            getSR: 'https://authenticator-rest-api.bnet-identity.blizzard.net/v1/authenticator',
            // 获取设备密钥
            getSecret: 'https://authenticator-rest-api.bnet-identity.blizzard.net/v1/authenticator/device'
        };

        console.log(`${getCurrentTime()} Received a getDeviceSecret request.`);
// 定义变量
        const localHostAPI = `http://${config.HOST}:${config.PORT}`;
        const token = req.query.token;
        let ssoToken = null;
        let serial = null;
        let restoreCode = null;
        let deviceSecret = null;
        let secret = null;

        // 解析 Token 中的地区码
        const getRegionFromToken = (token) => {
            const regionMatches = token.match(/^(KR|US|EU)-/i);
            if (regionMatches && regionMatches.length > 1) {
                return regionMatches[1].toLowerCase();
            }
            // 默认返回 'eu'，或者你可以根据实际情况返回其他默认值
            return 'KR';
        };

        // 获取当前地区
        const currentRegion = getRegionFromToken(token);
        blzApis.getSSOToken = `https://${currentRegion}.oauth.battle.net/oauth/sso/`;
        // console.log(blzApis.getSSOToken);

        // 检测token是否为空
        if (!token) {
            return res.status(400).json({"success": false, "error": "Please provide a token.", "time": unixTime});
        }

        // 初始化请求SSOToken表单参数
        const postData = new URLSearchParams();
        postData.append('client_id', 'baedda12fe054e4abdfc3ad7bdea970a');
        postData.append('grant_type', 'client_sso');
        postData.append('scope', 'auth.authenticator');
        postData.append('token', token);

        // 请求SSOToken
        await axios.post(blzApis.getSSOToken, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
        })
            .then(response => {
                ssoToken = response.data.access_token;
                if (ssoToken === null) {
                    const error = new Error("Invalid SSO token.");
                    error.step = "getSSOToken";
                    throw error;
                }
            })
            .catch(error => {
                error.step = "getSSOToken";
                throw error;
            });

        // 请求Serial序列号和restoreCode恢复码
        await axios.get(blzApis.getSR, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${ssoToken}`
            }
        })
            .then(response => {
                serial = response.data.serial;
                restoreCode = response.data.restoreCode;
                if (serial === null || restoreCode === null) {
                    const error = new Error("Can't get available serial and restoreCode.");
                    error.step = "getSerialAndRestoreCode";
                    throw error;
                }
            })
            .catch(error => {
                error.step = "getSerialAndRestoreCode";
                throw error;
            });

        // 请求deviceSecret设备密钥
        await axios.post(blzApis.getSecret, {
            serial: serial,
            restoreCode: restoreCode
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ssoToken}`
            }
        })
            .then(response => {
                deviceSecret = response.data.deviceSecret;
                if (deviceSecret === null) {
                    const error = new Error("Can't get available deviceSecret.");
                    error.step = "getDeviceSecret";
                    throw error;
                }
            })
            .catch(error => {
                error.step = "getDeviceSecret";
                throw error;
            });

        // 对设备密钥进行转换
        await axios.get(`${localHostAPI}/tool/secretConverter?value=${deviceSecret}`,)
            .then(response => {
                if (response.data.success === false) {
                    const error = new Error(response.data.error);
                    error.step = "secretConverter";
                    throw error;
                }
                secret = response.data.data.result;
                const result = {
                    "success": true,
                    "data": {
                        "serial": serial,
                        "restoreCode": restoreCode,
                        "deviceSecret": deviceSecret,
                        "otpSecret": secret,
                        "otpAuthUrl": `otpauth://totp/Battle.net?secret=${secret}&digits=8`,
                        "time": unixTime
                    }
                }
                return res.status(200).json(result);
            })
            .catch(error => {
                error.step = "secretConverter";
                throw error;
            });
    } catch (error) {
        console.error(`${getCurrentTime()} ${error.message},Step: ${error.step}`);
        return res.status(400).json({
            "success": false,
            "error": error.message,
            "step": error.step || "unknown",
            "time": unixTime
        });
    }
}

module.exports = {
    getDeviceSecret
};