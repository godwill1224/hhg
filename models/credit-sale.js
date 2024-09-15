const mongoose = require('mongoose');

const creditSaleSchema = new mongoose.Schema({
    produceName: {
        type: String,
        trim: true,
    },
    produceType: {
        type: String,
        trim: true,
    },
    tonnageDispatched:{
        type: Number,
        trim:true,
    },
    amountDue:{
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
    buyerNIN:{
        type: String,
        trim:true,
    },
    buyerLocation:{
        type: String,
        trim:true,
    },
    dispatchBranch:{
        type: String,
        trim:true,
    },
    dispatchedBy:{
        type: String,
        trim:true,
    },
    dueDate:{
        type: Date,
        trim:true,
    },
    dispatchDate:{
        type: Date,
        trim:true,
    },
});

module.exports = mongoose.model('CreditSale', creditSaleSchema);
