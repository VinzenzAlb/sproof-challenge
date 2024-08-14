const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;
const validPin = '1337';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/pdf', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Dev Challenge.pdf'));
});

app.post('/api/sign', (req, res) => {
    const { name, pin } = req.body;

    if (!name || !pin) {
        return res.status(400).json({ error: 'Name and PIN are required' });
    }

    if (pin !== validPin) {
        return res.status(400).json({ error: 'Invalid PIN' });
    }

    console.log(`Document signed by ${name}`);
    res.json({ message: 'Document signed successfully' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});