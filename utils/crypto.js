const crypto = require('crypto');

const encryprDecryptMethod = (string, action) => {
    const encryptMethod = 'aes-256-cbc';
    const secretKey = "qqC77Ew3ai";
    const secretIv = "uxL-7[!L?^+rMx1q<)bUAoSS-&4O.J";

    const key = crypto.createHash("sha256").update(secretKey).digest('hex').substring(0, 32);
    const iv = crypto.createHash("sha256").update(secretIv).digest('hex').substring(0,16);

    let result = null;

    if(action === "encrypt"){
        const cipher = crypto.createCipheriv(encryptMethod, key, iv);
        let encrypted = cipher.update(string, "utf8", "base64");
        encrypted += cipher.final('base64');
        result = `${encrypted}-${Buffer.from(string).toString('base64')}`;
    }

    if(action === "decrypt"){
        const encryptedString = string.substring(0, string.lastIndexOf('-'));
        const cipher = crypto.createDecipheriv(encryptMethod, key, iv);
        let decrypted  = cipher.update(encryptedString, "base64", "utf8");
        decrypted += cipher.final('utf8');
        result = decrypted;
    }

    
    return result;

}

module.exports = {encryprDecryptMethod};