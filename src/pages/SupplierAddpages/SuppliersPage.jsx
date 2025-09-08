"use client"

import { useState, useEffect } from "react"
import "./SuppliersPage.css"
import axios from "axios"

const SuccessPopup = ({ onClose }) => {
    return (
        <div className="success-popup-overlay">
            <div className="success-popup-content">
                <div className="success-icon">
                    <div className="checkmark">✓</div>
                </div>
                <h2>Success</h2>
                <p>Successfully Added Supplier Information</p>
                <div className="success-actions">
                    <button className="success-btn back-btn" onClick={onClose}>
                        Back
                    </button>
                    <button className="success-btn dashboard-btn">Dashboard</button>
                </div>
            </div>
        </div>
    )
}

const AddSupplierModal = ({ onClose, onSave, nextCode }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        address: "",
        tp1: "",
        tp2: "",
    })

    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target

        // Only allow numbers in tp1 and tp2
        if ((name === "tp1" || name === "tp2") && /[^0-9]/.test(value)) return

        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const validate = () => {
        const newErrors = {}
        if (!form.name) newErrors.name = "Name is required"
        if (!form.email) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Invalid email format"
        }
        if (!form.address) newErrors.address = "Address is required"
        if (!form.tp1) newErrors.tp1 = "T.P No (01) is required"
        return newErrors
    }

    const handleSubmit = () => {
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const newSupplier = {
            code: nextCode,
            name: form.name,
            email: form.email,
            address: form.address,
            tp1: form.tp1,
            tp2: form.tp2,
            date: new Date().toISOString().split("T")[0],
        }

        onSave(newSupplier)
    }

    const handleReset = () => {
        setForm({ name: "", email: "", address: "", tp1: "", tp2: "" })
        setErrors({})
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add Supplier</h3>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="form-group">
                    <label>Name</label>
                    <input
                        name="name"
                        placeholder="Enter supplier name"
                        value={form.name}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        name="email"
                        placeholder="Enter email address"
                        value={form.email}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input
                        name="address"
                        placeholder="Enter address"
                        value={form.address}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.address && <div className="error-message">{errors.address}</div>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>T.P No (01)</label>
                        <input
                            name="tp1"
                            placeholder="Primary phone"
                            value={form.tp1}
                            onChange={handleChange}
                            className="form-input"
                        />
                        {errors.tp1 && <div className="error-message">{errors.tp1}</div>}
                    </div>
                    <div className="form-group">
                        <label>T.P No (02)</label>
                        <input
                            name="tp2"
                            placeholder="Secondary phone"
                            value={form.tp2}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="modal-btn save-btn" onClick={handleSubmit}>
                        Save
                    </button>
                    <button className="modal-btn reset-btn" onClick={handleReset}>
                        Reset
                    </button>
                    <button className="modal-btn cancel-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

const SupplierList = ({ suppliers, onAdd, onSearch, searchQuery, onDelete }) => {
    return (
        <div className="supplier-container">
            <div className="supplier-header">
                <h3>Suppliers</h3>
                <div className="supplier-controls">
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="supplier-search"
                    />
                    <button className="supplier-add" onClick={onAdd}>
                        + Add Supplier
                    </button>
                </div>
            </div>

            <table className="supplier-table">
                <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date Created</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {suppliers.length === 0 ? (
                    <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                            No suppliers found.
                        </td>
                    </tr>
                ) : (
                    suppliers.map((s, i) => (
                        <tr key={i}>
                            <td>{s.code}</td>
                            <td>{s.name}</td>
                            <td>{s.email}</td>
                            <td>{s.date}</td>
                            <td>
                                <button className="delete-btn" onClick={() => onDelete(s.code)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    )
}

function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // Fetch suppliers from backend on mount
    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/suppliers")
            if (res.data.success) {
                setSuppliers(res.data.suppliers)
            }
        } catch (error) {
            console.error("Error fetching suppliers:", error)
        }
    }

    const addSupplier = async (supplier) => {
        try {
            const res = await axios.post("http://localhost:5000/api/suppliers", supplier)
            if (res.data.success) {
                setSuppliers((prev) => [...prev, res.data.supplier])
                setShowSuccess(true)
                setErrorMessage("")
            }
        } catch (error) {
            console.error("Error adding supplier:", error)
            const message = error.response?.data?.message || "Failed to add supplier"
            setErrorMessage(message)
        }
    }

    const deleteSupplier = async (code) => {
        try {
            const res = await axios.delete(`http://localhost:5000/api/suppliers/${code}`)
            if (res.data.success) {
                setSuppliers((prev) => prev.filter((s) => s.code !== code))
            }
        } catch (error) {
            console.error("Error deleting supplier:", error)
            alert("Failed to delete supplier")
        }
    }

    const filteredSuppliers = suppliers.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="main-container">
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

            {/* Error message display */}
            {errorMessage && <div className="error-banner">{errorMessage}</div>}

            <SupplierList
                suppliers={filteredSuppliers}
                onAdd={() => setShowModal(true)}
                onSearch={setSearchQuery}
                searchQuery={searchQuery}
                onDelete={deleteSupplier}
            />

            {showModal && (
                <AddSupplierModal
                    onClose={() => setShowModal(false)}
                    onSave={(supplier) => {
                        addSupplier(supplier)
                        setShowModal(false)
                    }}
                    nextCode={`SUP${String(suppliers.length + 1).padStart(3, "0")}`}
                />
            )}

            {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
        </div>
    )
}

export default SuppliersPage
