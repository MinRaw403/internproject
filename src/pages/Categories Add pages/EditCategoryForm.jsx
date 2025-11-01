"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import "./AddCategoryForm.css"
import axios from "axios"

export default function EditCategoryForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const categoryToEdit = location.state?.category

  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!categoryToEdit) {
      alert("No category selected for editing")
      navigate("/categories")
      return
    }
    setCode(categoryToEdit.code)
    setDescription(categoryToEdit.description)
  }, [categoryToEdit, navigate])

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!description.trim()) {
      setError("Please fill all required fields")
      return
    }

    setError(null)

    try {
      const res = await axios.put(`http://localhost:5000/api/categories/${categoryToEdit.code}`, {
        description,
      })

      if (res.data.success) {
        navigate("/categories", {
          replace: true,
          state: {
            categoryUpdated: true,
            categoryUpdatedData: res.data.category,
          },
        })
      } else {
        setError("Failed to update category")
      }
    } catch (err) {
      console.error("Error updating category:", err)
      console.error("Error response:", err.response?.data)
      setError(err.response?.data?.message || "Server error while updating category")
    }
  }

  return (
    <div className="add-category-page">
      <div className="add-category-container">
        <h2 className="add-category-title">Edit Category</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="add-category-form" onSubmit={handleUpdate}>
          <div className="input-group">
            <label htmlFor="categoryCode" className="input-label">
              Code
            </label>
            <input
              type="text"
              id="categoryCode"
              placeholder="Code"
              className="input-field"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled
              style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
            />
            <small style={{ color: "#666", fontSize: "0.85em" }}>Category code cannot be changed</small>
          </div>
          <div className="input-group">
            <label htmlFor="categoryDescription" className="input-label">
              Description
            </label>
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
            <button type="submit" className="primary-btn">
              Update
            </button>
            <Link to="/categories">
              <button type="button" className="primary-btn">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
