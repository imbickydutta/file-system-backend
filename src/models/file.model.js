const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    file_name: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "folder" },
    file_url: { type: String, required: true }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model("file", fileSchema);