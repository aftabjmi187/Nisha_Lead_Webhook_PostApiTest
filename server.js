const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

let allResponses = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Homepage
app.get('/', (req, res) => {
    res.send(`
        <h2>✅ Dynamic API is running</h2>
        <p>POST JSON object or array of objects to <code>/dynamic-format</code></p>
        <p><a href="/form">Open UI to Submit JSON</a></p>
        <p><a href="/view">View All Responses</a></p>
    `);
});

// View all stored responses
app.get('/view', (req, res) => {
    if (allResponses.length === 0) {
        return res.send('<h3>No POST data received yet.</h3>');
    }

    const formatted = allResponses.map(item => JSON.stringify(item, null, 2)).join(',<br><br>');
    res.send(`<h3>📄 All Responses:</h3><pre style="padding:10px; background:#f4f4f4; border:1px solid #ccc;">${formatted}</pre>`);
});

// UI form to send JSON
app.get('/form', (req, res) => {
    res.send(`
        <h2>🔁 Submit JSON to /dynamic-format</h2>
        <textarea id="jsonInput" rows="10" cols="60" style="font-family: monospace;">
{
  "userId": 3,
  "id": 101,
  "title": "Testing title",
  "body": "This is the original body text."
}
        </textarea><br><br>
        <button onclick="sendData()">Send</button>
        <pre id="responseOutput" style="padding: 10px; background: #f4f4f4; border: 1px solid #ccc; border-radius: 6px;"></pre>

        <script>
            function sendData() {
                const input = document.getElementById('jsonInput').value;
                try {
                    const json = JSON.parse(input);
                    fetch('/dynamic-format', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(json)
                    })
                    .then(res => res.text())
                    .then(data => {
                        try {
                            const parsed = JSON.parse('[' + data.replace(/}\\s*,\\s*{/g, '},{') + ']');
                            const pretty = parsed.length === 1
                                ? JSON.stringify(parsed[0], null, 2)
                                : parsed.map(obj => JSON.stringify(obj, null, 2)).join(',\\n\\n');
                            document.getElementById('responseOutput').innerText = pretty;
                        } catch (e) {
                            document.getElementById('responseOutput').innerText = data;
                        }
                    })
                    .catch(err => {
                        document.getElementById('responseOutput').innerText = '❌ Error: ' + err;
                    });
                } catch (e) {
                    document.getElementById('responseOutput').innerText = '❌ Invalid JSON';
                }
            }
        </script>
    `);
});

// POST endpoint
app.post('/dynamic-format', (req, res) => {
    const input = req.body;
    const inputArray = Array.isArray(input) ? input : [input];

    for (const obj of inputArray) {
        if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
            const errorResponse = { error: "Each item must be a valid JSON object." };
            console.log("❌ Error:", errorResponse);
            return res.status(400).json(errorResponse);
        }
    }

    allResponses.push(...inputArray);

    console.log("✅ POST Response:");
    inputArray.forEach(obj => console.dir(obj, { depth: null, colors: true }));

    const responseText = inputArray.map(obj => JSON.stringify(obj)).join(',\n');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(responseText);
});

// Start server
app.listen(port, () => {
    console.log(`✅ Dynamic API running at http://localhost:${port}`);
});
