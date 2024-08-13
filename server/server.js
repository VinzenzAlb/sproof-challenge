const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;
const validPin = '1337';

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to serve the PDF
app.get('/api/pdf', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Dev Challenge.pdf'));
});

// New endpoint to handle signature submission
app.post('/api/sign', (req, res) => {
    const { name, pin } = req.body;

    console.log('Signing document...');

    // //hold the program for waitTime seconds
    // const start = Date.now();
    // const waitTime = 2; // in seconds
    // let now = start;
    // while (now - start < waitTime * 2000) {
    //     now = Date.now();
    // }
    // console.log('done');

    // Basic validation
    if (!name || !pin) {
        return res.status(400).json({ error: 'Name and PIN are required' });
    }

    if (pin !== validPin) {
        return res.status(400).json({ error: 'Invalid PIN' });
    }

    // In a real application, you would process the signature here
    console.log(`Document signed by ${name}`);

    // Send success response
    res.json({ message: 'Document signed successfully' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});