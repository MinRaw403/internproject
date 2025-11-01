"use client"

import { useState, useEffect } from "react"
import "./GRNList.css"

const GRNList = ({ onEditGRN, onCreateNew }) => {
  const [grns, setGrns] = useState([])
  const [filteredGrns, setFilteredGrns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGRNs()
  }, [])

  useEffect(() => {
    filterGRNs()
  }, [searchTerm, grns])

  const fetchGRNs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/grns")
      const data = await response.json()

      if (data.success) {
        console.log("[v0] Loaded GRNs from backend:", data.grns.length)
        const activeGrns = data.grns.filter((grn) => !grn.deleted)
        setGrns(activeGrns)
        setFilteredGrns(activeGrns)
      } else {
        console.log("[v0] Backend returned error")
        setGrns([])
        setFilteredGrns([])
      }
    } catch (error) {
      console.log("[v0] Backend not available, showing empty list")
      setGrns([])
      setFilteredGrns([])
    } finally {
      setLoading(false)
    }
  }

  const filterGRNs = () => {
    if (!searchTerm.trim()) {
      setFilteredGrns(grns)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = grns.filter(
      (grn) =>
        grn.grnNo?.toLowerCase().includes(term) ||
        grn.supplier?.toLowerCase().includes(term) ||
        grn.receivedBy?.toLowerCase().includes(term) ||
        grn.invoiceNo?.toLowerCase().includes(term),
    )
    setFilteredGrns(filtered)
  }

  const handleDelete = async (grn) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete GRN ${grn.grnNo}?\n\nThis will mark it as deleted but keep the data stored.`,
    )

    if (!confirmed) return

    try {
      // ✅ Use _id instead of grnNo
      const response = await fetch(`http://localhost:5000/api/grns/${grn._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ GRN ${grn.grnNo} has been deleted successfully!`)
        setGrns(grns.filter((g) => g._id !== grn._id))
        setFilteredGrns(filteredGrns.filter((g) => g._id !== grn._id))
      } else {
        alert(`❌ Failed to delete GRN: ${data.message}`)
      }
    } catch (error) {
      console.log("[v0] Backend not available for deletion")
      alert("❌ Cannot delete GRN: Backend not available")
    }
  }

  if (loading) {
    return (
      <div className="grn-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading GRNs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grn-list-container">
      <div className="list-header">
        <div className="header-content">
          <h2 className="list-title">Saved GRNs</h2>
          <p className="list-subtitle">View, search, edit, and manage all goods receive notes</p>
        </div>
        <button onClick={onCreateNew} className="create-new-btn">
          ➕ Create New GRN
        </button>
      </div>

      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by GRN No, Supplier, Received By, or Invoice No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-search">
              ✕
            </button>
          )}
        </div>
        <div className="search-results-count">
          {filteredGrns.length} {filteredGrns.length === 1 ? "GRN" : "GRNs"} found
        </div>
      </div>

      {filteredGrns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">{searchTerm ? "No GRNs found" : "No GRNs yet"}</h3>
          <p className="empty-description">
            {searchTerm ? "Try adjusting your search terms" : "Create your first Goods Receive Note to get started"}
          </p>
          {!searchTerm && (
            <button onClick={onCreateNew} className="empty-action-btn">
              Create First GRN
            </button>
          )}
        </div>
      ) : (
        <div className="grn-table-wrapper">
          <table className="grn-table">
            <thead>
              <tr>
                <th>GRN No</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Received By</th>
                <th>Invoice No</th>
                <th>Items</th>
                <th>Net Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrns.map((grn) => (
                <tr key={grn._id}>
                  <td className="grn-no-cell">{grn.grnNo}</td>
                  <td>{new Date(grn.date).toLocaleDateString()}</td>
                  <td className="supplier-cell">{grn.supplier}</td>
                  <td>{grn.receivedBy}</td>
                  <td>{grn.invoiceNo || "-"}</td>
                  <td className="items-count">{grn.items?.length || 0}</td>
                  <td className="amount-cell">${grn.netTotal?.toFixed(2) || "0.00"}</td>
                  <td className="actions-cell">
                    <button onClick={() => onEditGRN(grn)} className="action-btn edit-btn" title="Edit GRN">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(grn)} className="action-btn delete-btn" title="Delete GRN">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GRNList
