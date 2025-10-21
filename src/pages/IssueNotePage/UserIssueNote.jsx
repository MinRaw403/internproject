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
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredData = tableData.filter((row) => {
    const searchLower = searchTerm.toLowerCase()
    return (
        (row.code && row.code.toLowerCase().includes(searchLower)) ||
        (row.department && row.department.toLowerCase().includes(searchLower)) ||
        (row.personName && row.personName.toLowerCase().includes(searchLower)) ||
        (row.item && row.item.toLowerCase().includes(searchLower)) ||
        (row.note && row.note.toLowerCase().includes(searchLower))
    )
  })

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const handleReset = () => {
    setDepartment(departmentOptions[0] || null)
    setPersonName("")
    setEvent("")
    setItem("")
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
            <h1 className="issue-note-title">ISSUE NOTE (user)</h1>
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

                  <div className="form-field">
                    <label className="form-label">ITEM *</label>
                    <select
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                        className="form-input select-input"
                        required
                    >
                      <option value="">-- Select Item --</option>
                      {itemsList.map((i) => (
                          <option key={i.itemCode} value={i.itemCode}>
                            {i.itemCode} — {i.description}
                          </option>
                      ))}
                    </select>
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
                    <input type="number" value={1} className="form-input" min="1" placeholder="1" readOnly />
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

            {/* Table Section */}
            <section className="table-section">
              <div className="table-header">
                <h2 className="table-title">Issue Notes History</h2>
                <div className="table-info">
                <span className="record-count no-print">
                  {filteredData.length} of {Array.isArray(tableData) ? tableData.length : 0} records
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
                <div className="search-container">
                  <svg
                      className="search-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                      type="text"
                      placeholder="Search by code, department, person, item, or note..."
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                      <button onClick={handleClearSearch} className="clear-search-button" title="Clear search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                  )}
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                  <tr className="table-header-row">
                    <th>Code</th>
                    <th>Department</th>
                    <th>Person</th>
                    <th>Item</th>
                    <th>QTY</th>
                    <th>Note</th>
                    <th>Date</th>
                  </tr>
                  </thead>
                  <tbody>
                  {Array.isArray(filteredData) && filteredData.length > 0 ? (
                      filteredData.map((row, index) => (
                          <tr key={row.code}>
                            <td>{row.code}</td>
                            <td>{row.department}</td>
                            <td>{row.personName}</td>
                            <td>{row.item}</td>
                            <td>{row.qty}</td>
                            <td>{row.note || "///"}</td>
                            <td>{row.issuedDate ? new Date(row.issuedDate).toLocaleDateString("en-GB") : "N/A"}</td>
                          </tr>
                      ))
                  ) : (
                      <tr className="empty-row">
                        <td colSpan="7" className="table-cell empty-message">
                          {searchTerm ? "No matching Issue Notes found" : "No Issue Notes Found"}
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
  )
}

export default Issuenote
