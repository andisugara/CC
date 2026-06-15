const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

const bucketName = "z-health-496809.firebasestorage.app";
const bucket = storage.bucket(bucketName);

function imgUrlBucket(filename) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filename)}?alt=media`;
}

const bucketUpload = {};

bucketUpload.uploadToBucket = (req, res, next) => {

    if (!req.file) return next();

    const timeStamp = new Date().getTime()
    const imgName = `${timeStamp}-${req.file.originalname}`;

    let path;
    if (req.file.fieldname == 'profile_img') {
        path = 'profile_img/'
    } 
    // else if (req.file.fieldname == 'image') {
    //     path = 'donation_img/'

    // } else if (req.file.fieldname == 'sell_img') {
    //     path = 'sell_img/'

    // }
        
    const gcsname = path + imgName;
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
