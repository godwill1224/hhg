const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    produceName: {
        type: String,
        trim: true,
    },
    produceType: {
        type: String,
        trim: true,
    },
    tonnage:{
        type: Number,
        trim:true,
    },
    produceCost:{
        type: Number,
        trim:true,
    },
    sellingPrice:{
        type: Number,
        trim:true,
    },
    dealerName:{
        type: String,
        trim:true,
    },
    dealerEmail:{
        type: String,
        trim:true,
    },
    dealerPhone:{
        type: String,
        trim:true,
    },
    storagebranch:{
        type: String,
        trim:true,
    },
    addedBy:{
        type: String,
        trim:true,
    },
    dateAdded:{
        type: Date,
        trim:true,
    },
});

module.exports = mongoose.model('Stock', stockSchema);
