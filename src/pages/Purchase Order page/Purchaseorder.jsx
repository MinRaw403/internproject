"use client";

import { useState, useEffect, useRef } from "react";
import "./Purchaseorder.css";
import axios from "axios";
import DatePicker from "react-datepicker";

export default function PurchaseOrder() {
  const [supplier, setSupplier] = useState("");
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [remarks, setRemarks] = useState("");

  const [suppliersList, setSuppliersList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [poNum, setPoNum] = useState("");

  // New rows table (multi-item)
  const [rows, setRows] = useState([]);

  // Table of saved POs
  const [tableData, setTableData] = useState([]);

  // Search / edit
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  /* ------------------ Load Data ------------------ */
  useEffect(() => {
    axios.get("http://localhost:5000/api/suppliers").then((res) => {
      if (res.data.success) setSuppliersList(res.data.suppliers);
    });
    axios.get("http://localhost:5000/api/items").then((res) => {
      if (res.data.success) setItemsList(res.data.items);
    });
    axios.get("http://localhost:5000/api/purchase-orders").then((res) => {
      if (res.data.success) setTableData(res.data.orders);
    });

    generatePoNumber();
  }, []);

  const generatePoNumber = () => {
    const randomNo = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    setPoNum(`PO-${randomNo}`);
  };

  /* ------------------ Row Handling ------------------ */
  const addRow = () => {
    setRows([
      ...rows,
      {
        itemCode: "",
        description: "",
        unit: "",
        unitPrice: "",
        quantity: "",
        total: 0,
      },
    ]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === "itemCode") {
      const selectedItem = itemsList.find((it) => it.itemCode === value);
      if (selectedItem) {
        updated[index].description = selectedItem.description;
        updated[index].unit = selectedItem.unit;
        updated[index].unitPrice = selectedItem.unitPrice;
      }
    }

    const qty = parseFloat(updated[index].quantity || 0);
    const price = parseFloat(updated[index].unitPrice || 0);
    updated[index].total = qty * price;

    setRows(updated);
  };

  /* ------------------ Submit / Save PO ------------------ */
  const handleSubmit = async () => {
    if (!supplier || rows.length === 0) {
      alert("Please select a supplier and add at least one item.");
      return;
    }

    const total = rows.reduce((sum, r) => sum + r.total, 0);
    const supplierObj = suppliersList.find((s) => s.code === supplier);

    const poData = {
      poNum,
      supplier: supplierObj,
      issuedDate,
      items: rows,
      total,
      remarks,
    };

    try {
      if (editId) {
        // Editing existing PO
        const res = await axios.put(
          `http://localhost:5000/api/purchase-orders/${editId}`,
          poData
        );
        if (res.data.success) {
          setTableData((prev) =>
            prev.map((o) => (o._id === editId ? res.data.order : o))
          );
          alert("✅ Purchase Order updated successfully!");
          resetForm();
        }
      } else {
        // New PO
        const res = await axios.post(
          "http://localhost:5000/api/purchase-orders",
          poData
        );
        if (res.data.success) {
          setTableData((prev) => [res.data.order, ...prev]);
          alert("✅ Purchase Order saved successfully!");
          resetForm();
        }
      }
    } catch (err) {
      console.error("❌ Error saving PO:", err);
      alert("Failed to save Purchase Order");
    }
  };

  const resetForm = () => {
    setSupplier("");
    setIssuedDate(new Date());
    setRemarks("");
    setRows([]);
    setEditId(null);
    generatePoNumber();
  };

  /* ------------------ Search ------------------ */
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");

  const filteredTableData = tableData.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order?.poNum || "").toLowerCase().includes(searchLower) ||
      (order?.remarks || "").toLowerCase().includes(searchLower)
    );
  });

  /* ------------------ Delete / Edit ------------------ */
  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/purchase-orders/${id}`
      );
      if (res.data.success) {
        setTableData((prev) => prev.filter((order) => order._id !== id));
        alert("Order deleted!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditOrder = (order) => {
    setEditId(order._id);
    setSupplier(order.supplier?.code || "");
    setIssuedDate(new Date(order.issuedDate));
    setRemarks(order.remarks || "");
    setRows(
      order.items.map((it) => ({
        itemCode: it.itemCode,
        description: it.description,
        unit: it.unit,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        total: it.total,
      }))
    );
  };

  /* ------------------ Render ------------------ */
  return (
    <div className="purchase-order-container">
      <div className="main-content">
        <header className="header">
          <span className="app-title">SMARTSTOCK(PVT) LTD</span>
        </header>

        <p className="page-title">Purchase Order</p>

        {/* Input Section */}
        <div className="input-section card">
          <div className="form-group">
            <label>Supplier</label>
            <select
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="">Select Supplier</option>
              {suppliersList.map((s) => (
                <option key={s.code} value={s.code}>
                  {`${s.code} - ${s.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <DatePicker
              selected={issuedDate}
              onChange={setIssuedDate}
              className="form-input"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Multi-item table */}
          <div className="form-group full-width">
            <label>Add Items</label>
            <table className="po-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={row.itemCode}
                        onChange={(e) =>
                          handleRowChange(index, "itemCode", e.target.value)
                        }
                      >
                        <option value="">Select item</option>
                        {itemsList.map((it) => (
                          <option key={it.itemCode} value={it.itemCode}>
                            {it.itemCode}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{row.description}</td>
                    <td>{row.unit}</td>
                    <td>
                      <input
                        type="number"
                        value={row.unitPrice}
                        onChange={(e) =>
                          handleRowChange(index, "unitPrice", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          handleRowChange(index, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td>{row.total.toFixed(2)}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => removeRow(index)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-button" onClick={addRow}>
              ➕ Add Item
            </button>
          </div>

          <div className="form-group full-width">
            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            ></textarea>
          </div>

          <div className="button-group">
            <button className="confirm-button" onClick={handleSubmit}>
              {editId ? "Update Purchase Order" : "Save Purchase Order"}
            </button>
            {editId && (
              <button className="clear-button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section card">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by PO number or remarks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={handleClearSearch}>
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
                <th>Supplier</th>
                <th>Total</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTableData.map((row, index) => (
                <tr key={row._id || index}>
                  <td>{row.poNum}</td>
                  <td>{row.supplier?.name || "-"}</td>
                  <td>{row.total?.toFixed(2) || "0.00"}</td>
                  <td>{row.issuedDate?.slice(0, 10)}</td>
                  <td>{row.remarks}</td>
                  <td>
                    <button
                      className="add-button"
                      onClick={() => handleEditOrder(row)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteOrder(row._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
