import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ItemDetailsPage.css';
import axios from 'axios';

const AddItemsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const deletedItemCode = location.state?.deletedItemCode;
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        category: '',
        unitPrice: '',
        itemCode: '',
        unit: '',
        imageFile: null,
        rackNumber: '',
        supplier: '',
        reOrder: '',
        description: '',
    });

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliersList, setSuppliersList] = useState([]);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const units = [
        'Kg', 'g', 'L', 'mL', 'pcs', 'box', 'pack', 'set', 'dozen', 'meter', 'cm', 'inch', 'bag', 'bottle', 'can'
    ];

    useEffect(() => {
        axios.get('http://localhost:5000/api/items')
            .then(res => {
                if (res.data.success) {
                    let fetchedItems = res.data.items;
                    if (deletedItemCode) fetchedItems = fetchedItems.filter(i => i.itemCode !== deletedItemCode);
                    setItems(fetchedItems);
                }
            }).catch(() => setErrorMessage("Failed to load items."));

        axios.get('http://localhost:5000/api/categories')
            .then(res => res.data.success && setCategories(res.data.categories))
            .catch(() => console.error("Error fetching categories"));

        axios.get('http://localhost:5000/api/suppliers')
            .then(res => res.data.success && setSuppliersList(res.data.suppliers))
            .catch(() => console.error("Error fetching suppliers"));
    }, [deletedItemCode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) setFormData(prev => ({ ...prev, imageFile: file }));
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'imageFile') form.append(key, formData[key]);
        });
        if (formData.imageFile) form.append('image', formData.imageFile);

        try {
            const response = await axios.post('http://localhost:5000/api/upload-item', form);
            if (response.data.success) {
                alert("✅ Item saved successfully!");
                setItems(prev => [...prev, response.data.item]);
                setFormData({ category: '', unitPrice: '', itemCode: '', unit: '', imageFile: null, rackNumber: '', supplier: '', reOrder: '', description: '' });
                setSupplierSearch('');
            } else {
                alert("⚠️ Failed to save item.");
            }
        } catch {
            alert("❌ Error saving item. Please try again.");
        }
    };

    const handleDelete = async (itemCode) => {
        const confirmed = window.confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        try {
            const response = await axios.delete(`http://localhost:5000/api/items/${itemCode}`);
            if (response.data.success) {
                alert("Item deleted successfully!");
                setItems(prev => prev.filter(i => i.itemCode !== itemCode));
            } else {
                setErrorMessage(response.data.message || "Failed to delete item.");
            }
        } catch {
            setErrorMessage("Error deleting item. Please try again.");
        }
    };

    const filteredSuppliers = suppliersList.filter(
        s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
             s.code.toLowerCase().includes(supplierSearch.toLowerCase())
    );

    const handleSupplierSelect = (supCode) => {
        setFormData(prev => ({ ...prev, supplier: supCode }));
        setSupplierSearch(supCode);
        setShowSupplierDropdown(false);
    };

    return (
        <div className="add-items-page-with-sidebar">
            <div className="add-items-page">
                <header className="header"><span className="app-title">SMARTSTOCK(PVT) LTD</span></header>
                <main className="main-content">
                    <section className="add-items-section">
                        <h2>Add Items</h2>
                        <form onSubmit={handleSubmit} className="add-item-form">

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select id="category" name="category" value={formData.category} onChange={handleChange}>
                                        <option value="">None</option>
                                        {categories.map(cat => <option key={cat.code} value={cat.code}>{cat.code} - {cat.description}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="unitPrice">Unit Price</label>
                                    <input type="text" id="unitPrice" name="unitPrice" value={formData.unitPrice} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="itemCode">Item Code</label>
                                    <input type="text" id="itemCode" name="itemCode" value={formData.itemCode} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="unit">Unit</label>
                                    <select id="unit" name="unit" value={formData.unit} onChange={handleChange}>
                                        <option value="">Select Unit</option>
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="imagePath">Image Upload</label>
                                    <div className="file-upload-group">
                                        <input type="text" readOnly value={formData.imageFile ? formData.imageFile.name : ''} placeholder="Image path" />
                                        <button type="button" className="upload-button" onClick={handleUploadClick}>⇧</button>
                                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="rackNumber">Rack Number</label>
                                    <input type="text" id="rackNumber" name="rackNumber" value={formData.rackNumber} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Supplier Field */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="supplier">Supplier</label>
                                    <input
                                        type="text"
                                        placeholder="Type to search..."
                                        value={supplierSearch}
                                        onChange={e => {
                                            setSupplierSearch(e.target.value);
                                            setShowSupplierDropdown(true);
                                        }}
                                        onFocus={() => setShowSupplierDropdown(true)}
                                    />
                                    {showSupplierDropdown && filteredSuppliers.length > 0 && (
                                        <div className="supplier-dropdown">
                                            {filteredSuppliers.map(s => (
                                                <div key={s.code} className="supplier-option" onClick={() => handleSupplierSelect(s.code)}>
                                                    {s.code} - {s.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="reOrder">Re - Order</label>
                                    <input type="text" id="reOrder" name="reOrder" value={formData.reOrder} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row full-width">
                                <div className="form-group description-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" />
                                </div>
                            </div>

                            <button type="submit" className="submit-button">Save</button>
                        </form>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </section>

                    <section className="items-table-section">
                        <h2>Item List</h2>
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Item Code</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Unit</th>
                                    <th>Unit Price</th>
                                    <th>Re-Order</th>
                                    <th>Supplier</th>
                                    <th>Rack No</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(i => (
                                    <tr key={i.itemCode}>
                                        <td>{i.itemCode}</td>
                                        <td>{i.category}</td>
                                        <td>{i.description}</td>
                                        <td>{i.unit}</td>
                                        <td>{i.unitPrice}</td>
                                        <td>{i.reOrder}</td>
                                        <td>{i.supplier}</td>
                                        <td>{i.rackNumber}</td>
                                        <td>
                                            <button onClick={() => navigate(`/edit-item/${i.itemCode}`, { state: { item: i } })}>Edit</button>
                                            <button onClick={() => handleDelete(i.itemCode)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AddItemsPage;

