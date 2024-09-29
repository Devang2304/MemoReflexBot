const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    },
    username:{
        type:String,
        required: true
    },
    chatId:{
        type: Number,
        required: true
    }

})

const User = mongoose.model('User', userSchema);

module.exports = User;