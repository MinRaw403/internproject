//server/models/PurchaseOrder.js

const mongoose = require('mongoose');

/**
 * One document = one line in your UI table.
 * If later you want true “multi‑line” POs, nest an array here instead.
 */
const PurchaseOrderSchema = new mongoose.Schema(
    {
        poNum:      { type: String, required: true, unique: true },

        // who you’re buying from
        supplier: {
            code: { type: String, required: true },
            name: { type: String },            // keep name for easy reads
        },

        issuedDate: { type: Date, required: true },

        // what you’re buying
        item: {
            itemCode:    { type: String, required: true },
            description: { type: String },
            unit:        { type: String },
            unitPrice:   { type: Number, default: 0 },
        },

        quantity: { type: Number, required: true },
        total:    { type: Number, required: true },

        remarks:  { type: String },
    },
    { timestamps: true }                // adds createdAt / updatedAt
);

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
