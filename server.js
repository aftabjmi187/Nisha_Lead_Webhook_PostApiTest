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

// View all responses
app.get('/view', (req, res) => {
    if (allResponses.length === 0) {
        return res.send('<h3>No POST data received yet.</h3>');
    }

    const formatted = allResponses.map(item => JSON.stringify(item, null, 2)).join('<hr>');
    res.send(`<h3>📄 All Responses:</h3><pre>${formatted}</pre>`);
});

// HTML UI form
app.get('/form', (req, res) => {
    res.send(`
        <h2>🔁 Submit JSON to /dynamic-format</h2>
        <textarea id="jsonInput" rows="10" cols="60">
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\\nsuscipit recusandae consequuntur expedita et cum\\nreprehenderit molestiae ut ut quas totam\\nnostrum rerum est autem sunt rem eveniet architecto"
}
        </textarea><br><br>
        <button onclick="sendData()">Send</button>
        <pre id="responseOutput"></pre>

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
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('responseOutput').innerText = JSON.stringify(data, null, 2);
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

        allResponses.push(obj);
        console.log("✅ POST Response:", obj); // clean logging
        return res.status(200).json(obj); // return exactly what was sent
    }
});

// Start server
app.listen(port, () => {
    console.log(`✅ Dynamic API running at http://localhost:${port}`);
});
