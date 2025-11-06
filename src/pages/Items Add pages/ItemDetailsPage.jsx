import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ItemDetailsPage.css";
import axios from "axios";
import Select from "react-select";

const AddItemsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const deletedItemCode = location.state?.deletedItemCode;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: "",
    unitPrice: "",
    itemCode: "",
    unit: "",
    imageFile: null,
    rackNumber: "",
    supplier: "",
    reOrder: "",
    description: "",
  });

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Units Dropdown Options
  const unitOptions = [
    { value: "Kg", label: "Kg" },
    { value: "g", label: "g" },
    { value: "mg", label: "mg" },
    { value: "L", label: "Litre" },
    { value: "mL", label: "Milli Litre" },
    { value: "pcs", label: "Pieces" },
    { value: "m", label: "Meter" },
    { value: "more", label: "More..." },
  ];

  useEffect(() => {
    // Fetch existing items
    axios
      .get("http://localhost:5000/api/items")
      .then((response) => {
        if (response.data.success) {
          let fetchedItems = response.data.items;
          if (deletedItemCode) {
            fetchedItems = fetchedItems.filter(
              (item) => item.itemCode !== deletedItemCode
            );
          }
          setItems(fetchedItems);
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        setErrorMessage("Failed to load items.");
      });

    // Fetch categories
    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => {
        if (response.data.success) {
          setCategories(response.data.categories);
          if (!formData.category && response.data.categories.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category: response.data.categories[0].code,
            }));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    // Fetch suppliers
    axios
      .get("http://localhost:5000/api/suppliers")
      .then((response) => {
        if (response.data.success) {
          setSuppliersList(response.data.suppliers);
          if (!formData.supplier && response.data.suppliers.length > 0) {
            setFormData((prev) => ({
              ...prev,
              supplier: response.data.suppliers[0].code,
            }));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching suppliers:", error);
      });
  }, [deletedItemCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key !== "imageFile") {
        form.append(key, formData[key]);
      }
    });

    if (formData.imageFile) {
      form.append("image", formData.imageFile);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload-item",
        form
      );
      if (response.data.success) {
        alert("✅ Item saved successfully!");
        setItems((prev) => [...prev, response.data.item]);
        setFormData({
          category: categories[0]?.code || "",
          unitPrice: "",
          itemCode: "",
          unit: "",
          imageFile: null,
          rackNumber: "",
          supplier: suppliersList[0]?.code || "",
          reOrder: "",
          description: "",
        });
        setErrorMessage("");
      } else {
        alert("⚠️ Failed to save item.");
      }
    } catch (error) {
      console.error("Error uploading item:", error);
      alert("❌ Error saving item. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      category: categories[0]?.code || "",
      unitPrice: "",
      itemCode: "",
      unit: "",
      imageFile: null,
      rackNumber: "",
      supplier: suppliersList[0]?.code || "",
      reOrder: "",
      description: "",
    });
    setErrorMessage("");
  };

  const handleRowClick = (item) => {
    navigate(`/item/${item.itemCode}`, { state: { item } });
  };

  const handleDelete = async (itemCode) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmed) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/items/${itemCode}`
      );
      if (response.data.success) {
        alert("Item deleted successfully!");
        setItems((prev) => prev.filter((item) => item.itemCode !== itemCode));
        setErrorMessage("");
      } else {
        setErrorMessage(response.data.message || "Failed to delete item.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage("Error deleting item. Please try again.");
    }
  };

  // ✅ Compute total item count & total purchase amount
  const totalItemCount = items.length;
  const totalPurchaseAmount = items.reduce(
    (sum, item) => sum + (parseFloat(item.unitPrice) || 0),
    0
  );

  return (
    <div className="add-items-page-with-sidebar">
      <div className="add-items-page">
        <main className="main-content">
          <section className="add-items-section">
            <h2>Add Items</h2>
            <form onSubmit={handleSubmit} className="add-item-form">
              <div className="form-row">
                <div className="form-group">
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
                  <label htmlFor="itemCode">Item Code</label>
                  <input
                    type="text"
                    id="itemCode"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleChange}
                  />
                </div>

                {/* ✅ Unit dropdown */}
                <div className="form-group">
                  <label htmlFor="unit">Unit</label>
                  <Select
                    id="unit"
                    name="unit"
                    value={
                      formData.unit
                        ? { value: formData.unit, label: formData.unit }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        unit: selectedOption?.value || "",
                      }))
                    }
                    options={unitOptions}
                    placeholder="Select unit..."
                    isSearchable
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="imagePath">Image Upload</label>
                  <div className="file-upload-group">
                    <input
                      type="text"
                      id="imagePath"
                      name="imagePath"
                      value={formData.imageFile ? formData.imageFile.name : ""}
                      readOnly
                      placeholder="Image path"
                    />
                    <button
                      type="button"
                      className="upload-button"
                      onClick={handleUploadClick}
                    >
                      ⇧
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                <div className="form-group">
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="supplier">Supplier</label>
                  <Select
                    id="supplier"
                    name="supplier"
                    value={
                      suppliersList.find((s) => s.code === formData.supplier)
                        ? {
                            value: formData.supplier,
                            label: `${formData.supplier} - ${
                              suppliersList.find(
                                (s) => s.code === formData.supplier
                              )?.name
                            }`,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        supplier: selectedOption?.value || "",
                      }))
                    }
                    options={suppliersList.map((s) => ({
                      value: s.code,
                      label: `${s.code} - ${s.name}`,
                    }))}
                    placeholder="Select a supplier..."
                    isSearchable
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reOrder">Re - Order</label>
                  <input
                    type="text"
                    id="reOrder"
                    name="reOrder"
                    value={formData.reOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row full-width">
                <div className="form-group description-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Submit
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          <section className="detail-view-section">
            <h2>Detail View</h2>
            {errorMessage && (
              <div style={{ color: "red", marginBottom: "10px" }}>
                {errorMessage}
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item Code</th>
                    <th>Unit Price</th>
                    <th>Units</th>
                    <th>Supplier</th>
                    <th>Re - Order</th>
                    <th>Rack</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.itemCode}
                      className="clickable-row"
                      onClick={() => handleRowClick(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{item.category}</td>
                      <td>{item.itemCode}</td>
                      <td>{item.unitPrice}</td>
                      <td>{item.unit}</td>
                      <td>{item.supplier}</td>
                      <td>{item.reOrder}</td>
                      <td>{item.rackNumber}</td>
                      <td>{item.description}</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.itemCode);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Summary section below table */}
            <div className="summary-section">
              <p>
                <strong>Total Items:</strong> {totalItemCount}
              </p>
              <p>
                <strong>Total Purchase Value:</strong> Rs.{" "}
                {totalPurchaseAmount.toFixed(2)}
              </p>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <div className="logo-placeholder"></div>
              <p>
                Built with precision, powered by innovation. Delivering
                cutting-edge IT solutions and business solutions for the future
                of business.
              </p>
            </div>
            <div className="footer-center">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="#">Home</a>
                </li>
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Features</a>
                </li>
                <li>
                  <a href="#">Testimonials</a>
                </li>
              </ul>
            </div>
            <div className="footer-right">
              <h4>Subscribe to our newsletter</h4>
              <p>
                The latest news, articles, and resources, sent to your inbox
                weekly.
              </p>
              <form className="newsletter-form">
                <input type="email" placeholder="Enter your email" />
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
          <div className="copyright">
            <p>
              Copyright 2023 © Proxima Technologies Pvt Ltd. All Right Reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AddItemsPage;
