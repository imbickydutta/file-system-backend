const mongoose = require("mongoose");

module.exports = () => {
    return mongoose.connect(
        "mongodb+srv://imbickydutta:pswrd4mongoatlas@cluster0.7pgrw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    );
}