require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");
const User = require("../models/user.model");
const Folder = require("../models/file.model");



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
            name: user.user_name,
            path: "/",
            user_id: user._id,
            parent_id: null,
        });


        const token = newToken(user);

        return res.status(200).send({ user, rootFolder, token });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.get("/root", authenticate, async (req, res) => {
    try {
        const root = await Folder.findOne({ user_id: req.user._id, parent_id: null }).lean().exec();
        return res.status(200).send({ root });
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

router.delete("/deleteAll", authenticate, async (req, res) => {
    try {
        const deleteAll = await User.deleteMany({});
        return res.status(200).send(deleteAll);
    } catch (err) {
        return res.status(500).send(err.message);
    }
})

module.exports = router;
