const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Set up database
const db = new sqlite3.Database('Updated_DB.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the Updated_DB database.');
    createTable();
});

// Create table if not exists
function createTable() {
    db.run('CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, data BLOB)', function(err) {
        if (err) {
            console.error(err.message);
        }
        console.log('Table created successfully.');
    });
}

// Set up routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    } else {
        // Insert file details into the database
        const imageDetails = {
            filename: req.file.originalname,
            data: req.file.buffer
        };

        db.run('INSERT INTO images(filename, data) VALUES (?, ?)', [imageDetails.filename, imageDetails.data], function(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
            res.send('File uploaded successfully.');
        });
    }
});

// Add a new route to serve the PDF file
app.get('/view_pdf', (req, res) => {
    const filePath = '/content/medicine_info_output.pdf'; // Path to your PDF file
    fs.readFile(filePath , (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading PDF file');
        }
        res.contentType('application/pdf');
        res.send(data);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});