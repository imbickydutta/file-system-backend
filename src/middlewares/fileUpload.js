const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const s3 = new aws.S3({
    accessKeyId: "AKIAYUH3YE2NAKYXBHJJ",
    secretAccessKey: "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",
})

// const upload = multer({ storage: storage });

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