const express = require('express');

const connect = require('./config/db');

const app = express();

app.use(express.json());

app.listen(1698, async () => {
    try {
        await connect();
        console.log("Server is running on port 1698");
    } catch (err) {
        console.log(err.message);
    }
})