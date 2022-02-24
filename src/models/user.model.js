const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
}, {
    timestamps: true,
    versionKey: false
});


// Hashing the password
userSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    var hash = bcrypt.hashSync(this.password, 8);
    this.password = hash;
    return next();
});


//Method to compare password
userSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('user', userSchema);