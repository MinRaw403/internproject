import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditItemForm.css";

const EditItemForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  const [formData, setFormData] = useState({
    category: "",
    itemCode: "",
    description: "",
    unitPrice: "",
    reOrder: "",
    unit: "",
    supplier: "",
    rackNumber: "",
    imageFile: null,
  });

  const [categories, setCategories] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  const units = [
    "Kg",
    "g",
    "L",
    "mL",
    "pcs",
    "box",
    "pack",
    "set",
    "dozen",
    "meter",
    "cm",
    "inch",
    "bag",
    "bottle",
    "can",
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => res.data.success && setCategories(res.data.categories))
      .catch((err) => console.error("Error fetching categories:", err));

    axios
      .get("http://localhost:5000/api/suppliers")
      .then((res) => res.data.success && setSuppliersList(res.data.suppliers))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category || "",
        itemCode: item.itemCode || "",
        description: item.description || "",
        unitPrice: item.unitPrice || "",
        reOrder: item.reOrder || "",
        unit: item.unit || "",
        supplier: item.supplier || "",
        rackNumber: item.rackNumber || "",
        imageFile: null,
      });
      setSupplierSearch(item.supplier || "");
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
      if (key !== "imageFile") form.append(key, formData[key]);
    });
    if (formData.imageFile) form.append("image", formData.imageFile);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/items/${formData.itemCode}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success) {
        alert("✅ Item updated successfully!");
        navigate(-1);
      } else {
        alert("❌ Failed to update item.");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Error updating item. Please try again.");
    }
  };

  const filteredSuppliers = suppliersList.filter(
    (sup) =>
      sup.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      sup.code.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const handleSupplierSelect = (supCode) => {
    setFormData((prev) => ({ ...prev, supplier: supCode }));
    setSupplierSearch(supCode);
    setShowSupplierDropdown(false);
  };

  return (
    <div className="edit-item-page">
      <h2 className="form-title">Edit Item Details</h2>
      <form onSubmit={handleSubmit} className="edit-item-form">
        <div className="form-section">
          <div className="form-group full-width">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">None</option>
              {categories.map((cat) => (
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
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
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

        {/* Supplier Field */}
        <div className="form-section">
          <div
            className="form-group full-width"
            style={{ position: "relative" }}
          >
            <label htmlFor="supplier">Supplier</label>
            <input
              type="text"
              placeholder="Type to search..."
              value={supplierSearch}
              onChange={(e) => {
                setSupplierSearch(e.target.value);
                setShowSupplierDropdown(true);
              }}
              onFocus={() => setShowSupplierDropdown(true)}
            />
            {showSupplierDropdown && filteredSuppliers.length > 0 && (
              <div className="supplier-dropdown">
                {filteredSuppliers.map((sup) => (
                  <div
                    key={sup.code}
                    className="supplier-option"
                    onClick={() => handleSupplierSelect(sup.code)}
                  >
                    {sup.code} - {sup.name}
                  </div>
                ))}
              </div>
            )}
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
          <button type="submit" className="save-button">
            Save Changes
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItemForm;
