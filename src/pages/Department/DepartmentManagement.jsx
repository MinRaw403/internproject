"use client";

import { useState, useEffect } from "react";
import "./DepartmentManagement.css";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  // <CHANGE> Added search state for filtering departments
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch departments
  useEffect(() => {
    fetch("http://localhost:5000/api/departments")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setDepartments(data.departments);
        })
        .catch((err) => console.error("❌ Fetch error:", err));
  }, []);

  // <CHANGE> Filter departments based on search query
  const filteredDepartments = departments.filter((dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Auto-generate next code when opening Add Modal
  const openAddModal = () => {
    let nextCode = "001"; // default
    if (departments.length > 0) {
      // Find highest numeric code
      const maxCode = Math.max(
          ...departments.map((d) => parseInt(d.code, 10) || 0)
      );
      nextCode = String(maxCode + 1).padStart(3, "0");
    }
    setFormData({ name: "", code: nextCode, description: "" });
    setIsAddModalOpen(true);
  };

  // ✅ Add Department
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    try {
      const res = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setDepartments((prev) => [data.department, ...prev]);
        setIsAddModalOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        alert(data.message || "Failed to add department");
      }
    } catch (err) {
      console.error("❌ Error adding department:", err);
    }
  };

  // ✅ Delete Department
  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/departments/${departmentId}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (data.success) {
          setDepartments((prev) => prev.filter((dept) => dept._id !== departmentId));
        } else {
          alert(data.message || "Failed to delete department");
        }
      } catch (err) {
        console.error("❌ Error deleting department:", err);
      }
    }
  };

  const handleReset = () => {
    let nextCode = "001";
    if (departments.length > 0) {
      const maxCode = Math.max(...departments.map((d) => parseInt(d.code, 10) || 0));
      nextCode = String(maxCode + 1).padStart(3, "0");
    }
    setFormData({ name: "", code: nextCode, description: "" });
  };

  return (
      <div className="app-container">
           

        {/* Main Content */}
        <div className="main-content">
          <div className="card">
            <div className="card-header">
              <h2>Departments</h2>
              <button className="add-button" onClick={openAddModal}>
                <span className="plus-icon">+</span>
                Add
              </button>
            </div>

            {/* <CHANGE> Added search bar section */}
            <div className="search-section">
              <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, code, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                  <button
                      className="clear-search"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                  >
                    ✕
                  </button>
              )}
            </div>

            <div className="card-content">
              {filteredDepartments.length > 0 ? (
                  <table className="department-table">
                    <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Date Created</th>
                      <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredDepartments.map((department) => (
                        <tr key={department._id} className="table-row">
                          <td>{department.name}</td>
                          <td>{department.code}</td>
                          <td>{department.description}</td>
                          <td>{new Date(department.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                                className="delete-button"
                                onClick={() => handleDeleteDepartment(department._id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
              ) : (
                  <div className="no-results">
                    <p>No departments found matching "{searchQuery}"</p>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Department Modal */}
        {isAddModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content department-modal">
                <div className="modal-header">
                  <h3>Department</h3>
                </div>
                <form onSubmit={handleAddDepartment} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="code">Code</label>
                    <input id="code" type="text" value={formData.code} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                        id="description"
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        required
                    />
                  </div>
                  <div className="modal-buttons">
                    <button type="button" className="btn-secondary" onClick={handleReset}>
                      Reset
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Success Modal */}
        {isSuccessModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content success-modal">
                <div className="success-content">
                  <div className="success-icon-container">
                    <div className="success-ping"></div>
                    <div className="success-icon">✓</div>
                  </div>
                  <h2>Success</h2>
                  <p>Successfully Added Department Information</p>
                  <div className="success-buttons">
                    <button className="btn-secondary" onClick={() => setIsSuccessModalOpen(false)}>
                      Back
                    </button>
                    <button className="btn-primary" onClick={() => setIsSuccessModalOpen(false)}>
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default DepartmentManagement;