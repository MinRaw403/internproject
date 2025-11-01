"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaBox, FaEdit } from "react-icons/fa"
import { useLocation, useNavigate } from "react-router-dom"
import "./category.css"
import axios from "axios"

export default function CategoryPage() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [allItems, setAllItems] = useState([])
  const [categoryItems, setCategoryItems] = useState([])

  const location = useLocation()
  const navigate = useNavigate()

  // Redirect if history state is at 0
  useEffect(() => {
    if (window.history.state && window.history.state.idx === 0) {
      navigate("/main", { replace: true })
    }
  }, [navigate])

  // Fetch categories and items
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories")
        if (res.data.success) setCategories(res.data.categories)
      } catch (error) {
        console.error("Error fetching categories", error)
      }
    }

    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items")
        if (res.data.success) setAllItems(res.data.items)
      } catch (error) {
        console.error("Error fetching items", error)
      }
    }

    fetchCategories()
    fetchItems()
  }, [])

  const handleRemoveCategory = async () => {
    if (!selectedCategory) return alert("Please select a category to remove.")
    if (!window.confirm(`Are you sure you want to delete "${selectedCategory.code}"?`)) return

    try {
      const res = await axios.delete(`http://localhost:5000/api/categories/${selectedCategory.code}`)
      if (res.data.success) {
        setCategories(prev => prev.filter(cat => cat.code !== selectedCategory.code))
        setSelectedCategory(null)
        setCategoryItems([])
        alert("Category deleted successfully")
      } else {
        alert("Failed to delete category")
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Server error while deleting category")
    }
  }

  const handleEditCategory = () => {
    if (!selectedCategory) return alert("Please select a category to edit.")
    navigate("/categories/edit", { state: { category: selectedCategory } })
  }

  const handleCategoryClick = category => {
    setSelectedCategory(category)
    setCategoryItems(allItems.filter(item => item.category === category.code))
  }

  const filteredCategories = categories.filter(
    cat =>
      cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-wrapper">
      <div className="category-content">
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

        <div className="page-container">
          {/* LEFT SECTION */}
          <div className="left-section">
            <img src="https://cdn-icons-png.flaticon.com/512/891/891419.png" alt="Category" className="category-img" />
            <span className="category-badge">
              {selectedCategory ? (
                <>
                  <span className="badge-code">{selectedCategory.code}</span>
                  <br />
                  <span className="badge-description">{selectedCategory.description}</span>
                </>
              ) : (
                "Select Category"
              )}
            </span>

            <div className="left-items">
              <button className="edit-category-btn" onClick={handleEditCategory} disabled={!selectedCategory}>
                <FaEdit />
                <span>Edit Category</span>
              </button>
              <button className="remove-category-btn" onClick={handleRemoveCategory} disabled={!selectedCategory}>
                Remove Category
              </button>
              <button className="add-item-btn" onClick={() => navigate("/details")}>
                <FaPlus />
                <span>Add Items</span>
              </button>
            </div>

            <div className="item-list">
              {categoryItems.length > 0 ? (
                categoryItems.map((item, index) => (
                  <div key={index} className="item-entry">
                    <span>{item.itemCode}</span>
                    <button
                      className="view-item-btn"
                      onClick={() => navigate(`/item/${item.itemCode}`, { state: { item } })}
                    >
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="item-entry">No items for this category</div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="right-section">
            <h2 className="section-heading">Item Categories</h2>
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-list">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, i) => (
                  <div
                    key={i}
                    className={`category-entry ${selectedCategory?.code === cat.code ? "selected" : ""}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <span>
                      {cat.code} - {cat.description}
                    </span>
                    <div className="category-box">
                      <FaBox />
                      <span>{allItems.filter(item => item.category === cat.code).length}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div>No categories found</div>
              )}
            </div>

            <button className="add-category-btn" onClick={() => navigate("/categories/add")}>
              Add Items Category
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
