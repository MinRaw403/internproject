import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaBox, FaTimesCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./category.css";
import axios from "axios";
//import Sidebar from "../Sidebar/Sidebar";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.history.state && window.history.state.idx === 0) {
      navigate("/main", { replace: true });
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items");
        if (res.data.success) {
          setAllItems(res.data.items);
        }
      } catch (error) {
        console.error("Error fetching items", error);
      }
    };

    fetchCategories();
    fetchItems();
  }, []);

  useEffect(() => {
    if (location.state?.categoryAddedData) {
      const newCategory = location.state.categoryAddedData;

      setCategories((prev) => {
        if (!prev.some((cat) => cat.code === newCategory.code)) {
          const updated = [...prev, newCategory];
          setShowSuccessPopup(true);
          return updated;
        }
        return prev;
      });

      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        window.history.replaceState({}, document.title);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleRemoveCategory = async () => {
    if (!selectedCategory) return alert("Please select a category to remove.");

    if (!window.confirm(`Are you sure you want to delete "${selectedCategory.code}"?`)) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/categories/${selectedCategory.code}`);
      if (res.data.success) {
        setCategories((prev) => prev.filter((cat) => cat.code !== selectedCategory.code));
        setSelectedCategory(null);
        setCategoryItems([]);
        alert("Category deleted successfully");
      } else {
        alert("Failed to delete category");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error while deleting category");
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCategoryItems(allItems.filter((item) => item.category === category.code));
  };

  const filteredCategories = categories.filter(
      (cat) =>
          cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="page-wrapper">

        {/*<Sidebar />*/}
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
            {showSuccessPopup && (
                <div className="success-popup">
                  <span className="popup-message">Successfully Added New Category</span>
                  <button className="popup-close-btn" onClick={() => setShowSuccessPopup(false)}>
                    <FaTimesCircle />
                  </button>
                </div>
            )}

            <div className="left-section">
              <img
                  src={"https://cdn-icons-png.flaticon.com/512/891/891419.png"}
                  alt="Category"
                  className="category-img"
              />
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
                <button
                    className="remove-category-btn"
                    onClick={handleRemoveCategory}
                    disabled={!selectedCategory}
                >
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

            <div className="right-section">
              <h2 className="section-heading">Item Categories</h2>
              <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="category-list">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat, i) => (
                        <div
                            key={i}
                            className={`category-entry ${
                                selectedCategory?.code === cat.code ? "selected" : ""
                            }`}
                            onClick={() => handleCategoryClick(cat)}
                        >
                          <span>{cat.code} - {cat.description}</span>
                          <div className="category-box">
                            <FaBox />
                            <span>
                        {
                          allItems.filter((item) => item.category === cat.code).length
                        }
                      </span>
                          </div>
                        </div>
                    ))
                ) : (
                    <div>No categories found</div>
                )}
              </div>

              <button className="add-category-btn" onClick={() => navigate("/add")}>
                Add Items Category
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
