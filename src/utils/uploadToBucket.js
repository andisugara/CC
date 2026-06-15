const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

const bucketName = "z-health-496809.firebasestorage.app";
const bucket = storage.bucket(bucketName);

function imgUrlBucket(filename) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filename)}?alt=media`;
}

const bucketUpload = {};
const nodePath = require('path'); 
bucketUpload.uploadToBucket = (req, res, next) => {
    if (!req.file) return next();
    const user_id = req.params.id;
    const imgName = `avatar-${user_id}${nodePath.extname(req.file.originalname)}`; // ✅ pakai nodePath
    let folder; // ✅ ganti nama variable dari 'path' ke 'folder'
    if (req.file.fieldname == 'profile_img') {
        folder = 'profile_img/'
    }
        
    const gcsname = folder + imgName;
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype || 'image/jpeg', // ✅ fallback ke image/jpeg
        },
    });
    
    stream.on("error", (err) => {
        req.file.cloudStorageError = err;
        next(err);
    });
    stream.on("finish", () => {
        req.file.cloudStoragePublicUrl = imgUrlBucket(gcsname);
        next();
    });
    stream.end(req.file.buffer);
};


module.exports = bucketUpload;
