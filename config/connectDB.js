const mongoose = require("mongoose")
const connectDb=()=> {
    return mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log("Connection successful"));
}
module.exports = connectDb; 