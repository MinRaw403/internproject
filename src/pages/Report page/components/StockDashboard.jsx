"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import "./dashboard.css"

const StockDashboard = () => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    supplier: "",
    category: "",
    documentType: "",
    search: "",
  })

  const [activeTab, setActiveTab] = useState("suppliers")

  // ✅ State for live API data
  const [kpiData, setKpiData] = useState([])
  const [supplierData, setSupplierData] = useState([])
  const [itemData, setItemData] = useState([])
  const [transactionData, setTransactionData] = useState([])

  // ✅ Dynamic dropdown options
  const [allSuppliers, setAllSuppliers] = useState([])
  const [allCategories, setAllCategories] = useState([])

  // ✅ Fetch data on mount
  useEffect(() => {
    fetchDashboardData()
    fetchSuppliers()
    fetchItems()
    fetchTransactions()
    fetchDropdownSuppliers()
    fetchDropdownCategories()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard")
      const data = await res.json()
      if (data.success) {
        setKpiData([
          { title: "Total Items in Stock", value: data.data.totalItems, change: "+0%", trend: "up", icon: "📦" },
          { title: "Total Departments", value: data.data.totalDepartments, change: "+0%", trend: "up", icon: "🏢" },
          { title: "Purchase Orders", value: data.data.purchaseOrders, change: "+0%", trend: "up", icon: "📄" },
          { title: "GRNs Received", value: data.data.grns, change: "+0%", trend: "up", icon: "⬇️" },
          { title: "Issue Notes", value: data.data.issueNotes, change: "+0%", trend: "up", icon: "⬆️" },
          { title: "Total Stock Value", value: `$${data.data.totalStockValue}`, change: "+0%", trend: "up", icon: "💰" },
        ])
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    }
  }

  // ✅ Fetch summarized supplier data for reports
  const fetchSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/report-suppliers")
      const data = await res.json()
      if (data.success) setSupplierData(data.suppliers)
    } catch (err) {
      console.error("Error fetching supplier reports:", err)
    }
  }

  // ✅ Fetch summarized item data for reports
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/report-items")
      const data = await res.json()
      if (data.success) setItemData(data.items)
    } catch (err) {
      console.error("Error fetching item reports:", err)
    }
  }

  // ✅ Fetch combined transactions (PO, GRN, Issue Notes)
  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions")
      const data = await res.json()
      if (data.success) setTransactionData(data.transactions)
    } catch (err) {
      console.error("Error fetching transactions:", err)
    }
  }

  // ✅ Fetch suppliers/categories for dropdowns
  const fetchDropdownSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/suppliers")
      const data = await res.json()
      if (data.success) setAllSuppliers(data.suppliers)
    } catch (err) {
      console.error("Error fetching dropdown suppliers:", err)
    }
  }

  const fetchDropdownCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories")
      const data = await res.json()
      if (data.success) setAllCategories(data.categories)
    } catch (err) {
      console.error("Error fetching dropdown categories:", err)
    }
  }

  const handleFilterChange = (key, value) => setFilters({ ...filters, [key]: value })
  const resetFilters = () =>
    setFilters({ dateFrom: "", dateTo: "", supplier: "", category: "", documentType: "", search: "" })

  const getStatusBadge = (status) => {
    const variants = {
      Active: "badge-default",
      Pending: "badge-secondary",
      Normal: "badge-default",
      "Low Stock": "badge-destructive",
      Completed: "badge-default",
      Received: "badge-default",
      Issued: "badge-secondary",
    }
    return <span className={`badge ${variants[status] || "badge-default"}`}>{status}</span>
  }

  const handleExportPDF = () => console.log("Exporting to PDF...")
  const handleExportExcel = () => console.log("Exporting to Excel...")
  const handlePrint = () => window.print()

  // Charts dummy data
  const purchasesBySupplier = [
    { name: "ABC Corp", value: 125000 },
    { name: "XYZ Ltd", value: 89000 },
    { name: "Global Supplies", value: 156000 },
    { name: "Tech Solutions", value: 78000 },
    { name: "Office Pro", value: 92000 },
  ]

  const stockByCategory = [
    { name: "Electronics", value: 35, color: "#3b82f6" },
    { name: "Furniture", value: 25, color: "#60a5fa" },
    { name: "Office Supplies", value: 20, color: "#93c5fd" },
    { name: "IT Equipment", value: 15, color: "#bfdbfe" },
    { name: "Others", value: 5, color: "#dbeafe" },
  ]

  const monthlyMovement = [
    { month: "Jan", grns: 45, issues: 38 },
    { month: "Feb", grns: 52, issues: 42 },
    { month: "Mar", grns: 48, issues: 45 },
    { month: "Apr", grns: 61, issues: 39 },
    { month: "May", grns: 55, issues: 48 },
    { month: "Jun", grns: 67, issues: 52 },
  ]

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <span className="menu-icon">☰</span>
            <h1 className="header-title">Stock Management System</h1>
          </div>
          <div className="header-right">
            <span className="header-subtitle">Dashboard Reports</span>
            <div className="user-avatar">A</div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Filters Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🔍 Filters & Search</h2>
          </div>
          <div className="card-content">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="input"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="input"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Supplier</label>
                <select
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange("supplier", e.target.value)}
                  className="select"
                >
                  <option value="">All Suppliers</option>
                  {allSuppliers.map((sup) => (
                    <option key={sup._id} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="select"
                >
                  <option value="">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat._id} value={cat.description}>
                      {cat.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Document Type</label>
                <select
                  value={filters.documentType}
                  onChange={(e) => handleFilterChange("documentType", e.target.value)}
                  className="select"
                >
                  <option value="">All Types</option>
                  <option value="po">Purchase Order</option>
                  <option value="grn">GRN</option>
                  <option value="issue">Issue Note</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Quick Search</label>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={resetFilters} className="btn btn-outline">
                🔄 Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {kpiData.map((kpi, index) => (
            <div key={index} className="card kpi-card">
              <div className="kpi-header">
                <h3 className="kpi-title">{kpi.title}</h3>
                <span className="kpi-icon">{kpi.icon}</span>
              </div>
              <div className="kpi-content">
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-change">
                  <span className={`trend-icon ${kpi.trend === "up" ? "trend-up" : "trend-down"}`}>
                    {kpi.trend === "up" ? "📈" : "📉"}
                  </span>
                  <span className={kpi.trend === "up" ? "text-green-700" : "text-red-700"}>{kpi.change}</span>
                  <span className="kpi-period">from last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Tables, Charts, Export Sections stay the same as your previous code */}
      </div>
    </div>
  )
}

export default StockDashboard
