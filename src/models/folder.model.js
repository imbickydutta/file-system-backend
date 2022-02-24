const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
    folder_name: { type: String, required: true },
    path: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "folder" },
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model("folder", folderSchema);