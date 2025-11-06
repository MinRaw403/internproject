// server/models/Grn.js
const mongoose = require("mongoose")

const GrnSchema = new mongoose.Schema(
  {
    grnNo: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    supplier: { type: String, required: true },
    receivedBy: { type: String, required: true }, // Added receivedBy field
    invoiceNo: { type: String },
    shipmentNo: { type: String },
    containerNo: { type: String },
    purchaseType: { type: String, enum: ["local", "import"], default: "local" },
    remarks: { type: String }, // Added remarks field
    items: [
      {
        code: String,
        item: String,
        qty: Number,
        unit: String,
        unitPrice: Number,
        amount: Number,
      },
    ],
    total: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    nbt: { type: Number, default: 0 },
    netTotal: { type: Number, default: 0 },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Grn", GrnSchema)
