const mongoose = require('mongoose');

const userMessages = new mongoose.Schema({
    userName:{
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    messageId:{
        type: Number,
        required: true
    },
    dataInNumber:{
        type: Number,
        required: true
    }

})

const userJournal = mongoose.model('userJournal', userMessages);

module.exports = userJournal;