const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    stockname: {
        type: String,
        trim: true,
    },
    stocktype: {
        type: String,  // Use 'String' with an uppercase 'S'
        trim: true,
    },
    tonnage:{
        type: Number,
        trim:true,
    },
    cost:{
        type: Number,
        trim:true,
    },
    dealer:{
        type: String,
        trim:true,
    },
    storagebranch:{
        type: String,
        trim:true,
    },
    contact:{
        type: String,
        trim:true,
    },
    sellingprice:{
        type: Number,
        trim:true,
    },
});

module.exports = mongoose.model('Stock', stockSchema);
