const express = require('express');
const multer = require('multer');
const File = require('../models/File');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = new File({
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      user: req.body.user,
    });
    await file.save();
    res.status(201).send('File uploaded successfully');
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }
    res.download(file.path, file.filename);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Route to list all files
router.get('/list', async (req, res) => {
  try {
    const files = await File.find({});
    res.json(files);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
