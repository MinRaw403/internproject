"use client"

import { useState, useEffect } from "react"
import "./Issuenote.css"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import axios from "axios"
import Select from "react-select"

function Issuenote() {
  const [department, setDepartment] = useState(null)
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [personName, setPersonName] = useState("")
  const [event, setEvent] = useState("")
  const [item, setItem] = useState("")
  const [issuedDate, setIssuedDate] = useState(new Date())
  const [note, setNote] = useState("")
  const [tableData, setTableData] = useState([])
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [itemsList, setItemsList] = useState([])

  const [itemSearchQuery, setItemSearchQuery] = useState("")
  const [itemSearchResults, setItemSearchResults] = useState([])
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Fetch Issue Notes
  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/issue-notes")
      const data = await res.json()
      if (data.success) setTableData(data.notes)
    } catch (err) {
      console.error("❌ Fetch error:", err)
    }
  }

  const searchItems = async (query) => {
    if (!query || query.trim().length === 0) {
      setItemSearchResults([])
      setShowItemDropdown(false)
      return
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/items/search?q=${encodeURIComponent(query)}`)
      if (res.data.success) {
        setItemSearchResults(res.data.items)
        setShowItemDropdown(true)
      }
    } catch (err) {
      console.error("Error searching items:", err)
      setItemSearchResults([])
    }
  }

  const handleItemSearchChange = (e) => {
    const query = e.target.value
    setItemSearchQuery(query)
    setItem("") // Clear selected item when typing

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      searchItems(query)
    }, 300)

    setSearchTimeout(timeout)
  }

  const handleItemSelect = (selectedItem) => {
    setItem(selectedItem.itemCode)
    setItemSearchQuery(`${selectedItem.itemCode} - ${selectedItem.description}`)
    setShowItemDropdown(false)
    setItemSearchResults([])
  }

  // Fetch Items and Departments
  useEffect(() => {
    fetchNotes()

    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items")
        if (res.data.success) setItemsList(res.data.items)
      } catch (err) {
        console.error("❌ Items fetch error:", err)
      }
    }

    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/departments")
        if (res.data.success) {
          const options = res.data.departments.map((d) => ({
            value: d.name,
            label: d.name,
          }))
          setDepartmentOptions(options)
          setDepartment(options[0])
        }
      } catch (err) {
        console.error("❌ Departments fetch error:", err)
      }
    }

    fetchItems()
    fetchDepartments()
  }, [])

  const handleSave = async () => {
    if (!personName || !event || !item || !department) {
      alert("Please fill all required fields before submitting.")
      return
    }

    const newCode = `CODE-${Date.now()}`

    try {
      const res = await fetch("http://localhost:5000/api/issue-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: department.value,
          personName,
          event,
          item,
          issuedDate: issuedDate.toISOString(),
          note,
          code: newCode,
          qty: 1,
        }),
      })

      const data = await res.json()

      if (data.success) {
        await fetchNotes()
        setShowSuccessPopup(true)
        handleReset()
      } else {
        alert("Failed to save issue note")
      }
    } catch (err) {
      console.error("❌ Error:", err)
      alert("Error saving issue note")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue note?")) {
      return
    }

    try {
      const res = await fetch(`http://localhost:5000/api/issue-notes/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) fetchNotes()
      else alert("Failed to delete")
    } catch (err) {
      console.error("❌ Delete error:", err)
    }
  }

  const handleReset = () => {
    setDepartment(departmentOptions[0] || null)
    setPersonName("")
    setEvent("")
    setItem("")
    setItemSearchQuery("")
    setItemSearchResults([])
    setShowItemDropdown(false)
    setIssuedDate(new Date())
    setNote("")
  }

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessPopup])

  return (
    <div className="page-container">
      <div className="app-container">
        <header className="header no-print">
          <div className="header-left">
            <div className="hamburger-menu">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <span className="app-title">SMARTSTOCK (PVT) LTD</span>
          </div>
        </header>

        <div className="print-only print-header">
          <div className="print-company-info">
            <h1 className="print-company-name">SMARTSTOCK (PVT) LTD</h1>
            <p className="print-company-details">Inventory Management System</p>
            <p className="print-company-details">Tel: +94 11 234 5678 | Email: info@smartstock.lk</p>
          </div>
        </div>

        <div className="page-header">
          <h1 className="issue-note-title">ISSUE NOTE (manager)</h1>
        </div>

        {showSuccessPopup && (
          <div className="popup-overlay no-print">
            <div className="success-popup">
              <div className="success-icon-container">
                <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="popup-title">Successfully Added: {item || "New Item"}</p>
            </div>
          </div>
        )}

        <main className="main-content">
          <section className="form-section no-print">
            <div className="form-container">
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">DEPARTMENT *</label>
                  <Select
                    options={departmentOptions}
                    value={department}
                    onChange={(selected) => setDepartment(selected)}
                    placeholder="Select department"
                    isSearchable
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">PERSON NAME *</label>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="form-input"
                    placeholder="Enter person name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">EVENT *</label>
                  <input
                    type="text"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="form-input"
                    placeholder="Enter event description"
                    required
                  />
                </div>

                <div className="form-field" style={{ position: "relative" }}>
                  <label className="form-label">ITEM *</label>
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={handleItemSearchChange}
                    onFocus={() => {
                      if (itemSearchResults.length > 0) {
                        setShowItemDropdown(true)
                      }
                    }}
                    className="form-input"
                    placeholder="Search by item code, description, or rack number..."
                    required
                  />
                  {showItemDropdown && itemSearchResults.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {itemSearchResults.map((searchItem) => (
                        <div
                          key={searchItem.itemCode}
                          onClick={() => handleItemSelect(searchItem)}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f5f5f5"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white"
                          }}
                        >
                          <div style={{ fontWeight: "bold" }}>{searchItem.itemCode}</div>
                          <div style={{ fontSize: "0.9em", color: "#666" }}>{searchItem.description}</div>
                          <div style={{ fontSize: "0.85em", color: "#999" }}>Rack: {searchItem.rackNumber}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">ISSUED DATE</label>
                  <DatePicker
                    selected={issuedDate}
                    onChange={(date) => setIssuedDate(date)}
                    className="form-input date-input"
                    maxDate={new Date()}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">QUANTITY</label>
                  <input
                    type="number"
                    value={1}
                    onChange={(e) => console.log(e.target.value)}
                    className="form-input"
                    min="1"
                    placeholder="1"
                  />
                </div>

                <div className="form-field full-width">
                  <label className="form-label">NOTE</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="3"
                    className="form-input textarea-input"
                    placeholder="Enter additional notes (optional)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button onClick={handleSave} className="action-button primary-button">
                  <svg
                    className="button-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21H5a2 2 0 0 0-2-2V5a2 2 0 0 0 2-2h11l5 5v11a2 2 0 0 0-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  <span>SUBMIT ISSUE NOTE</span>
                </button>
                <button onClick={handleReset} className="action-button secondary-button">
                  <svg
                    className="button-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="1,4 1,10 7,10"></polyline>
                    <path d="M3.51,15a9,9,0,0,0,14.85,3.36"></path>
                  </svg>
                  <span>CLEAR FORM</span>
                </button>
              </div>
            </div>
          </section>

          {/* Table Section (preserve old code fully) */}
          <section className="table-section">
            <div className="table-header">
              <h2 className="table-title">
                <svg
                  className="table-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Issue Notes History
              </h2>
              <div className="table-info">
                <span className="record-count no-print">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path>
                    <rect x="9" y="7" width="6" height="6"></rect>
                  </svg>
                  {Array.isArray(tableData) ? tableData.length : 0} records
                </span>
                <button onClick={handlePrint} className="print-button no-print" title="Print Issue Notes">
                  <svg
                    className="button-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6,9 6,2 18,2 18,9"></polyline>
                    <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="table-controls no-print">
              <input
                type="text"
                placeholder="Search issue notes..."
                className="search-input"
                value=""
                onChange={(e) => console.log(e.target.value)}
              />
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr className="table-header-row">
                    <th className="table-header sortable">
                      <div className="header-content">
                        <span>Code</span>
                        <svg
                          className="sort-icon no-print"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 9l4-4 4 4"></path>
                          <path d="M16 15l-4 4-4-4"></path>
                        </svg>
                      </div>
                    </th>
                    <th className="table-header sortable">
                      <div className="header-content">
                        <span>Department</span>
                        <svg
                          className="sort-icon no-print"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 9l4-4 4 4"></path>
                          <path d="M16 15l-4 4-4-4"></path>
                        </svg>
                      </div>
                    </th>
                    <th className="table-header sortable">
                      <div className="header-content">
                        <span>Person</span>
                        <svg
                          className="sort-icon no-print"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 9l4-4 4 4"></path>
                          <path d="M16 15l-4 4-4-4"></path>
                        </svg>
                      </div>
                    </th>
                    <th className="table-header">Item</th>
                    <th className="table-header">QTY</th>
                    <th className="table-header">Note</th>
                    <th className="table-header sortable">
                      <div className="header-content">
                        <span>Date</span>
                        <svg
                          className="sort-icon no-print"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 9l4-4 4 4"></path>
                          <path d="M16 15l-4 4-4-4"></path>
                        </svg>
                      </div>
                    </th>
                    <th className="table-header no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {Array.isArray(tableData) && tableData.length > 0 ? (
                    tableData.map((row, index) => (
                      <tr key={row.code} className={`table-row ${index % 2 === 0 ? "even-row" : "odd-row"}`}>
                        <td className="table-cell code-cell" data-label="Code">
                          <span className="code-badge">{row.code}</span>
                        </td>
                        <td className="table-cell" data-label="Department">
                          <span className="department-badge">{row.department}</span>
                        </td>
                        <td className="table-cell" data-label="Person">
                          <div className="person-info">
                            <svg
                              className="person-icon"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            {row.personName}
                          </div>
                        </td>
                        <td className="table-cell" data-label="Item">
                          <span className="item-code">{row.item}</span>
                        </td>
                        <td className="table-cell" data-label="QTY">
                          <span className="qty-badge">{row.qty}</span>
                        </td>
                        <td className="table-cell note-cell" data-label="Note">
                          <span className="note-text" title={row.note}>
                            {row.note || "///"}
                          </span>
                        </td>
                        <td className="table-cell" data-label="Date">
                          <div className="date-info">
                            <svg
                              className="date-icon"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {row.issuedDate ? new Date(row.issuedDate).toLocaleDateString("en-GB") : "N/A"}
                          </div>
                        </td>
                        <td className="table-cell action-cell no-print" data-label="Action">
                          <button
                            onClick={() => handleDelete(row._id)}
                            className="delete-button"
                            title="Delete this issue note"
                          >
                            <svg
                              className="delete-icon"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3,6 5,6 21,6"></polyline>
                              <path d="M19,6v14a2,2,0,0,1-2,2h4a2,2,0,0,1-2-2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="empty-row">
                      <td className="table-cell empty-message" colSpan="8">
                        <div className="empty-state">
                          <svg
                            className="empty-icon"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                          </svg>
                          <h3>No Issue Notes Found</h3>
                          <p>No results match your search. Try different keywords.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="print-only print-footer">
              <div className="print-signatures">
                <div className="signature-block">
                  <div className="signature-line"></div>
                  <p className="signature-label">Issued By</p>
                </div>
                <div className="signature-block">
                  <div className="signature-line"></div>
                  <p className="signature-label">Received By</p>
                </div>
                <div className="signature-block">
                  <div className="signature-line"></div>
                  <p className="signature-label">Authorized By</p>
                </div>
              </div>
              <div className="print-footer-note">
                <p>This is a computer-generated document. Printed on {new Date().toLocaleDateString("en-GB")}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Issuenote
