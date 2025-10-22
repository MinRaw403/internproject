"use client"

import { useState, useEffect, useRef } from "react"
import "./Purchaseorder.css"
import axios from "axios"
import DatePicker from "react-datepicker"

export default function PurchaseOrder() {
  /* ---------------------- state ---------------------- */
  const [supplier, setSupplier] = useState("")
  const [issuedDate, setIssuedDate] = useState(new Date())
  const [itemCode, setItemCode] = useState("")
  const [quantity, setQuantity] = useState("")
  const [remarks, setRemarks] = useState("")

  const [suppliersList, setSuppliersList] = useState([])
  const [itemsList, setItemsList] = useState([])
  const [unit, setUnit] = useState("")
  const [unitPrice, setUnitPrice] = useState(0)
  const [currentEntry, setCurrentEntry] = useState(null)
  const [tableData, setTableData] = useState([])

  const [searchTerm, setSearchTerm] = useState("")

  const [itemSearchQuery, setItemSearchQuery] = useState("")
  const [itemSearchResults, setItemSearchResults] = useState([])
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [selectedItemDisplay, setSelectedItemDisplay] = useState("")
  const itemSearchRef = useRef(null)

  // For editing
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({
    quantity: "",
    remarks: "",
    itemCode: "",
  })

  /* ------------------- data loading ------------------- */
  useEffect(() => {
    console.log("[v0] Fetching suppliers from backend...")
    axios
      .get("http://localhost:5000/api/suppliers")
      .then((res) => {
        console.log("[v0] Suppliers response:", res.data)
        if (res.data.success) {
          setSuppliersList(res.data.suppliers)
          console.log("[v0] Suppliers loaded:", res.data.suppliers.length)
          if (res.data.suppliers.length) {
            setSupplier(res.data.suppliers[0].code)
          }
        } else {
          console.warn("[v0] Suppliers fetch unsuccessful:", res.data)
        }
      })
      .catch((err) => {
        console.error("[v0] Error fetching suppliers:", err)
        console.error("[v0] Error details:", err.response?.data || err.message)
      })

    console.log("[v0] Fetching items from backend...")
    axios
      .get("http://localhost:5000/api/items")
      .then((res) => {
        console.log("[v0] Items response:", res.data)
        if (res.data.success) {
          setItemsList(res.data.items)
          console.log("[v0] Items loaded:", res.data.items.length)
          if (res.data.items.length) {
            const first = res.data.items[0]
            setItemCode(first.itemCode)
            setUnit(first.unit)
            setUnitPrice(Number.parseFloat(first.unitPrice || 0))
            setSelectedItemDisplay(`${first.itemCode} - ${first.description}`)
          }
        } else {
          console.warn("[v0] Items fetch unsuccessful:", res.data)
        }
      })
      .catch((err) => {
        console.error("[v0] Error fetching items:", err)
        console.error("[v0] Error details:", err.response?.data || err.message)
      })

    console.log("[v0] Fetching purchase orders from backend...")
    axios
      .get("http://localhost:5000/api/purchase-orders")
      .then((res) => {
        console.log("[v0] Purchase orders response:", res.data)
        if (res.data.success && Array.isArray(res.data.orders)) {
          setTableData(res.data.orders)
          console.log("[v0] Purchase orders loaded:", res.data.orders.length)
        } else {
          console.warn("[v0] Unexpected response format:", res.data)
          setTableData([])
        }
      })
      .catch((err) => {
        console.error("[v0] Error fetching POs:", err)
        console.error("[v0] Error details:", err.response?.data || err.message)
        setTableData([])
      })
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemSearchRef.current && !itemSearchRef.current.contains(event.target)) {
        setShowItemDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (itemSearchQuery.trim().length > 0) {
        axios
          .get(`http://localhost:5000/api/items/search?q=${encodeURIComponent(itemSearchQuery)}`)
          .then((res) => {
            if (res.data.success) {
              setItemSearchResults(res.data.items)
              setShowItemDropdown(true)
            }
          })
          .catch((err) => console.error("Error searching items:", err))
      } else {
        setItemSearchResults([])
        setShowItemDropdown(false)
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [itemSearchQuery])

  /* ------------------- handlers ------------------- */
  const handleSupplierChange = (e) => setSupplier(e.target.value)

  const handleItemSelect = (item) => {
    setItemCode(item.itemCode)
    setUnit(item.unit)
    setUnitPrice(Number.parseFloat(item.unitPrice || 0))
    setSelectedItemDisplay(`${item.itemCode} - ${item.description}`)
    setItemSearchQuery("")
    setShowItemDropdown(false)
  }

  const handleItemSearchChange = (e) => {
    setItemSearchQuery(e.target.value)
  }

  const handleItemSearchFocus = () => {
    if (itemSearchResults.length > 0) {
      setShowItemDropdown(true)
    }
  }

  const handleQuantityChange = (e) => setQuantity(e.target.value)
  const handleRemarksChange = (e) => setRemarks(e.target.value)
  const clearEntryInputs = () => {
    setQuantity("")
    setRemarks("")
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value)
  const handleClearSearch = () => setSearchTerm("")

  const filteredTableData = tableData.filter((order) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (order?.poNum || "").toLowerCase().includes(searchLower) ||
      (order?.item?.itemCode || "").toLowerCase().includes(searchLower) ||
      (order?.item?.description || "").toLowerCase().includes(searchLower) ||
      (order?.remarks || "").toLowerCase().includes(searchLower)
    )
  })

  /* -------------------- Preview button -------------------- */
  const handlePreview = () => {
    if (!quantity || !itemCode) return
    const poNum = "PO" + Date.now()
    const selectedItem = itemsList.find((it) => it.itemCode === itemCode)
    const supplierObj = suppliersList.find((s) => s.code === supplier) || {}

    const newEntry = {
      poNum,
      supplier: { code: supplier, name: supplierObj.name || "" },
      issuedDate: issuedDate.toISOString(),
      item: {
        itemCode: selectedItem?.itemCode || itemCode,
        description: selectedItem?.description || "",
        unit,
        unitPrice,
      },
      quantity: Number(quantity),
      total: Number(quantity) * unitPrice,
      remarks,
    }
    setCurrentEntry(newEntry)
    clearEntryInputs()
  }

  /* -------------------- Confirm button -------------------- */
  const handleConfirm = async () => {
    if (!currentEntry) return
    try {
      const { data } = await axios.post("http://localhost:5000/api/purchase-orders", currentEntry)
      if (data.success) {
        setTableData((prev) => [data.order, ...prev])
        setCurrentEntry(null)
        alert("Order saved!")
      } else throw new Error(data.message || "Save failed")
    } catch (err) {
      console.error("Save error", err)
      alert("Could not save order")
    }
  }

  /* -------------------- Delete preview -------------------- */
  const handleDeletePreview = () => setCurrentEntry(null)

  /* -------------------- Delete from table -------------------- */
  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return
    try {
      const res = await axios.delete(`http://localhost:5000/api/purchase-orders/${id}`)
      if (res.data.success) {
        setTableData((prev) => prev.filter((order) => order._id !== id))
        alert("Order deleted successfully!")
      } else alert("Failed to delete order")
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete order")
    }
  }

  /* -------------------- Edit order -------------------- */
  const handleEditOrder = (order) => {
    setEditId(order._id)
    setEditData({
      quantity: order.quantity,
      remarks: order.remarks,
      itemCode: order.item.itemCode,
    })
  }

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveEdit = async (id) => {
    try {
      const selectedItem = itemsList.find((it) => it.itemCode === editData.itemCode)
      const updatedOrder = {
        ...tableData.find((o) => o._id === id),
        quantity: Number(editData.quantity),
        remarks: editData.remarks,
        item: {
          ...selectedItem,
          itemCode: selectedItem?.itemCode || editData.itemCode,
          description: selectedItem?.description || "",
          unit: selectedItem?.unit || "",
          unitPrice: Number.parseFloat(selectedItem?.unitPrice || 0),
        },
        total: Number(editData.quantity) * Number.parseFloat(selectedItem?.unitPrice || 0),
      }

      const res = await axios.put(`http://localhost:5000/api/purchase-orders/${id}`, updatedOrder)
      if (res.data.success) {
        setTableData((prev) => prev.map((o) => (o._id === id ? res.data.order : o)))
        setEditId(null)
        alert("Order updated successfully!")
      } else {
        alert("Failed to update order")
      }
    } catch (err) {
      console.error("Update error:", err)
      alert("Could not update order")
    }
  }

  /* ------------------- render ------------------- */
  return (
    <div className="purchase-order-container">
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <div className="hamburger-menu">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <span className="app-title">SMARTSTOCK(PVT) LTD</span>
          </div>
        </header>
        <p className="page-title">Purchase Order</p>

        {/* Input Section */}
        <div className="input-section card">
          <div className="form-group">
            <label htmlFor="supplier">Supplier</label>
            <select id="supplier" value={supplier} onChange={handleSupplierChange}>
              {suppliersList.length === 0 ? (
                <option value="">No suppliers available - Check console for errors</option>
              ) : (
                suppliersList.map((s) => <option key={s.code} value={s.code}>{`${s.code} - ${s.name}`}</option>)
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <DatePicker selected={issuedDate} onChange={setIssuedDate} className="form-input" dateFormat="yyyy-MM-dd" />
          </div>

          <div className="form-group" ref={itemSearchRef}>
            <label htmlFor="item">Item (Search by Code, Description, or Rack Number)</label>
            <div className="item-search-container">
              <input
                type="text"
                id="item-search"
                className="item-search-input"
                placeholder="Type to search items..."
                value={itemSearchQuery || selectedItemDisplay}
                onChange={handleItemSearchChange}
                onFocus={handleItemSearchFocus}
              />
              {showItemDropdown && itemSearchResults.length > 0 && (
                <div className="item-search-dropdown">
                  {itemSearchResults.map((item) => (
                    <div key={item.itemCode} className="item-search-result" onClick={() => handleItemSelect(item)}>
                      <div className="item-result-code">{item.itemCode}</div>
                      <div className="item-result-desc">{item.description}</div>
                      <div className="item-result-rack">Rack: {item.rackNumber}</div>
                    </div>
                  ))}
                </div>
              )}
              {showItemDropdown && itemSearchQuery && itemSearchResults.length === 0 && (
                <div className="item-search-dropdown">
                  <div className="item-search-no-results">No items found</div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={handleQuantityChange} />
          </div>

          <div className="form-group full-width">
            <label htmlFor="remarks">Remarks</label>
            <textarea id="remarks" value={remarks} onChange={handleRemarksChange}></textarea>
          </div>

          <div className="button-group">
            <button className="clear-button" onClick={clearEntryInputs}>
              Clear
            </button>
            <button className="add-button" onClick={handlePreview}>
              Preview
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {currentEntry && (
          <div className="purchase-details-section card">
            <div className="detail-row">
              <div className="detail-item">
                Purchasing No : <span>{currentEntry.poNum}</span>
              </div>
              <div className="detail-item">
                Unit : <span>{currentEntry.item.unit}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-item">
                Item :{" "}
                <span>
                  {currentEntry.item.itemCode} - {currentEntry.item.description}
                </span>
              </div>
              <div className="detail-item">
                Total : <span>{currentEntry.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-item">
                Quantity : <span>{currentEntry.quantity}</span>
              </div>
            </div>
            <div className="button-group">
              <button className="delete-button" onClick={handleDeletePreview}>
                Delete
              </button>
              <button className="confirm-button" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="table-section card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by PO number, item code, description, or remarks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={handleClearSearch} title="Clear search">
                ✕
              </button>
            )}
          </div>

          <div className="record-count">
            Showing {filteredTableData.length} of {tableData.length} records
          </div>

          <table>
            <thead>
              <tr>
                <th>PO Num</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Total</th>
                <th>Ordered Date</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredTableData) && filteredTableData.length > 0 ? (
                filteredTableData.map((row, index) => (
                  <tr key={row?._id || index} className="table-row">
                    <td>{row?.poNum || "-"}</td>
                    <td>
                      {editId === row?._id ? (
                        <select
                          value={editData.itemCode}
                          onChange={(e) => handleEditChange("itemCode", e.target.value)}
                        >
                          {itemsList.map((it) => (
                            <option key={it.itemCode} value={it.itemCode}>
                              {`${it.itemCode} - ${it.description}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        `${row?.item?.itemCode || ""} - ${row?.item?.description || ""}`
                      )}
                    </td>
                    <td>
                      {editId === row?._id ? (
                        <input
                          type="number"
                          value={editData.quantity}
                          onChange={(e) => handleEditChange("quantity", e.target.value)}
                        />
                      ) : (
                        row?.quantity || ""
                      )}
                    </td>
                    <td>{row?.item?.unit || ""}</td>
                    <td>{row?.total ? row.total.toFixed(2) : "0.00"}</td>
                    <td>{row?.issuedDate ? row.issuedDate.slice(0, 10) : ""}</td>
                    <td>
                      {editId === row?._id ? (
                        <input
                          type="text"
                          value={editData.remarks}
                          onChange={(e) => handleEditChange("remarks", e.target.value)}
                        />
                      ) : (
                        row?.remarks || ""
                      )}
                    </td>
                    <td>
                      {editId === row?._id ? (
                        <>
                          <button className="confirm-button" onClick={() => handleSaveEdit(row._id)}>
                            Save
                          </button>
                          <button className="clear-button" onClick={() => setEditId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="add-button" onClick={() => handleEditOrder(row)}>
                            Edit
                          </button>
                          <button className="delete-button" onClick={() => handleDeleteOrder(row._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    {searchTerm ? "No purchase orders match your search." : "No purchase orders added yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
