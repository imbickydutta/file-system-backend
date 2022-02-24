const express = require('express');
const connect = require('./config/db');
require("dotenv").config();

const userController = require('./controllers/user.controller');
const fileController = require('./controllers/file.controller');


const app = express();

app.use(express.json());

app.use("/user", userController);
app.use("/drive", fileController);

let port = process.env.PORT || 1698;

app.listen(port, async () => {
    try {
        await connect();
        console.log("Server is running on port 1698");
    } catch (err) {
        console.log(err.message);
    }
})