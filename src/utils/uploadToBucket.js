const { Storage } = require('@google-cloud/storage');
const path = require('path');


const storage = new Storage();

const bucketName = "z-health-496809.firebasestorage.app";
const bucket = storage.bucket(bucketName);

function imgUrlBucket(filename) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filename)}?alt=media`;
}

const bucketUpload = {};

bucketUpload.uploadToBucket = (req, res, next) => {

    if (!req.file) return next();
    console.log('mimetype:', req.file.mimetype); // ✅ tambah ini
    console.log('buffer length:', req.file.buffer?.length); // ✅ tambah ini
    const timeStamp = new Date().getTime()
    const ext = path.extname(req.file.originalname);
    const imgName = `avatar-${req.params.id}${ext}`;

    let folder;
    if (req.file.fieldname == 'profile_img') {
        folder = 'profile_img/'
    } 
    // else if (req.file.fieldname == 'image') {
    //     path = 'donation_img/'

    // } else if (req.file.fieldname == 'sell_img') {
    //     path = 'sell_img/'

    // }
        
    const gcsname = folder + imgName;
    const file = bucket.file(gcsname);


    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
        },
    });

    stream.on("error", (err) => {
        req.file.cloudStorageError = err;
        next(err);
    });

    stream.on("finish", () => {
        req.file.cloudStorageObject = gcsname;
        req.file.cloudStoragePublicUrl = imgUrlBucket(gcsname);
        next(); 
    });

    stream.end(req.file.buffer);
};

module.exports = bucketUpload;
