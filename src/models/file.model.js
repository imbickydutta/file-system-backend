const mongoose = require("mongoose");

const folderOrFileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "childFolder" },
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model("folderOrFile", folderOrFileSchema);