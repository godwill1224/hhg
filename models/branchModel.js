const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    branchName: {
        type: String,
        trim: true,
    },
    branchLocation: {
        type: String,
        trim: true,
    },
    dateCreated:{
        type: Date,
        trim:true,
    },
});

module.exports = mongoose.model('Branch', branchSchema);
