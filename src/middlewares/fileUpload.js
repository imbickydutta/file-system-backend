require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

module.exports = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'my-drive-clone',
        acl: "public-read",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "-" + file.originalname)
        }
    })
})