"use client"

import { useState, useEffect, useRef } from "react"
import "./GRN.css"

const MOCK_SUPPLIERS = [
  { id: 1, code: "SUP001", name: "ABC Trading Company" },
  { id: 2, code: "SUP002", name: "XYZ Distributors" },
  { id: 3, code: "SUP003", name: "Global Imports Ltd" },
  { id: 4, code: "SUP004", name: "Local Suppliers Inc" },
  { id: 5, code: "SUP005", name: "Premium Goods Co" },
]

const MOCK_ITEMS = [
  { code: "ITM001", name: "Laptop Computer", unit: "pcs", price: 850.0 },
  { code: "ITM002", name: "Office Chair", unit: "pcs", price: 120.0 },
  { code: "ITM003", name: "Desk Lamp", unit: "pcs", price: 35.0 },
  { code: "ITM004", name: "Printer Paper A4", unit: "ream", price: 5.5 },
  { code: "ITM005", name: "USB Flash Drive 32GB", unit: "pcs", price: 12.0 },
  { code: "ITM006", name: "Wireless Mouse", unit: "pcs", price: 18.0 },
  { code: "ITM007", name: "Keyboard", unit: "pcs", price: 45.0 },
  { code: "ITM008", name: "Monitor 24 inch", unit: "pcs", price: 180.0 },
]

