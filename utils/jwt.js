const jwt  = require('jsonwebtoken');

const generateJWT = (user) =>{
    return jwt.sign(user, process.env.JWT_SECURITY_KEY, {expiresIn : "1h"});
}

module.exports = generateJWT;