const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

let allResponses = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root: show nothing
app.get('/', (req, res) => {
    res.status(204).send(); // No Content
});

// View all stored responses - clean format
app.get('/view', (req, res) => {
    if (allResponses.length === 0) {
        return res.status(200).send('No POST data received yet.');
    }

    const output = allResponses.map(obj => JSON.stringify(obj)).join(',\n\n');
    res.setHeader('Content-Type', 'application/json');
    res.send(output);
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

    console.log("✅ Received:", inputArray);

    res.status(200).json(inputArray.length === 1 ? inputArray[0] : inputArray);
});

// Start server
app.listen(port, () => {
    console.log(`✅ Dynamic API running at http://localhost:${port}`);
});
