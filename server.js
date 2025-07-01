const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

let allResponses = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root endpoint - blank
app.get('/', (req, res) => {
    res.status(204).send(); // No content
});

// View all stored responses (clean plain format)
app.get('/view', (req, res) => {
    if (allResponses.length === 0) {
        return res.send('No POST data received yet.');
    }

    const formatted = allResponses.map(item => JSON.stringify(item)).join(',\n\n');
    res.setHeader('Content-Type', 'application/json');
    res.send(formatted);
});

// POST endpoint
app.post('/dynamic-format', (req, res) => {
    const input = req.body;
    const inputArray = Array.isArray(input) ? input : [input];

    for (const obj of inputArray) {
        if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
            return res.status(400).json({ error: "Each item must be a valid JSON object." });
        }
    }

    allResponses.push(...inputArray);

    console.log("✅ POST Response:");
    inputArray.forEach(obj => console.dir(obj, { depth: null, colors: true }));

    // Return as plain line(s), no array/brackets
    const responseText = inputArray.map(obj => JSON.stringify(obj)).join(',\n\n');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(responseText);
});

// Start server
app.listen(port, () => {
    console.log(`✅ Dynamic API running at http://localhost:${port}`);
});
