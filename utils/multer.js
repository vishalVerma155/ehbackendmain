const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'uploads/'); // file path
    },
    filename : (req, file, cb) =>{
        cb(null, Date.now() + "-" + file.originalname); // create unique file name
    }
})

const upload = multer({storage}); // multer config

module.exports = {upload};