require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");
const User = require("../models/user.model");
const Folder = require("../models/folder.model");

const router = express.Router();


// Get all folders of a particular user
router.get("/", authenticate, async (req, res) => {
    try {
        const folder = await Folder.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();
        const childFolders = await Folder.find({ user_id: req.user._id, parent_id: folder._id }).lean().exec();

        // console.log(req.user._id)
        return res.status(200).json({ folder, childFolders, totalFolders: childFolders.length });
    } catch (err) {
        return res.status(500).send(err.message);
    }
});


// Create a folder for a specific path
// Path should be provided as a query (ex : /drive?path=root/folder1/folder2)
router.post("/", authenticate, async (req, res) => {
    try {

        const parentFolder = await Folder.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        if (!parentFolder) {
            return res.status(404).send("Parent folder not found");
        }

        const newFolder = await Folder.create({
            folder_name: req.body.folder_name,
            path: req.query.path + req.body.folder_name + "/",
            user_id: req.user._id,
            parent_id: parentFolder._id,
        });


        return res.status(200).send({ newFolder });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.delete("/", authenticate, async (req, res) => {
    try {

        const folder = await Folder.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        if (!folder) {
            return res.status(404).send("Folder not found");
        }

        const childFolders = await Folder.find({ user_id: req.user._id, parent_id: folder._id }).lean().exec();

        if (childFolders.length >= 1) {
            return res.status(400).send("Folder is not empty");
        }

        const deleteFolder = await Folder.findOneAndDelete({ user_id: req.user._id, path: req.query.path }).lean().exec();

        return res.status(200).send({ deleted_foder: deleteFolder });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.patch('/rename', authenticate, async (req, res) => {
    try {

        const folder = await Folder.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        if (!folder) {
            return res.status(404).send("Folder not found");
        }

        const parentFolder = await Folder.findOne({ user_id: req.user._id, _id: folder.parent_id }).lean().exec();

        const newFolder = await Folder.findOneAndUpdate({ user_id: req.user._id, path: req.query.path }, { folder_name: req.body.folder_name, path: parentFolder.path + req.body.folder_name + "/" }, { new: true }).lean().exec();

        return res.status(200).send({ updated_folder: newFolder });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.patch('/move', authenticate, async (req, res) => {
    try {
        // Folder that we want to move
        const currentFolder = await Folder.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        // const past_parent_path = currentFolder.path.split(currentFolder.folder_name + "/")[0];

        const newParentFolder = await Folder.findOne({ user_id: req.user._id, path: req.body.newParentPath }).lean().exec();
        console.log(req.body.newParentPath)
        if (!newParentFolder) {
            return res.status(404).send("Parent folder not found");
        }

        const new_parent_path = newParentFolder.path;

        if (!currentFolder) {
            return res.status(404).send("Folder not found");
        }

        await changePath(currentFolder._id, new_parent_path + currentFolder.folder_name + "/", req.user._id);

        const updatedFolder = await Folder.findOneAndUpdate({ user_id: req.user._id, _id: currentFolder._id }, { parent_id: newParentFolder._id }, { new: true }).lean().exec();

        const childFolders = await Folder.find({ user_id: req.user._id, parent_id: currentFolder._id }).lean().exec();

        return res.status(200).send({ updatedFolder, childFolders });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.get("/root", authenticate, async (req, res) => {
    try {
        const root = await Folder.findOne({ user_id: req.user._id, parent_id: null }).lean().exec();
        const folders = await Folder.find({ user_id: req.user._id, parent_id: root._id }).lean().exec();

        return res.status(200).send({ root, folders, totalFolders: folders.length });
    } catch (err) {
        return res.status(500).send(err.message);
    }
});


async function changePath(id, newPath, user_id) {
    const folder = await Folder.findOneAndUpdate({ user_id, _id: id }, { path: newPath }, { new: true }).lean().exec();

    console.log(folder);

    const childFolders = await Folder.find({ user_id, parent_id: folder._id }).lean().exec();

    console.log(childFolders);

    for (let i = 0; i < childFolders.length; i++) {
        await changePath(childFolders[i]._id, newPath + childFolders[i].folder_name + "/", user_id);
    }

}

module.exports = router;
