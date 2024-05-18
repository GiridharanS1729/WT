const express = require('express');
const url = require('url');
const querystring = require('querystring');

const app = express();
const port = 5000;

app.get('/', (req, res) => {
    const query = url.parse(req.url).query;
    const params = querystring.parse(query);

    const p = parseInt(params["principal"]);
    const r = parseInt(params["rate"]) / 100;
    const n = parseInt(params["compounding"]);
    const t = parseInt(params["time"]);

    const ci = p * Math.pow(1 + r / n, n * t) - p;
    const tot = p + ci;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Compound Interest Details</title>
            <style>
                body { display: flex; flex-direction: column; align-items: center; height: 100vh; background-color: #f3f3f3; color: #333; }
                table { font-family: Arial, sans-serif; border-collapse: collapse; width: 50%; margin-top: 20px; }
                th { background-color: #f2f2f2; padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                h2 { text-align: center; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h2>Compound Interest Details</h2>
            <table>
                <tr><th>Principal Amount</th><td>${p}</td></tr>
                <tr><th>Rate</th><td>${(r * 100).toFixed(2)}%</td></tr>
                <tr><th>Frequency</th><td>${n} months</td></tr>
                <tr><th>Time</th><td>${t} years</td></tr>
                <tr><th>Compound Interest</th><td>${ci.toFixed(2)}</td></tr>
                <tr><th>Total Amount</th><td>${tot.toFixed(2)}</td></tr>
            </table>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
