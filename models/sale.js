const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    produceName: {
        type: String,
        trim: true,
    },
    produceType: {
        type: String,
        trim: true,
    },
    tonnageSold:{
        type: Number,
        trim:true,
    },
    amountPaid:{
        type: Number,
        trim:true,
    },
    buyerName:{
        type: String,
        trim:true,
    },
    buyerEmail:{
        type: String,
        trim:true,
    },
    buyerPhone:{
        type: String,
        trim:true,
    },
    saleBranch:{
        type: String,
        trim:true,
    },
    soldBy:{
        type: String,
        trim:true,
    },
    dateSold:{
        type: Date,
        trim:true,
    },
});

module.exports = mongoose.model('Sale', saleSchema);