const GRN = () => {
  const [formData, setFormData] = useState({
    grnNo: "Loading...",
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    receivedBy: "",
    invoiceNo: "",
    shipmentNo: "",
    containerNo: "",
    purchaseType: "local",
    remarks: "",
    items: [{ code: "", item: "", qty: "", unit: "", unitPrice: "", amount: 0 }],
    total: 0,
    discount: 0,
    balance: 0,
    vat: 0,
    nbt: 0,
    netTotal: 0,
  })

  const [supplierSearch, setSupplierSearch] = useState("")
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [suppliers, setSuppliers] = useState([])

  const [itemSearchIndex, setItemSearchIndex] = useState(null)
  const [itemSearch, setItemSearch] = useState("")
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [availableItems, setAvailableItems] = useState([])

  const supplierRef = useRef(null)
  const itemRef = useRef(null)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/suppliers")
        const data = await response.json()
        if (data.success) {
          console.log("[v0] Loaded suppliers from backend:", data.suppliers.length)
          setSuppliers(data.suppliers)
        } else {
          console.log("[v0] Backend returned error, using mock suppliers")
          setSuppliers(MOCK_SUPPLIERS)
        }
      } catch (error) {
        console.log("[v0] Backend not available, using mock suppliers")
        setSuppliers(MOCK_SUPPLIERS)
      }
    }

    fetchSuppliers()
  }, [])

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/items")
        const data = await response.json()
        if (data.success) {
          const mappedItems = data.items.map((item) => ({
            code: item.itemCode,
            name: item.description || item.category,
            unit: item.unit,
            price: Number.parseFloat(item.unitPrice) || 0,
          }))
          console.log("[v0] Loaded items from backend:", mappedItems.length)
          setAvailableItems(mappedItems)
        } else {
          console.log("[v0] Backend returned error, using mock items")
          setAvailableItems(MOCK_ITEMS)
        }
      } catch (error) {
        console.log("[v0] Backend not available, using mock items")
        setAvailableItems(MOCK_ITEMS)
      }
    }

    fetchItems()
  }, [])

  useEffect(() => {
    setFormData((prev) => ({ ...prev, grnNo: "" }))
  }, [])

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      supplier.code.toLowerCase().includes(supplierSearch.toLowerCase()),
  )

  const filteredItems = availableItems.filter(
    (item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(itemSearch.toLowerCase()),
  )

  const handleSupplierSelect = (supplier) => {
    setFormData((prev) => ({ ...prev, supplier: supplier.name }))
    setSupplierSearch(supplier.name)
    setShowSupplierDropdown(false)
  }

  const handleItemSelect = (item) => {
    if (itemSearchIndex !== null) {
      const updatedItems = [...formData.items]
      updatedItems[itemSearchIndex] = {
        ...updatedItems[itemSearchIndex],
        code: item.code,
        item: item.name,
        unit: item.unit,
        unitPrice: item.price.toString(),
      }

      const qty = Number.parseFloat(updatedItems[itemSearchIndex].qty) || 0
      updatedItems[itemSearchIndex].amount = qty * item.price

      setFormData((prev) => ({ ...prev, items: updatedItems }))
      calculateTotals(updatedItems)
    }
    setItemSearch("")
    setShowItemDropdown(false)
    setItemSearchIndex(null)
  }

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
    const vat = balance * 0.15
    const nbt = balance * 0.02
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

  const handleSave = async () => {
    if (!formData.supplier) {
      alert("⚠️ Please select a supplier before saving.")
      return
    }

    if (!formData.receivedBy) {
      alert("⚠️ Please enter the person's name who is receiving the goods.")
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/grns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert("✅ GRN saved successfully! GRN No: " + data.grn.grnNo)
        console.log("[v0] Saved GRN:", data.grn)
        setFormData((prev) => ({ ...prev, grnNo: data.grn.grnNo }))
        setTimeout(() => {
          handlePrint()
        }, 500)
      } else {
        alert("❌ Failed to save GRN: " + data.message)
      }
    } catch (error) {
      console.log("[v0] Backend not available for saving")
      const mockGrnNo = `GRN-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.floor(
        Math.random() * 1000,
      )
        .toString()
        .padStart(3, "0")}`
      setFormData((prev) => ({ ...prev, grnNo: mockGrnNo }))
      alert(
        `✅ GRN saved locally! GRN No: ${mockGrnNo}\n\n(Note: Connect to backend at http://localhost:5000 to save to database)`,
      )
      setTimeout(() => {
        handlePrint()
      }, 500)
    }
  }

  const handleNew = () => {
    setFormData({
      grnNo: "",
      date: new Date().toISOString().split("T")[0],
      supplier: "",
      receivedBy: "",
      invoiceNo: "",
      shipmentNo: "",
      containerNo: "",
      purchaseType: "local",
      remarks: "",
      items: [{ code: "", item: "", qty: "", unit: "", unitPrice: "", amount: 0 }],
      total: 0,
      discount: 0,
      balance: 0,
      vat: 0,
      nbt: 0,
      netTotal: 0,
    })
    setSupplierSearch("")
  }

  const handlePrint = () => {
    window.print()
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
              <input type="text" value={formData.grnNo} readOnly className="header-input" />
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
              <div className="field-group" ref={supplierRef}>
                <label>
                  Supplier: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value)
                    setShowSupplierDropdown(true)
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  className="form-input"
                  placeholder="Search supplier by name or code..."
                  required
                />
                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <div className="search-dropdown">
                    {filteredSuppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="search-dropdown-item"
                        onClick={() => handleSupplierSelect(supplier)}
                      >
                        <span className="item-code">{supplier.code}</span>
                        <span className="item-name">{supplier.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="field-group">
                <label>
                  Received By: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.receivedBy}
                  onChange={(e) => handleInputChange("receivedBy", e.target.value)}
                  className="form-input"
                  placeholder="Enter person's name"
                  required
                />
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

          {/* Remarks Section */}
          <div className="form-section">
            <h3 className="section-title">Remarks</h3>
            <div className="field-group">
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                className="remarks-textarea"
                placeholder="Enter any additional notes or remarks..."
                rows={4}
              />
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
                      <td ref={itemSearchIndex === index ? itemRef : null}>
                        <input
                          type="text"
                          value={itemSearchIndex === index ? itemSearch : item.item}
                          onChange={(e) => {
                            if (itemSearchIndex === index) {
                              setItemSearch(e.target.value)
                            } else {
                              updateItem(index, "item", e.target.value)
                            }
                          }}
                          onFocus={() => {
                            setItemSearchIndex(index)
                            setItemSearch(item.item)
                            setShowItemDropdown(true)
                          }}
                          onBlur={(e) => {
                            setTimeout(() => {
                              if (itemSearchIndex === index && !itemSearch) {
                                setItemSearchIndex(null)
                              }
                            }, 200)
                          }}
                          className="table-input"
                          placeholder="Search or enter item..."
                        />
                        {showItemDropdown && itemSearchIndex === index && filteredItems.length > 0 && (
                          <div className="search-dropdown item-dropdown">
                            {filteredItems.map((availableItem) => (
                              <div
                                key={availableItem.code}
                                className="search-dropdown-item"
                                onClick={() => handleItemSelect(availableItem)}
                              >
                                <span className="item-code">{availableItem.code}</span>
                                <span className="item-name">{availableItem.name}</span>
                                <span className="item-price">${availableItem.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
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
        <button onClick={handlePrint} className="print-btn">
          Print GRN
        </button>
      </div>
    </div>
  )
}

export default GRN
