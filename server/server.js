require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const validPin = process.env.VALID_PIN || '1337';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/pdf', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'Dev Challenge.pdf');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending PDF file:', err);
            res.status(500).json({ error: 'Failed to send PDF file' });
        }
    });
});

app.post('/api/sign', (req, res) => {
    const { name, pin } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Valid name is required' });
    }

    if (!pin || typeof pin !== 'string' || pin.trim().length === 0) {
        return res.status(400).json({ error: 'Valid PIN is required' });
    }

    if (pin !== validPin) {
        return res.status(401).json({ error: 'Invalid PIN' });
    }

    try {
        console.log(`Document signed by ${name}`);
        res.json({ message: 'Document signed successfully' });
    } catch (error) {
        console.error('Error processing signature:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/status', (req, res) => {
    res.sendStatus(200);
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});