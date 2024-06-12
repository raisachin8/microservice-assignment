// app.js
const express = require('express');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 3000;;


const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.KEY_FILE_NAME,
});

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Handle file upload
app.post('/upload', multer.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    res.status(500).send(err);
  });

  blobStream.on('finish', () => {
    res.status(200).send('File uploaded successfully.');
  });

  blobStream.end(file.buffer);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Microservice listening at http://localhost:${port}`);
});
