const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.post('/authenticate-node', (req, res) => {
    const { id, password } = req.body;
    console.log("Received authentication request from node with id ", id, " and password ", password);
    res.json({ authenticated: id === "Alice" && password === "unicorns" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
