const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.post('/authenticate-node', (req, res) => {
    const { id, data } = req.body;
    let password, token;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            password = parsed.password;
            token = parsed.token;
        } catch (e) {
            console.log('Failed to parse data as JSON:', data);
            res.json({ authenticated: false });
        }
    } else if (typeof data === 'object' && data !== null) {
        password = data.password;
        token = data.token;
    }
    console.log("Received authentication request from node with id ", id, ", password ", password, ", token ", token);
    res.json({ authenticated: id === "Alice" && password === "unicorns" && token === "magic-token" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
