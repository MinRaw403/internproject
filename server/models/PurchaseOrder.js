const mongoose = require("mongoose");

const PurchaseOrderSchema = new mongoose.Schema({
  poNum: String,
  supplier: {
    code: String,
    name: String,
  },
  issuedDate: Date,
  items: [
    {
      itemCode: String,
      description: String,
      unit: String,
      unitPrice: Number,
      quantity: Number,
      total: Number,
    },
  ],
  total: Number,
  remarks: String,
}, { timestamps: true });

module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
