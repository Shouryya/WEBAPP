 const express = require('express');
//import express from 'express';
const multer = require('multer');
//import multer from 'multer';
const path = require('path');
//import path from 'path';
 const bodyParser = require('body-parser');
//import bodyParser from 'body-parser';
 const fs = require('fs');
//import fs from 'fs';
 const cors = require('cors');
//import cors from 'cors';
//__dirname giving not defined
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  };
app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const upload = multer({ dest: "C:/Users/lenovo/Downloads/planprj/planprj/public/uploads" })

app.post('/upload',cors(corsOptions),upload.single('file'), (req, res) => {
  console.log("req.file:",req.file);
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, 'public/uploads/', req.file.originalname);

    fs.rename(tempPath, targetPath, err => {
        if (err) return res.sendStatus(500);

        res.json({ imageUrl: "http://localhost:3000/uploads/"+ req.file.originalname });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});