const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) =>{
    const token = req.cookies.AccessToken || req.header('Authorization')?.replace('Bearer ', '');

    if(!token) return res.status(401).json({Message : "Token not found"});

    const user =  jwt.verify(token, process.env.JWT_SECURITY_KEY, (error, decoded)=>{
        if(error) return res.status(401).json({Message : "Unauthorized"});
        req.user = decoded;
        next()
    });
}

module.exports = verifyJWT;