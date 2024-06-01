const AWS = require('aws-sdk');
const fs = require('fs');
const File = require('../models/File');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.uploadFile = async (req, res) => {
    const fileContent = fs.readFileSync(req.file.path);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.filename,
        Body: fileContent,
    };

    s3.upload(params, async (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        const newFile = new File({
            userId: req.user._id,
            url: data.Location,
            filename: req.file.originalname,
        });
        await newFile.save();
        res.status(201).send({ message: 'File uploaded successfully', file: newFile });
    });
};

exports.downloadFile = async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send('File not found');

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename,
    };

    s3.getObject(params, (err, data) => {
        if (err) return res.status(500).send(err);
        res.attachment(file.filename);
        res.send(data.Body);
    });
};
