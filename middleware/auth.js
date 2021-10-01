const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

dotenv.config()
const JWT_SECRET = process.env.SECRET_KEY

const verifiedToken = async function(req,res,next){
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded
        
    } catch (error) {
        return res.status(401).send(error.message);
    }
    return next();
}; 

module.exports = verifiedToken; 