"use client"

import { useState } from "react"
import "./GRN.css"

const GRN = () => {
  const [formData, setFormData] = useState({
    grnNo: "GRN-001",
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    invoiceNo: "",
    shipmentNo: "",
    containerNo: "",
    purchaseType: "local",
    items: [{ code: "", item: "", qty: "", unit: "", unitPrice: "", amount: 0 }],
    total: 0,
    discount: 0,
    balance: 0,
    vat: 0,
    nbt: 0,
    netTotal: 0,
  })

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { code: "", item: "", qty: "", unit: "", unitPrice: "", amount: 0 }],
    }))
  }

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index][field] = value

    // Calculate amount for the item
    if (field === "qty" || field === "unitPrice") {
      const qty = Number.parseFloat(updatedItems[index].qty) || 0
      const unitPrice = Number.parseFloat(updatedItems[index].unitPrice) || 0
      updatedItems[index].amount = qty * unitPrice
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }))
    calculateTotals(updatedItems)
  }

  const calculateTotals = (items) => {
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discount = formData.discount || 0
    const balance = total - discount
    const vat = balance * 0.15 // 15% VAT
    const nbt = balance * 0.02 // 2% NBT
    const netTotal = balance + vat + nbt

    setFormData((prev) => ({
      ...prev,
      total,
      balance,
      vat,
      nbt,
      netTotal,
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "discount") {
      calculateTotals(formData.items)
    }
  }

  const handleSave = () => {
    console.log("Saving GRN:", formData)
    alert("GRN saved successfully!")
  }

  const handleNew = () => {
    setFormData({
      grnNo: `GRN-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      supplier: "",
      invoiceNo: "",
      shipmentNo: "",
      containerNo: "",
      purchaseType: "local",
      items: [{ code: "", item: "", qty: "", unit: "", unitPrice: "", amount: 0 }],
      total: 0,
      discount: 0,
      balance: 0,
      vat: 0,
      nbt: 0,
      netTotal: 0,
    })
  }

  return (
      <div className="grn-container">
        {/* Header */}
        <div className="grn-header">
          <div className="company-info">
            <h1 className="company-name">SMARTSTOCK (PVT) LTD</h1>
            <p className="company-tagline">Inventory Management System</p>
          </div>
          <div className="form-title-section">
            <h2 className="form-title">Goods Receive Note</h2>
            <div className="header-fields">
              <div className="field-group">
                <label>Date:</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="header-input"
                />
              </div>
              <div className="field-group">
                <label>GRN No:</label>
                <input
                    type="text"
                    value={formData.grnNo}
                    onChange={(e) => handleInputChange("grnNo", e.target.value)}
                    className="header-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="grn-form">
          {/* Left Section */}
          <div className="left-section">
            <div className="form-section">
              <h3 className="section-title">Supplier Information</h3>
              <div className="form-grid">
                <div className="field-group">
                  <label>Supplier:</label>
                  <select
                      value={formData.supplier}
                      onChange={(e) => handleInputChange("supplier", e.target.value)}
                      className="form-input"
                  >
                    <option value="">Select Supplier</option>
                    <option value="supplier1">ABC Trading Co.</option>
                    <option value="supplier2">XYZ Imports Ltd.</option>
                    <option value="supplier3">Global Supplies Inc.</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Invoice No:</label>
                  <input
                      type="text"
                      value={formData.invoiceNo}
                      onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
                      className="form-input"
                      placeholder="Enter invoice number"
                  />
                </div>
                <div className="field-group">
                  <label>Shipment No:</label>
                  <input
                      type="text"
                      value={formData.shipmentNo}
                      onChange={(e) => handleInputChange("shipmentNo", e.target.value)}
                      className="form-input"
                      placeholder="Enter shipment number"
                  />
                </div>
                <div className="field-group">
                  <label>Container No:</label>
                  <input
                      type="text"
                      value={formData.containerNo}
                      onChange={(e) => handleInputChange("containerNo", e.target.value)}
                      className="form-input"
                      placeholder="Enter container number"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Purchase Type</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                      type="radio"
                      name="purchaseType"
                      value="local"
                      checked={formData.purchaseType === "local"}
                      onChange={(e) => handleInputChange("purchaseType", e.target.value)}
                  />
                  <span className="radio-text">Local</span>
                </label>
                <label className="radio-label">
                  <input
                      type="radio"
                      name="purchaseType"
                      value="import"
                      checked={formData.purchaseType === "import"}
                      onChange={(e) => handleInputChange("purchaseType", e.target.value)}
                  />
                  <span className="radio-text">Import</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="right-section">
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Item Details</h3>
                <button onClick={addItem} className="add-item-btn">
                  + Add Item
                </button>
              </div>

              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                  <tr>
                    <th>Code</th>
                    <th>Item</th>
                    <th>Qty/Unit</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                              type="text"
                              value={item.code}
                              onChange={(e) => updateItem(index, "code", e.target.value)}
                              className="table-input"
                              placeholder="Code"
                          />
                        </td>
                        <td>
                          <input
                              type="text"
                              value={item.item}
                              onChange={(e) => updateItem(index, "item", e.target.value)}
                              className="table-input"
                              placeholder="Item description"
                          />
                        </td>
                        <td>
                          <div className="qty-unit-group">
                            <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateItem(index, "qty", e.target.value)}
                                className="table-input qty-input"
                                placeholder="Qty"
                            />
                            <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => updateItem(index, "unit", e.target.value)}
                                className="table-input unit-input"
                                placeholder="Unit"
                            />
                          </div>
                        </td>
                        <td>
                          <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                              className="table-input"
                              placeholder="0.00"
                          />
                        </td>
                        <td>
                          <span className="amount-display">{item.amount.toFixed(2)}</span>
                        </td>
                        <td>
                          {formData.items.length > 1 && (
                              <button onClick={() => removeItem(index)} className="remove-btn">
                                ×
                              </button>
                          )}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="form-section">
              <h3 className="section-title">Financial Summary</h3>
              <div className="summary-grid">
                <div className="summary-row">
                  <label>Total:</label>
                  <span className="summary-value">{formData.total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <label>Discount:</label>
                  <input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => handleInputChange("discount", Number.parseFloat(e.target.value) || 0)}
                      className="summary-input"
                  />
                </div>
                <div className="summary-row">
                  <label>Balance:</label>
                  <span className="summary-value">{formData.balance.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <label>VAT (15%):</label>
                  <span className="summary-value">{formData.vat.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <label>NBT (2%):</label>
                  <span className="summary-value">{formData.nbt.toFixed(2)}</span>
                </div>
                <div className="summary-row total-row">
                  <label>Net Total:</label>
                  <span className="summary-value">{formData.netTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleSave} className="save-btn">
            Save GRN
          </button>
          <button onClick={handleNew} className="new-btn">
            New GRN
          </button>
        </div>
      </div>
  )
}

export default GRN
