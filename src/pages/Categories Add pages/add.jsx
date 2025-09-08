import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './AddCategoryForm.css';
import axios from "axios";

export default function AddCategoryForm() {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);  // Add error state if needed
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();

    if (!code.trim() || !description.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setError(null);

    try {
      const res = await axios.post("http://localhost:5000/api/categories", {
        code,
        description,
      });

      if (res.data.success) {
        navigate("/categories", {
          replace: true, // prevents going back to Add form
          state: {
            categoryAdded: true,
            categoryAddedData: res.data.category,
          },
        });

      } else {
        setError("Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Server error while saving category");
    }
  };

  return (
      <div className="add-category-page">
        <div className="add-category-container">
          <h2 className="add-category-title">Add Category</h2>
          {error && <div className="error-message">{error}</div>}
          <form className="add-category-form" onSubmit={handleSave}>
            <div className="input-group">
              <label htmlFor="categoryCode" className="input-label">Code</label>
              <input
                  type="text"
                  id="categoryCode"
                  placeholder="Code"
                  className="input-field"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
              />
            </div>
            <div className="input-group">
              <label htmlFor="categoryDescription" className="input-label">Description</label>
              <textarea
                  id="categoryDescription"
                  placeholder="Description .........."
                  rows="5"
                  className="textarea-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
              ></textarea>
            </div>
            <div className="button-group">
              <button type="submit" className="primary-btn">Save</button>
              <Link to="/categories">
                <button type="button" className="primary-btn">Back</button>
              </Link>
            </div>
          </form>
        </div>
      </div>
  );
}
