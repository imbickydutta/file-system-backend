require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");
const User = require("../models/user.model");
const Folder = require("../models/folder.model");



// Generating new token During Signup
const newToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET_KEY);
};


const router = express.Router();

router.get("/", authenticate, async (req, res) => {
    try {
        const users = await User.find().lean().exec();


        return res.status(200).json({ user: req.user, usersAll: users });
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.post("/signup", async (req, res) => {
    try {

        let user = await User.findOne({ email: req.body.email }).lean().exec();

        console.log(user)

        if (user) {
            return res.status(400).send({ message: "User already exists" });
        }

        user = await User.create({
            user_name: req.body.user_name,
            email: req.body.email,
            password: req.body.password,
        });

        const rootFolder = await Folder.create({
            folder_name: user.user_name,
            path: "root/",
            user_id: user._id,
            parent_id: null,
        });


        const token = newToken(user);

        return res.status(200).send({ user, rootFolder, token });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.post("/login", async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send({ message: "User does not exist" });
        }

        const isValid = await user.checkPassword(req.body.password);

        if (!isValid) {
            return res.status(400).send({ message: "Invalid email or password" });
        }

        const token = newToken(user);

        user = await User.findOne({ email: req.body.email }).lean().exec();

        return res.status(200).send({ user, token });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});



router.delete("/", authenticate, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);

        return res.status(200).send(user);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});


module.exports = router;
