const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to serve the PDF
app.get('/api/pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Dev Challenge.pdf'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});