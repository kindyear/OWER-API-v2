// base32converter.js

function convertDeviceSecret(req,res) {
    const deviceSecret = req.query.value;

// Check if 'deviceSecret' parameter is provided
    if (!deviceSecret) {
        return res.status(400).json({ "success": false, "error": "Please provide a value." });
    }

    // Convert string to binary
    const binaryData = Buffer.from(deviceSecret, 'utf-8');

    // Convert binary data to hex
    const hexData = binaryData.toString('hex');

    // Simulate xxd -r -p
    const xxdResult = xxd(hexData);

    // Convert xxd result to binary
    const xxdBinaryData = Buffer.from(xxdResult, 'hex');

    // Call base32 encoding
    const base32Data = base32encode(xxdBinaryData);

    // Get Linux timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Return the result as an object
    return res.status(200).json({ "success": true, "data": { "result": base32Data, "time": timestamp } });
}

function xxd(hexData) {
    // Simulating xxd -r -p
    let result = '';
    for (let i = 0; i < hexData.length; i += 2) {
        result += String.fromCharCode(parseInt(hexData.substr(i, 2), 16));
    }
    return result;
}

function base32encode(buffer) {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let bitsCount = 0;

    for (let i = 0; i < buffer.length; i++) {
        bits = (bits << 8) | buffer[i];
        bitsCount += 8;

        while (bitsCount >= 5) {
            bitsCount -= 5;
            const index = (bits >>> bitsCount) & 31;
            result += base32Chars[index];
        }
    }

    if (bitsCount > 0) {
        bits = bits << (5 - bitsCount);
        const index = (bits >>> 3) & 31;
        result += base32Chars[index];
    }

    return result;
}

module.exports = {convertDeviceSecret};