const express = require('express');
const app = express();

// Parse JSON request bodies
app.use(express.json());

// A test endpoint
app.get('/', (req, res) => {
    res.send('Hello, World! from girish patel');
});

app.listen(3000);
