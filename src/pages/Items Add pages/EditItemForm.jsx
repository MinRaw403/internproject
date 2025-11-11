import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditItemForm.css';

const EditItemForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state?.item;

    const [formData, setFormData] = useState({
        category: '',
        itemCode: '',
        description: '',
        unitPrice: '',
        
        reOrder: '',
        unit: '',
        supplier: '',
        rackNumber: '',
        imageFile: null,
    });

    const [categories, setCategories] = useState([]);
    const [suppliersList, setSuppliersList] = useState([]);

    useEffect(() => {
        // Fetch categories
        axios.get('http://localhost:5000/api/categories')
            .then(response => {
                if (response.data.success) {
                    setCategories(response.data.categories);
                }
            })
            .catch(error => console.error("Error fetching categories:", error));

        // Fetch suppliers
        axios.get('http://localhost:5000/api/suppliers')
            .then(response => {
                if (response.data.success) {
                    setSuppliersList(response.data.suppliers);
                }
            })
            .catch(error => console.error("Error fetching suppliers:", error));
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                category: item.category || '',
                itemCode: item.itemCode || '',
                description: item.description || '',
                unitPrice: item.unitPrice || '',
                reOrder: item.reOrder || '',
                unit: item.unit || '',
                supplier: item.supplier || '',
                rackNumber: item.rackNumber || '',
                imageFile: null,
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key !== 'imageFile') {
                form.append(key, formData[key]);
            }
        });

        if (formData.imageFile) {
            form.append('image', formData.imageFile);
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/items/${formData.itemCode}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert('✅ Item updated successfully!');
                navigate(-1);
            } else {
                alert('❌ Failed to update item.');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Error updating item. Please try again.');
        }
    };

    return (
        <div className="edit-item-page">
            <h2 className="form-title">Edit Item Details</h2>
            <form onSubmit={handleSubmit} className="edit-item-form">
                <div className="form-section">
                    <div className="form-group full-width">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange}>
                            <option value="">None</option>
                            {categories.map(cat => (
                                <option key={cat.code} value={cat.code}>
                                    {cat.code} - {cat.description}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="itemCode">Item Code</label>
                            <input
                                type="text"
                                id="itemCode"
                                name="itemCode"
                                value={formData.itemCode}
                                onChange={handleChange}
                                disabled
                                className="disabled-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="unitPrice">Unit Price</label>
                            <input
                                type="text"
                                id="unitPrice"
                                name="unitPrice"
                                value={formData.unitPrice}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="unit">Unit</label>
                            <input
                                type="text"
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reOrder">Re-Order Level</label>
                            <input
                                type="text"
                                id="reOrder"
                                name="reOrder"
                                value={formData.reOrder}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-group full-width">
                        <label htmlFor="supplier">Supplier</label>
                        <select id="supplier" name="supplier" value={formData.supplier} onChange={handleChange}>
                            <option value="">None</option>
                            {suppliersList.map(sup => (
                                <option key={sup.code} value={sup.code}>
                                    {sup.code} - {sup.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="rackNumber">Rack Number</label>
                        <input
                            type="text"
                            id="rackNumber"
                            name="rackNumber"
                            value={formData.rackNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-group full-width">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="imageFile">Item Image</label>
                        <input
                            type="file"
                            id="imageFile"
                            name="imageFile"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-button">Save Changes</button>
                    <button type="button" className="cancel-button" onClick={() => navigate(-1)}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditItemForm;
