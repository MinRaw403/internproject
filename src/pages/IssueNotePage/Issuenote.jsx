"use client";

import { useState, useEffect } from "react";
import "./Issuenote.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Select from "react-select";

function Issuenote() {
  const [department, setDepartment] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [personName, setPersonName] = useState("");
  const [event, setEvent] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [tableData, setTableData] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [savedItemCount, setSavedItemCount] = useState(0);
  const [itemsList, setItemsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [itemSearchResults, setItemSearchResults] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null); // ✅ for update mode

  // ✅ Fetch all issue notes
  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/issue-notes");
      const data = await res.json();
      if (data.success) setTableData(data.notes);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  // ✅ Delete issue note
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue note?"))
      return;
    try {
      const res = await fetch(`http://localhost:5000/api/issue-notes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchNotes();
      } else {
        alert("Failed to delete issue note");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Error deleting issue note");
    }
  };

  // ✅ Search items for dropdown
  const searchItems = async (query) => {
    if (!query || query.trim().length === 0) {
      setItemSearchResults([]);
      setShowItemDropdown(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/items/search?q=${encodeURIComponent(query)}`
      );
      if (res.data.success) {
        setItemSearchResults(res.data.items);
        setShowItemDropdown(true);
      }
    } catch (err) {
      console.error("Error searching items:", err);
      setItemSearchResults([]);
    }
  };

  const handleItemSearchChange = (e) => {
    const query = e.target.value;
    setItemSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      searchItems(query);
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleItemSelect = (selectedItem) => {
    const isAlreadySelected = selectedItems.some(
      (item) => item.itemCode === selectedItem.itemCode
    );

    if (!isAlreadySelected) {
      const newItem = {
        itemCode: selectedItem.itemCode,
        description: selectedItem.description,
        rackNumber: selectedItem.rackNumber,
        qty: 1,
      };
      setSelectedItems([...selectedItems, newItem]);
    }

    setItemSearchQuery("");
    setShowItemDropdown(false);
    setItemSearchResults([]);
  };

  const handleRemoveItem = (itemCode) => {
    setSelectedItems(
      selectedItems.filter((item) => item.itemCode !== itemCode)
    );
  };

  const handleQuantityChange = (itemCode, newQty) => {
    if (newQty < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.itemCode === itemCode ? { ...item, qty: parseInt(newQty) } : item
      )
    );
  };

  useEffect(() => {
    fetchNotes();

    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items");
        if (res.data.success) setItemsList(res.data.items);
      } catch (err) {
        console.error("❌ Items fetch error:", err);
      }
    };

    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/departments");
        if (res.data.success) {
          const options = res.data.departments.map((d) => ({
            value: d.name,
            label: d.name,
          }));
          setDepartmentOptions(options);
          setDepartment(options[0]);
        }
      } catch (err) {
        console.error("❌ Departments fetch error:", err);
      }
    };

    fetchItems();
    fetchDepartments();
  }, []);

  // ✅ Save or Update Issue Note
  const handleSave = async () => {
    if (!personName || !event || !department || selectedItems.length === 0) {
      alert(
        "Please fill all required fields and select at least one item before submitting."
      );
      return;
    }

    try {
      if (editingNoteId) {
        // 🔄 UPDATE existing note
        const noteData = {
          department: department.value,
          personName,
          event,
          issuedDate: issuedDate.toISOString(),
          note,
          items: selectedItems,
        };

        const res = await fetch(
          `http://localhost:5000/api/issue-notes/${editingNoteId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(noteData),
          }
        );

        const data = await res.json();
        if (data.success) {
          fetchNotes();
          setShowSuccessPopup(true);
          handleReset();
        } else {
          alert("Failed to update issue note");
        }
      } else {
        // 🆕 CREATE new issue notes
        const baseCode = `CODE-${Date.now()}`;
        const savePromises = selectedItems.map(async (item, index) => {
          const noteData = {
            department: department.value,
            personName,
            event,
            item: item.itemCode,
            issuedDate: issuedDate.toISOString(),
            note,
            code: `${baseCode}-${index + 1}`,
            qty: item.qty,
          };

          const res = await fetch("http://localhost:5000/api/issue-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(noteData),
          });

          return res.json();
        });

        const results = await Promise.all(savePromises);
        const allSuccess = results.every((result) => result.success);

        if (allSuccess) {
          setSavedItemCount(selectedItems.length);
          await fetchNotes();
          setShowSuccessPopup(true);
          handleReset();
        } else {
          alert("Failed to save some issue notes");
        }
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Error saving issue notes");
    }
  };

  // ✅ Load note data into form for editing
  const handleEdit = (note) => {
    setEditingNoteId(note._id);
    setDepartment({ value: note.department, label: note.department });
    setPersonName(note.personName);
    setEvent(note.event);
    setIssuedDate(new Date(note.issuedDate));
    setNote(note.note);
    setSelectedItems([
      {
        itemCode: note.item,
        description: note.item,
        rackNumber: "N/A",
        qty: note.qty,
      },
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Filter table data by search
  const filteredData = tableData.filter((row) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (row.code && row.code.toLowerCase().includes(searchLower)) ||
      (row.department && row.department.toLowerCase().includes(searchLower)) ||
      (row.personName && row.personName.toLowerCase().includes(searchLower)) ||
      (row.item && row.item.toLowerCase().includes(searchLower)) ||
      (row.note && row.note.toLowerCase().includes(searchLower))
    );
  });

  const handleReset = () => {
    setEditingNoteId(null);
    setDepartment(departmentOptions[0] || null);
    setPersonName("");
    setEvent("");
    setSelectedItems([]);
    setItemSearchQuery("");
    setItemSearchResults([]);
    setShowItemDropdown(false);
    setIssuedDate(new Date());
    setNote("");
  };

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  return (
    <div className="page-container">
      <div className="app-container">
        <div className="page-header">
          <h1 className="issue-note-title">ISSUE NOTE</h1>
        </div>

        <main className="main-content">
          {/* ===== FORM ===== */}
          <section className="form-section no-print">
            <div className="form-container">
              {/* Department, Person, Event */}
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
                  />
                </div>

                {/* Items, Date, Note */}
                <div className="form-field" style={{ position: "relative" }}>
                  <label className="form-label">ADD ITEM *</label>
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={handleItemSearchChange}
                    onFocus={() => {
                      if (itemSearchResults.length > 0)
                        setShowItemDropdown(true);
                    }}
                    className="form-input"
                    placeholder="Search by item code, description, or rack number..."
                  />
                  {showItemDropdown && itemSearchResults.length > 0 && (
                      <div className="item-dropdown">
                        {itemSearchResults.map((searchItem) => (
                            <div
                                key={searchItem.itemCode}
                                onClick={() => handleItemSelect(searchItem)}
                                className="dropdown-item with-image"
                            >
                              {searchItem.imagePath && (
                                  <img
                                      src={`http://localhost:5000${searchItem.imagePath}`}
                                      alt={searchItem.itemCode}
                                      className="dropdown-item-image"
                                  />
                              )}
                              <div className="dropdown-item-info">
                                <strong>{searchItem.itemCode}</strong>
                                <div>{searchItem.description}</div>
                                <small>Rack: {searchItem.rackNumber}</small>
                              </div>
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

                <div className="form-field full-width">
                  <label className="form-label">
                    SELECTED ITEMS ({selectedItems.length})
                  </label>
                  <div className="selected-items-container">
                    {selectedItems.length === 0 ? (
                      <div className="no-items-message">No items selected</div>
                    ) : (
                      selectedItems.map((item) => (
                        <div key={item.itemCode} className="selected-item">
                          <div className="item-info">
                            <div className="item-code">{item.itemCode}</div>
                            <div className="item-description">
                              {item.description}
                            </div>
                          </div>
                          <div className="item-controls">
                            <div className="quantity-controls">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.itemCode,
                                    item.qty - 1
                                  )
                                }
                                className="quantity-btn"
                                disabled={item.qty <= 1}
                              >
                                -
                              </button>
                              <span className="quantity-display">
                                {item.qty}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.itemCode,
                                    item.qty + 1
                                  )
                                }
                                className="quantity-btn"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.itemCode)}
                              className="remove-item-btn"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="form-field full-width">
                  <label className="form-label">NOTE</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="3"
                    className="form-input textarea-input"
                    placeholder="Enter additional notes"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={handleSave}
                  className="action-button primary-button"
                >
                  {editingNoteId
                    ? "UPDATE ISSUE NOTE"
                    : `SUBMIT ISSUE NOTE (${selectedItems.length})`}
                </button>
                <button
                  onClick={handleReset}
                  className="action-button secondary-button"
                >
                  CLEAR FORM
                </button>
              </div>
            </div>
          </section>

          {/* ===== TABLE ===== */}
          <section className="table-section">
            <h2 className="table-title">Issue Notes History</h2>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>DEPARTMENT</th>
                    <th>PERSON NAME</th>
                    <th>EVENT</th>
                    <th>ITEM</th>
                    <th>QTY</th>
                    <th>ISSUED DATE</th>
                    <th>NOTE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr key={row._id}>
                        <td>{row.code}</td>
                        <td>{row.department}</td>
                        <td>{row.personName}</td>
                        <td>{row.event}</td>
                        <td>{row.item}</td>
                        <td>{row.qty}</td>
                        <td>{new Date(row.issuedDate).toLocaleDateString()}</td>
                        <td>{row.note}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(row)}
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(row._id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Issuenote;
