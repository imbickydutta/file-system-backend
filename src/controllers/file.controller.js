require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");
const uploadS3 = require("../middlewares/fileUpload");

const User = require("../models/user.model");
const Folder = require("../models/folder.model");
const File = require("../models/file.model");

const aws = require("aws-sdk");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const router = express.Router();



router.get("/", authenticate, async (req, res) => {
    try {
        const folder = await Folder.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();
        const childFolders = await Folder.find({ user_id: req.user._id, parent_id: folder._id }).lean().exec();
        const files = await File.find({ user_id: req.user._id, parent_id: folder._id }).lean().exec();
        const parentFolder = await Folder.findOne({ user_id: req.user._id, _id: folder.parent_id }).lean().exec();

        // console.log(req.user._id)
        return res.status(200).json({ folder, childFolders, parentFolder, files, totalFolders: childFolders.length, totalFiles: files.length });
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

router.post("/fileUpload", authenticate, uploadS3.single("file_url"), async (req, res) => {
    try {
        const parentFolder = await Folder.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        if (!parentFolder) {
            return res.status(404).send("Parent folder not found");
        }

        const newFile = await File.create({
            file_name: req.file.key,
            path: req.query.path + req.file.key,
            user_id: req.user._id,
            parent_id: parentFolder._id,
            file_url: req.file.location,
        });

        return res.status(200).send({ newFile });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.delete("/deleteFile", authenticate, async (req, res) => {
    try {
        const file = await File.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        if (!file) {
            return res.status(404).send("File not found");
        }


        const params = { Bucket: 'my-drive-clone', Key: file.file_name };

        s3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log("File Deleted Successfully");
        });

        await File.findOneAndDelete({ user_id: req.user._id, path: req.query.path }).lean().exec();

        return res.status(200).send({ file, msg: 'File Deleted Successfully' });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

router.patch('/moveFile', authenticate, async (req, res) => {
    try {
        // Folder that we want to move
        const currentFile = await File.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        // const past_parent_path = currentFolder.path.split(currentFolder.folder_name + "/")[0];

        const newParentFolder = await Folder.findOne({ user_id: req.user._id, path: req.body.newParentPath }).lean().exec();
        console.log(req.body.newParentPath)
        if (!newParentFolder) {
            return res.status(404).send("New Parent folder not found");
        }

        const new_parent_path = newParentFolder.path;

        if (!currentFile) {
            return res.status(404).send("File not found");
        }

        const updatedFile = await File.findOneAndUpdate({ user_id: req.user._id, _id: currentFile._id }, { parent_id: newParentFolder._id, path: new_parent_path + currentFile.name }, { new: true }).lean().exec();

        return res.status(200).send({ updatedFile });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});


// needs rework
router.patch('/renameFile', authenticate, async (req, res) => {
    try {
        // Folder that we want to move
        const currentFile = await File.findOne({ user_id: req.user._id, path: req.query.path }).lean().exec();

        if (!currentFile) {
            return res.status(404).send("File not found");
        }

        let extension = currentFile.file_name.split(".")[1];

        let newpath = currentFile.path.replace(currentFile.file_name, req.body.newName + "." + extension);
        let newFileurl = currentFile.file_url.replace(currentFile.file_name, req.body.newName + "." + extension);

        let BUCKET_NAME = 'my-drive-clone';
        let OLD_KEY = currentFile.file_name;
        let NEW_KEY = req.body.newName;

        // Copy the object to a new location
        s3.copyObject({
            Bucket: BUCKET_NAME,
            CopySource: OLD_KEY,
            Key: NEW_KEY
        })
            .promise()
            .then(() =>
                // Delete the old object
                s3.deleteObject({
                    Bucket: BUCKET_NAME,
                    Key: OLD_KEY
                }).promise()
            )
            // Error handling is left up to reader
            .catch((e) => console.error(e))



        const updatedFile = await File.findOneAndUpdate({ user_id: req.user._id, _id: currentFile._id }, { name: req.body.newName + "." + extension, path: newpath, file_url: newFileurl }, { new: true }).lean().exec();

        return res.status(200).send({ updatedFile });

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
        const files = await File.find({ user_id: req.user._id, parent_id: root._id }).lean().exec();

        return res.status(200).send({ root, folders, files, totalFolders: folders.length, totalFiles: files.length });
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
